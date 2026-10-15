/**
 * Genera docs/catalogo/ da schemi, schede (meta.ts) e fixture dei blocchi, dai preset del tema,
 * dalle icone, dai link speciali e dalle regole delle ricette (src/core/recipe-rules.ts):
 *   README.md          versione della libreria, regole d'oro, blocchi, blocchi di layout con le
 *                      opzioni di layout.json, link speciali, temi, icone
 *   blocchi/<tipo>.md  una scheda per blocco: quando usarlo, varianti con screenshot, campi, regole,
 *                      esempio pronto
 *   catalogo.json      gli stessi dati per le macchine
 *   ui.md              le primitive di src/core/ui
 * Gli screenshot (img/) li fa scripts/screenshots.ts; le ricette tipo (ricette-tipo/) si scrivono a mano.
 * Nel README la sezione «Regole di composizione» sta tra i marcatori RULES_START e RULES_END: si
 * scrive a mano e il generatore la ricopia com'è.
 *
 * Si ferma (e non scrive niente) se una variante non ha descrizione o «quando usarla», se un
 * refine/superRefine dello schema non ha il suo commento `// rule:` o la sua regola non è in
 * meta.rules, se un mood non ha da 2 a 4 aggettivi, se una scheda cita campi o varianti che non ci sono.
 *
 * Uso: npm run gen:catalog   scrive docs/catalogo/
 *      npm run catalog       gen:catalog + screenshots
 *      il check "blocks" (npm run check) fallisce se docs/catalogo non è aggiornato o manca uno screenshot
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type BlockMeta, compareBlocks, type Tone } from '../src/core/block-types.ts';
import * as catalog from '../src/core/catalog.ts';
import { requireLibraryMode } from '../src/core/mode.ts';
import { RECIPE_RULES } from '../src/core/recipe-rules.ts';
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

type Fixture = { name: string; tone?: Tone; props: Record<string, unknown> };
type PresetMetas = { palettes: Record<string, PaletteMeta>; fonts: Record<string, PresetMeta>; shapes: Record<string, PresetMeta> };

// ---------------------------------------------------------------------------- dati (catalogo.json)

export interface FieldInfo {
	/** Percorso come nella tabella: "title", "items[].icon", "primaryCta.label". */
	path: string;
	type: string;
	/** Obbligatorio (se c'è il gruppo facoltativo `requiredWith`). */
	required: boolean;
	requiredWith?: string;
	/** Varianti per cui è obbligatorio anche se lo schema lo ha facoltativo (meta.fieldRules). */
	requiredFor?: string[];
	default?: unknown;
	/** Limiti a parole, compatti: "max 70", "2–6 voci". */
	limits: string;
	/** Gli stessi limiti per le macchine: minLength, maxLength, minItems, maxItems, values, format, patterns. */
	constraints: Record<string, unknown>;
	/** Etichetta e aiuto nel CMS (describe("Etichetta|Aiuto")). */
	label: string;
	hint?: string;
	note?: string;
}

export interface VariantInfo {
	name: string;
	description: string;
	whenToUse: string;
	fixture: string;
	preview: string;
	screenshots: { desktop: string; mobile: string };
}

export interface BlockInfo {
	type: string;
	name: string;
	scope: BlockMeta['scope'];
	category: string;
	version: string;
	interactive: boolean;
	source: BlockMeta['source'];
	description: string;
	whenToUse: string;
	avoidWhen: string;
	rules: string[];
	variants: VariantInfo[];
	fields: FieldInfo[];
	example: { fixture: string; target: 'sections' | 'layout.json'; json: unknown };
}

export interface CatalogData {
	library: string;
	version: string;
	recipeRules: typeof RECIPE_RULES;
	specialLinks: { href: string; becomes: string; from: string }[];
	icons: { alias: string; icon: string; note?: string }[];
	themes: {
		palettes: (PresetMeta & { key: string; colors: Record<string, string>; screenshot: string })[];
		fonts: (PresetMeta & { key: string; heading: string; body: string })[];
		shapes: (PresetMeta & { key: string; boxRadius: string; buttonRadius: string })[];
	};
	blocks: BlockInfo[];
}

// ---------------------------------------------------------------------------- campi da Zod

const typeOf = (schema: ZodLike) => schema._zod.def.type;
const checksOf = (schema: ZodLike) => (schema._zod.def.checks ?? []) as ZodLike[];

