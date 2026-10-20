/**
 * Screenshot per guardare il design (npm run design:shots): le pagine del sito, o gli indirizzi
 * indicati, a 1280 e 375 px, con il tema di theme.json o con temi di prova. Avvia un server di
 * sviluppo tutto suo (astro dev --ignore-lock su una porta libera): i temi di prova sono i parametri
 * ?palette=&fonts=&shape=&pattern=&texture= che in sviluppo ogni pagina accetta (BaseLayout).
 *
 * Scrive in reports/design/<data-ora>/ una cartella per tema (<palette>-<fonts>-<shape>-<pattern>-<texture>)
 * e, per ogni pagina e larghezza (<pagina>-desktop…, <pagina>-mobile…):
 *   -apertura.jpg     la prima schermata, quello che si vede senza scorrere;
 *   -panoramica.jpg   la pagina intera rimpicciolita: ritmo di toni e sezioni;
 *   -NN-<tipo>.jpg    una sezione, numerata come nella ricetta (con --sezioni);
 *   -intera.jpg       la pagina intera a grandezza vera.
 * index.html le mette a confronto, da aprire nel browser. Tranne -intera, ogni immagine ha il lato
 * lungo entro 2000 px, così la leggono anche gli agenti (Claude Code, Codex).
 *
 * Uso: npm run design:shots                                      tutte le pagine, tema di theme.json
 *      npm run design:shots -- --pagine index,servizi           solo queste ricette (nome del file)
 *      npm run design:shots -- --percorsi /catalogo/hero/split/  questi indirizzi al posto delle ricette (con --pagine, anche quelle)
 *      npm run design:shots -- --tema laguna,fresco --tema notte,carattere,squadrato
 *                                        temi di prova: preset in qualsiasi ordine, gli altri da theme.json
 *      npm run design:shots -- --sezioni                         anche un'immagine per sezione
 *      npm run design:shots -- --larghezze 375                   solo mobile (375) o solo desktop (1280)
 */
import type { ChildProcess } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { chromium, type Page } from 'playwright';
import sharp from 'sharp';
import { SCREEN_WIDTHS } from '../src/core/catalog.ts';
import { isLibraryMode } from '../src/core/mode.ts';
import { type ThemeKey, themePresets } from '../src/themes/presets.ts';
import { loadRecipes } from './checks/lib/content.ts';
import { freePort, startDev, stopPreview } from './checks/lib/preview.ts';
import { rel, ROOT } from './checks/lib/project.ts';

const USAGE = 'uso: npm run design:shots -- [--pagine index,servizi] [--percorsi /catalogo/hero/split/] [--tema laguna,fresco …] [--sezioni] [--larghezze 375,1280]';
const SIZES = [
	{ name: 'desktop', width: SCREEN_WIDTHS.desktop, height: 800 },
	{ name: 'mobile', width: SCREEN_WIDTHS.mobile, height: 812 },
] as const;
/** Lato lungo massimo delle immagini da far leggere agli agenti. */
const MAX_SIDE = 2000;
const JPEG = { quality: 82, mozjpeg: true };
const IMAGE_TIMEOUT = 15_000;
// La barra degli strumenti di Astro c'è solo in sviluppo: negli screenshot non serve.
const HIDE_DEV_TOOLBAR = 'astro-dev-toolbar { display: none !important; }';
const THEME_FILE = 'src/content/settings/theme.json';

type Theme = Record<ThemeKey, string>;
interface Target {
	/** Prefisso dei file: nome della ricetta, o ricavato dall'indirizzo. */
	name: string;
	path: string;
	/** Tipi delle sezioni della ricetta, in ordine: danno il nome alle immagini delle sezioni. */
	sections?: string[];
}
interface Shot {
	theme: string;
	target: Target;
	size: (typeof SIZES)[number]['name'];
	files: string[];
}

function fail(message: string, hint = USAGE): never {
	console.error(`✗ ${message}\n  ${hint}`);
	process.exit(1);
}

const list = (value: string) =>
	value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

// ---------------------------------------------------------------------------- argomenti

const FLAGS = new Set(['--pagine', '--percorsi', '--tema', '--larghezze', '--sezioni']);
const options = new Map<string, string[]>();
const args = process.argv.slice(2);
for (let index = 0; index < args.length; index++) {
	const arg = args[index];
	const equals = arg.indexOf('=');
	const flag = equals > 0 ? arg.slice(0, equals) : arg;
	if (!FLAGS.has(flag)) fail(`argomento sconosciuto: ${arg}`);
	if (flag === '--sezioni') {
		options.set(flag, []);
		continue;
	}
	const value = equals > 0 ? arg.slice(equals + 1) : args[++index];
	if (!value || value.startsWith('--')) fail(`${flag} vuole un valore`);
	options.set(flag, [...(options.get(flag) ?? []), value]);
}

