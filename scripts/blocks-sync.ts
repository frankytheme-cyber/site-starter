/**
 * Aggiorna la libreria in un sito cliente: npm run blocks:sync -- vX.Y.Z
 * 1. controlla di essere in un sito inizializzato (blocks.lock.json) con il working tree pulito;
 * 2. scarica site-starter al tag vX.Y.Z in una cartella temporanea (library.manifest.json →
 *    repository, oppure --from=<indirizzo o percorso>);
 * 3. sostituisce cartelle e file gestiti con quelli del tag, secondo il manifest del tag (managed,
 *    managedFiles, senza exclude): le modifiche locali a quei file si perdono, e il riepilogo le elenca;
 * 4. unisce in package.json script, dipendenze ed engines della libreria, senza toccare name e
 *    version del sito né quello che ha solo il sito; toglie gli script solo della libreria
 *    (libraryScripts) e quelli che puntano a file di scripts/ che non esistono più;
 * 5. aggiorna blocks.lock.json (versione e hash) e mostra il riepilogo: versioni, file cambiati,
 *    breaking change di CHANGELOG.md tra le due versioni.
 * Non fa commit e non installa: dopo servono npm install, npm run gen:decap e npm run qa -- --strict.
 *
 * Uso: npm run blocks:sync -- v1.2.0
 *      npm run blocks:sync -- v1.2.0 --from=../site-starter   un clone locale invece del repository
 *      npm run blocks:sync -- v1.1.0 --force                  anche verso una versione precedente
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { requireSiteMode } from '../src/core/mode.ts';
import { hashManaged, LOCK_FILE, type Manifest, managedFiles, readLock, readManifest, writeLock } from './checks/lock.ts';
import { ROOT } from './checks/lib/project.ts';

requireSiteMode('npm run blocks:sync');

/** Script che la libreria ha tolto e che i siti più vecchi hanno ancora. */
const RETIRED_SCRIPTS = ['lock:write'];
const MAX_FILES_SHOWN = 40;

const args = process.argv.slice(2);
const tag = args.find((arg) => /^v\d+\.\d+\.\d+$/.test(arg));
const from = args.find((arg) => arg.startsWith('--from='))?.slice('--from='.length);
const force = args.includes('--force');

function fail(message: string, hint?: string): never {
	console.error(`✗ ${message}`);
	if (hint) console.error(`  → ${hint}`);
	process.exit(1);
}

const parse = (version: string) => version.replace(/^v/, '').split('.').map(Number);
function compare(a: string, b: string): number {
	const [x, y] = [parse(a), parse(b)];
	for (let index = 0; index < 3; index++) if (x[index] !== y[index]) return x[index] - y[index];
	return 0;
}

// ---------------------------------------------------------------------------- controlli

if (!tag) fail('uso: npm run blocks:sync -- vX.Y.Z (es. v1.2.0)');
const target = tag.slice(1);
if (!existsSync(join(ROOT, LOCK_FILE))) fail(`manca ${LOCK_FILE}: il sito non è inizializzato`, 'esegui prima npm run site:init');
if (execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim()) {
	fail('ci sono modifiche non committate', 'fai prima il commit: così l’aggiornamento si rivede e si annulla con git');
}

const oldManifest = readManifest(ROOT);
const lock = readLock(ROOT);
const installed = lock.version ?? oldManifest.version;
if (compare(target, installed) < 0 && !force) fail(`v${target} è precedente alla versione installata v${installed}`, 'aggiungi --force per tornare indietro');
const source = from ?? process.env.SITE_STARTER_REPO ?? oldManifest.repository;
if (!source) fail('non so da dove scaricare la libreria', 'aggiungi --from=<indirizzo del repository o percorso di un clone>');

// Modifiche locali ai file gestiti rispetto al lock: l'aggiornamento le sovrascrive.
const current = hashManaged(ROOT, oldManifest);
const localChanges = [...new Set([...Object.keys(lock.files), ...Object.keys(current)])].filter((file) => lock.files[file] !== current[file]).sort();

// ---------------------------------------------------------------------------- download

