/**
 * recipes: ricette di pagina (src/content/pages/*.json) e impostazioni (src/content/settings/*.json).
 *
 * Sempre errori, prima della build: dati non validi per lo schema (gli stessi controlli e messaggi
 * della build, src/core/content-validation.ts) e immagini che non esistono, con file, sezione e
 * campo. Con questi errori run.ts salta astro-check e build, che fallirebbero allo stesso modo.
 *
 * Il resto sono regole di contenuto. Senza --strict sono tutti avvisi. Con --strict:
 * - regole strutturali, errori ovunque: telefoni, email o P.IVA scritti nei testi delle sezioni;
 *   più di un hero; id di sezione duplicati; link interni a pagine o ancore inesistenti; alt uguale
 *   al nome del file; JSON non valido;
 * - segnaposto (DA-COMPILARE, og-DA-COMPILARE, lorem, TODO, […]): errori nei siti cliente, avvisi
 *   nella libreria, dove il template li contiene per scelta.
 * Sempre avvisi: due sezioni consecutive con lo stesso tone; più di 12 sezioni; prima sezione che
 * non è un hero; nessuna cta (non nelle pagine legali, "kind": "legale", né in quelle con noindex).
 */
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { CONTENT_HINT, type ContentSchema, contentProblems, fieldLocation, sectionLabel } from '../../src/core/content-validation.ts';
import { MAX_SECTIONS } from '../../src/core/recipe-rules.ts';
import { type CheckContext, collector, type Finding } from './lib/report.ts';
import {
	eachObject,
	eachString,
	excerpt,
	fieldPath,
	type Json,
	type JsonObject,
	lastKey,
	type LinkTarget,
	linkResolver,
	loadRecipes,
	placeholdersIn,
	readJsonFile,
	type Recipe,
} from './lib/content.ts';
import { withProjectModules } from './lib/vite.ts';

const OG_HINT = 'metti l’immagine vera per i social: defaultOgImage in site.json («Dati attività»), o ogImage nella pagina';

/** Chiavi che non contengono testo per chi visita: niente controlli sul contenuto. */
const NOT_TEXT = new Set(['$schema', 'type', 'id', 'tone', 'variant', 'icon']);

/** Recapiti da cercare nei testi, nell'ordine: un pezzo di testo già preso non si conta due volte. */
const BUSINESS_DATA: { label: string; pattern: RegExp; accept?: (match: string) => boolean }[] = [
	{ label: 'un indirizzo email', pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g },
	// «P.IVA 01234567890» è un recapito solo, la parola da sola o il numero da solo pure.
	{ label: 'una partita IVA', pattern: /\b(?:p\.?\s?iva|partita\s+iva)\b(?:[\s:.]*(?:IT)?\s?\d{11}(?!\d))?|(?<!\w)(?:IT)?\d{11}(?!\d)/gi },
	{
		label: 'un numero di telefono',
		pattern: /(?:\+39[\s.-]?)?(?<!\d)(?:0\d{1,3}|3\d{2})(?:[\s.-]?\d{2,4}){2,3}(?!\d)/g,
		accept: (match) => {
			const digits = match.replace(/^\+39/, '').replace(/\D/g, '').length;
			return digits >= 8 && digits <= 11;
		},
	},
];

/** Tutti i recapiti scritti a mano in un testo (devono arrivare da site.json): cosa sono e il pezzo di testo. */
function businessDataIn(key: string, text: string): { label: string; match: string }[] {
	if (key === 'href') {
		if (/^(?:tel|mailto|sms):/i.test(text)) return [{ label: 'un link tel:/mailto:', match: text }];
		if (/\bwa\.me\/|api\.whatsapp\.com/i.test(text)) return [{ label: 'un link WhatsApp con il numero', match: text }];
		return [];
	}
	if (key === 'src') return [];
	const found: { label: string; match: string; start: number; end: number }[] = [];
	for (const { label, pattern, accept } of BUSINESS_DATA) {
		for (const { 0: match, index: start } of text.matchAll(pattern)) {
			const end = start + match.length;
			if (accept && !accept(match)) continue;
			if (found.some((item) => start < item.end && end > item.start)) continue;
			found.push({ label, match: match.trim(), start, end });
		}
	}
	return found.sort((a, b) => a.start - b.start).map(({ label, match }) => ({ label, match }));
}

