/**
 * recipes: regole di contenuto delle ricette di pagina (src/content/pages/*.json) e dei dati del
 * sito (site.json, navigation.json). Forma e lunghezze dei campi le verifica già la build.
 *
 * Errori con --strict (senza, e sempre nella libreria, sono avvisi): segnaposto (DA-COMPILARE,
 * lorem, TODO, […]); telefoni, email o P.IVA scritti nei testi delle sezioni; più di un hero;
 * id di sezione duplicati; link interni a pagine o ancore inesistenti; alt uguale al nome del file.
 * Avvisi: due sezioni consecutive con lo stesso tone; più di 12 sezioni; prima sezione che non è
 * un hero; nessuna cta.
 */
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { MAX_SECTIONS } from '../../src/core/recipe-rules.ts';
import { type CheckContext, collector, type Finding } from './lib/report.ts';
import {
	eachObject,
	eachString,
	excerpt,
	fieldPath,
	type JsonObject,
	lastKey,
	type LinkTarget,
	linkResolver,
	loadRecipes,
	type Path,
	placeholdersIn,
	readJsonFile,
	type Recipe,
} from './lib/content.ts';


/** Chiavi che non contengono testo per chi visita: niente controlli sul contenuto. */
const NOT_TEXT = new Set(['$schema', 'type', 'id', 'tone', 'variant', 'icon']);

/** Recapiti scritti a mano: devono arrivare da site.json. Restituisce cosa è stato trovato. */
function businessDataIn(key: string, text: string): string | undefined {
	if (key === 'href') {
		if (/^(?:tel|mailto|sms):/i.test(text)) return 'un link tel:/mailto:';
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

const sectionLabel = (section: JsonObject, index: number) =>
	`sezione ${index + 1} (${String(section.type)}${typeof section.id === 'string' ? `, #${section.id}` : ''})`;

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

export function recipes({ root, strict, isLibrary }: CheckContext): Finding[] {
	const { findings, error: asError, warning } = collector('recipes');
	// Nella libreria i segnaposto del template sono voluti: le regole restano avvisi anche con --strict.
	const rule = strict && !isLibrary ? asError : warning;

	const all = loadRecipes(root, (file, message) => rule({ file, message }));
	const resolve = linkResolver(root, all);
	if (all.length === 0) rule({ file: 'src/content/pages', message: 'nessuna ricetta', hint: 'serve almeno index.json' });

	for (const recipe of all) checkRecipe(recipe);
	checkSettings();
	return findings;

	function checkRecipe({ file, data, sections, route }: Recipe) {
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
			for (const label of placeholdersIn(text)) {
				rule({ file, where: where(path), message: `segnaposto ${label}: ${excerpt(text)}`, hint: 'sostituisci con il testo vero' });
			}
			const found = businessDataIn(key, text);
			if (found) {
				rule({
					file,
					where: where(path),
					message: `${found}${key === 'href' ? '' : ' nel testo'}: ${excerpt(text)}`,
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
		if (!sections.some((section) => section.type === 'cta')) {
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
					rule({ file, where: fieldPath(jsonPath), message: `segnaposto ${label}: ${excerpt(text)}`, hint: 'sostituisci con il dato vero (anche dal CMS)' });
				}
				if (name === 'navigation.json' && key === 'href') {
					const problem = linkProblem(text, resolve(text, undefined));
					if (problem) rule({ file, where: fieldPath(jsonPath), ...problem });
				}
			});
		}
	}
}
