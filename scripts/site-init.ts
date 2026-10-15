/**
 * Inizializza un sito cliente copiato dal template site-starter, una volta sola:
 * 1. controlla di essere in un sito (non nella libreria), in un repository git pulito e non ancora
 *    inizializzato (niente blocks.lock.json), il cui remote "origin" non è la libreria;
 * 2. repo GitHub del CMS: --repo=org/nome, poi DECAP_REPO, poi il remote "origin" su GitHub; se
 *    manca lo chiede. Lo scrive in src/site.config.ts (cms.repo) e rigenera public/admin/config.yml;
 * 3. toglie quello che serve solo alla libreria (library.manifest.json → libraryOnly: src/library
 *    con il catalogo, docs/README.md, CHANGELOG.md) e i suoi script di package.json (libraryScripts);
 * 4. scrive blocks.lock.json con la versione della libreria (package.json) e gli hash dei file gestiti;
 * 5. crea docs/sito.md, per le note di questo sito, e stampa i passi successivi.
 * Non fa commit: le modifiche restano nel working tree (git restore . per annullarle).
 *
 * Uso: npm run site:init
 *      npm run site:init -- --repo=agenzia/rossi-imbianchino --yes   (senza domande, es. in CI)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { requireSiteMode } from '../src/core/mode.ts';
import { LOCK_FILE, readManifest, writeLock } from './checks/lock.ts';
import { ROOT } from './checks/lib/project.ts';
import { DECAP_CONFIG, generateDecapConfig, githubRepoOf, originRepo } from './gen-decap-config.ts';

requireSiteMode('npm run site:init');

const args = process.argv.slice(2);
const yes = args.includes('--yes');
const repoArg = args.find((arg) => arg.startsWith('--repo='))?.slice('--repo='.length);
const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

function fail(message: string, hint?: string): never {
	console.error(`✗ ${message}`);
	if (hint) console.error(`  → ${hint}`);
	process.exit(1);
}

const git = (...gitArgs: string[]) => execFileSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

async function ask(question: string): Promise<string> {
	const readline = createInterface({ input: process.stdin, output: process.stdout });
	try {
		return (await readline.question(question)).trim();
	} finally {
		readline.close();
	}
}

// ---------------------------------------------------------------------------- controlli

if (existsSync(join(ROOT, LOCK_FILE))) {
	fail(`${LOCK_FILE} c’è già: il sito è già inizializzato`, 'per aggiornare la libreria usa npm run blocks:sync -- vX.Y.Z');
}
try {
	git('rev-parse', '--is-inside-work-tree');
} catch {
	fail('non è un repository git', 'git init && git add -A && git commit -m "Copia di site-starter", poi rilancia');
}
if (git('status', '--porcelain')) {
	fail('ci sono modifiche non committate', 'fai prima il commit della copia del template: così site:init si annulla con git');
}

const manifest = readManifest(ROOT);
const libraryRepo = manifest.repository ? githubRepoOf(manifest.repository)?.toLowerCase() : undefined;
const origin = originRepo(ROOT);
const isLibraryRepo = (repo: string | undefined) => Boolean(repo && libraryRepo && repo.toLowerCase() === libraryRepo);
if (isLibraryRepo(origin)) {
	fail(
		`il remote "origin" è la libreria (${origin}): site:init cancellerebbe il catalogo`,
		'nella libreria imposta SITE_STARTER_LIBRARY=1 (.env); per un sito nuovo crea un repository dal template',
	);
}

// ---------------------------------------------------------------------------- repo del CMS

let repo = repoArg || process.env.DECAP_REPO || origin;
if (!repo && interactive) repo = await ask('Repository GitHub del sito, per il CMS (org/nome): ');
if (!repo) fail('repository GitHub del sito non trovato', 'usa --repo=org/nome (oppure DECAP_REPO, o un remote "origin" su GitHub)');
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) fail(`"${repo}" non è nel formato org/nome`);
if (isLibraryRepo(repo)) fail(`${repo} è la libreria, non il repository del sito`);

const remove = (manifest.libraryOnly ?? []).filter((path) => existsSync(join(ROOT, path)));
console.log(`Inizializzo il sito cliente in ${ROOT}`);
console.log(`  repository del CMS: ${repo}`);
console.log(`  da togliere (solo libreria): ${remove.join(', ') || 'niente'}\n`);
if (!yes) {
	if (!interactive) fail('serve una conferma', 'rilancia con --yes');
	if (!/^s[iì]?$/i.test(await ask('Procedo? [s/N] '))) fail('annullato: nessuna modifica');
}

// ---------------------------------------------------------------------------- parte della libreria

for (const path of remove) rmSync(join(ROOT, path), { recursive: true, force: true });

const packageFile = join(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(packageFile, 'utf8'));
const removedScripts = (manifest.libraryScripts ?? []).filter((name) => pkg.scripts && name in pkg.scripts);
for (const name of removedScripts) delete pkg.scripts[name];
writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);

// ---------------------------------------------------------------------------- CMS

// cms.repo nell'oggetto config di site.config.ts (non nell'interfaccia sopra), dopo branch.
const siteConfigFile = join(ROOT, 'src/site.config.ts');
const siteConfig = readFileSync(siteConfigFile, 'utf8');
const start = siteConfig.indexOf('const config');
const [head, body] = start >= 0 ? [siteConfig.slice(0, start), siteConfig.slice(start)] : [siteConfig, ''];
const withRepo = /^\s*repo:/m.test(body)
	? body.replace(/^(\s*)repo:.*$/m, `$1repo: '${repo}',`)
	: body.replace(/^(\s*)branch:(.*)$/m, `$1branch:$2\n$1repo: '${repo}',`);
const repoWritten = withRepo !== body;
if (repoWritten) writeFileSync(siteConfigFile, head + withRepo);
else console.warn(`! cms.repo non scritto in src/site.config.ts: aggiungilo a mano (repo: '${repo}')`);

const decap = await generateDecapConfig({ repo });
if (decap.problems.length > 0) {
	fail(`configurazione di Decap non generata:\n${decap.problems.map((problem) => `    ${problem}`).join('\n')}`);
}
writeFileSync(DECAP_CONFIG, decap.output);

// ---------------------------------------------------------------------------- lock e note

const version = String(pkg.version);
const lock = writeLock(ROOT, version);
const notes = join(ROOT, 'docs/sito.md');
if (!existsSync(notes)) writeFileSync(notes, '');

console.log(`✓ Sito inizializzato con la libreria v${version}: ${Object.keys(lock.files).length} file gestiti in ${LOCK_FILE}.`);
if (remove.length > 0) console.log(`  Tolti: ${remove.join(', ')}.`);
if (removedScripts.length > 0) console.log(`  Script della libreria tolti da package.json: ${removedScripts.join(', ')}.`);
console.log(`  CMS: repository ${repo}${repoWritten ? ' in src/site.config.ts (cms.repo)' : ''}, public/admin/config.yml rigenerato.`);
console.log(`
Passi successivi:
  1. npm install, poi git add -A && git commit -m "Inizializza il sito"
  2. Dati dell’attività in src/content/settings/site.json (o dal CMS, «Dati attività»): nessun DA-COMPILARE
  3. Menu in navigation.json, aspetto in theme.json (palette, fonts, shape), header e footer in layout.json
  4. Pagine in src/content/pages partendo da docs/catalogo/ricette-tipo; foto in src/assets/images;
     un ogImage vero al posto di og-DA-COMPILARE in ogni pagina
  5. Indirizzo del worker OAuth in src/site.config.ts (cms.oauthBaseUrl) e dominio del sito nell’elenco del worker (docs/decap.md)
  6. Progetto Vercel collegato al repository, senza la variabile SITE_STARTER_LIBRARY
  7. Protezione di main con i check «check» e «qa» (docs/controlli.md), poi l’invito del cliente al CMS (docs/decap.md)
  8. Prima di pubblicare: npm run qa -- --strict, senza errori

Note di questo sito: docs/sito.md. Per aggiornare la libreria: npm run blocks:sync -- vX.Y.Z (docs/siti-cliente.md).`);
