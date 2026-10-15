/** Lettura di ricette di pagina, impostazioni e link: la usano i check recipes e release. */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

/** Percorso di un campo con gli indici da 1 ("items[2].title"), come nei messaggi della build. */
export { fieldPath } from '../../../src/core/content-validation.ts';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type JsonObject = { [key: string]: Json };
export type Path = (string | number)[];

/** Segnaposto del template. og-DA-COMPILARE è l'immagine per i social di prova (src/assets/images/og-DA-COMPILARE.jpg). */
export const PLACEHOLDERS: [RegExp, string][] = [
	[/og-DA-COMPILARE/i, 'og-DA-COMPILARE'],
	[/(?<!og-)DA-COMPILARE/i, 'DA-COMPILARE'],
	[/\blorem\b|\bipsum\b/i, 'lorem ipsum'],
	[/\bTODO\b/, 'TODO'],
	[/\[(?:…|\.{3})\]/, '[…]'],
];

export const placeholdersIn = (text: string) =>
	PLACEHOLDERS.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);

export const excerpt = (text: string) => JSON.stringify(text.length > 60 ? `${text.slice(0, 57)}…` : text);

/** Visita ogni stringa del JSON con il suo percorso. */
export function eachString(value: Json, path: Path, visit: (path: Path, text: string) => void) {
	if (typeof value === 'string') visit(path, value);
	else if (Array.isArray(value)) value.forEach((item, index) => eachString(item, [...path, index], visit));
	else if (value && typeof value === 'object') {
		for (const [key, item] of Object.entries(value)) eachString(item, [...path, key], visit);
	}
}

/** Visita ogni oggetto del JSON con il suo percorso. */
export function eachObject(value: Json, path: Path, visit: (path: Path, object: JsonObject) => void) {
	if (Array.isArray(value)) value.forEach((item, index) => eachObject(item, [...path, index], visit));
	else if (value && typeof value === 'object') {
		visit(path, value);
		for (const [key, item] of Object.entries(value)) eachObject(item, [...path, key], visit);
	}
}

export const lastKey = (path: Path) => [...path].reverse().find((part): part is string => typeof part === 'string') ?? '';

export const isObject = (value: Json | undefined): value is JsonObject =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

export const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

export interface Recipe {
	/** Relativo alla radice: src/content/pages/index.json. */
	file: string;
	/** Percorso pubblicato senza slash finale: "/", "/chi-siamo". */
	route: string;
	data: JsonObject;
	sections: JsonObject[];
	ids: Set<string>;
	draft: boolean;
}

/** index.json → "/", chi-siamo.json → "/chi-siamo". */
export const recipeRoute = (file: string) => {
	const name = basename(file, '.json').toLowerCase();
	return name === 'index' ? '/' : `/${name}`;
};

/** Legge un JSON; se non è valido chiama onError e restituisce undefined. */
export function readJsonFile(path: string, onError: (message: string) => void): Json | undefined {
	try {
		return JSON.parse(readFileSync(path, 'utf8')) as Json;
	} catch (cause) {
		onError(`JSON non valido: ${(cause as Error).message}`);
		return undefined;
	}
}

export function loadRecipes(root: string, onError: (file: string, message: string) => void): Recipe[] {
	const dir = join(root, 'src/content/pages');
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((name) => name.endsWith('.json'))
		.sort()
		.flatMap((name) => {
			const file = `src/content/pages/${name}`;
			const data = readJsonFile(join(dir, name), (message) => onError(file, message));
			if (!isObject(data)) return [];
			const sections = Array.isArray(data.sections) ? data.sections.filter(isObject) : [];
			const ids = new Set(sections.map((section) => section.id).filter((id): id is string => typeof id === 'string'));
			return [{ file, route: recipeRoute(name), data, sections, ids, draft: data.draft === true }];
		});
}

/** Pagine .astro/.md senza parametri in src/pages (es. il catalogo), senza slash finale. */
function staticRoutes(dir: string, base = ''): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name.startsWith('_') || entry.name.includes('[')) return [];
		if (entry.isDirectory()) return staticRoutes(join(dir, entry.name), `${base}/${entry.name}`);
		if (!['.astro', '.md', '.mdx', '.html'].includes(extname(entry.name))) return [];
		const name = basename(entry.name, extname(entry.name));
		return [name === 'index' ? base || '/' : `${base}/${name}`];
	});
}

export type LinkTarget =
	| { kind: 'external' }
	| { kind: 'file' }
	| { kind: 'page'; route: string; recipe?: Recipe }
	| { kind: 'missing-page'; route: string; hint: string }
	| { kind: 'missing-anchor'; route: string; anchor: string; recipe: Recipe };

/** Risolve i link interni ("/pagina/", "#ancora", "/pagina/#ancora") contro ricette, pagine statiche e public/. */
export function linkResolver(root: string, recipes: Recipe[]) {
	const byRoute = new Map(recipes.map((recipe) => [recipe.route, recipe]));
	const routes = new Set([...byRoute.keys(), ...staticRoutes(join(root, 'src/pages')).map(trimSlash)]);
	const publicFile = (path: string) => {
		const file = join(root, 'public', decodeURIComponent(path));
		return existsSync(file) && statSync(file).isFile();
	};

	return (href: string, from: string | undefined): LinkTarget => {
		if (!(href.startsWith('/') || href.startsWith('#')) || href.startsWith('//')) return { kind: 'external' };
		const [beforeHash, ...hash] = href.split('#');
		const anchor = hash.join('#');
		const path = beforeHash.split('?')[0];
		if (path && publicFile(path)) return { kind: 'file' };
		const route = path ? trimSlash(path) : from;
		if (!route) return { kind: 'external' };
		if (!routes.has(route)) {
			const name = route === '/' ? 'index' : route.slice(1);
			const hint = name.includes('/')
				? 'le ricette sono file nella cartella src/content/pages, senza sottocartelle'
				: `manca src/content/pages/${name}.json`;
			return { kind: 'missing-page', route, hint };
		}
		const recipe = byRoute.get(route);
		if (anchor && recipe && !recipe.ids.has(anchor)) return { kind: 'missing-anchor', route, anchor, recipe };
		return { kind: 'page', route, recipe };
	};
}
