/**
 * Intensità degli effetti di sfondo per ogni palette: --fx-default e --fx-muted in
 * src/themes/palettes/<nome>.css moltiplicano le percentuali calc(N% * var(--fx-…)) di
 * src/themes/backgrounds.css. Per ogni palette e tono trova il valore più alto, a passi di 0.05 e
 * al massimo 1.25, con cui testi, link e anello di focus restano AA in ogni effetto e con ogni
 * texture: gli stessi calcoli del check contrast (effectFailures). Le palette con più margine di
 * contrasto hanno effetti più visibili; nessuna scende sotto AA.
 *
 * Uso: node scripts/effect-strength.ts           stampa i valori
 *      node scripts/effect-strength.ts --write   li scrive nei file delle palette
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { effectFailures, FX_SCALES, PALETTES_DIR, readEffects, readPalettes, readTextures } from './checks/contrast.ts';
import { ROOT } from './checks/lib/project.ts';

const MAX = 1.25;
const STEP = 0.05;

const write = process.argv.includes('--write');
const effects = readEffects(ROOT);
const textures = readTextures(ROOT);
if (effects.length === 0) {
	console.error('Nessun effetto letto in src/themes/backgrounds.css.');
	process.exit(1);
}

const dir = join(ROOT, PALETTES_DIR);
for (const file of readdirSync(dir).filter((name) => name.endsWith('.css'))) {
	let css = readFileSync(join(dir, file), 'utf8');
	for (const [palette, vars] of readPalettes(css)) {
		const found: Record<string, string> = {};
		for (const scale of FX_SCALES) {
			const tone = scale.replace('fx-', '');
			let best = 0;
			for (let steps = Math.round(MAX / STEP); steps >= 0; steps--) {
				const value = Number((steps * STEP).toFixed(2));
				const trial = new Map(vars).set(scale, String(value));
				if (effectFailures(trial, effects, textures).every((failure) => failure.tone !== tone)) {
					best = value;
					break;
				}
			}
			found[scale] = String(best);
		}
		console.log(`${palette.padEnd(12)} --fx-default: ${found['fx-default']};  --fx-muted: ${found['fx-muted']};`);
		if (!write) continue;
		// Sostituisce le righe che ci sono, o le aggiunge in fondo al blocco della palette.
		const block = new RegExp(`(\\[data-palette="${palette}"\\]\\s*\\{)([^}]*)\\}`);
		css = css.replace(block, (_, open: string, body: string) => {
			let next = body;
			for (const scale of FX_SCALES) {
				const line = new RegExp(`\\n\\t--${scale}:[^;]*;`);
				next = line.test(next) ? next.replace(line, `\n\t--${scale}: ${found[scale]};`) : `${next.trimEnd()}\n\t--${scale}: ${found[scale]};\n`;
			}
			return `${open}${next}}`;
		});
	}
	if (write) writeFileSync(join(dir, file), css);
}
if (write) console.log('\nScritti nei file di src/themes/palettes: rilancia npm run check:contrast.');
