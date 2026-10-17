/** Provisioning eseguito dal titolare. Nessun accesso al filesystem o shell; API iniettate nei test. */
export interface SiteCreateOptions {
	name: string;
	owner: string;
	template: string;
	collaborator: string;
	team?: string;
}

export interface Credentials {
	github: string;
	vercel: string;
}

interface Repository {
	id: number;
	full_name: string;
	private: boolean;
	is_template?: boolean;
	template_repository?: { full_name: string };
}

interface Project {
	id: string;
	name: string;
	framework: string;
	link?: { type: string; repoId: number | string };
	env?: { key: string; value?: string; type?: string; target?: string | string[]; gitBranch?: string; customEnvironmentIds?: string[] }[];
}

export interface SiteCreateResult {
	repository: string;
	project: string;
	collaborator: 'attivo' | 'invito in attesa';
}

const accountPattern = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
const targets = ['production', 'preview', 'development'];

export function validateOptions(options: SiteCreateOptions) {
	if (!/^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/.test(options.name) || options.name.includes('---')) {
		throw new Error('Nome non valido: 1–100 lettere minuscole, cifre o trattini; niente tre trattini consecutivi.');
	}
	if (!accountPattern.test(options.owner) || !accountPattern.test(options.collaborator)) {
		throw new Error('Owner o collaboratore GitHub non valido.');
	}
	if (!/^[a-z\d-]+\/[\w.-]+$/i.test(options.template)) throw new Error('Template non valido: usa owner/repo.');
	if (same(`${options.owner}/${options.name}`, options.template)) throw new Error('Il sito non può essere la repo della libreria.');
	if (options.team !== undefined && !/^team_[a-z\d]+$/i.test(options.team)) throw new Error('Team Vercel non valido: serve il Team ID team_…, non il nome.');
}

function validateRepository(repo: Repository, options: SiteCreateOptions) {
	if (!repo.id || !same(repo.full_name, `${options.owner}/${options.name}`) || !repo.private ||
		!repo.template_repository || !same(repo.template_repository.full_name, options.template)) {
		throw new Error('La repo esistente non è privata o non risulta creata dal template previsto. Nessuna modifica: scegli un altro nome o verifica la repo.');
	}
}

function validateProject(project: Project, repo: Repository, name: string) {
	if (!project.id || project.name !== name || project.framework !== 'astro' || project.link?.type !== 'github' ||
		String(project.link.repoId) !== String(repo.id)) {
		throw new Error('Il progetto Vercel esistente non è Astro o è collegato a una repo diversa. Non verrà modificato.');
	}
	// Valore vuoto esplicito: prevale anche su una variabile condivisa del team impostata a 1.
	const flags = project.env?.filter((env) => env.key === 'SITE_STARTER_LIBRARY') ?? [];
	const covered = new Set<string>();
	for (const flag of flags) {
		if (flag.type !== 'plain' || flag.value !== '' || flag.gitBranch || flag.customEnvironmentIds?.length) {
			throw new Error('Verifica SITE_STARTER_LIBRARY su Vercel: deve essere vuota, plain e senza override di branch o ambienti personalizzati.');
		}
		for (const target of Array.isArray(flag.target) ? flag.target : [flag.target]) if (target) covered.add(target);
	}
	if (targets.some((target) => !covered.has(target))) {
		throw new Error('Su Vercel manca SITE_STARTER_LIBRARY vuota per Production, Preview e Development. Impostala prima di riprendere.');
	}
}

