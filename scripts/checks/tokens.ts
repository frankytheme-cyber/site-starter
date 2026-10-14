/**
 * tokens: nei .astro e .css di src/blocks e src/core solo token semantici. Vieta valori
 * arbitrari di colore (bg-[#..], text-[rgb(..)]), colori letterali (hex, rgb, hsl, oklch...),
 * attributi style con color/background e !important.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type CheckContext, collector } from './lib/report.ts';
import { rel, walk } from './lib/project.ts';

const DIRS = ['src/blocks', 'src/core'];
const COLOR_FUNCTION = String.raw`(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(`;
const HEX = String.raw`#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})`;

const RULES: { pattern: RegExp; message: (match: string) => string; hint: string }[] = [
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
	const files = DIRS.flatMap((dir) => walk(join(root, dir), (file) => file.endsWith('.astro') || file.endsWith('.css')));
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