// ---------------------------------------------------------------------------- temi

const KEYS = Object.keys(themePresets) as ThemeKey[];
const allowed = (key: ThemeKey, value: unknown) => (themePresets[key] as readonly unknown[]).includes(value);
const presetList = KEYS.map((key) => `${key}: ${themePresets[key].join(', ')}`).join(' · ');

/** Tema di theme.json, con i valori di partenza di decoro e texture. */
function siteTheme(): Theme {
	let data: Record<string, unknown>;
	try {
		data = JSON.parse(readFileSync(join(ROOT, THEME_FILE), 'utf8'));
	} catch (cause) {
		fail(`${THEME_FILE}: ${(cause as Error).message}`, 'npm run check:recipes per i dettagli');
	}
	const defaults: Partial<Theme> = { pattern: 'nessuno', texture: 'liscia' };
	return Object.fromEntries(
		KEYS.map((key) => {
			const value = data[key] ?? defaults[key];
			if (!allowed(key, value)) fail(`${THEME_FILE}: ${key} non valido (${String(value)})`, 'npm run check:recipes per i dettagli');
			return [key, value];
		}),
	) as Theme;
}

// Ogni preset ha un nome diverso da tutti gli altri, quindi basta il valore; con un doppione serve chiave=valore.
const owners = new Map<string, ThemeKey[]>();
for (const key of KEYS) for (const value of themePresets[key]) owners.set(value, [...(owners.get(value) ?? []), key]);

/** Un --tema: preset in qualsiasi ordine (o chiave=valore), gli altri da theme.json. */
function trialTheme(spec: string, base: Theme): Theme {
	const theme = { ...base };
	const given = new Set<ThemeKey>();
	for (const item of list(spec)) {
		const [named, value] = item.includes('=') ? item.split('=', 2) : [undefined, item];
		const keys = named ? [named as ThemeKey] : (owners.get(value) ?? []);
		if (named && !KEYS.includes(named as ThemeKey)) fail(`--tema ${spec}: «${named}» non è una chiave del tema (${KEYS.join(', ')})`);
		if (keys.length === 0 || !allowed(keys[0], value)) fail(`--tema ${spec}: «${value}» non è un preset`, presetList);
		if (keys.length > 1) fail(`--tema ${spec}: «${value}» vale per ${keys.join(' e ')}`, `scrivi chiave=valore, es. ${keys[0]}=${value}`);
		if (given.has(keys[0])) fail(`--tema ${spec}: due valori per ${keys[0]}`);
		given.add(keys[0]);
		theme[keys[0]] = value;
	}
	return theme;
}

const base = siteTheme();
const themeId = (theme: Theme) => KEYS.map((key) => theme[key]).join('-');
const baseId = themeId(base);
// Senza --tema la pagina resta com'è (theme.json); con --tema ogni indirizzo porta tutti e cinque i valori.
const themes = (options.get('--tema') ?? []).length
	? [...new Map((options.get('--tema') ?? []).map((spec) => trialTheme(spec, base)).map((theme) => [themeId(theme), theme])).values()].map(
			(theme) => ({ id: themeId(theme), theme, query: `?${new URLSearchParams(theme)}` }),
		)
	: [{ id: baseId, theme: base, query: '' }];

// ---------------------------------------------------------------------------- pagine e larghezze

