/**
 * release (con --strict, nei siti cliente): il sito è pronto per andare online.
 * - nessun DA-COMPILARE nelle impostazioni (site.json, navigation.json, layout.json) né in site.config.ts;
 * - nessuna pagina in bozza linkata da pagine pubblicate o dal menu;
 * - nella build: sitemap, robots.txt, favicon, Open Graph completo su ogni pagina;
 * - nel footer di ogni pagina: P.IVA e, per le società, REA e capitale sociale (da site.json);
 *   link a privacy e cookie che portano a una pagina della build (o a un indirizzo https esterno);
 * - campi "fonte" (fonte, source, credit) compilati dove sono previsti.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type CheckContext, collector } from './lib/report.ts';
import { builtPages, DIST } from './lib/project.ts';
import {
	eachObject,
	eachString,
	excerpt,
	fieldPath,
	isObject,
	lastKey,
	linkResolver,
	loadRecipes,
	placeholdersIn,
	readJsonFile,
	trimSlash,
} from './lib/content.ts';
import { withProjectModules } from './lib/vite.ts';

/** Link legali da trovare nel footer: per indirizzo (percorsi usuali) o per testo del link. */
const LEGAL_LINKS = [
	{ name: 'privacy', label: 'all’informativa privacy', text: /privacy/i, routes: ['/privacy/', '/privacy-policy/', '/informativa-privacy/'] },
	{ name: 'cookie', label: 'all’informativa cookie', text: /cookie/i, routes: ['/cookie/', '/cookie-policy/', '/informativa-cookie/'] },
];
const OPEN_GRAPH = ['og:title', 'og:description', 'og:url', 'og:image'];
const SOURCE_KEY = /^(?:fonte|source|credit|credits|crediti)$/i;

const htmlOf = (path: string) => readFileSync(join(DIST, path, 'index.html'), 'utf8');

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (text: string) =>
	text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (entity, code: string) => {
		if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? entity;
		return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
	});
/** Testo leggibile di un pezzo di HTML: senza tag, entità decodificate, spazi compattati. */
const textOf = (html: string) => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** I <footer> di una pagina (header e footer del sito li mette BaseLayout da layout.json). */
const footerOf = (html: string) => html.match(/<footer[\s\S]*?<\/footer>/g)?.join('') ?? '';
const anchorsOf = (html: string) =>
	[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attributes, inner]) => ({
		href: decode(/\bhref="([^"]*)"/.exec(attributes)?.[1] ?? ''),
		text: textOf(inner),
	}));

