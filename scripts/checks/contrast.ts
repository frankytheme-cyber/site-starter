/**
 * Controlla il contrasto WCAG 2.x delle palette in src/themes/palettes/.
 * Ogni coppia testo/sfondo deve arrivare a 4.5:1 (AA, testo normale);
 * l'anello di focus deve arrivare a 3:1 sullo sfondo (AA, componenti non testuali).
 *
 * Uso: npm run check:contrast
 */
import { readdirSync, readFileSync } from 'node:fs';

const PALETTES_DIR = new URL('../../src/themes/palettes/', import.meta.url);

const TOKENS = [
	'bg',
	'fg',
	'fg-muted',
	'surface',
	'surface-fg',
	'primary',
	'primary-fg',
	'accent',
	'accent-fg',
	'border',
	'ring',
];

/**
 * [primo piano, sfondo, rapporto minimo]
 * Le coppie su surface servono per le sezioni con tone="muted", che usano surface come sfondo.
 */
const PAIRS: [string, string, number][] = [
	['fg', 'bg', 4.5],
	['fg-muted', 'bg', 4.5],
	['primary', 'bg', 4.5],
	['surface-fg', 'surface', 4.5],
	['fg-muted', 'surface', 4.5],
	['primary', 'surface', 4.5],
	['primary-fg', 'primary', 4.5],
	['accent-fg', 'accent', 4.5],
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

function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light + 0.05) / (dark + 0.05);
}

/** Estrae { nome palette → { token → valore } } dai blocchi [data-palette="..."] { ... }. */
function readPalettes(css: string): Map<string, Map<string, string>> {
	const palettes = new Map<string, Map<string, string>>();
	const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const [, name, body] of source.matchAll(/\[data-palette="([^"]+)"\]\s*\{([^}]*)\}/g)) {
		const vars = new Map<string, string>();
		for (const [, token, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
			vars.set(token, value.trim());
		}
		palettes.set(name, vars);
	}
	return palettes;
}

let failures = 0;
const files = readdirSync(PALETTES_DIR).filter((file) => file.endsWith('.css'));

if (files.length === 0) {
	console.error('Nessuna palette in src/themes/palettes/');
	process.exit(1);
}

for (const file of files) {
	const palettes = readPalettes(readFileSync(new URL(file, PALETTES_DIR), 'utf8'));
	if (palettes.size === 0) {
		console.error(`✗ ${file}: nessun blocco [data-palette="..."]`);
		failures++;
	}

	for (const [name, vars] of palettes) {
		console.log(`\n${name} (${file})`);

		const missing = TOKENS.filter((token) => !vars.has(token));
		if (missing.length > 0) {
			console.log(`  ✗ token mancanti: ${missing.join(', ')}`);
			failures++;
			continue;
		}

		for (const [fg, bg, min] of PAIRS) {
			const label = `${fg} / ${bg}`.padEnd(22);
			try {
				const ratio = contrast(vars.get(fg)!, vars.get(bg)!);
				// Arrotonda per difetto: 4.499 non deve comparire come 4.50.
				const shown = (Math.floor(ratio * 100) / 100).toFixed(2);
				const ok = ratio >= min;
				if (!ok) failures++;
				console.log(`  ${ok ? '✓' : '✗'} ${label} ${shown}:1${ok ? '' : `  (minimo ${min}:1)`}`);
			} catch (error) {
				console.log(`  ✗ ${label} ${(error as Error).message}`);
				failures++;
			}
		}
	}
}

if (failures > 0) {
	console.error(`\n${failures} problemi di contrasto.`);
	process.exit(1);
}
console.log('\nContrasti OK.');
