/**
 * Controlla le ricette di pagina (src/content/pages/*.json) e i dati del sito
 * (src/content/settings/site.json e navigation.json) prima di pubblicare.
 * Forma e lunghezze dei campi le verifica già la build (schema della collezione "pages");
 * qui ci sono le regole sul contenuto.
 *
 * Errori: segnaposto (DA-COMPILARE, lorem, TODO, […]); telefoni, email o P.IVA scritti nei
 * testi delle sezioni (stanno in site.json); più di un hero; id di sezione duplicati; link
 * interni a pagine o ancore inesistenti; alt uguale al nome del file.
 * Avvisi: due sezioni consecutive con lo stesso tone; più di 12 sezioni; prima sezione che
 * non è un hero; nessuna cta.
 *
 * Uso: npm run check:recipes               solo report, esce sempre con 0
 *      npm run check:recipes -- --strict   esce con 1 se ci sono errori
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };
type Path = (string | number)[];

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const PAGES_DIR = join(ROOT, 'src/content/pages');
const SETTINGS_DIR = join(ROOT, 'src/content/settings');
const strict = process.argv.includes('--strict');

/** I blocchi di navigazione (header) non contano come contenuto della pagina. */
const NAVIGATION_TYPES = new Set(['header']);
const MAX_SECTIONS = 12;

interface Problem {
	level: 'errore' | 'avviso';
	file: string;
	where: string;
	message: string;
}
const problems: Problem[] = [];
const error = (file: string, where: string, message: string) => problems.push({ level: 'errore', file, where, message });
const warning = (file: string, where: string, message: string) =>
	problems.push({ level: 'avviso', file, where, message });

// ---------------------------------------------------------------------------- testi

/** Chiavi che non contengono testo per chi visita: niente controlli sul contenuto. */
const NOT_TEXT = new Set(['$schema', 'type', 'id', 'tone', 'variant', 'icon']);

const PLACEHOLDERS: [RegExp, string][] = [
	[/DA-COMPILARE/i, 'DA-COMPILARE'],
	[/\blorem\b|\bipsum\b/i, 'lorem ipsum'],
	[/\bTODO\b/, 'TODO'],
	[/\[(?:…|\.{3})\]/, '[…]'],
];

function placeholdersIn(text: string): string[] {
	return PLACEHOLDERS.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}

/** Recapiti scritti a mano: devono arrivare da site.json. Restituisce cosa è stato trovato. */
function businessDataIn(key: string, text: string): string | undefined {
	if (key === 'href') {
		if (/^(?:tel|mailto|sms):/i.test(text)) return 'un link tel:/mailto: (i recapiti si mostrano con showContacts della cta)';
		if (/\bwa\.me\/|api\.whatsapp\.com/i.test(text)) return 'un link WhatsApp con il numero';
		return undefined;
	}
	if (key === 'src') return undefined;
	if (/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/.test(text)) return 'un indirizzo email';
	if (/\b(?:p\.?\s?iva|partita\s+iva)\b/i.test(text) || /(?<!\d)\d{11}(?!\d)/.test(text)) return 'una partita IVA';
	for (const [match] of text.matchAll(/(?:\+39[\s.-]?)?(?<!\d)(?:0\d{1,3}|3\d{2})(?:[\s.-]?\d{2,4}){2,3}(?!\d)/g)) {
		const digits = match.replace(/^\+39/, '').replace(/\D/g, '').length;
		if (digits >= 8 && digits <= 11) return 'un numero di telefono';
	}
	return undefined;
}

const excerpt = (text: string) => JSON.stringify(text.length > 60 ? `${text.slice(0, 57)}…` : text);

/** Visita ogni stringa del JSON con il suo percorso. */
function eachString(value: Json, path: Path, visit: (path: Path, text: string) => void) {
	if (typeof value === 'string') visit(path, value);
	else if (Array.isArray(value)) value.forEach((item, index) => eachString(item, [...path, index], visit));
	else if (value && typeof value === 'object') {
		for (const [key, item] of Object.entries(value)) eachString(item, [...path, key], visit);
	}
}

/** Visita ogni oggetto del JSON con il suo percorso. */
function eachObject(value: Json, path: Path, visit: (path: Path, object: JsonObject) => void) {
	if (Array.isArray(value)) value.forEach((item, index) => eachObject(item, [...path, index], visit));
	else if (value && typeof value === 'object') {
		visit(path, value);
		for (const [key, item] of Object.entries(value)) eachObject(item, [...path, key], visit);
	}
}

const lastKey = (path: Path) => [...path].reverse().find((part): part is string => typeof part === 'string') ?? '';

