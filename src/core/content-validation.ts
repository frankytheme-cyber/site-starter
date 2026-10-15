import type { SchemaContext } from 'astro:content';
import { existsSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AstroError } from 'astro/errors';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * Validazione di ricette di pagina e impostazioni con messaggi in italiano e il percorso del
 * campo come lo ritrova chi apre il JSON, con gli indici da 1:
 *   pagina index.json → sezione 3 (services) → items[2].title: troppo lungo: 90 caratteri, al massimo 70
 * La usano content.config.ts (prima della validazione di Astro, così dev, build e astro check
 * danno questi messaggi) e il check recipes, che gira prima della build. Niente import relativi:
 * gli script la caricano direttamente con Node.
 */

// ---------------------------------------------------------------------------- messaggi

const TYPE_NAMES: Record<string, string> = {
	string: 'un testo',
	number: 'un numero',
	int: 'un numero intero',
	boolean: 'true o false',
	array: 'un elenco',
	object: 'un oggetto',
	date: 'una data',
	null: 'null',
};
const typeOf = (value: unknown) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);
const typeName = (type: string) => TYPE_NAMES[type] ?? type;
const quote = (value: unknown) => JSON.stringify(value) ?? String(value);
const sizeOf = (value: unknown) => (typeof value === 'string' || Array.isArray(value) ? value.length : undefined);

/**
 * Error map di Zod in italiano. Le regole con un messaggio proprio nello schema (regex, refine)
 * tengono il loro; i casi non coperti qui passano alla traduzione italiana di Zod.
 */
export const italianErrors: z.core.$ZodErrorMap = (issue) => {
	switch (issue.code) {
		case 'invalid_type':
			if (issue.input === undefined) return 'campo obbligatorio mancante';
			return `atteso ${typeName(issue.expected)}, trovato ${typeName(typeOf(issue.input))}`;
		case 'too_big': {
			const limit = `${issue.inclusive === false ? 'meno di' : 'al massimo'} ${issue.maximum}`;
			const size = sizeOf(issue.input);
			if (issue.origin === 'string') return `troppo lungo: ${size} caratteri, ${limit}`;
			if (issue.origin === 'array') return `troppi elementi: ${size}, ${limit}`;
			return `troppo grande: ${limit}`;
		}
		case 'too_small': {
			const minimum = Number(issue.minimum);
			const limit = `${issue.inclusive === false ? 'più di' : 'almeno'} ${minimum}`;
			const size = sizeOf(issue.input);
			if (issue.origin === 'string') return minimum === 1 && issue.inclusive !== false ? 'non può essere vuoto' : `troppo corto: ${size} caratteri, ${limit}`;
			if (issue.origin === 'array') return minimum === 1 && issue.inclusive !== false ? 'serve almeno un elemento' : `troppo pochi elementi: ${size}, ${limit}`;
			return `troppo piccolo: ${limit}`;
		}
		case 'invalid_value':
			if (issue.values.length === 1) return `deve essere ${quote(issue.values[0])}`;
			return `${quote(issue.input)} non è ammesso: scegli tra ${issue.values.map(quote).join(', ')}`;
		case 'invalid_format':
			if (issue.format === 'email') return 'indirizzo email non valido (es. info@esempio.it)';
			if (issue.format === 'url') return 'indirizzo web non valido: scrivilo completo, es. https://www.esempio.it';
			return issue.format === 'regex' ? 'formato non valido' : `formato non valido (${issue.format})`;
		case 'invalid_union': {
			if (issue.discriminator) {
				const value = (issue.input as Record<string, unknown> | undefined)?.[issue.discriminator];
				const allowed = (issue as { options?: unknown[] }).options;
				const options = allowed ? `: usa uno tra ${allowed.join(', ')}` : '';
				return value === undefined ? `manca "${issue.discriminator}"${options}` : `${quote(value)} non è ammesso${options}`;
			}
			const first = issue.errors[0]?.[0]?.message;
			return first ? `valore non valido: ${first}` : 'valore non valido';
		}
		case 'unrecognized_keys':
			return issue.keys.length === 1 ? `campo sconosciuto ${quote(issue.keys[0])}` : `campi sconosciuti ${issue.keys.map(quote).join(', ')}`;
		case 'custom':
			return 'valore non valido';
	}
	return undefined;
};

/** Messaggi di Zod in italiano in tutto il processo (la configurazione di Zod è globale). */
export function useItalianErrors() {
	z.config({ ...z.locales.it(), customError: italianErrors });
}

// ---------------------------------------------------------------------------- percorsi

