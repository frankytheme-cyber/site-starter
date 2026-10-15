/**
 * tokens: in src/blocks, src/core e src/layouts (.astro, .css, .ts) solo token semantici. Vieta le
 * classi della palette di Tailwind (bg-blue-600, text-gray-500, fill-*, ring-*, from-/via-/to-*...)
 * anche se con la palette disattivata non generano CSS, i valori arbitrari di colore (bg-[#..],
 * text-[rgb(..)]), i colori letterali (hex, rgb, hsl, oklch...), gli attributi style con
 * color/background e !important.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type CheckContext, collector } from './lib/report.ts';
import { rel, walk } from './lib/project.ts';

const DIRS = ['src/blocks', 'src/core', 'src/layouts'];
const EXTENSIONS = ['.astro', '.css', '.ts'];
const COLOR_FUNCTION = String.raw`(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(`;
const HEX = String.raw`#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})`;

/** Colori e sfumature della palette di default di Tailwind (v4, compresi mauve, olive, mist e taupe). */
const PALETTE = String.raw`(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|mauve|olive|mist|taupe)-(?:50|[1-9]00|950)`;
/** Utility di Tailwind che accettano un colore. */
const COLOR_UTILITY = String.raw`(?:bg|text|border(?:-[xytrblse])?|divide|outline|ring(?:-offset)?|inset-ring|shadow|inset-shadow|drop-shadow|text-shadow|fill|stroke|from|via|to|placeholder|caret|accent|decoration)`;

const RULES: { pattern: RegExp; message: (match: string) => string; hint: string }[] = [
	{
		// Con la palette disattivata (base.css) queste classi non generano CSS: restano nell'HTML senza effetto.
		pattern: new RegExp(String.raw`(?<![\w-])${COLOR_UTILITY}-${PALETTE}(?:\/[\w.]+)?(?![\w-])|--color-${PALETTE}(?![\w-])`, 'g'),
		message: (match) => `classe della palette di Tailwind "${match}"`,
		hint: 'usa una classe semantica (bg-primary, text-fg-muted, border-border, ring-ring...): la palette di Tailwind è disattivata',
	},
	{
		// Classi Tailwind con un colore tra parentesi quadre: bg-[#1e40af], text-[rgb(0_0_0)], border-[color:#fff].
		pattern: new RegExp(String.raw`[\w:-]*-\[(?:color:)?(?:${HEX}|${COLOR_FUNCTION})[^\]]*\]`, 'g'),
		message: (match) => `valore arbitrario di colore "${match}"`,
		hint: 'usa una classe semantica (bg-primary, text-fg-muted, border-border...)',
	},
	{
		pattern: new RegExp(String.raw`(?<![\w&#\[-])${HEX}(?![\w-])|(?<![\w\[-])${COLOR_FUNCTION}`, 'g'),
		message: (match) => `colore letterale "${match}"`,
		hint: 'i colori stanno solo nelle palette di src/themes/palettes: usa un token (var(--primary) nel CSS, bg-primary nelle classi)',
	},
	{
		pattern: /style=(?:"[^"]*|'[^']*|\{[^}]*)\b(?:color|background)[\w-]*\s*:/gi,
		message: () => 'attributo style con color o background',
		hint: 'usa le classi semantiche: lo stile inline scavalca i toni di Section e il contrasto verificato',
	},
	{
		pattern: /!important/g,
		message: () => '!important',
		hint: 'risolvi la priorità con la specificità o i layer di Tailwind, non con !important',
	},
];

export function tokens({ root }: CheckContext) {
	const { findings, error } = collector('tokens');
	const files = DIRS.flatMap((dir) => walk(join(root, dir), (file) => EXTENSIONS.some((extension) => file.endsWith(extension))));
	for (const path of files) {
		const lines = readFileSync(path, 'utf8').split('\n');
		lines.forEach((line, index) => {
			// Un colore dentro un valore arbitrario già segnalato non si conta due volte.
			const spans: [number, number][] = [];
			for (const rule of RULES) {
				for (const match of line.matchAll(rule.pattern)) {
					const start = match.index;
					if (spans.some(([from, to]) => start >= from && start < to)) continue;
					spans.push([start, start + match[0].length]);
					error({ file: rel(path), where: `riga ${index + 1}`, message: rule.message(match[0]), hint: rule.hint });
				}
			}
		});
	}
	return findings;
}