const fieldPath = (path: Path) =>
	path.map((part, index) => (typeof part === 'number' ? `[${part}]` : index === 0 ? part : `.${part}`)).join('');

// ---------------------------------------------------------------------------- pagine e link

interface Recipe {
	file: string;
	route: string;
	data: JsonObject;
	sections: JsonObject[];
	ids: Set<string>;
}

const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/** Percorso pubblicato di una ricetta: index.json → "/", chi-siamo.json → "/chi-siamo". */
const recipeRoute = (file: string) => {
	const name = basename(file, '.json').toLowerCase();
	return name === 'index' ? '/' : `/${name}`;
};

/** Pagine .astro/.md senza parametri in src/pages (es. il catalogo). */
function staticRoutes(dir = join(ROOT, 'src/pages'), base = ''): string[] {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name.startsWith('_') || entry.name.includes('[')) return [];
		if (entry.isDirectory()) return staticRoutes(join(dir, entry.name), `${base}/${entry.name}`);
		if (!['.astro', '.md', '.mdx', '.html'].includes(extname(entry.name))) return [];
		const name = basename(entry.name, extname(entry.name));
		return [name === 'index' ? base || '/' : `${base}/${name}`];
	});
}

const publicFile = (path: string) => {
	const file = join(ROOT, 'public', decodeURIComponent(path));
	return existsSync(file) && statSync(file).isFile();
};

function readJson(file: string): Json | undefined {
	try {
		return JSON.parse(readFileSync(file, 'utf8')) as Json;
	} catch (cause) {
		error(relative(ROOT, file), 'file', `JSON non valido: ${(cause as Error).message}`);
		return undefined;
	}
}

const isObject = (value: Json | undefined): value is JsonObject =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const recipes: Recipe[] = existsSync(PAGES_DIR)
	? readdirSync(PAGES_DIR)
			.filter((name) => name.endsWith('.json'))
			.sort()
			.flatMap((name) => {
				const file = join(PAGES_DIR, name);
				const data = readJson(file);
				if (!isObject(data)) return [];
				const sections = Array.isArray(data.sections) ? data.sections.filter(isObject) : [];
				const ids = new Set(sections.map((section) => section.id).filter((id): id is string => typeof id === 'string'));
				return [{ file: relative(ROOT, file), route: recipeRoute(name), data, sections, ids }];
			})
	: [];

const recipesByRoute = new Map(recipes.map((recipe) => [recipe.route, recipe]));
const routes = new Set([...recipesByRoute.keys(), ...staticRoutes().map(trimSlash)]);

/** Controlla un link interno ("/pagina/", "#ancora", "/pagina/#ancora"); i link esterni passano. */
function checkLink(href: string, from: string | undefined, report: (message: string) => void) {
	if (!(href.startsWith('/') || href.startsWith('#')) || href.startsWith('//')) return;
	const [beforeHash, anchor] = [href.split('#')[0], href.split('#').slice(1).join('#')];
	const path = beforeHash.split('?')[0];

	if (path && publicFile(path)) return;
	const route = path ? trimSlash(path) : from;
	if (!route) return;
	if (!routes.has(route)) {
		const name = route === '/' ? 'index' : route.slice(1);
		const hint = name.includes('/')
			? 'le ricette sono file nella cartella src/content/pages, senza sottocartelle'
			: `manca src/content/pages/${name}.json`;
		report(`link a "${href}": la pagina ${route} non esiste (${hint})`);
		return;
	}
	const target = recipesByRoute.get(route);
	if (anchor && target && !target.ids.has(anchor)) {
		report(`link a "${href}": nessuna sezione con id "${anchor}" in ${target.file}`);
	}
}

// ---------------------------------------------------------------------------- controlli

const sectionLabel = (section: JsonObject, index: number) =>
	`sezione ${index + 1} (${String(section.type)}${typeof section.id === 'string' ? `, #${section.id}` : ''})`;