isLibraryMode(); // legge .env: il server di sviluppo eredita la modalità (in libreria c'è /catalogo)
const recipes = loadRecipes(ROOT, (file, message) => fail(`${file}: ${message}`, 'npm run check:recipes per i dettagli'));
const byName = new Map(recipes.map((recipe) => [basename(recipe.file, '.json'), recipe]));
const pageNames = options.has('--pagine') ? (options.get('--pagine') ?? []).flatMap(list) : options.has('--percorsi') ? [] : [...byName.keys()];
const targets: Target[] = pageNames.map((name) => {
	const recipe = byName.get(name);
	if (!recipe) fail(`--pagine: nessuna ricetta src/content/pages/${name}.json`, `ricette: ${[...byName.keys()].join(', ')}`);
	return {
		name,
		path: recipe.route === '/' ? '/' : `${recipe.route}/`,
		sections: recipe.sections.map((section) => String(section.type)),
	};
});
for (const path of (options.get('--percorsi') ?? []).flatMap(list)) {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	targets.push({ name: normalized.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home', path: normalized });
}
if (targets.length === 0) fail('nessuna pagina da fotografare');

const widths = (options.get('--larghezze') ?? []).flatMap(list).map(Number);
const sizes = widths.length ? SIZES.filter((size) => widths.includes(size.width)) : [...SIZES];
const unknownWidths = widths.filter((width) => !SIZES.some((size) => size.width === width));
if (unknownWidths.length > 0 || sizes.length === 0) fail(`--larghezze: solo ${SIZES.map((size) => size.width).join(' e ')}`);
const withSections = options.has('--sezioni');

// ---------------------------------------------------------------------------- screenshot

/** Immagini caricate (le lazy diventano eager) e font pronti, con un tetto di attesa. */
async function settle(page: Page) {
	await page.evaluate(async (timeout) => {
		const images = [...document.images];
		for (const image of images) image.loading = 'eager';
		const loaded = Promise.all(
			images.map((image) =>
				image.complete && image.naturalWidth > 0
					? image.decode().catch(() => {})
					: new Promise((resolve) => {
							image.addEventListener('load', resolve, { once: true });
							image.addEventListener('error', resolve, { once: true });
						}),
			),
		);
		await Promise.race([loaded, new Promise((resolve) => setTimeout(resolve, timeout))]);
		await document.fonts.ready;
	}, IMAGE_TIMEOUT);
	// Un attimo per gli script dei blocchi interattivi (frecce del carosello, schede).
	await page.waitForTimeout(300);
}

/** Le sezioni della pagina, cioè le radici <Section> dei blocchi in <main>, in coordinate della pagina. */
const sectionBoxes = (page: Page) =>
	page.evaluate(() =>
		[...document.querySelectorAll('main section[data-tone]')]
			.filter((section) => !section.parentElement?.closest('section[data-tone]'))
			.map((section) => {
				const box = section.getBoundingClientRect();
				return { top: Math.max(0, Math.round(box.top + scrollY)), height: Math.round(box.height) };
			}),
	);

async function save(image: ReturnType<typeof sharp>, file: string, fit = true) {
	if (fit) image.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true });
	await image.jpeg(JPEG).toFile(file);
}

const pad = (value: number) => String(value).padStart(2, '0');
const now = new Date();
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const outDir = join(ROOT, 'reports', 'design', stamp);
mkdirSync(outDir, { recursive: true });

const startedAt = Date.now();
const port = await freePort();
let server: ChildProcess | undefined;
// Il server è in un gruppo di processi a parte: con Ctrl+C va chiuso a mano.
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, () => {
		if (server) stopPreview(server);
		process.exit(130);
	});
}
console.log(`Server di sviluppo su http://127.0.0.1:${port}/ (si chiude alla fine)…`);
server = await startDev(port);

const shots: Shot[] = [];
const problems: string[] = [];
const notes = new Set<string>();
const browser = await chromium.launch();
try {
	for (const size of sizes) {
		const context = await browser.newContext({
			baseURL: `http://127.0.0.1:${port}`,
			viewport: { width: size.width, height: size.height },
			deviceScaleFactor: 1,
			reducedMotion: 'reduce',
		});
		const page = await context.newPage();
		for (const { id, query } of themes) {
			const dir = join(outDir, id);
			mkdirSync(dir, { recursive: true });
			for (const target of targets) {
				const where = `${target.path}${query} a ${size.width} px`;
				const response = await page.goto(`${target.path}${query}`, { waitUntil: 'load', timeout: 120_000 }).catch((cause: Error) => cause);
				if (response instanceof Error || !response || response.status() >= 400) {
					problems.push(`${where}: ${response instanceof Error ? response.message.split('\n')[0] : `HTTP ${response?.status() ?? '?'}`}`);
					continue;
				}
				await page.addStyleTag({ content: HIDE_DEV_TOOLBAR });
				await settle(page);
				const opening = await page.screenshot({ type: 'png', animations: 'disabled' });
				const full = await page.screenshot({ type: 'png', fullPage: true, animations: 'disabled' });
				const prefix = `${target.name}-${size.name}`;
				const files = [`${prefix}-apertura.jpg`, `${prefix}-panoramica.jpg`, `${prefix}-intera.jpg`];
				await save(sharp(opening), join(dir, files[0]));
				await save(sharp(full), join(dir, files[1]));
				await save(sharp(full), join(dir, files[2]), false);
				if (withSections) {
					const { width = size.width, height = 0 } = await sharp(full).metadata();
					const boxes = (await sectionBoxes(page)).filter((box) => box.height > 0 && box.top < height);
					const types = target.sections?.length === boxes.length ? target.sections : undefined;
					if (target.sections && !types) notes.add(`${target.path}: ${boxes.length} sezioni nella pagina, ${target.sections.length} nella ricetta: immagini senza il tipo`);
					for (const [index, box] of boxes.entries()) {
						const file = `${prefix}-${pad(index + 1)}-${types?.[index] ?? 'sezione'}.jpg`;
						const crop = { left: 0, top: box.top, width, height: Math.min(box.height, height - box.top) };
						await save(sharp(full).extract(crop), join(dir, file));
						files.push(file);
					}
				}
				shots.push({ theme: id, target, size: size.name, files });
				console.log(`  ${rel(join(dir, prefix))} (${files.length} immagini)`);
			}
		}
		await context.close();
	}
} finally {
	await browser.close();
	if (server) stopPreview(server);
}

