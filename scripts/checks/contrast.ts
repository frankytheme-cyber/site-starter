/**
 * contrast: contrasto WCAG 2.x delle palette in src/themes/palettes/ e degli effetti di sfondo.
 * Ogni coppia testo/sfondo deve arrivare a 4.5:1 (AA, testo normale); l'anello di focus a 3:1
 * sullo sfondo (AA, componenti non testuali). Le coppie su surface valgono per tone="muted".
 * Pulsanti (core/ui/button/button.css): primary-fg su primary-hover e accent-fg su accent-hover
 * (passaggio sui pieni), primary-hover su bg e surface (passaggio sui link). Su tone primary il
 * pieno chiaro passa a surface con testo primary: è la coppia primary / surface.
 *
 * Effetti di sfondo (src/themes/backgrounds.css): per ogni palette, effetto e tono, i testi della
 * sezione (testo, testo secondario, link e il loro passaggio) e l'anello di focus sul colore pieno
 * di ogni velo composto sul fondo del tono e, dove due veli possono toccarsi, sui veli sovrapposti:
 * il punto più carico possibile. Veli e geometria si leggono dal CSS (var(--token), color-mix in
 * oklab, radial-gradient con misure in %), quindi il controllo segue il file; i colori del decoro
 * (--decor-*) coprono tutta la sezione e sono alternativi: ogni disegno ne usa uno.
 *
 * Velature delle foto (src/themes/overlays.css): il testo bianco della variante full dell'hero sul
 * colore della velatura composto su una foto tutta bianca, il caso peggiore, per ogni palette.
 *
 * Texture (src/themes/textures/): una grana grigia in soft-light sopra ogni sfondo. Dal CSS si
 * leggono i limiti del rumore (tableValues) e l'opacità: ogni punto qui sopra si verifica anche
 * schiarito e scurito al massimo dalla grana, per ogni texture.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TONES, type Tone } from '../../src/core/block-types.ts';
import { BACKGROUNDS } from '../../src/themes/backgrounds.ts';
import { type CheckContext, collector } from './lib/report.ts';

const TOKENS = ['bg', 'fg', 'fg-muted', 'surface', 'surface-fg', 'primary', 'primary-fg', 'primary-hover', 'accent', 'accent-fg', 'accent-hover', 'border', 'ring'];

/** [primo piano, sfondo, rapporto minimo] */
const PAIRS: [string, string, number][] = [
	['fg', 'bg', 4.5],
	['fg-muted', 'bg', 4.5],
	['primary', 'bg', 4.5],
	['surface-fg', 'surface', 4.5],
	['fg-muted', 'surface', 4.5],
	['primary', 'surface', 4.5],
	['primary-fg', 'primary', 4.5],
	['primary-fg', 'primary-hover', 4.5],
	['primary-hover', 'bg', 4.5],
	['primary-hover', 'surface', 4.5],
	['accent-fg', 'accent', 4.5],
	['accent-fg', 'accent-hover', 4.5],
	['ring', 'bg', 3],
	['ring', 'surface', 3],
];

/** Fondo di una sezione per tono (core/ui/Section.astro) e cosa ci sta sopra, con il rapporto minimo. */
const TONE_BASE: Record<Tone, string> = { default: 'bg', muted: 'surface', primary: 'primary' };
const TONE_TEXT: Record<Tone, [string, number][]> = {
	default: [['fg', 4.5], ['fg-muted', 4.5], ['primary', 4.5], ['primary-hover', 4.5], ['ring', 3]],
	muted: [['surface-fg', 4.5], ['fg-muted', 4.5], ['primary', 4.5], ['primary-hover', 4.5], ['ring', 3]],
	// Su tone primary testo, testo secondario, link e anello sono tutti primary-fg (base.css).
	primary: [['primary-fg', 4.5]],
};