function stringLimits(schema: ZodLike) {
	const limits: string[] = [];
	const constraints: Record<string, unknown> = {};
	const min = schema.minLength ?? 0;
	const max = schema.maxLength ?? undefined;
	if (min > 1) constraints.minLength = min;
	if (max !== undefined) constraints.maxLength = max;
	if (max !== undefined) limits.push(min > 1 ? `${min}–${max}` : `max ${max}`);
	else if (min > 1) limits.push(`min ${min}`);
	const format = schema._zod.def.format as string | undefined;
	if (format === 'url' || format === 'email') constraints.format = format;
	if (format === 'url') limits.push('https://…');
	if (format === 'email') limits.push('email');
	const patterns: { pattern: string; message: string }[] = [];
	for (const check of checksOf(schema)) {
		const def = check._zod.def;
		if (def.format !== 'regex') continue;
		const error = def.error?.({ code: 'invalid_format', input: '' });
		const message = typeof error === 'string' ? error : (error?.message ?? `formato ${def.pattern}`);
		patterns.push({ pattern: String(def.pattern.source), message });
		limits.push(message);
	}
	if (patterns.length > 0) constraints.patterns = patterns;
	return { limits: limits.join('; '), constraints };
}

function arrayLimits(schema: ZodLike) {
	const constraints: Record<string, unknown> = {};
	for (const check of checksOf(schema)) {
		if (check._zod.def.check === 'min_length') constraints.minItems = check._zod.def.minimum;
		if (check._zod.def.check === 'max_length') constraints.maxItems = check._zod.def.maximum;
	}
	const { minItems: min, maxItems: max } = constraints;
	const limits = min !== undefined && max !== undefined ? `${min}–${max} voci` : min !== undefined ? `min ${min} voci` : max !== undefined ? `max ${max} voci` : '';
	return { limits, constraints };
}

/** I campi dello schema: oggetti ed elenchi si aprono nei campi figli (primaryCta.label, items[].title). */
function schemaFields(schema: ZodLike, iconNames: string[], fieldRules: BlockMeta['fieldRules'] = {}): FieldInfo[] {
	const fields: FieldInfo[] = [];
	const enumInfo = (values: unknown[]) =>
		values.length === iconNames.length && values.every((value) => iconNames.includes(String(value)))
			? { type: 'icona', limits: '[lista icone](../README.md#icone)', constraints: { values: 'icone' } }
			: { type: 'scelta', limits: values.map(code).join(' · '), constraints: { values } };

	const visit = (path: string, input: ZodLike, optionalParent: string | undefined) => {
		const { schema: inner, optional, hasDefault, defaultValue, description } = unwrap(input);
		const [label = '', ...hint] = (description ?? '').split('|');
		const rule = fieldRules[path];
		const field: FieldInfo = {
			path,
			type: typeOf(inner),
			required: !optional && !hasDefault,
			...(optionalParent && !optional && !hasDefault && { requiredWith: optionalParent }),
			...(rule?.requiredFor?.length && { requiredFor: rule.requiredFor }),
			...(hasDefault && { default: defaultValue }),
			limits: '',
			constraints: {},
			label: label.trim(),
			...(hint.join('|').trim() && { hint: hint.join('|').trim() }),
			...(rule?.note && { note: rule.note }),
		};
		const childParent = optional || hasDefault ? path : optionalParent;
		const children: [string, ZodLike][] = [];
		const type = field.type;

		if (inner.meta()?.[IMAGE_MARKER]) Object.assign(field, { type: 'immagine', limits: 'foto in src/assets/images', constraints: { format: 'image' } });
		else if (type === 'string' || (type === 'union' && inner._zod.def.options.every((option: ZodLike) => ['string', 'literal'].includes(typeOf(option))))) {
			const base = type === 'union' ? inner._zod.def.options.find((option: ZodLike) => typeOf(option) === 'string') : inner;
			Object.assign(field, { type: 'testo' }, base ? stringLimits(base) : {});
		} else if (type === 'enum') Object.assign(field, enumInfo(inner.options ?? []));
		else if (type === 'boolean') field.type = 'sì/no';
		else if (type === 'number') field.type = 'numero';
		else if (type === 'object') {
			field.type = 'gruppo';
			for (const [key, child] of Object.entries(inner._zod.def.shape as Record<string, ZodLike>)) children.push([`${path}.${key}`, child]);
		} else if (type === 'array') {
			const element = unwrap(inner._zod.def.element).schema;
			Object.assign(field, { type: 'elenco' }, arrayLimits(inner));
			if (typeOf(element) === 'object') {
				for (const [key, child] of Object.entries(element._zod.def.shape as Record<string, ZodLike>)) children.push([`${path}[].${key}`, child]);
			} else if (typeOf(element) === 'enum') {
				const values = enumInfo(element.options ?? []);
				field.type = `elenco di ${values.type === 'icona' ? 'icone' : 'scelte'}`;
				field.limits = [field.limits, values.limits].filter(Boolean).join('; ');
				field.constraints = { ...field.constraints, ...values.constraints };
			}
		}
		fields.push(field);
		for (const [childPath, child] of children) visit(childPath, child, childParent);
	};

	for (const [key, child] of Object.entries(schema._zod.def.shape as Record<string, ZodLike>)) visit(key, child, undefined);
	return fields;
}