/** Nessun retry automatico delle scritture: dopo esiti incerti si rilancia e si rilegge lo stato remoto. */
export async function createSite(
	options: SiteCreateOptions,
	credentials: Credentials,
	dependencies: { fetch?: typeof fetch; log?: (message: string) => void; wait?: (ms: number) => Promise<void> } = {},
): Promise<SiteCreateResult> {
	validateOptions(options);
	if (!credentials.github || !credentials.vercel) throw new Error('Servono SITE_CREATE_GITHUB_TOKEN e VERCEL_TOKEN nell’ambiente.');
	const request = dependencies.fetch ?? fetch;
	const log = dependencies.log ?? console.log;
	const wait = dependencies.wait ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
	const fullName = `${options.owner}/${options.name}`;
	const ghPath = `/repos/${fullName}`;
	const scope = options.team ? `?teamId=${encodeURIComponent(options.team)}` : '';

	async function api<T>(provider: 'GitHub' | 'Vercel', path: string, method = 'GET', body?: unknown, allow404 = false): Promise<T | null> {
		const github = provider === 'GitHub';
		let response: Response;
		try {
			response = await request(`${github ? 'https://api.github.com' : 'https://api.vercel.com'}${path}`, {
				method,
				redirect: 'error',
				signal: AbortSignal.timeout(20_000),
				headers: {
					Authorization: `Bearer ${github ? credentials.github : credentials.vercel}`,
					Accept: 'application/json',
					...(github ? { 'X-GitHub-Api-Version': '2022-11-28' } : {}),
					...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
				},
				body: body === undefined ? undefined : JSON.stringify(body),
			});
		} catch {
			throw new Error(`${provider}: connessione interrotta o timeout (${method}). L’esito di una scrittura può essere incerto: rilancia lo stesso comando, senza cambiare nome.`);
		}
		if (allow404 && response.status === 404) return null;
		if (!response.ok) {
			const hint = response.status === 401 || response.status === 403
				? 'Verifica credenziali, permessi e accesso alla destinazione.'
				: response.status === 404 ? 'Risorsa non trovata o non accessibile.'
					: provider === 'Vercel' ? 'Verifica anche che l’integrazione GitHub di Vercel abbia accesso alla nuova repo.' : 'Verifica nome, accesso al template e permessi del token.';
			// Non riportare body, header o errori fetch: potrebbero contenere credenziali o dati riservati.
			throw new Error(`${provider} HTTP ${response.status} (${method}). ${hint} Le risorse già create restano disponibili: puoi riprendere con lo stesso comando.`);
		}
		if (response.status === 204) return {} as T;
		try {
			return await response.json() as T;
		} catch {
			throw new Error(`${provider}: risposta non leggibile. Rilancia lo stesso comando per controllare lo stato remoto.`);
		}
	}

	// Autenticazione e collisioni si verificano prima della prima scrittura.
	const identity = await api<{ login: string }>('GitHub', '/user');
	if (same(identity!.login, options.collaborator)) throw new Error('Usa il token del titolare, non quello di simone-agenti, per il provisioning.');
	const template = await api<Repository>('GitHub', `/repos/${options.template}`);
	if (!template!.is_template) throw new Error('La repo sorgente non è abilitata come template GitHub.');
	await api('GitHub', `/users/${options.collaborator}`);
	let repo = await api<Repository>('GitHub', ghPath, 'GET', undefined, true);
	if (repo) validateRepository(repo, options);
	const account = options.team
		? await api<{ slug: string }>('Vercel', `/v2/teams/${encodeURIComponent(options.team)}`)
		: (await api<{ user: { username: string } }>('Vercel', '/v2/user'))!.user;
	const accountSlug = 'slug' in account! ? account.slug : account!.username;
	let project = await api<Project>('Vercel', `/v9/projects/${options.name}${scope}`, 'GET', undefined, true);
	if (project) {
		if (!repo) throw new Error('Il nome Vercel è già occupato, ma la repo prevista non esiste. Nessuna risorsa creata.');
		validateProject(project, repo, options.name);
	}

	if (!repo) {
		await api('GitHub', `/repos/${options.template}/generate`, 'POST', {
			owner: options.owner, name: options.name, private: true, include_all_branches: false,
		});
		log(`✓ Repo richiesta: https://github.com/${fullName}`);
		// La generazione è asincrona: attendi solo la lettura della nuova repo, con limite breve.
		for (let attempt = 0; attempt < 6; attempt++) {
			repo = await api<Repository>('GitHub', ghPath, 'GET', undefined, true);
			if (repo?.template_repository) break;
			if (attempt < 5) await wait(1000);
		}
		if (!repo) throw new Error('Repo ancora in preparazione su GitHub: rilancia lo stesso comando fra poco.');
		validateRepository(repo, options);
	} else log(`✓ Repo riusata: https://github.com/${fullName}`);

	const permission = await api<{ permission: string }>('GitHub', `${ghPath}/collaborators/${options.collaborator}/permission`, 'GET', undefined, true);
	let collaborator: SiteCreateResult['collaborator'];
	if (permission && ['admin', 'maintain', 'write', 'push'].includes(permission.permission)) {
		collaborator = 'attivo';
	} else {
		let pending = false;
		for (let page = 1; ; page++) {
			const invitations = await api<{ invitee: { login: string } | null; permissions: string }[]>(
				'GitHub', `${ghPath}/invitations?per_page=100&page=${page}`,
			);
			pending = invitations!.some((invitation) => invitation.invitee && same(invitation.invitee.login, options.collaborator) && ['write', 'maintain', 'admin'].includes(invitation.permissions));
			if (pending || invitations!.length < 100) break;
		}
		if (!pending) await api('GitHub', `${ghPath}/collaborators/${options.collaborator}`, 'PUT', { permission: 'push' });
		// Un membro di un’organizzazione può essere aggiunto subito, senza invito.
		const after = await api<{ permission: string }>('GitHub', `${ghPath}/collaborators/${options.collaborator}/permission`, 'GET', undefined, true);
		collaborator = after && ['admin', 'maintain', 'write', 'push'].includes(after.permission) ? 'attivo' : 'invito in attesa';
	}
	log(`✓ ${options.collaborator}: ${collaborator}`);

	if (!project) {
		await api('Vercel', `/v11/projects${scope}`, 'POST', {
			name: options.name,
			framework: 'astro',
			gitRepository: { type: 'github', repo: fullName },
			environmentVariables: [{ key: 'SITE_STARTER_LIBRARY', value: '', type: 'plain', target: targets }],
		});
		// Rileggi anche dopo la creazione: il successo del POST non prova che il collegamento sia corretto.
		project = await api<Project>('Vercel', `/v9/projects/${options.name}${scope}`);
	}
	validateProject(project!, repo, options.name);
	const projectUrl = `https://vercel.com/${encodeURIComponent(accountSlug)}/${options.name}`;
	log(`✓ Progetto Vercel verificato: ${projectUrl}`);
	return { repository: `https://github.com/${fullName}`, project: projectUrl, collaborator };
}