const BACKGROUNDS_FILE = 'src/themes/backgrounds.css';
const TEXTURES_DIR = 'src/themes/textures';
const OVERLAYS_FILE = 'src/themes/overlays.css';
const WHITE: Rgb = [1, 1, 1];

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
	const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
	if (!match) throw new Error(`colore non supportato "${hex}" (usa #rgb o #rrggbb)`);
	const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
	return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16) / 255) as Rgb;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function luminanceOf(rgb: Rgb): number {
	const [r, g, b] = rgb.map(toLinear);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratioOf(a: Rgb, b: Rgb): number {
	const [light, dark] = [luminanceOf(a), luminanceOf(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

export function contrastRatio(a: string, b: string): number {
	return ratioOf(parseHex(a), parseHex(b));
}

/** sRGB → OKLab (Björn Ottosson), per color-mix(in oklab, ...). */
function toOklab(rgb: Rgb): Rgb {
	const [r, g, b] = rgb.map(toLinear);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

function fromOklab([L, A, B]: Rgb): Rgb {
	const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
	const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
	const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
	const linear = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	];
	return linear.map((c) => Math.min(1, Math.max(0, toGamma(c)))) as Rgb;
}

/** color-mix(in oklab, a p%, b) tra due colori pieni. */
function mixOklab(a: Rgb, b: Rgb, p: number): Rgb {
	const [x, y] = [toOklab(a), toOklab(b)];
	return fromOklab(x.map((value, i) => value * p + y[i] * (1 - p)) as Rgb);
}

/** Un colore con trasparenza sopra un fondo pieno, come lo compone il browser (in sRGB). */
const over = (top: Rgb, bottom: Rgb, alpha: number) => top.map((value, i) => value * alpha + bottom[i] * (1 - alpha)) as Rgb;

/** mix-blend-mode: soft-light (Compositing and Blending Level 1) di un grigio s su un canale b. */
function softLight(b: number, s: number): number {
	if (s <= 0.5) return b - (1 - 2 * s) * b * (1 - b);
	const d = b <= 0.25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b);
	return b + (2 * s - 1) * (d - b);
}

/** Una texture: rumore grigio tra low e high, in soft-light con questa opacità. */
interface Texture {
	name: string;
	low: number;
	high: number;
	opacity: number;
}

/** Le texture di src/themes/textures/ con una regola ::after: limiti del rumore (tableValues) e opacità. */
function readTextures(dir: string, error: (finding: { file: string; where?: string; message: string; hint?: string }) => void): Texture[] {
	if (!existsSync(dir)) return [];
	const textures: Texture[] = [];
	for (const file of readdirSync(dir).filter((name) => name.endsWith('.css'))) {
		const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
		const name = /\[data-texture="([\w-]+)"\]/.exec(css)?.[1];
		if (!name) continue;
		const bounds = [...css.matchAll(/tableValues='([\d.]+)\s+([\d.]+)'/g)].map(([, low, high]) => [Number(low), Number(high)]);
		const opacity = Number(/opacity\s*:\s*([\d.]+)/.exec(css)?.[1]);
		if (bounds.length === 0 || !Number.isFinite(opacity) || !/mix-blend-mode\s*:\s*soft-light/.test(css)) {
			error({
				file: `${TEXTURES_DIR}/${file}`,
				where: name,
				message: 'rumore non verificabile',
				hint: "serve un rumore grigio limitato da feComponentTransfer con tableValues='min max', mix-blend-mode: soft-light e un'opacity",
			});
			continue;
		}
		textures.push({ name, low: Math.min(...bounds.map(([low]) => low)), high: Math.max(...bounds.map(([, high]) => high)), opacity });
	}
	return textures;
}

/** { nome palette → { token → valore } } dai blocchi [data-palette="..."] { ... }. */
function readPalettes(css: string): Map<string, Map<string, string>> {
	const palettes = new Map<string, Map<string, string>>();
	const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const [, name, body] of source.matchAll(/\[data-palette="([^"]+)"\]\s*\{([^}]*)\}/g)) {
		const vars = new Map<string, string>();
		for (const [, token, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars.set(token, value.trim());
		palettes.set(name, vars);
	}
	return palettes;
}

/** Un colore di un velo: un token, mescolato in oklab con un altro (mix) o con il trasparente (alpha < 1). */
interface Layer {
	token: string;
	alpha: number;
	mix?: { with: string; percent: number };
}

/** Un gradiente di background-image: i suoi colori e il riquadro, in % della sezione, dove non è trasparente. */
interface Veil {
	colors: Layer[];
	box: [left: number, right: number, top: number, bottom: number];
}

interface EffectRule {
	background: string;
	tone: Tone;
	veils: Veil[];
}

const COLOR = /color-mix\(\s*in oklab\s*,\s*var\(--([\w-]+)\)\s+([\d.]+)%\s*,\s*(?:(transparent)|var\(--([\w-]+)\)|(black|white))\s*\)|var\(--([\w-]+)\)/g;

/** I colori di un testo CSS: var(--token), color-mix(in oklab, var(--token) N%, transparent | var(--token) | black | white). */
const colorsIn = (text: string): Layer[] =>
	[...text.matchAll(COLOR)].map(([, mixed, percent, transparent, other, keyword, plain]) => {
		if (plain) return { token: plain, alpha: 1 };
		if (transparent) return { token: mixed, alpha: Number(percent) / 100 };
		return { token: mixed, alpha: 1, mix: { with: other ?? keyword, percent: Number(percent) / 100 } };
	});

/** --palette-<token> (salvati su <html> da base.css) vale il token della palette; black e white sono loro. */
const tokenName = (token: string) => token.replace(/^palette-/, '');
const KEYWORDS: Record<string, Rgb> = { black: [0, 0, 0], white: [1, 1, 1] };
const WHOLE: Veil['box'] = [0, 100, 0, 100];

/** Le funzioni di primo livello di un valore CSS ("radial-gradient(...), linear-gradient(...)"). */
function topLevelFunctions(value: string): string[] {
	const parts: string[] = [];
	let depth = 0;
	let start = -1;
	for (let i = 0; i < value.length; i++) {
		if (value[i] === '(') {
			if (depth === 0) start = value.lastIndexOf(',', i) + 1;
			depth++;
		} else if (value[i] === ')' && --depth === 0) parts.push(value.slice(start, i + 1).trim());
	}
	return parts;
}

/**
 * Riquadro di un radial-gradient(Rx% Ry% at X% Y%, ..., transparent N%): l'ellisse arriva a N% dei
 * raggi. Ogni altro gradiente copre tutta la sezione.
 */
function boxOf(gradient: string): Veil['box'] {
	const shape = /^radial-gradient\(\s*([\d.]+)%\s+([\d.]+)%\s+at\s+(-?[\d.]+)%\s+(-?[\d.]+)%/.exec(gradient);
	if (!shape) return WHOLE;
	const [rx, ry, x, y] = shape.slice(1).map(Number);
	const end = Number(/transparent\s+([\d.]+)%\s*\)$/.exec(gradient)?.[1] ?? 100) / 100;
	return [x - rx * end, x + rx * end, y - ry * end, y + ry * end];
}

const touch = (a: Veil, b: Veil) => a.box[0] < b.box[1] && b.box[0] < a.box[1] && a.box[2] < b.box[3] && b.box[2] < a.box[3];

/** Le regole [data-background="..."] > [data-tone="..."] { background-image: ... } con i loro veli. */
function readEffects(css: string): EffectRule[] {
	const rules: EffectRule[] = [];
	const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const [, selectorList, body] of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const value = /background-image\s*:\s*([^;]+);/.exec(body)?.[1];
		const decor = [...body.matchAll(/--decor-[\w-]+\s*:\s*([^;]+);/g)].map(([, color]) => color);
		if ((!value || value.trim() === 'none') && decor.length === 0) continue;
		const veils: Veil[] = [
			...(value && value.trim() !== 'none' ? topLevelFunctions(value).map((gradient) => ({ box: boxOf(gradient), colors: colorsIn(gradient) })) : []),
			// Ogni disegno del decoro usa uno solo dei colori --decor-*: alternative nello stesso velo, mai sovrapposte.
			...(decor.length > 0 ? [{ box: WHOLE, colors: decor.flatMap(colorsIn) }] : []),
		];
		for (const selector of selectorList.split(',').map((item) => item.trim())) {
			const match = /^\[data-background="([\w-]+)"\]\s*>\s*\[data-tone="([\w-]+)"\]$/.exec(selector);
			if (match) rules.push({ background: match[1], tone: match[2] as Tone, veils });
		}
	}
	return rules;
}

/** Gruppi di veli che si toccano tutti a due a due (sottoinsiemi di 2 o più), nell'ordine di background-image. */
function overlappingGroups(veils: Veil[]): Veil[][] {
	const groups: Veil[][] = [];
	for (let mask = 1; mask < 1 << veils.length; mask++) {
		const group = veils.filter((_, i) => mask & (1 << i));
		if (group.length > 1 && group.every((a, i) => group.slice(i + 1).every((b) => touch(a, b)))) groups.push(group);
	}
	return groups;
}

/** Le velature [data-overlay="nome"] { background-color: ...; opacity: N } di overlays.css. */
function readOverlays(css: string): { name: string; layer: Layer; opacity: number }[] {
	const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
	return [...source.matchAll(/\[data-overlay="([\w-]+)"\]\s*\{([^}]*)\}/g)].flatMap(([, name, body]) => {
		const layer = colorsIn(/background-color\s*:\s*([^;]+);/.exec(body)?.[1] ?? '')[0];
		return layer ? [{ name, layer, opacity: Number(/opacity\s*:\s*([\d.]+)/.exec(body)?.[1] ?? 1) }] : [];
	});
}

// Arrotonda per difetto: 4.499 non deve comparire come 4.50.
const shown = (ratio: number) => (Math.floor(ratio * 100) / 100).toFixed(2);

export function contrast({ root }: CheckContext) {
	const { findings, error } = collector('contrast');
	const dir = join(root, 'src/themes/palettes');
	const files = readdirSync(dir).filter((file) => file.endsWith('.css'));
	if (files.length === 0) error({ file: 'src/themes/palettes', message: 'nessuna palette' });

	/** Le palette complete, per gli effetti di sfondo. */
	const complete: { palette: string; vars: Map<string, string> }[] = [];

	for (const name of files) {
		const file = `src/themes/palettes/${name}`;
		const palettes = readPalettes(readFileSync(join(dir, name), 'utf8'));
		if (palettes.size === 0) error({ file, message: 'nessun blocco [data-palette="..."]' });

		for (const [palette, vars] of palettes) {
			const missing = TOKENS.filter((token) => !vars.has(token));
			if (missing.length > 0) {
				error({ file, where: palette, message: `token mancanti: ${missing.join(', ')}`, hint: 'ogni palette definisce tutti i token di base.css' });
				continue;
			}
			let valid = true;
			for (const [fg, bg, min] of PAIRS) {
				try {
					const ratio = contrastRatio(vars.get(fg)!, vars.get(bg)!);
					if (ratio < min) {
						error({
							file,
							where: `${palette} › ${fg} / ${bg}`,
							message: `contrasto ${shown(ratio)}:1, minimo ${min}:1 (WCAG AA)`,
							hint: `scurisci o schiarisci --${fg} o --${bg} finché il rapporto arriva a ${min}:1`,
						});
					}
				} catch (cause) {
					valid = false;
					error({ file, where: `${palette} › ${fg} / ${bg}`, message: (cause as Error).message });
				}
			}
			if (valid) complete.push({ palette, vars });
		}
	}

	if (!existsSync(join(root, BACKGROUNDS_FILE))) {
		error({ file: BACKGROUNDS_FILE, message: 'file mancante', hint: 'gli effetti di sfondo di src/themes/backgrounds.ts vivono qui' });
		return findings;
	}
	const effects = readEffects(readFileSync(join(root, BACKGROUNDS_FILE), 'utf8'));
	let usable = true;
	for (const effect of effects) {
		const where = `${effect.background} › tone ${effect.tone}`;
		if (!(BACKGROUNDS as readonly string[]).includes(effect.background)) {
			error({ file: BACKGROUNDS_FILE, where, message: `effetto "${effect.background}" non è in src/themes/backgrounds.ts`, hint: `uno di ${BACKGROUNDS.join(', ')}` });
		}
		if (!(TONES as readonly string[]).includes(effect.tone)) {
			error({ file: BACKGROUNDS_FILE, where, message: `tono "${effect.tone}" sconosciuto`, hint: `uno di ${TONES.join(', ')}` });
			usable = false;
		}
		const layers = effect.veils.flatMap((veil) => veil.colors);
		const unknown = layers.flatMap((layer) => [layer.token, layer.mix?.with ?? []].flat()).filter((token) => !TOKENS.includes(tokenName(token)) && !(token in KEYWORDS));
		if (layers.length === 0 || unknown.length > 0) {
			error({
				file: BACKGROUNDS_FILE,
				where,
				message: unknown.length > 0 ? `token sconosciuti: ${unknown.join(', ')}` : 'nessun colore letto in background-image',
				hint: 'usa solo var(--token) e color-mix(in oklab, var(--token) N%, transparent | var(--token)) con i token delle palette',
			});
			usable = false;
		}
	}
	for (const background of BACKGROUNDS.filter((name) => name !== 'pieno')) {
		for (const tone of TONES) {
			if (!effects.some((effect) => effect.background === background && effect.tone === tone)) {
				error({ file: BACKGROUNDS_FILE, where: `${background} › tone ${tone}`, message: 'manca la regola', hint: `aggiungi [data-background="${background}"] > [data-tone="${tone}"] { background-image: ... }` });
			}
		}
	}
	if (!usable) return findings;

	const textures = readTextures(join(root, TEXTURES_DIR), error);
	/** Il colore di un punto schiarito e scurito al massimo dalla texture (senza texture, il punto com'è). */
	const textured = (point: Rgb, texture?: Texture): Rgb[] =>
		texture ? [texture.low, texture.high].map((gray) => over(point.map((channel) => softLight(channel, gray)) as Rgb, point, texture.opacity)) : [point];

	for (const { palette, vars } of complete) {
		const color = (token: string) => KEYWORDS[token] ?? parseHex(vars.get(tokenName(token))!);
		// Le sezioni senza effetto (pieno) prendono anche loro la texture.
		const plain: EffectRule[] = TONES.map((tone) => ({ background: 'pieno', tone, veils: [] }));
		for (const texture of [undefined, ...textures]) {
			for (const { background, tone, veils } of texture ? [...plain, ...effects] : effects) {
				const base = color(TONE_BASE[tone]);
				const colorOf = (layer: Layer) => (layer.mix ? mixOklab(color(layer.token), color(layer.mix.with), layer.mix.percent) : color(layer.token));
				const stack = (layers: Layer[], below: Rgb) => layers.reduceRight((under, layer) => over(colorOf(layer), under, layer.alpha), below);
				// Ogni colore di ogni velo sul fondo; poi i veli che si toccano, uno sull'altro (il primo di background-image sta sopra).
				const points = veils.length === 0 ? [base] : veils.flatMap((veil) => veil.colors.map((layer) => stack([layer], base)));
				for (const group of overlappingGroups(veils)) {
					const combinations = group.reduce<Layer[][]>((all, veil) => all.flatMap((chosen) => veil.colors.map((layer) => [...chosen, layer])), [[]]);
					points.push(...combinations.map((layers) => stack(layers, base)));
				}
				const shaded = points.flatMap((point) => textured(point, texture));
				for (const [fg, min] of TONE_TEXT[tone]) {
					const worst = Math.min(...shaded.map((point) => ratioOf(color(fg), point)));
					if (worst < min) {
						error({
							file: texture ? `${TEXTURES_DIR}/${texture.name}.css` : BACKGROUNDS_FILE,
							where: `${background} › tone ${tone} › ${palette} › ${fg}${texture ? ` › texture ${texture.name}` : ''}`,
							message: `contrasto ${shown(worst)}:1 nel punto più carico${background === 'pieno' ? '' : ' dell’effetto'}, minimo ${min}:1 (WCAG AA)`,
							hint: texture
								? `abbassa l’opacità della texture ${texture.name} o restringi i suoi tableValues verso 0.5`
								: `abbassa le percentuali di color-mix di "${background}" sul tono ${tone}, o rivedi --${fg} della palette ${palette}`,
						});
					}
				}
			}
		}
	}
	// Velature delle foto: il testo bianco sulla velatura, sopra una foto tutta bianca.
	const overlays = existsSync(join(root, OVERLAYS_FILE)) ? readOverlays(readFileSync(join(root, OVERLAYS_FILE), 'utf8')) : [];
	for (const overlay of overlays) {
		const unknown = [overlay.layer.token, overlay.layer.mix?.with ?? []].flat().filter((token) => !TOKENS.includes(tokenName(token)) && !(token in KEYWORDS));
		if (unknown.length > 0 || !Number.isFinite(overlay.opacity)) {
			error({ file: OVERLAYS_FILE, where: overlay.name, message: unknown.length > 0 ? `token sconosciuti: ${unknown.join(', ')}` : 'opacity mancante', hint: 'background-color: color-mix(in oklab, var(--token) N%, black) e opacity: N' });
			continue;
		}
		for (const { palette, vars } of complete) {
			const color = (token: string) => KEYWORDS[token] ?? parseHex(vars.get(tokenName(token))!);
			const { layer } = overlay;
			const fill = layer.mix ? mixOklab(color(layer.token), color(layer.mix.with), layer.mix.percent) : color(layer.token);
			const ratio = ratioOf(WHITE, over(fill, WHITE, overlay.opacity * layer.alpha));
			if (ratio < 4.5) {
				error({
					file: OVERLAYS_FILE,
					where: `${overlay.name} › ${palette}`,
					message: `testo bianco ${shown(ratio)}:1 sulla velatura sopra una foto bianca, minimo 4.5:1 (WCAG AA)`,
					hint: 'scurisci la velatura (più nero nel color-mix) o alza l’opacità',
				});
			}
		}
	}
	return findings;
}
