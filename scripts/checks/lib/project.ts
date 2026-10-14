/** Percorsi e utilità comuni ai controlli. */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
export const DIST = join(ROOT, 'dist');

/** La libreria site-starter ha il catalogo dei blocchi; un sito cliente no (escluso dal manifest). */
export const isLibrary = () => existsSync(join(ROOT, 'src/pages/catalogo'));

/** Percorso relativo alla radice, sempre con "/". */
export const rel = (file: string) => relative(ROOT, file).split(sep).join('/');

export const readJson = <T = unknown>(file: string): T => JSON.parse(readFileSync(file, 'utf8')) as T;

/** Tutti i file sotto dir (ricorsivo), filtrati. */
export function walk(dir: string, filter: (file: string) => boolean = () => true): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return walk(path, filter);
		return entry.isFile() && filter(path) ? [path] : [];
	});
}

export const isFile = (path: string) => existsSync(path) && statSync(path).isFile();

/** Pagine HTML della build come percorsi del sito ("/", "/chi-siamo/"), escluso il CMS. */
export function builtPages(): string[] {
	return walk(DIST, (file) => file.endsWith('.html'))
		.map((file) => `/${relative(DIST, file).split(sep).join('/')}`.replace(/index\.html$/, '').replace(/\.html$/, '/'))
		.filter((path) => !path.startsWith('/admin/'))
		.sort();
}