/** Percorso di un campo con gli indici da 1: ["items", 1, "title"] → "items[2].title". */
export const fieldPath = (path: readonly PropertyKey[]) =>
	path.map((part, index) => (typeof part === 'number' ? `[${part + 1}]` : index === 0 ? String(part) : `.${String(part)}`)).join('');

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** "sezione 3 (services)": posizione da 1 e tipo del blocco. */
export function sectionLabel(section: unknown, index: number) {
	const type = isRecord(section) && typeof section.type === 'string' ? section.type : undefined;
	return `sezione ${index + 1}${type ? ` (${type})` : ''}`;
}

/** Dove sta un campo: in una ricetta «sezione 3 (services) → items[2].title», altrove il suo percorso. */
export function fieldLocation(data: unknown, path: readonly PropertyKey[]) {
	const sections = isRecord(data) && Array.isArray(data.sections) ? data.sections : undefined;
	if (sections && path[0] === 'sections' && typeof path[1] === 'number') {
		const label = sectionLabel(sections[path[1]], path[1]);
		const rest = fieldPath(path.slice(2));
		return rest ? `${label} → ${rest}` : label;
	}
	return fieldPath(path);
}

// ---------------------------------------------------------------------------- validazione

/** Percorso su disco di un'immagine: relativo al JSON o con l'alias @/; gli indirizzi web restano fuori. */
function imageFile(value: string, file: string, root: string) {
	if (value.startsWith('@/')) return join(root, 'src', value.slice(2));
	if (value.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(value)) return undefined;
	return resolve(dirname(file), value);
}

const fromRoot = (root: string, path: string) => relative(root, path).split(sep).join('/');

/**
 * Contesto degli schemi per validare un JSON (file) fuori dalla pipeline delle immagini di Astro:
 * image() accetta il percorso solo se il file esiste.
 */
export function imageContext(file: string, root: string): SchemaContext {
	const image = () =>
		z.string().superRefine((value, context) => {
			const path = imageFile(value, file, root);
			if (path && !existsSync(path)) {
				context.addIssue({ code: 'custom', message: `immagine non trovata: "${value}" (relativo al JSON) porta a ${fromRoot(root, path)}, che non esiste` });
			}
		});
	return { image } as unknown as SchemaContext;
}

export type ContentSchema = z.ZodType | ((context: SchemaContext) => z.ZodType);

export interface ContentProblem {
	path: PropertyKey[];
	/** fieldLocation del campo: "" se il problema riguarda tutto il file. */
	where: string;
	message: string;
}

/** I problemi di data per lo schema, con messaggi in italiano e percorsi leggibili. */
export function contentProblems(schema: ContentSchema, data: unknown, file: string, root: string): ContentProblem[] {
	const resolved = typeof schema === 'function' ? schema(imageContext(file, root)) : schema;
	const result = resolved.safeParse(data, { error: italianErrors });
	if (result.success) return [];
	return result.error.issues.map((issue) => ({ path: issue.path, where: fieldLocation(data, issue.path), message: issue.message }));
}

export const CONTENT_HINT = 'sezioni ed elementi si contano da 1; formato delle ricette in src/content/pages/README.md, campi dei blocchi in docs/catalogo';

interface CheckedOptions {
	schema: ContentSchema;
	/** Come si chiama il file nei messaggi: "pagina" → «pagina index.json → ...». */
	label: string;
	/** Trasforma i dati prima della validazione (es. toglie i campi vuoti lasciati dal CMS). */
	prepare?: (data: unknown) => unknown;
}

/**
 * Avvolge un loader: ogni voce è validata con contentProblems prima di arrivare ad Astro. Con dati
 * non validi dev, build e astro check si fermano con file, sezione e campo, in italiano.
 */
export function checkedLoader(loader: Loader, { schema, label, prepare = (data) => data }: CheckedOptions): Loader {
	return {
		...loader,
		load: (context) => {
			const root = fileURLToPath(context.config.root);
			return loader.load({
				...context,
				parseData: (props) => {
					const data = prepare(props.data) as typeof props.data;
					const file = resolve(root, props.filePath ?? '');
					const problems = props.filePath ? contentProblems(schema, data, file, root) : [];
					if (problems.length > 0) {
						const name = `${label} ${basename(file)}`;
						throw new AstroError(
							[`Dati non validi in ${fromRoot(root, file)}:`, ...problems.map(({ where, message }) => `${where ? `${name} → ${where}` : name}: ${message}`)].join('\n'),
							CONTENT_HINT,
						);
					}
					return context.parseData({ ...props, data });
				},
			});
		},
	};
}
