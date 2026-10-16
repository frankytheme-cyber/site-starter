/**
 * PR in bozza su GitHub senza gh, per gli agenti (skill github-pr): cerca la PR aperta da un branch e,
 * se non c'è e il titolo è dato, la apre in bozza. Stampa l'indirizzo della PR o l'errore di GitHub.
 *
 * Uso:
 *   npm run pr -- --dest lancio                                    # cerca: indirizzo o «nessuna PR aperta»
 *   npm run pr -- --dest <branch> --title "<titolo>" [--base main] [--body-file <file>]   # cerca o apre
 *
 * Repository dal remote origin; token da GH_TOKEN (o GITHUB_TOKEN), solo nell'header, mai stampato.
 * Non fa merge, non toglie la bozza, non chiude PR.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
	options: {
		dest: { type: 'string' },
		base: { type: 'string', default: 'main' },
		title: { type: 'string' },
		'body-file': { type: 'string' },
	},
});

function fail(message: string): never {
	console.error(`✗ ${message}`);
	process.exit(1);
}

const dest = values.dest?.trim();
if (!dest) fail('manca --dest <branch>: il branch da cui parte la PR (nei siti: lancio).');
if (dest === values.base) fail(`--dest e --base sono lo stesso branch (${dest}).`);

const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
if (/^https:\/\/[^/]*@/.test(remote)) {
	fail('il remote origin contiene credenziali: correggilo con git remote set-url origin https://github.com/<owner>/<repo>.git');
}
const match = remote.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/);
if (!match) fail(`il remote origin non è un repository GitHub: ${remote}`);
const [, owner, repo] = match;

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) fail("manca il token: GH_TOKEN non c'è nell'ambiente. Avvisa il PM, non cercare altre strade.");

type GitHubError = { message?: string; errors?: unknown[] };
type PullRequest = { html_url: string };

async function github<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
	const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
		method: init.method ?? 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28',
			...(init.body ? { 'Content-Type': 'application/json' } : {}),
		},
		body: init.body ? JSON.stringify(init.body) : undefined,
	});
	const data = (await response.json()) as T & GitHubError;
	if (!response.ok) {
		const details = data.errors?.length ? ` ${JSON.stringify(data.errors)}` : '';
		const hint = response.status === 401 || response.status === 403 ? ' (token scaduto o senza permessi: avvisa il PM)' : '';
		fail(`GitHub ${response.status}: ${data.message ?? 'errore'}${details}${hint}`);
	}
	return data;
}

const open = await github<PullRequest[]>(`/pulls?state=open&head=${encodeURIComponent(`${owner}:${dest}`)}`);
if (open.length > 0) {
	console.log(open[0].html_url);
	process.exit(0);
}

if (!values.title) {
	console.log('nessuna PR aperta');
	process.exit(0);
}

const body = values['body-file'] ? readFileSync(values['body-file'], 'utf8') : '';
const created = await github<PullRequest>('/pulls', {
	method: 'POST',
	body: { title: values.title, head: dest, base: values.base, body, draft: true },
});
console.log(created.html_url);