/** Le regole dei refine/superRefine di uno schema: i commenti `// rule:` subito sopra ognuno. */
function schemaRules(file: string, problems: string[]): string[] {
	const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
	const rules: string[] = [];
	lines.forEach((line, index) => {
		if (!/\.(?:super)?[Rr]efine\(/.test(line)) return;
		const found: string[] = [];
		for (let above = index - 1; above >= 0 && /^\s*\/\/ rule:/.test(lines[above]); above--) {
			found.unshift(lines[above].replace(/^\s*\/\/ rule:\s*/, '').trim());
		}
		if (found.length === 0) problems.push(`${file} › riga ${index + 1}: ${line.includes('superRefine') ? 'superRefine' : 'refine'} senza il commento // rule: che lo descrive`);
		rules.push(...found);
	});
	return rules;
}

// ---------------------------------------------------------------------------- markdown

const code = (text: unknown) => `\`${String(text)}\``;
const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n+/g, ' ');
const row = (cells: string[]) => `| ${cells.map(cell).join(' | ')} |`;
const table = (head: string[], rows: string[][]) => [row(head), row(head.map(() => '---')), ...rows.map(row)].join('\n');
const page = (...parts: (string | false | undefined)[]) => `${parts.filter((part) => part !== false && part !== undefined && part !== '').join('\n\n')}\n`;

const requiredText = (field: FieldInfo) =>
	field.requiredFor?.length
		? `per ${field.requiredFor.join(', ')}`
		: field.default !== undefined
			? `no (predefinito ${code(JSON.stringify(field.default))})`
			: !field.required
				? 'no'
				: field.requiredWith
					? `sì, se c’è ${code(field.requiredWith)}`
					: 'sì';
const noteText = (field: FieldInfo) => [field.label && `«${field.label}»`, field.note].filter(Boolean).join(' · ');
const sourceText = (source: BlockMeta['source']) =>
	source.from === 'originale' ? 'disegno originale' : `disegno da [${source.name}](${source.url}), ${source.license}`;
const jsonBlock = (value: unknown) => `\`\`\`json\n${JSON.stringify(value, null, '\t')}\n\`\`\``;

