/**
 * Font di ripiego con le misure dei font del tema, per src/themes/fonts/<coppia>.css.
 *
 * I font arrivano con font-display: swap: finché non sono scaricati il testo usa il ripiego, e se
 * il ripiego è più largo o più stretto i titoli vanno a capo in altri punti e la pagina salta
 * (CLS). Il salto cambia da un sistema all'altro: su macOS Georgia e system-ui somigliano ai
 * font del tema, su Linux e Android no. Il ripiego qui è Arial o Times New Roman (o i loro gemelli
 * con le stesse misure, Liberation e Arimo/Tinos, installati con le dipendenze di Playwright),
 * scalato con size-adjust alla larghezza media del font vero e con ascent/descent-override alla
 * sua altezza: lo scambio non sposta più il testo.
 *
 * Misura in Chromium un testo italiano col font vero e col ripiego, ai pesi 400 e 700, e stampa
 * i @font-face da incollare nel CSS della coppia.
 *
 * Uso: node scripts/font-fallbacks.ts fraunces:serif source-sans-3:sans
 *      (pacchetto @fontsource-variable/<nome> e tipo del ripiego, serif o sans)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { ROOT } from './checks/lib/project.ts';

/** Fonti locali del ripiego, regolare e grassetto: Arial e Times New Roman o i gemelli metrici. */
const LOCAL: Record<'serif' | 'sans', { regular: string[]; bold: string[] }> = {
	serif: {
		regular: ['Times New Roman', 'TimesNewRomanPSMT', 'Liberation Serif', 'Tinos'],
		bold: ['Times New Roman Bold', 'TimesNewRomanPS-BoldMT', 'Liberation Serif Bold', 'Tinos Bold'],
	},
	sans: {
		regular: ['Arial', 'ArialMT', 'Liberation Sans', 'Arimo'],
		bold: ['Arial Bold', 'Arial-BoldMT', 'Liberation Sans Bold', 'Arimo Bold'],
	},
};

/** Fino a 549 il ripiego regolare, da 550 il grassetto (font-semibold e font-bold dei titoli). */
const FACES = [
	{ weight: 400, range: '100 549', local: 'regular' },
	{ weight: 700, range: '550 900', local: 'bold' },
] as const;

const SAMPLE =
	'Bottega artigiana in centro dal 1987: preventivo gratuito, appuntamento in 48 ore. ' +
	'Mobili su misura, riparazioni, pranzi di lavoro e consulenze per famiglie e imprese. Chiamaci o scrivici su WhatsApp, ' +
	'ti rispondiamo entro un giorno lavorativo. Qualità, puntualità e prezzi chiari fin dal primo incontro.';

const args = process.argv.slice(2);
const fonts = args.map((arg) => {
	const [name, kind] = arg.split(':');
	if (!name || (kind !== 'serif' && kind !== 'sans')) {
		console.error(`Argomento non valido: "${arg}". Uso: node scripts/font-fallbacks.ts fraunces:serif source-sans-3:sans`);
		process.exit(2);
	}
	const dir = join(ROOT, 'node_modules/@fontsource-variable', name);
	const family = /font-family:\s*'([^']+)'/.exec(readFileSync(join(dir, 'index.css'), 'utf8'))?.[1];
	if (!family) throw new Error(`font-family non trovato in @fontsource-variable/${name}/index.css`);
	const woff2 = readFileSync(join(dir, 'files', `${name}-latin-wght-normal.woff2`)).toString('base64');
	return { name, kind: kind as 'serif' | 'sans', family, woff2 };
});
if (fonts.length === 0) {
	console.error('Uso: node scripts/font-fallbacks.ts fraunces:serif source-sans-3:sans');
	process.exit(2);
}

const localSrc = (names: readonly string[]) => names.map((name) => `local("${name}")`).join(', ');
const css = fonts
	.flatMap(({ name, kind, woff2 }) => [
		`@font-face { font-family: "vero-${name}"; font-weight: 100 900; src: url(data:font/woff2;base64,${woff2}); }`,
		...FACES.map((face) => `@font-face { font-family: "ripiego-${name}"; font-weight: ${face.range}; src: ${localSrc(LOCAL[kind][face.local])}; }`),
	])
	.join('\n');

const browser = await chromium.launch();
try {
	const page = await browser.newPage();
	await page.setContent(`<style>${css}</style>`);
	const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
	for (const { name, kind, family } of fonts) {
		const blocks: string[] = [];
		for (const face of FACES) {
			const measured = await page.evaluate(
				async ({ name, weight, sample }) => {
					await document.fonts.load(`${weight} 16px "vero-${name}"`);
					const [face] = await document.fonts.load(`${weight} 16px "ripiego-${name}"`);
					const context = document.createElement('canvas').getContext('2d')!;
					const measure = (familyName: string) => {
						context.font = `${weight} 1000px "${familyName}"`;
						return context.measureText(sample);
					};
					const real = measure(`vero-${name}`);
					const fallback = measure(`ripiego-${name}`);
					return {
						// Senza nessuna delle fonti locali la faccia non si carica: la misura sarebbe di un altro font.
						loaded: face?.status === 'loaded',
						ratio: real.width / fallback.width,
						ascent: real.fontBoundingBoxAscent / 1000,
						descent: real.fontBoundingBoxDescent / 1000,
					};
				},
				{ name, weight: face.weight, sample: SAMPLE },
			);
			if (!measured.loaded) throw new Error(`nessuno tra ${LOCAL[kind][face.local].join(', ')} è installato: servono per misurare il ripiego`);
			blocks.push(
				[
					'@font-face {',
					`\tfont-family: "${family} ripiego";`,
					`\tfont-weight: ${face.range};`,
					`\tsrc: ${localSrc(LOCAL[kind][face.local])};`,
					`\tsize-adjust: ${percent(measured.ratio)};`,
					`\tascent-override: ${percent(measured.ascent / measured.ratio)};`,
					`\tdescent-override: ${percent(measured.descent / measured.ratio)};`,
					'\tline-gap-override: 0%;',
					'}',
				].join('\n'),
			);
		}
		console.log(`/* ${family}: ripiego ${kind === 'serif' ? 'Times New Roman' : 'Arial'} con le sue misure (node scripts/font-fallbacks.ts ${name}:${kind}). */`);
		console.log(`${blocks.join('\n')}\n`);
	}
} finally {
	await browser.close();
}