// ---------------------------------------------------------------------------- confronto

const escapeHtml = (text: string) => text.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
const themeLabel = ({ id, theme }: (typeof themes)[number]) =>
	`${KEYS.map((key) => theme[key]).join(' · ')}${id === baseId ? ' (theme.json)' : ''}`;

function figure(shot: Shot | undefined, size: string) {
	if (!shot) return `<p class="missing">${size}: non disponibile</p>`;
	const src = `${shot.theme}/${shot.files[2]}`;
	const details = shot.files
		.filter((file) => file !== shot.files[2])
		.map((file) => `<a href="${escapeHtml(`${shot.theme}/${file}`)}">${escapeHtml(file.replace(`${shot.target.name}-${size}-`, '').replace('.jpg', ''))}</a>`)
		.join(' ');
	return `<figure class="${size}"><a href="${escapeHtml(src)}"><img src="${escapeHtml(src)}" alt="${escapeHtml(`${shot.target.path}, ${size}`)}" loading="lazy"></a><figcaption>${details}</figcaption></figure>`;
}

const rows = targets
	.map((target) => {
		const columns = themes
			.map((theme) => {
				const find = (size: string) => shots.find((shot) => shot.theme === theme.id && shot.target === target && shot.size === size);
				return `<div class="theme"><h3>${escapeHtml(themeLabel(theme))}</h3><div class="sizes">${sizes.map((size) => figure(find(size.name), size.name)).join('')}</div></div>`;
			})
			.join('');
		return `<section><h2>${escapeHtml(target.path)}</h2><div class="themes" style="--columns: ${themes.length}">${columns}</div></section>`;
	})
	.join('\n');

writeFileSync(
	join(outDir, 'index.html'),
	`<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design · ${escapeHtml(stamp)}</title>
<style>
	body { margin: 0; padding: 1.5rem; font: 15px/1.5 system-ui, sans-serif; background: #f4f4f2; color: #1d1d1b; }
	h1 { margin: 0 0 0.25rem; font-size: 1.4rem; }
	h2 { margin: 2.5rem 0 0.75rem; font-size: 1.1rem; }
	h3 { margin: 0 0 0.5rem; font-size: 0.9rem; font-weight: 600; }
	.themes { display: grid; grid-template-columns: repeat(var(--columns), minmax(22rem, 1fr)); gap: 1.5rem; overflow-x: auto; }
	.sizes { display: flex; gap: 0.75rem; align-items: flex-start; }
	figure { margin: 0; }
	figure.desktop { flex: 3; }
	figure.mobile { flex: 1; }
	img { display: block; width: 100%; height: auto; border: 1px solid #d6d6d0; background: #fff; }
	figcaption { margin-top: 0.35rem; font-size: 0.75rem; word-break: break-word; }
	figcaption a { margin-right: 0.4rem; }
	.missing { color: #8a1c1c; }
</style>
</head>
<body>
<h1>Design · ${escapeHtml(stamp)}</h1>
<p>${themes.length} ${themes.length === 1 ? 'tema' : 'temi'}, ${targets.length} ${targets.length === 1 ? 'pagina' : 'pagine'}. Ogni immagine si apre a grandezza vera; sotto, le altre viste (apertura, panoramica, sezioni).</p>
${rows}
</body>
</html>
`,
);

const images = shots.reduce((total, shot) => total + shot.files.length, 0);
const seconds = Math.round((Date.now() - startedAt) / 1000);
console.log(`\n${images} immagini in ${rel(outDir)} (${seconds} s). Confronto: ${rel(join(outDir, 'index.html'))}`);
for (const note of notes) console.log(`! ${note}`);
if (problems.length > 0) {
	console.error(`\n✗ Pagine non fotografate:`);
	for (const problem of problems) console.error(`  ${problem}`);
	process.exit(1);
}
