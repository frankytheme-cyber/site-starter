/**
 * Prova il template come lo riceve un sito cliente: job "template-as-site" della CI, in locale
 * npm run check:template. Solo nella libreria.
 * 1. copia la repo (file tracciati e nuovi non ignorati, modifiche comprese) in una cartella
 *    temporanea, con un commit iniziale e senza remote, poi npm ci;
 * 2. senza SITE_STARTER_LIBRARY né DECAP_REPO (modalità sito): npm run site:init -- --yes
 *    --repo=agenzia/sito-di-prova, che deve togliere src/library;
 * 3. npm run qa -- --strict (o la suite indicata con --suite=), che deve FALLIRE;
 * 4. passa solo se tutti gli errori sono segnaposto attesi (EXPECTED). Report in reports/template-as-site/.
 *
 * Uso: npm run check:template                    suite qa
 *      npm run check:template -- --suite=check   più veloce: senza anteprima, link, axe e Lighthouse
 *      npm run check:template -- --keep          lascia la cartella temporanea per guardarci dentro
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { LIBRARY_ENV, requireLibraryMode } from '../src/core/mode.ts';
import { ROOT } from './checks/lib/project.ts';
import { type Finding, formatFinding } from './checks/lib/report.ts';

requireLibraryMode('npm run check:template');

/** I soli errori ammessi: i segnaposto del template (Finding.placeholder). */
const EXPECTED = new Set(['DA-COMPILARE', 'og-DA-COMPILARE']);
const REPO = 'agenzia/sito-di-prova';

const args = process.argv.slice(2);
const suite = args.find((arg) => arg.startsWith('--suite='))?.slice('--suite='.length) ?? 'qa';
const keep = args.includes('--keep');
const reportsDir = join(ROOT, 'reports/template-as-site');

// Ambiente di un sito cliente: niente modalità libreria, niente repo del CMS ereditato dalla CI.
const env: NodeJS.ProcessEnv = { ...process.env, FORCE_COLOR: '0' };
for (const name of [LIBRARY_ENV, 'DECAP_REPO', 'SITE_URL', 'VERCEL_GIT_REPO_OWNER', 'VERCEL_GIT_REPO_SLUG']) delete env[name];

const tmp = mkdtempSync(join(tmpdir(), 'template-as-site-'));
const site = join(tmp, 'sito');
let failure: string | undefined;

function step(title: string, command: string, commandArgs: string[]) {
	console.log(`\n▸ ${title}: ${command} ${commandArgs.join(' ')}`);
	return spawnSync(command, commandArgs, { cwd: site, env, stdio: 'inherit', shell: process.platform === 'win32' }).status ?? 1;
}

try {
	// ------------------------------------------------------------------------ copia
	const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
		.split('\0')
		.filter(Boolean);
	let copied = 0;
	for (const file of files) {
		const from = join(ROOT, file);
		if (!existsSync(from) && !isSymlink(from)) continue; // tracciato ma cancellato nel working tree
		const to = join(site, file);
		mkdirSync(dirname(to), { recursive: true });
		if (isSymlink(from)) symlinkSync(readlinkSync(from), to);
		else copyFileSync(from, to);
		copied++;
	}
	console.log(`Copia del template in ${site} (${copied} file).`);
	const git = (...gitArgs: string[]) => execFileSync('git', gitArgs, { cwd: site, env, stdio: 'ignore' });
	git('init', '--quiet');
	git('add', '-A');
	git('-c', 'user.name=template-as-site', '-c', 'user.email=template-as-site@example.invalid', 'commit', '--quiet', '-m', 'Copia del template');

	if (step('Dipendenze', 'npm', ['ci', '--no-audit', '--no-fund', '--prefer-offline']) !== 0) throw new Error('npm ci non riuscito');
	if (step('Inizializzazione', 'npm', ['run', 'site:init', '--', '--yes', `--repo=${REPO}`]) !== 0) throw new Error('site:init non riuscito');
	if (existsSync(join(site, 'src/library'))) throw new Error('dopo site:init src/library c’è ancora');

	// ------------------------------------------------------------------------ controlli
	const status = step(`Suite ${suite} con --strict (deve fallire solo per i segnaposto)`, 'npm', ['run', suite, '--', '--strict']);
	rmSync(reportsDir, { recursive: true, force: true });
	if (existsSync(join(site, 'reports'))) cpSync(join(site, 'reports'), reportsDir, { recursive: true });

	const report = JSON.parse(readFileSync(join(reportsDir, 'qa.json'), 'utf8')) as { isLibrary: boolean; findings: Finding[] };
	const errors = report.findings.filter((finding) => finding.level === 'error');
	const unexpected = errors.filter((finding) => !EXPECTED.has(finding.placeholder ?? ''));

	console.log('\n──────── template-as-site');
	if (report.isLibrary) failure = 'i controlli sono girati in modalità libreria: la copia deve essere un sito cliente';
	else if (status === 0 || errors.length === 0) {
		failure = `${suite} --strict è passato: un sito con i segnaposto del template andrebbe online (regole di pubblicazione non attive?)`;
	} else if (unexpected.length > 0) {
		console.log(`${unexpected.length} errori che non sono segnaposto attesi (${[...EXPECTED].join(', ')}):`);
		for (const finding of unexpected) console.log(formatFinding(finding));
		failure = 'il template fallisce anche per motivi diversi dai segnaposto';
	} else {
		const byLabel = new Map<string, number>();
		for (const finding of errors) byLabel.set(finding.placeholder!, (byLabel.get(finding.placeholder!) ?? 0) + 1);
		const counts = [...byLabel].map(([label, count]) => `${label}: ${count}`).join(', ');
		console.log(`✓ Il template fallisce solo per i segnaposto attesi: ${errors.length} errori (${counts}). Report in reports/template-as-site/.`);
	}
} catch (cause) {
	failure = (cause as Error).message;
} finally {
	if (keep) console.log(`Cartella temporanea lasciata in ${site}`);
	else rmSync(tmp, { recursive: true, force: true });
}

if (failure) {
	console.error(`✗ ${failure}`);
	process.exit(1);
}

function isSymlink(path: string) {
	try {
		return lstatSync(path).isSymbolicLink();
	} catch {
		return false;
	}
}
