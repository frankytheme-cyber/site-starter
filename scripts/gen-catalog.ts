/**
 * Genera la documentazione del catalogo in docs/catalogo/ da schede, schemi e fixture dei blocchi,
 * dalle primitive di src/core/ui, dai preset del tema e dalle icone:
 *   blocchi/<tipo>.md   scheda, varianti con screenshot, tabella dei campi, esempio JSON
 *   ui.md, temi.md, icone.md, README.md (indice)
 * Gli screenshot (img/) li fa scripts/screenshots.ts; le ricette tipo (ricette-tipo/) si scrivono a mano.
 *
 * Nel README la sezione «Regole di composizione» sta tra i marcatori RULES_START e RULES_END: si
 * scrive a mano e il generatore la ricopia com'è.
 *
 * Uso: npm run gen:catalog   scrive docs/catalogo/
 *      npm run catalog       gen:catalog + screenshots
 *      il check "catalog" (npm run check) fallisce se i file non sono aggiornati o manca uno screenshot
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type BlockMeta, compareBlocks, type Tone } from '../src/core/block-types.ts';
import * as catalog from '../src/core/catalog.ts';
import type { PaletteMeta, PresetMeta } from '../src/themes/presets.ts';
import { withProjectModules } from './checks/lib/vite.ts';
import { unwrap, type ZodLike } from './gen-decap-config.ts';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const CATALOG_DIR = join(ROOT, 'docs/catalogo');
export const RULES_START = '<!-- regole-di-composizione:inizio -->';
export const RULES_END = '<!-- regole-di-composizione:fine -->';

const GENERATED = '<!-- Generato da scripts/gen-catalog.ts (npm run gen:catalog): non modificare a mano. -->';
const IMAGE_MARKER = 'catalogImage';
const DEFAULT_RULES = `${RULES_START}
## Regole di composizione

Sezione scritta a mano: \`npm run gen:catalog\` la ricopia com'è.
${RULES_END}`;

// Tipi del progetto (i moduli si caricano con Vite, i tipi da qui).
type Fixture = { name: string; tone?: Tone; props: Record<string, unknown> };
type PresetMetas = { palettes: Record<string, PaletteMeta>; fonts: Record<string, PresetMeta>; shapes: Record<string, PresetMeta> };

export interface CatalogVariant {
	type: string;
	variant: string;
}

// ---------------------------------------------------------------------------- markdown

const code = (text: unknown) => `\`${String(text)}\``;
const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n+/g, ' ');
const row = (cells: string[]) => `| ${cells.map(cell).join(' | ')} |`;
const table = (head: string[], rows: string[][]) => [row(head), row(head.map(() => '---')), ...rows.map(row)].join('\n');
const page = (...parts: (string | false | undefined)[]) => `${parts.filter((part) => part !== false && part !== undefined).join('\n\n')}\n`;

// ---------------------------------------------------------------------------- campi da Zod

interface FieldRow {
	path: string;
	kind: string;
	required: string;
	limits: string;
	label: string;
	rule: string;
}

const typeOf = (schema: ZodLike) => schema._zod.def.type;
const checksOf = (schema: ZodLike) => (schema._zod.def.checks ?? []) as ZodLike[];

function stringLimits(schema: ZodLike): string[] {
	const limits: string[] = [];
	const min = schema.minLength ?? 0;
	const max = schema.maxLength ?? undefined;
	if (max !== undefined) limits.push(min > 1 ? `${min}–${max} caratteri` : `max ${max} caratteri`);
	else if (min > 1) limits.push(`almeno ${min} caratteri`);
	const format = schema._zod.def.format as string | undefined;
	if (format === 'url') limits.push('indirizzo https:// completo');
	if (format === 'email') limits.push('indirizzo email');
	for (const check of checksOf(schema)) {
		const def = check._zod.def;
		if (def.format !== 'regex') continue;
		const error = def.error?.({ code: 'invalid_format', input: '' });
		limits.push(typeof error === 'string' ? error : (error?.message ?? `formato ${def.pattern}`));
	}
	return limits;
}

function arrayLimits(schema: ZodLike): string[] {
	let min: number | undefined;
	let max: number | undefined;
	for (const check of checksOf(schema)) {
		if (check._zod.def.check === 'min_length') min = check._zod.def.minimum;
		if (check._zod.def.check === 'max_length') max = check._zod.def.maximum;
	}
	if (min !== undefined && max !== undefined) return [`da ${min} a ${max}`];
	if (min !== undefined) return [`almeno ${min}`];
	if (max !== undefined) return [`fino a ${max}`];
	return [];
}

/** Righe della tabella dei campi: oggetti ed elenchi si aprono nei campi figli (primaryCta.label, items[].title). */
function fieldRows(schema: ZodLike, iconNames: string[]): FieldRow[] {
	const rows: FieldRow[] = [];
	const enumLimits = (values: unknown[]) =>
		values.length === iconNames.length && values.every((value) => iconNames.includes(String(value)))
			? { kind: 'icona', limits: 'un alias di [icone.md](../icone.md)' }
			: { kind: 'scelta', limits: values.map(code).join(' · ') };

	const visit = (path: string, input: ZodLike, optionalParent: string | undefined) => {
		const { schema: inner, optional, hasDefault, defaultValue, description } = unwrap(input);
		const [label = '', ...hint] = (description ?? '').split('|');
		const required = optional
			? 'no'
			: hasDefault
				? `no (predefinito ${code(JSON.stringify(defaultValue))})`
				: optionalParent
					? `sì, se c’è ${code(optionalParent)}`
					: 'sì';
		const childParent = optional || hasDefault ? path : optionalParent;
		const type = typeOf(inner);
		const entry: FieldRow = {
			path,
			kind: type,
			required,
			limits: '',
			label: [label.trim() && `**${label.trim()}**`, hint.join('|').trim()].filter(Boolean).join(' — '),
			rule: '',
		};
		const children: [string, ZodLike, string | undefined][] = [];

		if (inner.meta()?.[IMAGE_MARKER]) Object.assign(entry, { kind: 'immagine', limits: 'file in src/assets/images, percorso relativo al JSON' });
		else if (type === 'string' || (type === 'union' && inner._zod.def.options.every((option: ZodLike) => ['string', 'literal'].includes(typeOf(option))))) {
			const base = type === 'union' ? inner._zod.def.options.find((option: ZodLike) => typeOf(option) === 'string') : inner;
			Object.assign(entry, { kind: 'testo', limits: base ? stringLimits(base).join('; ') : '' });
		} else if (type === 'enum') Object.assign(entry, enumLimits(inner.options ?? []));
		else if (type === 'boolean') entry.kind = 'sì/no';
		else if (type === 'number') entry.kind = 'numero';
		else if (type === 'object') {
			entry.kind = 'gruppo';
			for (const [key, child] of Object.entries(inner._zod.def.shape as Record<string, ZodLike>)) children.push([`${path}.${key}`, child, childParent]);
		} else if (type === 'array') {
			const element = unwrap(inner._zod.def.element).schema;
			entry.limits = arrayLimits(inner).join('; ');
			if (typeOf(element) === 'object') {
				entry.kind = 'elenco';
				for (const [key, child] of Object.entries(element._zod.def.shape as Record<string, ZodLike>)) children.push([`${path}[].${key}`, child, childParent]);
			} else if (typeOf(element) === 'enum') {
				const { kind, limits } = enumLimits(element.options ?? []);
				Object.assign(entry, { kind: `elenco di ${kind === 'icona' ? 'icone' : 'scelte'}`, limits: [entry.limits, limits].filter(Boolean).join('; ') });
			} else entry.kind = 'elenco';
		}
		rows.push(entry);
		for (const [childPath, child, parent] of children) visit(childPath, child, parent);
	};

	for (const [key, child] of Object.entries(schema._zod.def.shape as Record<string, ZodLike>)) visit(key, child, undefined);
	return rows;
}

