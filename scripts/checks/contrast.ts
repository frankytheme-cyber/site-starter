/**
 * contrast: contrasto WCAG 2.x delle palette in src/themes/palettes/.
 * Ogni coppia testo/sfondo deve arrivare a 4.5:1 (AA, testo normale); l'anello di focus a 3:1
 * sullo sfondo (AA, componenti non testuali). Le coppie su surface valgono per tone="muted".
 * Pulsanti (core/ui/button/button.css): primary-fg su primary-hover e accent-fg su accent-hover
 * (passaggio sui pieni), primary-hover su bg e surface (passaggio sui link). Su tone primary il
 * pieno chiaro passa a surface con testo primary: è la coppia primary / surface.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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

function luminance(hex: string): number {
	const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
	if (!match) throw new Error(`colore non supportato "${hex}" (usa #rgb o #rrggbb)`);
	const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
	const [r, g, b] = [0, 2, 4].map((i) => {
		const c = parseInt(digits.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
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

// Arrotonda per difetto: 4.499 non deve comparire come 4.50.
const shown = (ratio: number) => (Math.floor(ratio * 100) / 100).toFixed(2);

export function contrast({ root }: CheckContext) {
	const { findings, error } = collector('contrast');
	const dir = join(root, 'src/themes/palettes');
	const files = readdirSync(dir).filter((file) => file.endsWith('.css'));
	if (files.length === 0) error({ file: 'src/themes/palettes', message: 'nessuna palette' });

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
					error({ file, where: `${palette} › ${fg} / ${bg}`, message: (cause as Error).message });
				}
			}
		}
	}
	return findings;
}
