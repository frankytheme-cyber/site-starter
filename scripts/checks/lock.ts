/**
 * lock (solo se esiste blocks.lock.json): nei siti cliente le cartelle "managed" di
 * library.manifest.json sono in sola lettura. Confronta l'hash sha256 di ogni file con quello
 * registrato in blocks.lock.json quando la libreria è stata installata o aggiornata.
 *
 * Uso: npm run check:lock
 *      npm run lock:write   rigenera blocks.lock.json (solo quando si installa o aggiorna la libreria)
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type CheckContext, collector } from './lib/report.ts';
import { readJson, rel, ROOT, walk } from './lib/project.ts';

export const LOCK_FILE = 'blocks.lock.json';
const IGNORED = new Set(['.DS_Store', 'Thumbs.db']);

interface Manifest {
	managed: string[];
	exclude?: string[];
}
interface Lock {
	generatedAt: string;
	files: Record<string, string>;
}

/** sha256 di ogni file nelle cartelle gestite (escluse quelle in manifest.exclude). */
export function hashManaged(root: string): Record<string, string> {
	const manifest = readJson<Manifest>(join(root, 'library.manifest.json'));
	const excluded = manifest.exclude ?? [];
	const files = manifest.managed.flatMap((dir) =>
		walk(join(root, dir), (file) => !IGNORED.has(file.split(/[\\/]/).pop() ?? '')),
	);
	return Object.fromEntries(
		files
			.map((file) => rel(file))
			.filter((file) => !excluded.some((dir) => file === dir || file.startsWith(`${dir}/`)))
			.sort()
			.map((file) => [file, createHash('sha256').update(readFileSync(join(root, file))).digest('hex')]),
	);
}

export function lock({ root }: CheckContext) {
	const { findings, error } = collector('lock');
	const expected = readJson<Lock>(join(root, LOCK_FILE)).files;
	const actual = hashManaged(root);
	const hint = 'annulla la modifica (git checkout -- <file>) e proponila nella repo site-starter';

	for (const [file, hash] of Object.entries(expected)) {
		if (!(file in actual)) error({ file, message: 'file della libreria eliminato: modifica locale vietata, va fatta in site-starter', hint });
		else if (actual[file] !== hash) error({ file, message: 'modifica locale vietata, va fatta in site-starter', hint });
	}
	for (const file of Object.keys(actual)) {
		if (!(file in expected)) {
			error({ file, message: 'file aggiunto in una cartella gestita: modifica locale vietata, va fatta in site-starter', hint: 'spostalo fuori dalle cartelle di library.manifest.json → managed, o proponilo in site-starter' });
		}
	}
	return findings;
}

// Eseguito come comando con --write: registra lo stato attuale delle cartelle gestite.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--write')) {
	const files = hashManaged(ROOT);
	const lockFile: Lock = { generatedAt: new Date().toISOString(), files };
	writeFileSync(join(ROOT, LOCK_FILE), `${JSON.stringify(lockFile, null, 2)}\n`);
	console.log(`Scritto ${LOCK_FILE} (${Object.keys(files).length} file).`);
}