const KIND_NAMES: Record<string, string> = { string: 'testo', union: 'testo', literal: 'valore fisso' };

// ---------------------------------------------------------------------------- pagine

function blockPage(meta: BlockMeta, rows: FieldRow[], variants: { name: string; description: string; fixture: Fixture }[], example: { fixture: Fixture; json: string }) {
	const source =
		meta.source.from === 'originale' ? 'originale' : `esterno: [${meta.source.name}](${meta.source.url}), ${meta.source.license}`;
	const scope = meta.scope === 'layout' ? '`layout`: in layout.json' : '`page`: sezione delle ricette';
	const where =
		meta.scope === 'layout'
			? `Blocco di layout: le props si scrivono in \`src/content/settings/layout.json\`, sotto la chiave ${code(meta.type)}; BaseLayout lo disegna su ogni pagina.`
			: `Ogni sezione ha anche \`type\` (${code(meta.type)}), \`id\` (ancora facoltativa, in kebab-case) e \`tone\` (\`default\`, \`muted\`, \`primary\`): vedi \`src/content/pages/README.md\`.`;

	const variantSections = variants.map(({ name, description, fixture }) => {
		const desktop = catalog.screenshotName(meta.type, name, 'desktop');
		const mobile = catalog.screenshotName(meta.type, name, 'mobile');
		return page(
			`### ${code(name)}`,
			description,
			`Da sola: \`/catalogo/${meta.type}/${name}/\` · fixture «${fixture.name}».`,
			`![${meta.name}, variante ${name}, a ${catalog.SCREEN_WIDTHS.desktop} px](../img/${desktop})`,
			`<img src="../img/${mobile}" alt="${meta.name}, variante ${name}, a ${catalog.SCREEN_WIDTHS.mobile} px" width="300">`,
		).trimEnd();
	});

	return page(
		GENERATED,
		`# ${meta.name}`,
		`[← Catalogo](../README.md) · dal vivo: \`/catalogo/${meta.type}/\``,
		table(['Tipo', 'Scope', 'Versione', 'Interattivo', 'Categoria', 'Disegno'], [[code(meta.type), scope, meta.version, meta.interactive ? 'sì' : 'no', meta.category, source]]),
		meta.description,
		`- **Quando usarlo.** ${meta.whenToUse}\n- **Quando evitarlo.** ${meta.avoidWhen}`,
		'## Varianti',
		...variantSections,
		'## Campi',
		table(
			['Campo', 'Tipo', 'Obbligatorio', 'Limiti', 'Etichetta e aiuto (CMS)', 'Vincoli'],
			rows.map((field) => [code(field.path), KIND_NAMES[field.kind] ?? field.kind, field.required, field.limits, field.label, meta.fieldRules?.[field.path] ?? '']),
		),
		where,
		'## Esempio',
		meta.scope === 'layout'
			? `Dalla fixture «${example.fixture.name}», da mettere in \`src/content/settings/layout.json\`:`
			: `Dalla fixture «${example.fixture.name}», una sezione da mettere in \`sections\` di una ricetta (le immagini sono percorsi relativi a \`src/content/pages\`):`,
		`\`\`\`json\n${example.json}\n\`\`\``,
	);
}

