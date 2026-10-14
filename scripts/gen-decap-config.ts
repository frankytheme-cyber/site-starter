/**
 * Genera public/admin/config.yml per Decap CMS dagli schemi Zod di blocchi, ricette di pagina e
 * impostazioni: i campi del CMS sono sempre quelli che la build valida.
 *
 * Ogni campo deve avere .describe("Etichetta|Aiuto"); un campo senza descrizione o di un tipo che
 * Decap non sa rappresentare ferma lo script con il blocco e il campo da sistemare.
 *
 * Uso: npm run gen:decap                   scrive public/admin/config.yml
 *      npm run gen:decap -- --repo=org/sito  repo GitHub esplicito
 *      npm run check:decap                 (scripts/checks/decap.ts) fallisce se il file non è aggiornato
 * Repo: --repo, poi DECAP_REPO, poi VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, poi il remote "origin".
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { withProjectModules } from './checks/lib/vite.ts';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const DECAP_CONFIG = join(ROOT, 'public/admin/config.yml');

/** Il JSON di una pagina sta in src/content/pages: da lì le immagini sono in ../../assets/images. */
const MEDIA_FROM_CONTENT = '../../assets/images';
const PAGES_SCHEMA = '../../../.astro/collections/pages.schema.json';
const IMAGE_MARKER = 'image';

// Tipi minimi per leggere gli schemi di Zod 4 senza dipendere dalle sue classi.
interface ZodLike {
	description?: string;
	meta(): Record<string, unknown> | undefined;
	_zod: { def: Record<string, any> & { type: string } };
	minLength?: number | null;
	maxLength?: number | null;
	options?: unknown[];
}
type DecapField = Record<string, unknown>;
interface BlockMeta {
	name: string;
	description: string;
	category: string;
}

const problems: string[] = [];

// ---------------------------------------------------------------------------- repo

function resolveRepo(): string {
	const flag = process.argv.find((arg) => arg.startsWith('--repo='))?.slice('--repo='.length);
	const vercel =
		process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
			? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
			: undefined;
	let repo = flag ?? process.env.DECAP_REPO ?? vercel;
	if (!repo) {
		try {
			const origin = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
			repo = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/.exec(origin)?.[1];
		} catch {}
	}
	if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
		throw new Error('Repo GitHub non trovato: usa --repo=org/nome o la variabile DECAP_REPO.');
	}
	return repo;
}

// ---------------------------------------------------------------------------- Zod → Decap

/** Toglie optional/nullable/default e raccoglie cosa dicono; la descrizione può stare sul wrapper o dentro. */
function unwrap(schema: ZodLike) {
	let current = schema;
	let optional = false;
	let hasDefault = false;
	let defaultValue: unknown;
	let description = current.description;
	for (;;) {
		const { type } = current._zod.def;
		if (type === 'optional' || type === 'nullable') optional = true;
		else if (type === 'default' || type === 'prefault') {
			hasDefault = true;
			defaultValue = current._zod.def.defaultValue;
		} else break;
		current = current._zod.def.innerType;
		description ??= current.description;
	}
	return { schema: current, optional, hasDefault, defaultValue, description };
}

/** "Etichetta|Aiuto" → { label, hint }. */
function labels(description: string | undefined, where: string): { label: string; hint?: string } | undefined {
	if (!description?.trim()) {
		problems.push(`${where}: manca .describe("Etichetta|Aiuto")`);
		return undefined;
	}
	const [label, ...hint] = description.split('|');
	return { label: label.trim(), ...(hint.length > 0 && { hint: hint.join('|').trim() }) };
}