const tmp = mkdtempSync(join(tmpdir(), 'site-starter-'));
try {
	console.log(`Scarico site-starter ${tag} da ${source}…`);
	const clone = spawnSync('git', ['clone', '--quiet', '--depth', '1', '--branch', tag, source, tmp], { encoding: 'utf8' });
	if (clone.status !== 0) {
		rmSync(tmp, { recursive: true, force: true });
		fail(`non riesco a scaricare ${tag} da ${source}`, clone.stderr.trim().split('\n').at(-1));
	}
	const next: Manifest = readManifest(tmp);
	if (next.version !== target) console.warn(`! il manifest del tag ${tag} dice v${next.version}`);

	// ------------------------------------------------------------------------ file gestiti

	const incoming = managedFiles(tmp, next);
	const incomingSet = new Set(incoming);
	// Da togliere: i file nelle cartelle gestite del tag che il tag non ha, e i file della vecchia
	// versione (nel lock) spariti dalla libreria. Un file che c'è ancora ma non è più gestito resta.
	const outgoing = [...new Set([...managedFiles(ROOT, next), ...Object.keys(lock.files).filter((file) => !existsSync(join(tmp, file)))])]
		.filter((file) => !incomingSet.has(file) && existsSync(join(ROOT, file)))
		.sort();
	const before = hashManaged(ROOT, { ...next, managed: [], managedFiles: [...incoming, ...outgoing] });

	for (const file of outgoing) rmSync(join(ROOT, file));
	for (const file of incoming) {
		mkdirSync(dirname(join(ROOT, file)), { recursive: true });
		copyFileSync(join(tmp, file), join(ROOT, file));
	}
	for (const dir of next.managed) pruneEmptyDirs(join(ROOT, dir));

	const after = hashManaged(ROOT, next);
	const added = incoming.filter((file) => !(file in before));
	const modified = incoming.filter((file) => file in before && before[file] !== after[file]);

	// ------------------------------------------------------------------------ package.json

	const packageFile = join(ROOT, 'package.json');
	const site = JSON.parse(readFileSync(packageFile, 'utf8'));
	const library = JSON.parse(readFileSync(join(tmp, 'package.json'), 'utf8'));
	const packageChanges = mergePackage(site, library, next);
	writeFileSync(packageFile, `${JSON.stringify(site, null, 2)}\n`);

	// ------------------------------------------------------------------------ lock e riepilogo

	const written = writeLock(ROOT, target);
	const breaking = breakingChanges(join(tmp, 'CHANGELOG.md'), installed, target);

	console.log(`\n✓ Libreria aggiornata: v${installed} → v${target} (${Object.keys(written.files).length} file gestiti in ${LOCK_FILE}).`);
	const changes = [
		...added.map((file) => `  + ${file}`),
		...modified.map((file) => `  ~ ${file}`),
		...outgoing.map((file) => `  - ${file}`),
	];
	console.log(`\nFile gestiti: ${added.length} aggiunti, ${modified.length} modificati, ${outgoing.length} tolti.`);
	for (const line of changes.slice(0, MAX_FILES_SHOWN)) console.log(line);
	if (changes.length > MAX_FILES_SHOWN) console.log(`  … e altri ${changes.length - MAX_FILES_SHOWN} (git status per l’elenco completo)`);
	if (localChanges.length > 0) {
		console.log(`\n! Modifiche locali sovrascritte (erano vietate dal lock): ${localChanges.join(', ')}`);
	}
	if (packageChanges.length > 0) {
		console.log('\npackage.json:');
		for (const line of packageChanges) console.log(`  ${line}`);
	}
	if (breaking.length > 0) {
		console.log('\n⚠ Breaking change (CHANGELOG.md):');
		for (const { version, items } of breaking) {
			console.log(`  ${version}`);
			for (const item of items) console.log(`    ${item}`);
		}
	} else {
		console.log('\nNessun breaking change in CHANGELOG.md tra le due versioni.');
	}
	console.log(`
Passi successivi:
  1. npm install                (dipendenze della nuova versione)
  2. npm run gen:decap          (i campi del CMS possono essere cambiati)
  3. npm run qa -- --strict     (le ricette devono essere ancora valide${breaking.length > 0 ? ': guarda i breaking change' : ''})
  4. git add -A && git commit -m "Libreria site-starter ${tag}"`);
} finally {
	rmSync(tmp, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------- funzioni

/** Toglie le cartelle rimaste vuote dopo aver tolto dei file. */
function pruneEmptyDirs(dir: string) {
	if (!existsSync(dir)) return;
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isDirectory()) pruneEmptyDirs(join(dir, entry.name));
	}
	if (readdirSync(dir).length === 0) rmdirSync(dir);
}