/** Commento iniziale e interface Props di una primitiva .astro. */
function primitiveDoc(file: string) {
	const text = readFileSync(file, 'utf8');
	const frontmatter = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
	const comment = /^\s*\/\*\*([\s\S]*?)\*\//.exec(frontmatter)?.[1];
	const description = comment
		?.split('\n')
		.map((line) => line.replace(/^\s*\* ?/, ''))
		.join('\n')
		.trim()
		// I tag citati nel commento (<details>, <Tabs ...>) restano testo, non HTML della pagina.
		.replace(/</g, '&lt;');
	const start = frontmatter.indexOf('interface Props {');
	let props: string | undefined;
	if (start >= 0) {
		let depth = 0;
		for (let index = frontmatter.indexOf('{', start); index < frontmatter.length; index++) {
			if (frontmatter[index] === '{') depth++;
			if (frontmatter[index] === '}' && --depth === 0) {
				props = frontmatter.slice(start, index + 1);
				break;
			}
		}
	}
	return { description, props };
}

function uiPage() {
	const dir = join(ROOT, 'src/core/ui');
	// Per le primitive senza commento iniziale vale la riga del README della cartella.
	const readme = readFileSync(join(dir, 'README.md'), 'utf8');
	const readmeLine = (name: string) => new RegExp(`^- \`${name}\`: (.+)$`, 'm').exec(readme)?.[1];
	// Anche i moduli in sottocartelle (button/): Button.astro, CtaButton.astro...
	const sections = (readdirSync(dir, { recursive: true }) as string[])
		.map((file) => file.split(sep).join('/'))
		.filter((file) => file.endsWith('.astro'))
		.sort((a, b) => basename(a).localeCompare(basename(b)))
		.map((file) => {
			const name = basename(file, '.astro');
			const { description, props } = primitiveDoc(join(dir, file));
			return page(
				`## ${name}`,
				`\`src/core/ui/${file}\``,
				description ?? readmeLine(name) ?? '',
				props ? `\`\`\`ts\n${props}\n\`\`\`` : 'Nessuna prop.',
			).trimEnd();
		});
	return page(
		GENERATED,
		'# Primitive UI',
		'[← Catalogo](README.md) · dal vivo, in tutti gli stati: `/catalogo/ui`',
		'Componenti di `src/core/ui` con cui sono fatti i blocchi: si usano nei componenti dei blocchi, mai nelle ricette. Le regole dei componenti interattivi sono in `docs/blocchi-interattivi.md`. I pulsanti sono un modulo a parte, `src/core/ui/button/` (componenti, `button.css` con stati e toni, schema `cta.ts`): dal vivo in ogni variante, stato, misura e tono in `/catalogo/bottoni`.',
		...sections,
	);
}