/** Pattern di Decap (regex + messaggio) dai vincoli di una stringa Zod: lunghezza, formato, regex. */
function stringPattern(schema: ZodLike): [string, string] | undefined {
	const parts: string[] = [];
	const messages: string[] = [];
	const min = schema.minLength ?? 0;
	const max = schema.maxLength ?? undefined;
	if (max !== undefined || min > 1) {
		parts.push(`^[\\s\\S]{${min},${max ?? ''}}$`);
		messages.push(
			max === undefined
				? `almeno ${min} caratteri`
				: min > 1
					? `tra ${min} e ${max} caratteri`
					: `al massimo ${max} caratteri`,
		);
	}
	const format = schema._zod.def.format as string | undefined;
	if (format === 'email') {
		parts.push('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
		messages.push('un indirizzo email, es. info@esempio.it');
	} else if (format === 'url') {
		parts.push('^https://\\S+$');
		messages.push('un indirizzo completo che inizia con https://');
	}
	for (const check of (schema._zod.def.checks ?? []) as ZodLike[]) {
		const def = check._zod.def;
		if (def.format !== 'regex') continue;
		parts.push(String(def.pattern.source));
		const error = def.error?.({ code: 'invalid_format', input: '' });
		messages.push(typeof error === 'string' ? error : (error?.message ?? 'formato non valido'));
	}
	if (parts.length === 0) return undefined;
	// Più vincoli insieme: un lookahead ciascuno, tutti ancorati all'inizio del testo.
	const pattern = parts.length === 1 ? parts[0] : parts.map((part) => `(?=${part})`).join('');
	return [pattern, messages.join('; ')];
}

const typeOf = (schema: ZodLike) => schema._zod.def.type;
const isStringLike = (schema: ZodLike) => typeOf(schema) === 'string' || typeOf(schema) === 'literal';

/** Opzioni di una select: con .meta({ optionLabels }) sull'enum diventano { label, value }. */
function selectOptions(schema: ZodLike): unknown[] {
	const values = schema.options ?? [];
	const labels = schema.meta()?.optionLabels as Record<string, string> | undefined;
	return labels ? values.map((value) => ({ label: labels[String(value)] ?? String(value), value })) : values;
}

/** Larghezze delle liste (min/max) dai check di un array Zod. */
function listBounds(schema: ZodLike): DecapField {
	const bounds: DecapField = {};
	for (const check of (schema._zod.def.checks ?? []) as ZodLike[]) {
		const def = check._zod.def;
		if (def.check === 'min_length') bounds.min = def.minimum;
		if (def.check === 'max_length') bounds.max = def.maximum;
	}
	return bounds;
}

/**
 * Un campo Decap da uno schema Zod.
 * parentOptional: dentro un oggetto facoltativo i campi non possono essere obbligatori per Decap,
 * che li valida uno per uno anche quando l'oggetto è vuoto ("tutto o niente" lo verifica la build).
 */
function toField(name: string, input: ZodLike, where: string, ctx: { metas: Record<string, BlockMeta>; parentOptional: boolean }): DecapField | undefined {
	const { schema, optional, hasDefault, defaultValue, description } = unwrap(input);
	const text = labels(description, where);
	const field: DecapField = { name, ...text };
	const optionalHere = optional || hasDefault || ctx.parentOptional;
	if (optionalHere) field.required = false;
	if (hasDefault) field.default = defaultValue;

	const type = typeOf(schema);
	const widget = (() => {
		if (type === 'string' && schema.meta()?.decapWidget === IMAGE_MARKER) return { widget: 'image', choose_url: false };
		if (type === 'string' || (type === 'union' && schema._zod.def.options.every(isStringLike))) {
			// Unione di stringa e segnaposto (es. telefono o "DA-COMPILARE"): nel CMS vale il formato vero.
			const base = type === 'union' ? schema._zod.def.options.find((option: ZodLike) => typeOf(option) === 'string') : schema;
			if (!base) return undefined;
			const max = base.maxLength ?? undefined;
			const pattern = stringPattern(base);
			return { widget: max !== undefined && max > 120 ? 'text' : 'string', ...(pattern && { pattern }) };
		}
		if (type === 'enum') return { widget: 'select', options: selectOptions(schema) };
		if (type === 'boolean') return { widget: 'boolean', ...(!optionalHere && { default: false }) };
		if (type === 'number') return { widget: 'number', value_type: 'float' };
		if (type === 'object') {
			const fields = objectFields(schema, where, { ...ctx, parentOptional: optionalHere });
			return { widget: 'object', collapsed: optionalHere, fields };
		}
		if (type === 'array') return toList(schema, where, ctx, optionalHere);
		return undefined;
	})();

	if (!widget) {
		problems.push(`${where}: tipo non mappabile in Decap (${type})`);
		return undefined;
	}
	return { ...field, ...widget };
}

function objectFields(schema: ZodLike, where: string, ctx: { metas: Record<string, BlockMeta>; parentOptional: boolean }, skip: string[] = []) {
	const shape = schema._zod.def.shape as Record<string, ZodLike>;
	return Object.entries(shape)
		.filter(([key]) => !skip.includes(key))
		.map(([key, child]) => toField(key, child, `${where} › ${key}`, ctx))
		.filter((field): field is DecapField => field !== undefined);
}

/** Lista: di oggetti (fields), di valori semplici (field) o di tipi diversi (types, una per blocco). */
function toList(schema: ZodLike, where: string, ctx: { metas: Record<string, BlockMeta>; parentOptional: boolean }, optional: boolean): DecapField | undefined {
	const element = unwrap(schema._zod.def.element).schema;
	const bounds = listBounds(schema);
	const itemCtx = { ...ctx, parentOptional: false };

	const discriminator = element._zod.def.discriminator as string | undefined;
	if (typeOf(element) === 'union' && discriminator) {
		const typeValue = (option: ZodLike) => String(option._zod.def.shape[discriminator]._zod.def.values[0]);
		// Stesso ordine del catalogo: categoria, poi nome (l'hero, "apertura", viene per primo).
		const sortKey = (option: ZodLike) => {
			const meta = ctx.metas[typeValue(option)];
			return meta ? `${meta.category}\u0000${meta.name}` : typeValue(option);
		};
		const options = [...(element._zod.def.options as ZodLike[])].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
		const types = options.map((option) => {
			const value = typeValue(option);
			const meta = ctx.metas[value];
			const blockWhere = `blocco ${value}`;
			const fields = objectFields(option, blockWhere, itemCtx, [discriminator]);
			const hasTitle = fields.some((field) => field.name === 'title');
			return {
				name: value,
				label: meta?.name ?? value,
				widget: 'object',
				...(meta && { hint: meta.description }),
				summary: hasTitle ? '{{fields.title}}' : '{{fields.variant}}',
				fields,
			};
		});
		return { widget: 'list', typeKey: discriminator, types, ...bounds, collapsed: true };
	}
	if (typeOf(element) === 'object') {
		return { widget: 'list', fields: objectFields(element, where, itemCtx), ...bounds, collapsed: optional };
	}
	// Lista di valori da un elenco chiuso (es. i giorni di un orario): una select a scelta multipla.
	if (typeOf(element) === 'enum') return { widget: 'select', multiple: true, options: selectOptions(element), ...bounds };
	const field = toField('item', schema._zod.def.element, `${where}[]`, itemCtx);
	return field && { widget: 'list', field, ...bounds };
}

// ---------------------------------------------------------------------------- moduli del sito

/** Carica gli schemi con Vite (alias @/, import.meta.glob), senza i componenti e senza astro:content. */
function loadProject() {
	return withProjectModules(async (load) => {
		const [blocks, page, settings, navigation, siteConfig] = await Promise.all([
			load('/src/core/block-schemas.ts'),
			load('/src/core/page-schema.ts'),
			load('/src/core/settings.ts'),
			load('/src/core/navigation.ts'),
			load('/src/site.config.ts'),
		]);
		return { blocks, page, settings, navigation, siteConfig: siteConfig.default };
	});
}

// ---------------------------------------------------------------------------- configurazione

async function buildConfig() {
	const repo = resolveRepo();
	const { blocks, page, settings, navigation, siteConfig } = await loadProject();
	const { z } = await import('astro/zod');

	// image() del generatore: una stringa marcata, che diventa il widget image di Decap.
	const context = { image: () => z.string().meta({ decapWidget: IMAGE_MARKER }) };
	const metas = blocks.blockMetas as Record<string, BlockMeta>;
	const ctx = { metas, parentOptional: false };

	const pageFields = objectFields(page.pageSchema(context), 'pagine', ctx);
	const siteFields = objectFields(settings.siteSettingsSchema(context), 'Dati attività', ctx);
	const navigationFields = objectFields(navigation.navigationSchema, 'Menu', ctx);

	const site = JSON.parse(readFileSync(join(ROOT, 'src/content/settings/site.json'), 'utf8'));
	const media = { media_folder: MEDIA_FROM_CONTENT, public_folder: MEDIA_FROM_CONTENT };
	const noPreview = { editor: { preview: false } };

	return {
		backend: {
			name: 'github',
			repo,
			branch: siteConfig.cms.branch,
			base_url: siteConfig.cms.oauthBaseUrl,
			auth_endpoint: 'auth',
			commit_messages: {
				create: 'Crea {{collection}} «{{slug}}»',
				update: 'Aggiorna {{collection}} «{{slug}}»',
				delete: 'Elimina {{collection}} «{{slug}}»',
				uploadMedia: 'Carica «{{path}}»',
				deleteMedia: 'Elimina «{{path}}»',
			},
		},
		// Solo su localhost: il CMS usa decap-server (npm run cms:local) invece di GitHub.
		local_backend: true,
		publish_mode: 'editorial_workflow',
		locale: 'it',
		site_url: site.url,
		display_url: site.url,
		media_folder: 'src/assets/images',
		public_folder: '/src/assets/images',
		slug: { encoding: 'ascii', clean_accents: true, sanitize_replacement: '-' },
		...noPreview,
		collections: [
			{
				name: 'pages',
				label: 'Pagine',
				label_singular: 'Pagina',
				description: 'Le pagine del sito: ogni pagina è un elenco di sezioni. La home è «index».',
				folder: 'src/content/pages',
				extension: 'json',
				format: 'json',
				create: true,
				slug: '{{slug}}',
				identifier_field: 'title',
				summary: '{{title}}',
				...media,
				...noPreview,
				fields: [{ name: '$schema', widget: 'hidden', default: PAGES_SCHEMA }, ...pageFields],
			},
			{
				name: 'site',
				label: 'Dati attività',
				description: 'Nome, recapiti, indirizzo, orari e dati legali: compaiono in tutto il sito.',
				...noPreview,
				files: [
					{ name: 'site', label: 'Dati attività', file: 'src/content/settings/site.json', ...media, fields: siteFields },
				],
			},
			{
				name: 'navigation',
				label: 'Menu',
				description: 'Le voci del menu in cima al sito, il pulsante in evidenza e i link del footer.',
				...noPreview,
				files: [{ name: 'navigation', label: 'Menu', file: 'src/content/settings/navigation.json', fields: navigationFields }],
			},
		],
	};
}

// ---------------------------------------------------------------------------- uscita

const HEADER =
	'# Generato da scripts/gen-decap-config.ts (npm run gen:decap): non modificare a mano.\n' +
	'# I campi vengono dagli schemi Zod di blocchi, pagine e impostazioni.\n';

/** Genera il contenuto di config.yml; problems elenca i campi da sistemare (senza descrizione o non mappabili). */
export async function generateDecapConfig() {
	problems.length = 0;
	const config = await buildConfig();
	const output = HEADER + stringify(config, { lineWidth: 0, aliasDuplicateObjects: false });
	return { output, problems: [...problems], repo: config.backend.repo, collections: config.collections.length };
}

// Eseguito come comando (npm run gen:decap): scrive il file.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const { output, problems: found, repo, collections } = await generateDecapConfig();
		if (found.length > 0) {
			console.error('Configurazione di Decap non generata:');
			for (const problem of found) console.error(`  ✗ ${problem}`);
			process.exit(1);
		}
		mkdirSync(dirname(DECAP_CONFIG), { recursive: true });
		writeFileSync(DECAP_CONFIG, output);
		console.log(`Scritto public/admin/config.yml (${collections} collezioni, repo ${repo}).`);
	} catch (error) {
		console.error((error as Error).message);
		process.exit(1);
	}
}