/** "/privacy/", "/privacy" e "/privacy/#cookie" contano come lo stesso percorso. */
const samePath = (href: string, route: string) => trimSlash(href.split(/[?#]/)[0]) === trimSlash(route);

const listPages = (paths: string[]) => paths.slice(0, 5).join(', ') + (paths.length > 5 ? ` e altre ${paths.length - 5}` : '');

export async function release({ root }: CheckContext) {
	const { findings, error, warning } = collector('release');

	// Impostazioni senza segnaposto.
	const settingsDir = join(root, 'src/content/settings');
	for (const name of readdirSync(settingsDir).filter((file) => file.endsWith('.json'))) {
		const file = `src/content/settings/${name}`;
		const data = readJsonFile(join(settingsDir, name), (message) => error({ file, message }));
		if (data === undefined) continue;
		eachString(data, [], (path, text) => {
			if (placeholdersIn(text).includes('DA-COMPILARE')) {
				error({ file, where: fieldPath(path), message: `segnaposto: ${excerpt(text)}`, hint: 'compila il dato vero (anche dal CMS, «Dati attività» o «Menu»)' });
			}
		});
	}
	const siteConfig = join(root, 'src/site.config.ts');
	if (existsSync(siteConfig) && /da-compilare/i.test(readFileSync(siteConfig, 'utf8'))) {
		error({ file: 'src/site.config.ts', where: 'cms.oauthBaseUrl', message: 'indirizzo del servizio OAuth ancora segnaposto', hint: 'metti l’indirizzo del worker condiviso: vedi docs/decap.md' });
	}

	// Bozze linkate.
	const recipes = loadRecipes(root, (file, message) => error({ file, message }));
	const resolve = linkResolver(root, recipes);
	const checkDraftLink = (file: string, where: string, href: string, from?: string) => {
		const target = resolve(href, from);
		if (target.kind === 'page' && target.recipe?.draft) {
			error({ file, where, message: `link a "${href}", che è una bozza (draft: true)`, hint: 'pubblica la pagina (draft: false) o togli il link' });
		}
	};
	for (const recipe of recipes.filter((item) => !item.draft)) {
		eachString(recipe.data, [], (path, text) => {
			if (lastKey(path) === 'href') checkDraftLink(recipe.file, fieldPath(path), text, recipe.route);
		});
	}
	const navigationFile = join(settingsDir, 'navigation.json');
	if (existsSync(navigationFile)) {
		const navigation = readJsonFile(navigationFile, () => {});
		if (navigation !== undefined) {
			eachString(navigation, [], (path, text) => {
				if (lastKey(path) === 'href') checkDraftLink('src/content/settings/navigation.json', fieldPath(path), text);
			});
		}
	}

	// Campi "fonte" compilati.
	const sources: [string, unknown][] = [
		...recipes.map((recipe) => [recipe.file, recipe.data] as [string, unknown]),
		...readdirSync(settingsDir)
			.filter((name) => name.endsWith('.json'))
			.map((name) => [`src/content/settings/${name}`, readJsonFile(join(settingsDir, name), () => {})] as [string, unknown]),
	];
	for (const [file, data] of sources) {
		if (data === undefined) continue;
		eachObject(data as never, [], (path, object) => {
			for (const [key, value] of Object.entries(object)) {
				if (SOURCE_KEY.test(key) && (value === null || (typeof value === 'string' && !value.trim()))) {
					error({ file, where: fieldPath([...path, key]), message: 'fonte vuota', hint: 'indica da dove viene il contenuto (es. «Recensione Google, marzo 2026»)' });
				}
			}
		});
	}

	// Build.
	if (!existsSync(DIST)) {
		error({ file: 'dist', message: 'build mancante', hint: 'esegui npm run build prima del controllo' });
		return findings;
	}
	if (!readdirSync(DIST).some((name) => /^sitemap.*\.xml$/.test(name))) {
		error({ file: 'dist', message: 'sitemap mancante', hint: 'serve l’integrazione @astrojs/sitemap in astro.config.mjs' });
	}
	if (!existsSync(join(DIST, 'robots.txt'))) {
		error({ file: 'dist/robots.txt', message: 'robots.txt mancante', hint: 'è generato da src/pages/robots.txt.ts' });
	} else if (!/^Sitemap:/m.test(readFileSync(join(DIST, 'robots.txt'), 'utf8'))) {
		warning({ file: 'dist/robots.txt', message: 'non indica la sitemap' });
	}
	if (!['favicon.ico', 'favicon.svg'].some((name) => existsSync(join(DIST, name)))) {
		error({ file: 'public', message: 'favicon mancante', hint: 'metti favicon.svg e favicon.ico in public/' });
	}

	const pages = builtPages().filter((path) => !path.startsWith('/catalogo/'));
	for (const path of pages) {
		const html = htmlOf(path);
		const missing = OPEN_GRAPH.filter((property) => !new RegExp(`<meta[^>]+property="${property}"`).test(html));
		if (missing.length > 0) {
			error({
				file: 'dist',
				where: path,
				message: `Open Graph incompleto: manca ${missing.join(', ')}`,
				hint: missing.includes('og:image') ? 'imposta ogImage nella ricetta della pagina' : 'controlla title e description della ricetta',
			});
		}
	}

	// Footer: dati legali di site.json e link a privacy e cookie, su ogni pagina.
	const { COMPANY_FORMS, LEGAL_FORM_NAMES, PLACEHOLDER } = await withProjectModules((load) => load('/src/core/settings.ts'));
	const site = readJsonFile(join(settingsDir, 'site.json'), () => {});
	const legalForm = isObject(site) && typeof site.legalForm === 'string' ? site.legalForm : undefined;
	const company = legalForm !== undefined && (COMPANY_FORMS as string[]).includes(legalForm);
	const legalData = [
		{ field: 'vatNumber', label: 'la P.IVA', prefix: 'P.IVA', required: true },
		{ field: 'rea', label: 'il numero REA', prefix: 'REA', required: company },
		{ field: 'shareCapital', label: 'il capitale sociale', prefix: 'Capitale sociale', required: company },
	];
	const footers = pages.map((path) => ({ path, html: footerOf(htmlOf(path)) }));
	const withoutFooter = footers.filter(({ html }) => !html).map(({ path }) => path);
	if (withoutFooter.length > 0) {
		error({ file: 'dist', where: listPages(withoutFooter), message: `${withoutFooter.length} pagine senza footer`, hint: 'il footer lo disegna BaseLayout da src/content/settings/layout.json' });
	}
	const withFooter = footers.filter(({ html }) => html);

	for (const { field, label, prefix, required } of legalData) {
		if (!required) continue;
		const value = isObject(site) ? site[field] : undefined;
		if (typeof value !== 'string' || !value.trim()) {
			const who = field === 'vatNumber' ? 'ogni attività' : `una società (${LEGAL_FORM_NAMES[legalForm!] ?? legalForm})`;
			error({ file: 'src/content/settings/site.json', where: field, message: `manca ${label}: ${who} deve indicarlo sul sito`, hint: 'compilalo in «Dati attività»' });
			continue;
		}
		// Il segnaposto lo segnala già il controllo sulle impostazioni.
		if (value === PLACEHOLDER) continue;
		const missing = withFooter.filter(({ html }) => !textOf(html).includes(`${prefix} ${value}`)).map(({ path }) => path);
		if (missing.length > 0) {
			error({ file: 'dist', where: listPages(missing), message: `${missing.length} pagine senza ${label} nel footer («${prefix} ${value}»)`, hint: 'il footer la mostra da site.json: controlla layout.json e il blocco footer' });
		}
	}

	for (const legal of LEGAL_LINKS) {
		const missing: string[] = [];
		const broken = new Map<string, string>();
		for (const { path, html } of withFooter) {
			const link = anchorsOf(html).find(({ href, text }) => legal.routes.some((route) => samePath(href, route)) || legal.text.test(text));
			if (!link) {
				missing.push(path);
				continue;
			}
			const problem = (() => {
				if (/^https:\/\//i.test(link.href)) return undefined;
				if (!link.href.startsWith('/')) return `«${link.text}» porta a "${link.href}": serve una pagina del sito o un indirizzo https`;
				const target = trimSlash(link.href.split(/[?#]/)[0]);
				// Una bozza linkata la segnala già il controllo sulle bozze (i link del footer sono in navigation.json).
				if (!pages.some((page) => trimSlash(page) === target)) return `«${link.text}» porta a "${link.href}", che non esiste nella build`;
				return undefined;
			})();
			if (problem && !broken.has(problem)) broken.set(problem, path);
		}
		if (missing.length > 0) {
			error({
				file: 'src/content/settings/navigation.json',
				where: `footer.legal · ${listPages(missing)}`,
				message: `${missing.length} pagine senza link ${legal.label} nel footer`,
				hint: `aggiungi a footer.legal il link alla pagina ${legal.name} (es. ${legal.routes[0]}) o all’informativa esterna`,
			});
		}
		for (const [message, path] of broken) {
			error({ file: 'src/content/settings/navigation.json', where: `footer.legal · ${path}`, message, hint: `crea e pubblica la pagina ${legal.name} (ricetta in src/content/pages) o correggi il link` });
		}
	}
	return findings;
}