/** { nome → { variabile → valore } } dai blocchi [data-<attributo>="nome"] dei CSS di una cartella. */
function cssPresets(dir: string, attribute: string) {
	const presets = new Map<string, Map<string, string>>();
	for (const file of readdirSync(dir).filter((name) => name.endsWith('.css'))) {
		const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
		for (const [, name, body] of css.matchAll(new RegExp(`\\[data-${attribute}="([^"]+)"\\]\\s*\\{([^}]*)\\}`, 'g'))) {
			presets.set(name, new Map([...body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()])));
		}
	}
	return presets;
}

const firstFamily = (value: string | undefined) => value?.split(',')[0].replace(/["']/g, '').replace(/ Variable$/, '').trim() ?? '?';

function themePage(metas: PresetMetas, problems: string[]) {
	const palettesCss = cssPresets(join(ROOT, 'src/themes/palettes'), 'palette');
	const fontsCss = cssPresets(join(ROOT, 'src/themes/fonts'), 'fonts');
	const shapesCss = cssPresets(join(ROOT, 'src/themes/shapes'), 'shape');
	const intro = (key: string, meta: PresetMeta) => [`### ${meta.name} · ${code(key)}`, meta.mood, `**Adatta a:** ${meta.adattoA.join(', ')}.`];

	const palettes = Object.entries(metas.palettes).map(([key, meta]) => {
		const css = palettesCss.get(key);
		for (const [token, value] of Object.entries(meta.colors ?? {})) {
			const actual = css?.get(token);
			if (actual?.toLowerCase() !== value.toLowerCase()) {
				problems.push(`src/themes/palettes/${key}.meta.ts › colors.${token}: ${value} diverso dal CSS (${actual ?? 'mancante'})`);
			}
		}
		return page(
			...intro(key, meta),
			table(['Token', 'Valore'], Object.entries(meta.colors ?? {}).map(([token, value]) => [code(token), code(value)])),
			`![Hero con la palette ${meta.name}](img/${catalog.paletteScreenshotName(key)})`,
		).trimEnd();
	});
	const fonts = Object.entries(metas.fonts).map(([key, meta]) => {
		const css = fontsCss.get(key);
		return page(...intro(key, meta), `**Titoli:** ${firstFamily(css?.get('heading-font'))} · **Testo:** ${firstFamily(css?.get('body-font'))}`).trimEnd();
	});
	const shapes = Object.entries(metas.shapes).map(([key, meta]) => {
		const css = shapesCss.get(key);
		return page(...intro(key, meta), `**Raggi:** card e riquadri ${code(css?.get('box-radius') ?? '?')} · pulsanti ${code(css?.get('button-radius') ?? '?')}`).trimEnd();
	});

	return page(
		GENERATED,
		'# Temi',
		'[← Catalogo](README.md)',
		'L’aspetto del sito si sceglie in `src/content/settings/theme.json` con tre preset: `palette`, `fonts` e `shape`. Ogni preset è un CSS in `src/themes/<palettes|fonts|shapes>/` con accanto la sua scheda `<nome>.meta.ts`. Nel catalogo dal vivo si provano con i selettori in alto; una variante da sola accetta `?palette=…&fonts=…&shape=…` (es. `/catalogo/hero/split/?palette=ardesia&fonts=moderno&shape=arrotondato`).',
		'## Palette',
		'Ogni palette passa il controllo di contrasto WCAG AA (`npm run check:contrast`). Sotto, i colori principali e l’hero con quella palette.',
		...palettes,
		'## Font',
		...fonts,
		'## Forme',
		...shapes,
	);
}

function iconPage(icons: Record<string, string>) {
	const source = readFileSync(join(ROOT, 'src/core/icons.ts'), 'utf8');
	const notes = new Map([...source.matchAll(/\/\*\*\s*(.*?)\s*\*\/\s*\n\s*'?([\w-]+)'?:/g)].map(([, note, alias]) => [alias, note]));
	const group = (title: string, set: string) => {
		const entries = Object.entries(icons).filter(([, id]) => id.startsWith(`${set}:`));
		return page(`## ${title}`, table(['Alias', 'Icona', 'Note'], entries.map(([alias, id]) => [code(alias), code(id), notes.get(alias) ?? '']))).trimEnd();
	};
	return page(
		GENERATED,
		'# Icone',
		'[← Catalogo](README.md) · dal vivo: `/catalogo/icone`',
		`${Object.keys(icons).length} alias in \`src/core/icons.ts\`: nei componenti \`<Icon name="pennello" />\`, negli schemi \`z.enum(ICON_NAMES)\`. Il colore è quello del testo intorno. Licenze in \`docs/THIRD_PARTY_LICENSES.md\`.`,
		group('Simboli (Lucide)', 'lucide'),
		group('Marchi (Simple Icons)', 'simple-icons'),
		'I marchi servono solo per i link ai profili dell’attività: sono marchi registrati dei rispettivi titolari.',
	);
}

function readmePage(blocks: { meta: BlockMeta; variants: string[] }[], rules: string) {
	return page(
		GENERATED,
		'# Catalogo dei blocchi',
		'Documentazione dei blocchi di `src/blocks`, delle primitive, dei temi e delle icone, generata dagli schemi e dalle fixture con `npm run gen:catalog`; gli screenshot li fa `npm run screenshots`, tutti e due `npm run catalog`. `npm run check` fallisce se questi file non corrispondono agli schemi o manca uno screenshot.',
		'Dal vivo: `/catalogo` (tutti i blocchi, con i selettori di palette, font e forma e il JSON di ogni variante da copiare) e `/catalogo/<tipo>/<variante>/` (una variante da sola).',
		'## Blocchi',
		table(
			['Blocco', 'Tipo', 'Scope', 'Categoria', 'Varianti'],
			blocks.map(({ meta, variants }) => [`[${meta.name}](blocchi/${meta.type}.md)`, code(meta.type), meta.scope, meta.category, variants.map(code).join(', ')]),
		),
		'## Altro',
		[
			'- [Primitive UI](ui.md): i componenti di `src/core/ui`.',
			'- [Temi](temi.md): palette, font e forme, con a cosa si adattano.',
			'- [Icone](icone.md): gli alias ammessi.',
			'- [Ricette tipo](ricette-tipo/README.md): pagine pronte da copiare in `src/content/pages`.',
		].join('\n'),
		rules,
	);
}

/** La sezione scritta a mano del README attuale (marcatori compresi), o quella iniziale. */
function currentRules(): string {
	const file = join(CATALOG_DIR, 'README.md');
	if (!existsSync(file)) return DEFAULT_RULES;
	const text = readFileSync(file, 'utf8');
	const start = text.indexOf(RULES_START);
	const end = text.indexOf(RULES_END);
	return start >= 0 && end > start ? text.slice(start, end + RULES_END.length) : DEFAULT_RULES;
}

// ---------------------------------------------------------------------------- generazione

/**
 * Contenuto di tutti i file generati (percorso relativo a docs/catalogo → testo), gli screenshot che
 * devono esserci (in img/), le pagine delle varianti, le palette e i problemi trovati nelle schede.
 */
export async function generateCatalog() {
	const problems: string[] = [];
	const files: Record<string, string> = {};
	const variants: CatalogVariant[] = [];
	const images: string[] = [];
	const palettes: string[] = [];

	await withProjectModules(async (load) => {
		const { z } = await import('astro/zod');
		const [schemas, icons] = await Promise.all([load('/src/core/block-schemas.ts'), load('/src/core/icons.ts')]);
		let metas: PresetMetas;
		try {
			metas = (await load('/src/themes/metas.ts')).presetMetas;
		} catch (cause) {
			problems.push((cause as Error).message.split('\n')[0]);
			return;
		}

		// image() del catalogo: una stringa marcata, mostrata come «immagine» nella tabella.
		const context = { image: () => z.string().meta({ [IMAGE_MARKER]: true }) };
		// Fuori da Astro un'immagine importata è il suo percorso: /src/assets/images/...
		const imagePath = (value: unknown) =>
			typeof value === 'string' && value.startsWith('/src/assets/images/') ? catalog.recipeImagePath(value) : undefined;

		const metasByType = schemas.blockMetas as Record<string, BlockMeta>;
		const types = Object.keys(metasByType).sort((a, b) => compareBlocks(metasByType[a], metasByType[b]));
		const index: { meta: BlockMeta; variants: string[] }[] = [];
		for (const type of types) {
			const meta = metasByType[type];
			const schema = schemas.blockSchemas[type](context) as ZodLike;
			const fixtures = (await load(`/src/blocks/${type}/fixtures.ts`)).fixtures as Fixture[];
			const rows = fieldRows(schema, icons.ICON_NAMES as string[]);
			const paths = new Set(rows.map((field) => field.path));
			for (const path of Object.keys(meta.fieldRules ?? {})) {
				if (!paths.has(path)) problems.push(`src/blocks/${type}/meta.ts › fieldRules: "${path}" non è un campo dello schema (campi: ${[...paths].join(', ')})`);
			}
			if (checksOf(schema).length > 0 && Object.keys(meta.fieldRules ?? {}).length === 0) {
				problems.push(`src/blocks/${type}/meta.ts › fieldRules: lo schema ha vincoli tra campi (refine/superRefine), descrivili in fieldRules`);
			}

			const blockVariants = catalog.catalogVariants(meta, fixtures);
			for (const { name } of blockVariants) {
				variants.push({ type, variant: name });
				images.push(catalog.screenshotName(type, name, 'desktop'), catalog.screenshotName(type, name, 'mobile'));
			}
			const example = { fixture: fixtures[0], json: catalog.exampleJson(meta, fixtures[0], imagePath) };
			files[`blocchi/${type}.md`] = blockPage(meta, rows, blockVariants, example);
			index.push({ meta, variants: blockVariants.map(({ name }) => name) });
		}

		palettes.push(...Object.keys(metas.palettes));
		for (const palette of palettes) images.push(catalog.paletteScreenshotName(palette));
		files['ui.md'] = uiPage();
		files['temi.md'] = themePage(metas, problems);
		files['icone.md'] = iconPage(icons.icons);
		files['README.md'] = readmePage(index, currentRules());
	});
	return { files, images, variants, palettes, problems };
}

/** File .md di blocchi/ che il generatore non produce più (blocco eliminato o rinominato). */
export function staleBlockPages(files: Record<string, string>): string[] {
	const dir = join(CATALOG_DIR, 'blocchi');
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((name) => name.endsWith('.md'))
		.map((name) => `blocchi/${name}`)
		.filter((path) => !(path in files));
}

// Eseguito come comando (npm run gen:catalog): scrive i file.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const { files, problems } = await generateCatalog();
		if (problems.length > 0) {
			console.error('Catalogo non generato:');
			for (const problem of problems) console.error(`  ✗ ${problem}`);
			process.exit(1);
		}
		for (const [path, content] of Object.entries(files)) {
			mkdirSync(dirname(join(CATALOG_DIR, path)), { recursive: true });
			writeFileSync(join(CATALOG_DIR, path), content);
		}
		const stale = staleBlockPages(files);
		for (const path of stale) unlinkSync(join(CATALOG_DIR, path));
		console.log(`Scritto docs/catalogo (${Object.keys(files).length} file${stale.length > 0 ? `, tolti ${stale.join(', ')}` : ''}).`);
	} catch (error) {
		console.error((error as Error).message);
		process.exit(1);
	}
}