/** Scheda di un blocco: quando usarlo, varianti con screenshot, campi, regole, esempio pronto. */
function blockPage(block: BlockInfo) {
	const facts = [
		block.scope === 'layout' ? 'blocco di layout (`layout`, in layout.json)' : 'sezione delle ricette (`page`)',
		`v${block.version}`,
		block.category,
		block.interactive ? 'interattivo' : 'non interattivo',
		sourceText(block.source),
		`dal vivo \`/catalogo/${block.type}/\``,
	];
	const where =
		block.scope === 'layout'
			? `Le props si scrivono in \`src/content/settings/layout.json\`, sotto la chiave ${code(block.type)}; BaseLayout disegna il blocco su ogni pagina.`
			: `Ogni sezione ha anche \`type\` (${code(block.type)}), \`id\` (ancora facoltativa, in kebab-case) e \`tone\` (\`default\`, \`muted\`, \`primary\`): vedi \`src/content/pages/README.md\`.`;
	const variants = block.variants
		.map((variant) =>
			[
				`- ${code(variant.name)} — ${variant.description} **Quando usarla:** ${variant.whenToUse} Fixture «${variant.fixture}», dal vivo \`${variant.preview}\`.`,
				`  ![${block.name}, ${variant.name}, ${catalog.SCREEN_WIDTHS.desktop} px](../${variant.screenshots.desktop})`,
				`  <img src="../${variant.screenshots.mobile}" alt="${block.name}, ${variant.name}, ${catalog.SCREEN_WIDTHS.mobile} px" width="240">`,
			].join('\n\n'),
		)
		.join('\n\n');

	return page(
		GENERATED,
		`# ${block.type} — ${block.name}`,
		`[← Catalogo](../README.md) · ${facts.join(' · ')}`,
		block.description,
		`**Quando usarlo:** ${block.whenToUse}`,
		`**Evitare quando:** ${block.avoidWhen}`,
		'**Varianti:**',
		variants,
		'**Campi:**',
		table(
			['Campo', 'Tipo', 'Obbl.', 'Limiti', 'Note'],
			block.fields.map((field) => [code(field.path), field.type, requiredText(field), field.limits, noteText(field)]),
		),
		`Nelle note, tra «», l’etichetta del campo nel CMS. ${where}`,
		block.rules.length > 0 && `**Regole:**\n\n${block.rules.map((rule) => `- ${rule}`).join('\n')}`,
		block.example.target === 'layout.json'
			? `**Esempio pronto** (fixture «${block.example.fixture}», in \`src/content/settings/layout.json\`):`
			: `**Esempio pronto** (fixture «${block.example.fixture}», una sezione per \`sections\`; immagini relative a \`src/content/pages\`):`,
		jsonBlock(block.example.json),
	);
}