/** Schemi delle impostazioni, come in src/content.config.ts: i campi vuoti si tolgono solo dove lo fa il loader. */
const SETTINGS: { name: string; module: string; schema: string; clean: boolean }[] = [
	{ name: 'site.json', module: '/src/core/settings.ts', schema: 'siteSettingsSchema', clean: true },
	{ name: 'navigation.json', module: '/src/core/navigation.ts', schema: 'navigationSchema', clean: true },
	{ name: 'theme.json', module: '/src/themes/presets.ts', schema: 'themeSchema', clean: false },
	{ name: 'layout.json', module: '/src/core/layout.ts', schema: 'layoutSchema', clean: false },
];

function linkProblem(href: string, target: LinkTarget): { message: string; hint: string } | undefined {
	if (target.kind === 'missing-page') {
		return { message: `link a "${href}": la pagina ${target.route} non esiste`, hint: target.hint };
	}
	if (target.kind === 'missing-anchor') {
		return {
			message: `link a "${href}": nessuna sezione con id "${target.anchor}" in ${target.recipe.file}`,
			hint: 'aggiungi "id" alla sezione di destinazione o correggi il link',
		};
	}
	return undefined;
}

export async function recipes({ root, strict, isLibrary }: CheckContext): Promise<Finding[]> {
	const { findings, error: asError, warning } = collector('recipes');
	const rule = strict ? asError : warning;
	// Nella libreria i segnaposto del template sono voluti: restano avvisi anche con --strict.
	const placeholderRule = strict && !isLibrary ? asError : warning;
	const placeholder = (label: string, finding: Omit<Finding, 'check' | 'level' | 'placeholder'>) =>
		placeholderRule({ ...finding, placeholder: label });

	const all = loadRecipes(root, (file, message) => rule({ file, message }));
	const resolve = linkResolver(root, all);
	if (all.length === 0) rule({ file: 'src/content/pages', message: 'nessuna ricetta', hint: 'serve almeno index.json' });

	await checkSchemas();
	for (const recipe of all) checkRecipe(recipe);
	checkSettings();
	return findings;

	/** Schema e immagini di ricette e impostazioni: gli stessi controlli della build, prima della build. */
	async function checkSchemas() {
		const settingsDir = join(root, 'src/content/settings');
		const report = (file: string, data: Json, schema: ContentSchema) => {
			for (const { where, message } of contentProblems(schema, data, join(root, file), root)) {
				asError({ file, where: where || undefined, message, hint: CONTENT_HINT, breaksBuild: true });
			}
		};
		try {
			await withProjectModules(async (load) => {
				const { withoutEmpty } = await load('/src/core/clean-data.ts');
				const { pageSchema } = await load('/src/core/page-schema.ts');
				for (const { file, data } of all) report(file, withoutEmpty(data), pageSchema);
				for (const { name, module, schema, clean } of SETTINGS) {
					const path = join(settingsDir, name);
					if (!existsSync(path)) continue;
					const file = `src/content/settings/${name}`;
					// Un JSON non valido lo segnala già checkSettings.
					const data = readJsonFile(path, () => {});
					if (data !== undefined) report(file, clean ? withoutEmpty(data) : data, (await load(module))[schema]);
				}
			});
		} catch (cause) {
			// Uno schema che non si carica è un problema del codice, non dei contenuti: lo dice la build.
			asError({ message: `schemi dei contenuti non caricati: ${(cause as Error).message.split('\n')[0]}`, hint: 'la build mostra l’errore completo' });
		}
	}

	function checkRecipe({ file, data, sections, route }: Recipe) {
		/** "sezione 3 (services) → items[2].text" oppure "title". */
		const where = (path: (string | number)[]) => fieldLocation(data, path);

		eachString(data, [], (path, text) => {
			const key = lastKey(path);
			if (NOT_TEXT.has(key)) return;
			for (const label of placeholdersIn(text)) {
				placeholder(label, {
					file,
					where: where(path),
					message: `segnaposto ${label}: ${excerpt(text)}`,
					hint: label === 'og-DA-COMPILARE' ? OG_HINT : 'sostituisci con il testo vero',
				});
			}
			for (const { label, match } of businessDataIn(key, text)) {
				rule({
					file,
					where: where(path),
					message: `${label}${key === 'href' ? '' : ' nel testo'}: ${excerpt(match)}`,
					hint: 'i recapiti stanno solo in site.json: nei link usa @telefono, @whatsapp, @email o @mappa',
				});
			}
			if (key === 'href') {
				const problem = linkProblem(text, resolve(text, route));
				if (problem) rule({ file, where: where(path), ...problem });
			}
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
				rule({
					file,
					where: where([...path, 'alt']),
					message: `alt uguale al nome del file (${basename(object.src)})`,
					hint: 'descrivi cosa mostra la foto, es. «Soggiorno con pareti verde salvia»',
				});
			}
		});

		const heroes = sections.flatMap((section, index) => (section.type === 'hero' ? [index] : []));
		if (heroes.length > 1) {
			rule({
				file,
				where: heroes.map((index) => `sezione ${index + 1}`).join(', '),
				message: `${heroes.length} hero nella pagina`,
				hint: 'ne va uno solo, in apertura: per le altre sezioni usa services o cta',
			});
		}

		const seen = new Map<string, number>();
		sections.forEach((section, index) => {
			if (typeof section.id !== 'string') return;
			const first = seen.get(section.id);
			if (first === undefined) seen.set(section.id, index);
			else {
				rule({ file, where: sectionLabel(section, index), message: `id "${section.id}" già usato dalla sezione ${first + 1}`, hint: 'ogni ancora è unica nella pagina' });
			}
		});

		if (sections.length > MAX_SECTIONS) {
			warning({ file, where: 'sections', message: `${sections.length} sezioni`, hint: `oltre ${MAX_SECTIONS} la pagina diventa lunga: valuta di dividerla` });
		}

		// Header e footer non sono sezioni (layout.json): tutte le sezioni sono contenuto.
		const content = sections.map((section, index) => ({ section, index }));
		const toneOf = (section: JsonObject) => (typeof section.tone === 'string' ? section.tone : 'default');

		if (content.length > 0 && content[0].section.type !== 'hero') {
			warning({ file, where: sectionLabel(content[0].section, content[0].index), message: 'la pagina non si apre con un hero' });
		}
		for (let i = 1; i < content.length; i++) {
			const { section, index } = content[i];
			if (toneOf(section) === toneOf(content[i - 1].section)) {
				warning({
					file,
					where: sectionLabel(section, index),
					message: `stesso tone della sezione precedente (${toneOf(section)})`,
					hint: 'alterna i toni (default, muted, primary) per separare le sezioni',
				});
			}
		}
		// Le pagine legali e quelle fuori dai motori di ricerca non chiedono un'azione a chi visita.
		const needsCta = data.kind !== 'legale' && data.noindex !== true;
		if (needsCta && !sections.some((section) => section.type === 'cta')) {
			warning({ file, where: 'sections', message: 'nessuna cta', hint: 'aggiungi un invito all’azione: la pagina non chiede a chi visita di fare un passo' });
		}
	}

	/** site.json e navigation.json: niente segnaposto, e il menu porta a pagine che esistono. */
	function checkSettings() {
		for (const name of ['site.json', 'navigation.json']) {
			const path = join(root, 'src/content/settings', name);
			if (!existsSync(path)) continue;
			const file = `src/content/settings/${name}`;
			const data = readJsonFile(path, (message) => rule({ file, message }));
			if (data === undefined) continue;
			eachString(data, [], (jsonPath, text) => {
				const key = lastKey(jsonPath);
				if (key === '$schema') return;
				for (const label of placeholdersIn(text)) {
					placeholder(label, {
						file,
						where: fieldPath(jsonPath),
						message: `segnaposto ${label}: ${excerpt(text)}`,
						hint: label === 'og-DA-COMPILARE' ? OG_HINT : 'sostituisci con il dato vero (anche dal CMS)',
					});
				}
				if (name === 'navigation.json' && key === 'href') {
					const problem = linkProblem(text, resolve(text, undefined));
					if (problem) rule({ file, where: fieldPath(jsonPath), ...problem });
				}
			});
		}
	}
}