function checkRecipe(recipe: Recipe) {
	const { file, data, sections } = recipe;

	/** "sezione 2 (services, #servizi) › items[0].text" oppure "title". */
	const where = (path: Path) => {
		if (path[0] === 'sections' && typeof path[1] === 'number' && sections[path[1]]) {
			const rest = path.slice(2);
			const label = sectionLabel(sections[path[1]], path[1]);
			return rest.length > 0 ? `${label} › ${fieldPath(rest)}` : label;
		}
		return fieldPath(path);
	};

	eachString(data, [], (path, text) => {
		const key = lastKey(path);
		if (NOT_TEXT.has(key)) return;
		for (const label of placeholdersIn(text)) error(file, where(path), `segnaposto ${label}: ${excerpt(text)}`);
		const found = businessDataIn(key, text);
		if (found) {
			const context = key === 'href' ? '' : ' nel testo';
			error(file, where(path), `${found}${context}: ${excerpt(text)}. I recapiti stanno solo in site.json`);
		}
		if (key === 'href') checkLink(text, recipe.route, (message) => error(file, where(path), message));
	});

	eachObject(data, [], (path, object) => {
		if (typeof object.src !== 'string' || typeof object.alt !== 'string') return;
		const normalize = (text: string) =>
			text
				.toLowerCase()
				.replace(/\.[a-z0-9]{2,5}$/, '')
				.replace(/[-_\s]+/g, ' ')
				.trim();
		if (normalize(object.alt) === normalize(basename(object.src))) {
			error(file, where([...path, 'alt']), `alt uguale al nome del file (${basename(object.src)}): descrivi cosa mostra la foto`);
		}
	});

	const heroes = sections.flatMap((section, index) => (section.type === 'hero' ? [index] : []));
	if (heroes.length > 1) {
		error(file, heroes.map((index) => `sezione ${index + 1}`).join(', '), `${heroes.length} hero nella pagina: ne va uno solo, in apertura`);
	}

	const seen = new Map<string, number>();
	sections.forEach((section, index) => {
		if (typeof section.id !== 'string') return;
		const first = seen.get(section.id);
		if (first === undefined) seen.set(section.id, index);
		else error(file, sectionLabel(section, index), `id "${section.id}" già usato dalla sezione ${first + 1}`);
	});

	if (sections.length > MAX_SECTIONS) {
		warning(file, 'sections', `${sections.length} sezioni: oltre ${MAX_SECTIONS} la pagina diventa lunga, valuta di dividerla`);
	}

	const content = sections
		.map((section, index) => ({ section, index }))
		.filter(({ section }) => !NAVIGATION_TYPES.has(String(section.type)));
	const toneOf = (section: JsonObject) => (typeof section.tone === 'string' ? section.tone : 'default');

	if (content.length > 0 && content[0].section.type !== 'hero') {
		warning(file, sectionLabel(content[0].section, content[0].index), 'la pagina non si apre con un hero');
	}
	for (let i = 1; i < content.length; i++) {
		const { section, index } = content[i];
		if (toneOf(section) === toneOf(content[i - 1].section)) {
			warning(
				file,
				sectionLabel(section, index),
				`stesso tone della sezione precedente (${toneOf(section)}): alterna i toni per separare le sezioni`,
			);
		}
	}
	if (!sections.some((section) => section.type === 'cta')) {
		warning(file, 'sections', 'nessuna cta: la pagina non chiede a chi visita di fare un passo');
	}
}

/** site.json e navigation.json: niente segnaposto, e il menu porta a pagine che esistono. */
function checkSettings() {
	for (const name of ['site.json', 'navigation.json']) {
		const path = join(SETTINGS_DIR, name);
		if (!existsSync(path)) continue;
		const file = relative(ROOT, path);
		const data = readJson(path);
		if (data === undefined) continue;
		eachString(data, [], (jsonPath, text) => {
			const key = lastKey(jsonPath);
			if (key === '$schema') return;
			for (const label of placeholdersIn(text)) error(file, fieldPath(jsonPath), `segnaposto ${label}: ${excerpt(text)}`);
			if (name === 'navigation.json' && key === 'href') {
				checkLink(text, undefined, (message) => error(file, fieldPath(jsonPath), message));
			}
		});
	}
}

// ---------------------------------------------------------------------------- report

if (recipes.length === 0) error('src/content/pages', 'file', 'nessuna ricetta: serve almeno index.json');
recipes.forEach(checkRecipe);
checkSettings();

const files = [...new Set(problems.map((problem) => problem.file))];
for (const file of files) {
	console.log(`\n${file}`);
	for (const problem of problems.filter((p) => p.file === file)) {
		console.log(`  ${problem.level === 'errore' ? '✗' : '!'} ${problem.where}: ${problem.message}`);
	}
}

const errors = problems.filter((problem) => problem.level === 'errore').length;
const warnings = problems.length - errors;
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
console.log(
	`\n${plural(recipes.length, 'ricetta controllata', 'ricette controllate')}: ${plural(errors, 'errore', 'errori')}, ${plural(warnings, 'avviso', 'avvisi')}.`,
);

if (errors > 0 && strict) {
	console.error('Pubblicazione bloccata (--strict): correggi gli errori.');
	process.exit(1);
}
if (errors > 0) console.log('Solo report: con --strict gli errori bloccano (npm run check:recipes -- --strict).');
