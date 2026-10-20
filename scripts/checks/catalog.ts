/**
 * Parte del check "blocks" (solo nella libreria): docs/catalogo corrisponde a schemi, schede e fixture.
 * Rigenera in memoria tutto quello che scriverebbe npm run gen:catalog e lo confronta coi file.
 * - .md e catalogo.json uguali a quelli generati (la sezione «Regole di composizione» del README è
 *   scritta a mano e non conta); nessuna pagina in più (blocco eliminato o rinominato);
 * - schede coerenti (i problemi di gen-catalog): varianti con descrizione e «quando usarla», ogni
 *   refine/superRefine col suo // rule: riportato in meta.rules, fieldRules su campi e varianti che
 *   esistono, mood di 2-4 aggettivi, colori delle palette uguali al CSS, una scheda per preset;
 * - ogni screenshot citato c'è: due per variante (desktop e mobile) e uno per palette;
 * - le ricette tipo (docs/catalogo/ricette-tipo/*.json) sono valide per lo schema delle pagine, con
 *   immagini che esistono e link interni a pagine e ancore dell'insieme.
 * Screenshot che nessuna pagina cita: avviso.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { CATALOG_DIR, generateCatalog, stalePages } from '../gen-catalog.ts';
import { CONTENT_HINT, contentProblems } from '../../src/core/content-validation.ts';
import { eachString, fieldPath, type Json, lastKey, readJsonFile, trimSlash } from './lib/content.ts';
import { rel } from './lib/project.ts';
import type { collector } from './lib/report.ts';
import { withProjectModules } from './lib/vite.ts';

const HINT = 'esegui npm run gen:catalog (o npm run catalog) e fai il commit di docs/catalogo';
const RECIPES_DIR = 'docs/catalogo/ricette-tipo';

type Report = Pick<ReturnType<typeof collector>, 'error' | 'warning'>;

export async function checkCatalog(root: string, { error, warning }: Report) {
	const { files, images, problems } = await generateCatalog();

	for (const problem of problems) {
		const [file, message] = problem.includes(': ') ? problem.split(/: (.*)/s) : [undefined, problem];
		error({ file: file?.split(' › ')[0], where: file?.split(' › ')[1], message: message ?? problem, hint: 'sistema la scheda, poi npm run gen:catalog' });
	}
	// Con problemi (es. un blocco che non si carica, la scheda di un preset che manca) i file generati
	// sono incompleti e gen:catalog non li scriverebbe: il confronto non avrebbe senso.
	if (problems.length > 0 || Object.keys(files).length === 0) {
		await checkRecipes(root, error);
		return;
	}

	for (const [path, content] of Object.entries(files)) {
		const file = join(CATALOG_DIR, path);
		const current = existsSync(file) ? readFileSync(file, 'utf8') : undefined;
		if (current === content) continue;
		const line = current === undefined ? -1 : content.split('\n').findIndex((text, index) => text !== current.split('\n')[index]);
		error({
			file: rel(file),
			where: line >= 0 ? `riga ${line + 1}` : undefined,
			message: current === undefined ? 'file mancante' : 'non corrisponde a schemi, schede e fixture: rigeneralo',
			hint: HINT,
		});
	}
	for (const path of stalePages(files)) {
		error({ file: rel(join(CATALOG_DIR, path)), message: 'file che il generatore non produce (scritto a mano o di un blocco che non c’è più)', hint: `${HINT}: gen:catalog lo toglie` });
	}

	const imgDir = join(CATALOG_DIR, 'img');
	for (const image of images.filter((name) => !existsSync(join(imgDir, name)))) {
		error({ file: `docs/catalogo/img/${image}`, message: 'screenshot mancante', hint: 'npm run screenshots (build, anteprima e Playwright) e commit delle immagini' });
	}
	const extra = existsSync(imgDir) ? readdirSync(imgDir).filter((name) => name.endsWith('.webp') && !images.includes(name)) : [];
	for (const image of extra) {
		warning({ file: `docs/catalogo/img/${image}`, message: 'screenshot che nessuna pagina cita', hint: 'npm run screenshots toglie quelli superflui' });
	}

	await checkRecipes(root, error);
}

/** Ricette tipo: <insieme>-<pagina>.json, dove la pagina "home" è "/" e le altre "/<pagina>". */
async function checkRecipes(root: string, error: ReturnType<typeof collector>['error']) {
	const dir = join(root, RECIPES_DIR);
	if (!existsSync(dir)) return;
	const pagesDir = join(root, 'src/content/pages');
	const recipes = readdirSync(dir)
		.filter((name) => name.endsWith('.json'))
		.sort()
		.flatMap((name) => {
			const file = `${RECIPES_DIR}/${name}`;
			const data = readJsonFile(join(dir, name), (message) => error({ file, message }));
			const [, set, page] = /^(.+?)-(.+)\.json$/.exec(name) ?? [];
			if (!page) {
				error({ file, message: 'nome non valido', hint: 'usa <insieme>-<pagina>.json, es. artigiano-servizi.json (home = la pagina iniziale)' });
				return [];
			}
			return data === undefined ? [] : [{ file, data, set, route: page === 'home' ? '/' : `/${page}` }];
		});

	await withProjectModules(async (load) => {
		const { pageSchema } = await load('/src/core/page-schema.ts');
		// Stessi controlli e messaggi delle ricette vere; le immagini sono relative a src/content/pages,
		// dove la ricetta va copiata.
		for (const { file, data } of recipes) {
			for (const { where, message } of contentProblems(pageSchema, data, join(pagesDir, basename(file)), root)) {
				error({ file, where: where || undefined, message, hint: `le ricette tipo seguono lo schema delle pagine: ${CONTENT_HINT}` });
			}
		}
	});

	// Link interni: pagine dell'insieme (più le pagine legali del template, linkate dal footer) e loro ancore.
	// Ogni insieme ha la sua home "/": le pagine si cercano dentro l'insieme della ricetta.
	const sections = (data: Json) => (data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.sections) ? data.sections : []);
	const idsOf = (data: Json) =>
		new Set(sections(data).flatMap((section) => (section && typeof section === 'object' && !Array.isArray(section) && typeof section.id === 'string' ? [section.id] : [])));
	const byRoute = new Map(recipes.map((recipe) => [`${recipe.set} ${recipe.route}`, idsOf(recipe.data)]));
	const legal = existsSync(pagesDir) ? readdirSync(pagesDir).filter((name) => /^(privacy|cookie)\.json$/.test(name)).map((name) => `/${basename(name, '.json')}`) : [];
	for (const { file, data, set, route } of recipes) {
		eachString(data, [], (path, href) => {
			if (lastKey(path) !== 'href' || !(href.startsWith('/') || href.startsWith('#'))) return;
			const [target, anchor] = href.split('#');
			const targetRoute = target ? trimSlash(target.split('?')[0]) : route;
			const ids = byRoute.get(`${set} ${targetRoute}`);
			if (!ids && !legal.includes(targetRoute)) {
				error({ file, where: fieldPath(path), message: `link a "${href}": nessuna ricetta tipo per ${targetRoute}`, hint: 'usa le pagine dell’insieme (home, servizi, chi-siamo, contatti...)' });
			} else if (anchor && ids && !ids.has(anchor)) {
				error({ file, where: fieldPath(path), message: `link a "${href}": nessuna sezione con id "${anchor}"`, hint: 'aggiungi "id" alla sezione di destinazione o correggi il link' });
			}
		});
	}
}
