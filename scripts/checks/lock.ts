/**
 * lock (siti cliente): le cartelle e i file "managed" di library.manifest.json sono in sola lettura.
 * Confronta l'hash sha256 di ogni file con quello registrato in blocks.lock.json, che scrivono solo
 * npm run site:init (alla creazione del sito) e npm run blocks:sync (a ogni aggiornamento della
 * libreria), insieme alla versione installata.
 *
 * Uso: npm run check:lock
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { type CheckContext, collector } from './lib/report.ts';
import { readJson, walk } from './lib/project.ts';

export const LOCK_FILE = 'blocks.lock.json';
export const MANIFEST_FILE = 'library.manifest.json';
const IGNORED = new Set(['.DS_Store', 'Thumbs.db']);

export interface Manifest {
	version: string;
	/** Repository della libreria, da cui blocks:sync scarica le versioni. */
	repository?: string;
	/** Cartelle della libreria: nei siti cliente si cambiano solo con blocks:sync. */
	managed: string[];
	/** File singoli della libreria, come le cartelle. */
	managedFiles?: string[];
	/** Dentro le cartelle gestite, ma né controllati né copiati. */
	exclude?: string[];
	/** Solo nella libreria: site:init li toglie, blocks:sync non li copia. */
	libraryOnly?: string[];
	/** Script di package.json solo della libreria: site:init e blocks:sync non li lasciano nei siti. */
	libraryScripts?: string[];
}
export interface Lock {
	/** Versione della libreria installata (vX.Y.Z senza "v"). */
	version?: string;
	generatedAt: string;
	files: Record<string, string>;
}

export const readManifest = (root: string) => readJson<Manifest>(join(root, MANIFEST_FILE));

const toPosix = (path: string) => path.split(/[\\/]/).join('/');
const isExcluded = (file: string, manifest: Manifest) => (manifest.exclude ?? []).some((dir) => file === dir || file.startsWith(`${dir}/`));

/** File gestiti (relativi alla radice, ordinati): quelli delle cartelle e i file singoli che esistono. */
export function managedFiles(root: string, manifest: Manifest = readManifest(root)): string[] {
	const fromDirs = manifest.managed.flatMap((dir) =>
		walk(join(root, dir), (file) => !IGNORED.has(file.split(/[\\/]/).pop() ?? '')).map((file) => toPosix(relative(root, file))),
	);
	const single = (manifest.managedFiles ?? []).filter((file) => existsSync(join(root, file)));
	return [...new Set([...fromDirs, ...single])].filter((file) => !isExcluded(file, manifest)).sort();
}

const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');

/** sha256 di ogni file gestito. */
export function hashManaged(root: string, manifest: Manifest = readManifest(root)): Record<string, string> {
	return Object.fromEntries(managedFiles(root, manifest).map((file) => [file, sha256(join(root, file))]));
}

export const readLock = (root: string) => readJson<Lock>(join(root, LOCK_FILE));

/** Scrive blocks.lock.json con la versione installata e gli hash attuali (site:init, blocks:sync). */
export function writeLock(root: string, version: string): Lock {
	const lock: Lock = { version, generatedAt: new Date().toISOString(), files: hashManaged(root) };
	writeFileSync(join(root, LOCK_FILE), `${JSON.stringify(lock, null, 2)}\n`);
	return lock;
}

export function lock({ root }: CheckContext) {
	const { findings, error } = collector('lock');
	if (!existsSync(join(root, LOCK_FILE))) {
		// Il check gira solo nei siti cliente (run.ts): un sito senza lock non è stato inizializzato.
		const looksLikeLibrary = existsSync(join(root, 'src/library'));
		error({
			file: LOCK_FILE,
			message: looksLikeLibrary
				? 'manca: c’è src/library, quindi è la libreria senza SITE_STARTER_LIBRARY=1, o un sito appena copiato'
				: 'manca: il sito non è stato inizializzato',
			hint: looksLikeLibrary
				? 'nella libreria metti SITE_STARTER_LIBRARY=1 in .env (vedi .env.example); in un sito copiato dal template esegui npm run site:init'
				: 'esegui npm run site:init (una volta sola, alla creazione del sito)',
		});
		return findings;
	}

	const { files: expected, version } = readLock(root);
	const actual = hashManaged(root);
	const library = version ? `libreria v${version}` : 'libreria';
	const hint = 'annulla la modifica (git checkout -- <file>) e proponila nella repo site-starter; per aggiornare la libreria: npm run blocks:sync -- vX.Y.Z';

	for (const [file, hash] of Object.entries(expected)) {
		if (!(file in actual)) {
			const message = existsSync(join(root, file))
				? `file della ${library} tolto dai file gestiti (library.manifest.json modificato): vietato, va fatto in site-starter`
				: `file della ${library} eliminato: modifica locale vietata, va fatta in site-starter`;
			error({ file, message, hint });
		}
		else if (actual[file] !== hash) error({ file, message: `modifica locale a un file della ${library}: vietata, va fatta in site-starter`, hint });
	}
	for (const file of Object.keys(actual)) {
		if (!(file in expected)) {
			error({ file, message: 'file aggiunto in una cartella gestita: modifica locale vietata, va fatta in site-starter', hint: 'spostalo fuori dalle cartelle di library.manifest.json → managed, o proponilo in site-starter' });
		}
	}
	return findings;
}
