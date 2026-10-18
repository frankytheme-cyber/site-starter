import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { createSite, validateOptions, type SiteCreateOptions } from './site-create.ts';

const options: SiteCreateOptions = { name: 'sito-prova', owner: 'titolare', template: 'titolare/site-starter', collaborator: 'simone-agenti', team: 'team_prova' };
const credentials = { github: 'github-test-secret', vercel: 'vercel-test-secret' };
const repo = { id: 42, full_name: 'titolare/sito-prova', private: true, template_repository: { full_name: options.template } };
const clientMode = [{ key: 'SITE_STARTER_LIBRARY', value: '', type: 'plain', target: ['production', 'preview', 'development'] }];
const project = { id: 'prj_prova', name: options.name, framework: 'astro', link: { type: 'github', repoId: '42' }, env: clientMode };

function fixture(initial: { repo?: unknown; project?: unknown; active?: boolean; pending?: boolean; failVercelCreate?: boolean; lostRepoResponse?: boolean; extraInvitations?: boolean } = {}) {
	let repository = initial.repo;
	let vercelProject = initial.project;
	let active = initial.active ?? false;
	let pending = initial.pending ?? false;
	let failVercelCreate = initial.failVercelCreate ?? false;
	let lostRepoResponse = initial.lostRepoResponse ?? false;
	const writes: string[] = [];
	const reads: string[] = [];
	const payloads: { host: string; path: string; body: any }[] = [];
	const logs: string[] = [];
	const response = (value: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(value), { status });
	const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
		const url = new URL(String(input));
		const path = url.pathname;
		const method = init?.method ?? 'GET';
		assert.ok(['api.github.com', 'api.vercel.com'].includes(url.host));
		const headers = init?.headers as Record<string, string>;
		assert.equal(headers.Authorization, `Bearer ${url.host === 'api.github.com' ? credentials.github : credentials.vercel}`);
		assert.equal(init?.redirect, 'error');
		if (url.host === 'api.vercel.com' && path.includes('/projects')) assert.equal(url.searchParams.get('teamId'), options.team);
		if (method !== 'GET') {
			writes.push(`${method} ${url.host}${path}`);
			payloads.push({ host: url.host, path, body: JSON.parse(String(init?.body)) });
		} else reads.push(url.href);
		if (path === '/user') return response({ login: 'titolare' });
		if (path === '/repos/titolare/site-starter') return response({ is_template: true });
		if (path === '/users/simone-agenti') return response({ login: 'simone-agenti' });
		if (path === '/v2/teams/team_prova') return response({ slug: 'studio-prova' });
		if (path === '/repos/titolare/site-starter/generate') {
			repository = structuredClone(repo);
			if (lostRepoResponse) { lostRepoResponse = false; throw new Error(credentials.github); }
			return response(repository, 201);
		}
		if (path === '/repos/titolare/sito-prova') return response(repository ?? {}, repository ? 200 : 404);
		if (path.endsWith('/permission')) return response({ permission: active ? 'write' : 'none' });
		if (path.endsWith('/invitations')) {
			if (initial.extraInvitations && url.searchParams.get('page') === '1') return response(Array.from({ length: 100 }, () => ({ invitee: null, permissions: 'write' })));
			return response(pending ? [{ invitee: { login: 'simone-agenti' }, permissions: 'write' }] : []);
		}
		if (path.endsWith('/collaborators/simone-agenti') && method === 'PUT') {
			pending = true;
			return response({ id: 17 }, 201);
		}
		if (path === '/v11/projects' && method === 'POST') {
			if (failVercelCreate) { failVercelCreate = false; return response({ error: { message: credentials.vercel } }, 403); }
			vercelProject = structuredClone(project);
			return response(vercelProject, 200);
		}
		if (path === '/v9/projects/sito-prova') return response(vercelProject ?? {}, vercelProject ? 200 : 404);
		throw new Error(`Richiesta inattesa: ${method} ${url.href}`);
	}) as typeof fetch;
	return { writes, reads, payloads, logs, dependencies: { fetch: fetcher, log: (line: string) => logs.push(line), wait: async () => {} } };
}

test('crea risorse private, separa credenziali, verifica il collegamento e distingue invito pendente', async () => {
	const f = fixture();
	const result = await createSite(options, credentials, f.dependencies);
	assert.equal(result.repository, 'https://github.com/titolare/sito-prova');
	assert.equal(result.project, 'https://vercel.com/studio-prova/sito-prova');
	assert.equal(result.collaborator, 'invito in attesa');
	assert.equal(f.writes.length, 3);
	assert.deepEqual(f.payloads[0].body, { owner: 'titolare', name: options.name, private: true, include_all_branches: false });
	assert.deepEqual(f.payloads[1].body, { permission: 'push' });
	assert.deepEqual(f.payloads[2].body.environmentVariables, clientMode);
	assert.deepEqual(f.payloads[2].body.gitRepository, { type: 'github', repo: repo.full_name });
	assert.equal(f.logs.join('\n').includes(credentials.github), false);
	assert.equal(f.logs.join('\n').includes(credentials.vercel), false);
});