function readmePage(data: CatalogData, rules: string) {
	const pageBlocks = data.blocks.filter((block) => block.scope === 'page');
	const layoutBlocks = data.blocks.filter((block) => block.scope === 'layout');
	const checkLabel = { build: 'build', recipes: 'controllo recipes', release: 'controllo release' } as const;
	const iconGroup = (set: string) =>
		table(
			['Alias', 'Icona', 'Note'],
			data.icons.filter((icon) => icon.icon.startsWith(`${set}:`)).map((icon) => [code(icon.alias), code(icon.icon), icon.note ?? '']),
		);
	const presetCells = (preset: PresetMeta & { key: string }) => [code(preset.key), preset.name, preset.mood.join(', '), preset.adattoA.join(', ')];
	const layoutExample = Object.fromEntries(layoutBlocks.map((block) => [block.type, (block.example.json as Record<string, unknown>)[block.type]]));

	return page(
		GENERATED,
		'# Catalogo dei blocchi',
		`Libreria **${data.library} v${data.version}** (\`library.manifest.json\`). Tutto quello che segue è generato da \`npm run gen:catalog\` a partire da schemi, schede e fixture; gli screenshot da \`npm run screenshots\`; gli stessi dati per le macchine sono in [\`catalogo.json\`](catalogo.json). \`npm run check\` fallisce se questa cartella non corrisponde agli schemi.`,
		'Dal vivo: `/catalogo` (tutti i blocchi con i selettori di palette, font e forma e «Copia JSON» per ogni variante), `/catalogo/<tipo>/<variante>/` (una variante da sola), `/catalogo/bottoni`, `/catalogo/ui`, `/catalogo/icone`.',
		'## Regole d’oro delle ricette',
		data.recipeRules.map((rule, index) => `${index + 1}. ${rule.rule}${rule.check ? ` *(${checkLabel[rule.check]})*` : ''}`).join('\n'),
		rules,
		'## Blocchi',
		'Sezioni delle ricette di pagina (`scope: "page"`), nell’ordine in cui compaiono di solito in una pagina.',
		table(
			['Blocco', 'Categoria', 'Varianti', 'Quando usarlo'],
			pageBlocks.map((block) => [`[${block.type} — ${block.name}](blocchi/${block.type}.md)`, block.category, block.variants.map((variant) => code(variant.name)).join(', '), block.whenToUse]),
		),
		'## Blocchi di layout',
		'Header e footer sono uguali su tutte le pagine: non stanno nelle ricette ma in `src/content/settings/layout.json`, una chiave per blocco, e li disegna BaseLayout. Le opzioni:',
		...layoutBlocks.map((block) =>
			page(
				`### [${block.type} — ${block.name}](blocchi/${block.type}.md)`,
				table(
					['Opzione', 'Valori', 'Obbl.', 'Note'],
					block.fields.map((field) => [code(field.path), field.limits || field.type, requiredText(field), [field.hint, field.note].filter(Boolean).join(' · ')]),
				),
			).trimEnd(),
		),
		`Esempio di \`layout.json\` (dalle fixture):\n\n${jsonBlock(layoutExample)}`,
		'## Link speciali',
		'Nei link dei pulsanti (`href` delle cta e del menu) i recapiti non si scrivono: si usano questi valori, che la build risolve con i dati di `src/content/settings/site.json` (e si ferma se il dato manca).',
		table(['Link', 'Diventa', 'Dato di site.json'], data.specialLinks.map((link) => [code(link.href), link.becomes, code(link.from)])),
		'## Temi',
		'L’aspetto si sceglie in `src/content/settings/theme.json` con tre preset (`palette`, `fonts`, `shape`), ciascuno con la sua scheda `<nome>.meta.ts` accanto al CSS in `src/themes/`. Una variante da sola accetta `?palette=…&fonts=…&shape=…`.',
		'### Palette',
		table(
			['Preset', 'Nome', 'Mood', 'Adatta a', 'Colori'],
			data.themes.palettes.map((palette) => [...presetCells(palette), Object.entries(palette.colors).map(([token, value]) => `${token} ${code(value)}`).join(' · ')]),
		),
		data.themes.palettes.map((palette) => `![Hero con la palette ${palette.name}](${palette.screenshot})`).join('\n'),
		'### Font',
		table(['Preset', 'Nome', 'Mood', 'Adatta a', 'Titoli', 'Testo'], data.themes.fonts.map((font) => [...presetCells(font), font.heading, font.body])),
		'### Forme',
		table(
			['Preset', 'Nome', 'Mood', 'Adatta a', 'Raggi'],
			data.themes.shapes.map((shape) => [...presetCells(shape), `card ${code(shape.boxRadius)} · pulsanti ${code(shape.buttonRadius)}`]),
		),
		'## Icone',
		`${data.icons.length} alias in \`src/core/icons.ts\`: nei componenti \`<Icon name="pennello" />\`, negli schemi \`z.enum(ICON_NAMES)\`. Il colore è quello del testo intorno. Licenze in \`docs/THIRD_PARTY_LICENSES.md\`.`,
		'**Simboli (Lucide)**',
		iconGroup('lucide'),
		'**Marchi (Simple Icons)**: solo per i link ai profili dell’attività, sono marchi registrati dei rispettivi titolari.',
		iconGroup('simple-icons'),
		'## Altro',
		[
			'- [Primitive UI](ui.md): i componenti di `src/core/ui` con cui sono fatti i blocchi.',
			'- [Ricette tipo](ricette-tipo/README.md): pagine pronte da copiare in `src/content/pages`.',
		].join('\n'),
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
			return page(`## ${name}`, `\`src/core/ui/${file}\``, description ?? readmeLine(name) ?? '', props ? `\`\`\`ts\n${props}\n\`\`\`` : 'Nessuna prop.').trimEnd();
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

function themesData(metas: PresetMetas, problems: string[]): CatalogData['themes'] {
	const palettesCss = cssPresets(join(ROOT, 'src/themes/palettes'), 'palette');
	const fontsCss = cssPresets(join(ROOT, 'src/themes/fonts'), 'fonts');
	const shapesCss = cssPresets(join(ROOT, 'src/themes/shapes'), 'shape');
	for (const [kind, presets] of Object.entries(metas)) {
		for (const [key, meta] of Object.entries(presets as Record<string, PresetMeta>)) {
			const file = `src/themes/${kind}/${key}.meta.ts`;
			if (!Array.isArray(meta.mood) || meta.mood.length < 2 || meta.mood.length > 4) problems.push(`${file} › mood: servono da 2 a 4 aggettivi`);
			if (!meta.adattoA?.length) problems.push(`${file} › adattoA: indica almeno un settore`);
		}
	}
	return {
		palettes: Object.entries(metas.palettes).map(([key, meta]) => {
			const css = palettesCss.get(key);
			for (const [token, value] of Object.entries(meta.colors)) {
				const actual = css?.get(token);
				if (actual?.toLowerCase() !== value.toLowerCase()) problems.push(`src/themes/palettes/${key}.meta.ts › colors.${token}: ${value} diverso dal CSS (${actual ?? 'mancante'})`);
			}
			return { key, ...meta, colors: meta.colors as Record<string, string>, screenshot: `img/${catalog.paletteScreenshotName(key)}` };
		}),
		fonts: Object.entries(metas.fonts).map(([key, meta]) => ({
			key,
			...meta,
			heading: firstFamily(fontsCss.get(key)?.get('heading-font')),
			body: firstFamily(fontsCss.get(key)?.get('body-font')),
		})),
		shapes: Object.entries(metas.shapes).map(([key, meta]) => ({
			key,
			...meta,
			boxRadius: shapesCss.get(key)?.get('box-radius') ?? '?',
			buttonRadius: shapesCss.get(key)?.get('button-radius') ?? '?',
		})),
	};
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
 * Dati del catalogo e contenuto di tutti i file generati (percorso relativo a docs/catalogo →
 * testo), gli screenshot che devono esserci (in img/), le pagine delle varianti, le palette e i
 * problemi trovati in schede e schemi (con problemi non si scrive niente).
 */
export async function generateCatalog() {
	const problems: string[] = [];
	const files: Record<string, string> = {};
	const variants: { type: string; variant: string }[] = [];
	const images: string[] = [];
	const palettes: string[] = [];

	await withProjectModules(async (load) => {
		const { z } = await import('astro/zod');
		const [schemas, icons, cta] = await Promise.all([load('/src/core/block-schemas.ts'), load('/src/core/icons.ts'), load('/src/core/ui/button/cta.ts')]);
		let metas: PresetMetas;
		try {
			metas = (await load('/src/themes/metas.ts')).presetMetas;
		} catch (cause) {
			problems.push((cause as Error).message.split('\n')[0]);
			return;
		}
		const manifest = JSON.parse(readFileSync(join(ROOT, 'library.manifest.json'), 'utf8'));

		// image() del catalogo: una stringa marcata, mostrata come «immagine» nella tabella.
		const context = { image: () => z.string().meta({ [IMAGE_MARKER]: true }) };
		// Fuori da Astro un'immagine importata è il suo percorso: /src/assets/images/...
		const imagePath = (value: unknown) =>
			typeof value === 'string' && value.startsWith('/src/assets/images/') ? catalog.recipeImagePath(value) : undefined;

		const metasByType = schemas.blockMetas as Record<string, BlockMeta>;
		const blocks: BlockInfo[] = [];
		for (const type of Object.keys(metasByType).sort((a, b) => compareBlocks(metasByType[a], metasByType[b]))) {
			const meta = metasByType[type];
			const metaFile = `src/blocks/${type}/meta.ts`;
			// Un blocco incompleto è un problema come gli altri: non ferma il controllo dei successivi.
			let schema: ZodLike;
			let fixtures: Fixture[];
			try {
				if (typeof schemas.blockSchemas[type] !== 'function') throw new Error('manca schema.ts');
				schema = schemas.blockSchemas[type](context) as ZodLike;
				fixtures = (await load(`/src/blocks/${type}/fixtures.ts`)).fixtures as Fixture[];
				if (!Array.isArray(fixtures) || fixtures.length === 0) throw new Error('nessuna fixture in fixtures.ts');
			} catch (cause) {
				problems.push(`src/blocks/${type}: non si carica: ${(cause as Error).message.split('\n')[0]}`);
				continue;
			}
			const fields = schemaFields(schema, icons.ICON_NAMES as string[], meta.fieldRules);

			for (const [name, variant] of Object.entries(meta.variants)) {
				if (!variant?.description?.trim()) problems.push(`${metaFile} › variants.${name}: manca la descrizione`);
				if (!variant?.whenToUse?.trim()) problems.push(`${metaFile} › variants.${name}: manca «quando usarla» (whenToUse)`);
			}
			const paths = new Set(fields.map((field) => field.path));
			for (const [path, rule] of Object.entries(meta.fieldRules ?? {})) {
				if (!paths.has(path)) problems.push(`${metaFile} › fieldRules: "${path}" non è un campo dello schema (campi: ${[...paths].join(', ')})`);
				for (const variant of rule.requiredFor ?? []) {
					if (!(variant in meta.variants)) problems.push(`${metaFile} › fieldRules.${path}: requiredFor cita "${variant}", che non è in meta.variants`);
				}
				if (!rule.requiredFor?.length && !rule.note?.trim()) problems.push(`${metaFile} › fieldRules.${path}: indica requiredFor o note`);
			}
			for (const rule of schemaRules(`src/blocks/${type}/schema.ts`, problems)) {
				if (!meta.rules?.includes(rule)) problems.push(`${metaFile} › rules: manca «${rule}» (dal commento // rule: dello schema)`);
			}

			const blockVariants = catalog.catalogVariants(meta, fixtures).map(({ name, description, whenToUse, fixture }) => {
				const screenshots = { desktop: `img/${catalog.screenshotName(type, name, 'desktop')}`, mobile: `img/${catalog.screenshotName(type, name, 'mobile')}` };
				variants.push({ type, variant: name });
				images.push(basename(screenshots.desktop), basename(screenshots.mobile));
				return { name, description, whenToUse, fixture: fixture.name, preview: `/catalogo/${type}/${name}/`, screenshots };
			});
			// Esempio pronto: la fixture della prima variante.
			const first = catalog.catalogVariants(meta, fixtures)[0]?.fixture ?? fixtures[0];
			blocks.push({
				type,
				name: meta.name,
				scope: meta.scope,
				category: meta.category,
				version: meta.version,
				interactive: meta.interactive ?? false,
				source: meta.source,
				description: meta.description,
				whenToUse: meta.whenToUse,
				avoidWhen: meta.avoidWhen,
				rules: meta.rules ?? [],
				variants: blockVariants,
				fields,
				example: {
					fixture: first.name,
					target: meta.scope === 'layout' ? 'layout.json' : 'sections',
					json: catalog.blockExample(meta, first, imagePath),
				},
			});
		}

		const iconsSource = readFileSync(join(ROOT, 'src/core/icons.ts'), 'utf8');
		const iconNotes = new Map([...iconsSource.matchAll(/\/\*\*\s*(.*?)\s*\*\/\s*\n\s*'?([\w-]+)'?:/g)].map(([, note, alias]) => [alias, note]));
		const themes = themesData(metas, problems);
		palettes.push(...themes.palettes.map((palette) => palette.key));
		images.push(...themes.palettes.map((palette) => basename(palette.screenshot)));

		const data: CatalogData = {
			library: 'site-starter',
			version: String(manifest.version ?? '0.0.0'),
			recipeRules: RECIPE_RULES,
			specialLinks: Object.entries(cta.SPECIAL_HREF_TARGETS as Record<string, { becomes: string; from: string }>).map(([href, target]) => ({ href, ...target })),
			icons: Object.entries(icons.icons as Record<string, string>).map(([alias, icon]) => ({ alias, icon, ...(iconNotes.has(alias) && { note: iconNotes.get(alias) }) })),
			themes,
			blocks,
		};

		for (const block of blocks) files[`blocchi/${block.type}.md`] = blockPage(block);
		files['README.md'] = readmePage(data, currentRules());
		files['ui.md'] = uiPage();
		files['catalogo.json'] = `${JSON.stringify(data, null, '\t')}\n`;
	});
	return { files, images, variants, palettes, problems };
}

/** File .md e .json generati (in docs/catalogo e in blocchi/) che il generatore non produce più. */
export function stalePages(files: Record<string, string>): string[] {
	const list = (dir: string, prefix: string) =>
		existsSync(dir) ? readdirSync(dir).filter((name) => /\.(md|json)$/.test(name)).map((name) => `${prefix}${name}`) : [];
	return [...list(CATALOG_DIR, ''), ...list(join(CATALOG_DIR, 'blocchi'), 'blocchi/')].filter((path) => !(path in files));
}

// Eseguito come comando (npm run gen:catalog): scrive i file.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	// docs/catalogo nei siti cliente arriva già fatto, con blocks:sync.
	requireLibraryMode('npm run gen:catalog');
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
		const stale = stalePages(files);
		for (const path of stale) unlinkSync(join(CATALOG_DIR, path));
		console.log(`Scritto docs/catalogo (${Object.keys(files).length} file${stale.length > 0 ? `, tolti ${stale.join(', ')}` : ''}).`);
	} catch (error) {
		console.error((error as Error).message);
		process.exit(1);
	}
}