type Package = Record<string, any>;

/** Unisce in site (package.json del sito) script, dipendenze ed engines della libreria. Restituisce le righe del riepilogo. */
function mergePackage(site: Package, library: Package, manifest: Manifest): string[] {
	const lines: string[] = [];
	const libraryOnly = new Set(manifest.libraryScripts ?? []);

	site.scripts ??= {};
	for (const name of Object.keys(site.scripts)) {
		const command = String(site.scripts[name]);
		const missingFile = /\bscripts\/[\w./-]+\.(?:ts|mjs|js)\b/.exec(command)?.[0];
		const retired = RETIRED_SCRIPTS.includes(name) || libraryOnly.has(name) || (missingFile !== undefined && !existsSync(join(ROOT, missingFile)) && !(name in (library.scripts ?? {})));
		if (retired) {
			delete site.scripts[name];
			lines.push(`script tolto: ${name}`);
		}
	}
	for (const [name, command] of Object.entries<string>(library.scripts ?? {})) {
		if (libraryOnly.has(name)) continue;
		if (site.scripts[name] !== command) lines.push(`${name in site.scripts ? 'script aggiornato' : 'script aggiunto'}: ${name}`);
		site.scripts[name] = command;
	}

	for (const section of ['dependencies', 'devDependencies'] as const) {
		const other = section === 'dependencies' ? 'devDependencies' : 'dependencies';
		for (const [name, version] of Object.entries<string>(library[section] ?? {})) {
			site[section] ??= {};
			if (site[other]?.[name] !== undefined && library[other]?.[name] === undefined) {
				delete site[other][name];
				lines.push(`${name}: spostato in ${section}`);
			}
			if (site[section][name] !== version) {
				lines.push(`${name}: ${site[section][name] ?? 'nuovo'} → ${version}`);
				site[section][name] = version;
			}
		}
		if (site[section]) site[section] = Object.fromEntries(Object.entries(site[section]).sort(([a], [b]) => a.localeCompare(b)));
	}
	if (library.engines && JSON.stringify(site.engines) !== JSON.stringify(library.engines)) {
		site.engines = library.engines;
		lines.push(`engines: ${JSON.stringify(library.engines)}`);
	}
	return lines;
}

/**
 * Voci delle sezioni «### Breaking» di CHANGELOG.md per le versioni dopo `from`, fino a `to`
 * compresa. Le versioni sono i titoli «## vX.Y.Z» (con la data facoltativa dopo).
 */
function breakingChanges(file: string, from: string, to: string): { version: string; items: string[] }[] {
	if (!existsSync(file)) return [];
	const items = new Map<string, string[]>();
	let version: string | undefined;
	let inBreaking = false;
	for (const line of readFileSync(file, 'utf8').split('\n')) {
		const heading = /^## (v\d+\.\d+\.\d+)\b/.exec(line);
		if (heading || line.startsWith('## ')) {
			version = heading && compare(heading[1], from) > 0 && compare(heading[1], to) <= 0 ? heading[1] : undefined;
			inBreaking = false;
			continue;
		}
		if (line.startsWith('### ')) {
			inBreaking = version !== undefined && /breaking|incompatibil/i.test(line);
			continue;
		}
		if (inBreaking && version && line.trim()) items.set(version, [...(items.get(version) ?? []), line.trim()]);
	}
	return [...items].map(([version, list]) => ({ version, items: list }));
}