test('un secondo avvio riusa le risorse senza duplicare repo, progetto o invito', async () => {
	const f = fixture();
	await createSite(options, credentials, f.dependencies);
	const written = f.writes.length;
	await createSite(options, credentials, f.dependencies);
	assert.equal(f.writes.length, written);
});

test('riparte dopo un errore Vercel senza duplicare repo o invito e senza stampare segreti', async () => {
	const f = fixture({ failVercelCreate: true });
	await assert.rejects(createSite(options, credentials, f.dependencies), (error: Error) => {
		assert.ok(error.message.includes('HTTP 403'));
		assert.ok(!error.message.includes(credentials.vercel));
		return true;
	});
	await createSite(options, credentials, f.dependencies);
	assert.equal(f.writes.filter((line) => line.includes('/generate')).length, 1);
	assert.equal(f.writes.filter((line) => line.includes('/collaborators/')).length, 1);
	assert.equal(f.writes.filter((line) => line.includes('/v11/projects')).length, 2);
});

test('risposta persa dopo creazione repo: nessun retry del POST e ripresa per lettura', async () => {
	const f = fixture({ lostRepoResponse: true });
	await assert.rejects(createSite(options, credentials, f.dependencies), (error: Error) => {
		assert.ok(error.message.includes('esito di una scrittura'));
		assert.ok(!error.message.includes(credentials.github));
		return true;
	});
	assert.equal(f.writes.length, 1);
	await createSite(options, credentials, f.dependencies);
	assert.equal(f.writes.filter((line) => line.includes('/generate')).length, 1);
});

test('collisioni con risorse estranee fermano tutto prima di concedere accessi', async () => {
	for (const initial of [
		{ repo: { ...repo, template_repository: null } },
		{ repo: { ...repo, private: false } },
		{ repo, project: { ...project, link: { type: 'github', repoId: 99 } } },
		{ project },
		{ repo, project: { ...project, env: [{ ...clientMode[0], value: '1' }] } },
		{ repo, project: { ...project, env: [] } },
	]) {
		const f = fixture(initial);
		await assert.rejects(createSite(options, credentials, f.dependencies));
		assert.deepEqual(f.writes, []);
	}
});

test('un collaboratore attivo non viene reinvitato', async () => {
	const f = fixture({ repo, project, active: true });
	assert.equal((await createSite(options, credentials, f.dependencies)).collaborator, 'attivo');
	assert.deepEqual(f.writes, []);
});

test('trova un invito pendente anche oltre la prima pagina', async () => {
	const f = fixture({ repo, project, pending: true, extraInvitations: true });
	await createSite(options, credentials, f.dependencies);
	assert.deepEqual(f.writes, []);
	assert.ok(f.reads.some((url) => url.includes('page=2')));
});

test('parametri e credenziali mancanti vengono rifiutati prima delle API', async () => {
	for (const name of ['../sito', 'Sito', 'sito---prova', 'x'.repeat(101), 'sito?token=x']) assert.throws(() => validateOptions({ ...options, name }));
	assert.throws(() => validateOptions({ ...options, team: 'nome-del-team' }));
	const f = fixture();
	await assert.rejects(createSite(options, { github: '', vercel: credentials.vercel }, f.dependencies));
	assert.deepEqual(f.reads, []);
});

test('CLI: anteprima senza credenziali e senza applicazione; i token non sono argomenti accettati', () => {
	const env = { PATH: process.env.PATH, SITE_STARTER_LIBRARY: '1' };
	const run = (...args: string[]) => execFileSync(process.execPath, ['scripts/site-create.ts', ...args], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
	assert.match(run(options.name, '--owner', options.owner, '--team', options.team!), /Anteprima offline/);
	assert.throws(() => run(options.name, '--apply'), /Servono SITE_CREATE_GITHUB_TOKEN/);
	assert.throws(() => run(options.name, '--token', 'non-un-token'), /Unknown option/);
	assert.throws(() => execFileSync(process.execPath, ['scripts/site-create.ts', options.name, '--apply'], {
		env: { ...env, PAPERCLIP_AGENT_ID: 'agente-test' }, stdio: ['ignore', 'pipe', 'pipe'],
	}), /fuori dalle run degli agenti/);
});
