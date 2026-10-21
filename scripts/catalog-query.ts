/** Consultazione locale mirata, disponibile anche nei siti cliente. Non avvia Astro. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BlockInfo, CatalogData } from './gen-catalog.ts';
import { ROOT } from './checks/lib/project.ts';

const usage = `uso: npm run catalog:query -- [<blocco> | --cerca <testo> | --temi [testo] | --icone <testo> | --regole]
Senza argomenti: indice breve. Un blocco: campi, limiti, regole ed esempio (la variante è indicata nell'esempio).
La ricerca è testuale: confronta il materiale disponibile con whenToUse, avoidWhen e i campi obbligatori.`;
const summary = (block: BlockInfo) => ({ type: block.type, scope: block.scope, description: block.description, variants: block.variants.map(({ name, whenToUse }) => ({ name, whenToUse })) });
const matches = (value: unknown, term: string) => JSON.stringify(value).toLocaleLowerCase('it').includes(term.toLocaleLowerCase('it'));

try {
	const args = process.argv.slice(2);
	if (args[0] === '--help' && args.length === 1) { console.log(usage); process.exit(0); }
	const data = JSON.parse(readFileSync(join(ROOT, 'docs/catalogo/catalogo.json'), 'utf8')) as CatalogData;
	const [command, term] = args;
	let result: unknown;
	if (args.length === 0) result = data.blocks.map(summary);
	else if (command === '--cerca' && term?.trim() && args.length === 2) {
		result = data.blocks.filter((block) => matches([block.type, block.name, block.description, block.whenToUse, block.variants], term)).map(summary);
	} else if (command === '--icone' && term?.trim() && args.length === 2) {
		result = data.icons.filter((icon) => matches(icon, term));
	} else if (command === '--temi' && args.length <= 2) {
		result = Object.fromEntries(Object.entries(data.themes).filter(([key]) => key !== 'fields').map(([key, presets]) =>
			[key, presets.filter((preset) => !term || matches(preset, term))],
		));
	} else if (command === '--regole' && args.length === 1) {
		const index = readFileSync(join(ROOT, 'docs/catalogo/README.md'), 'utf8');
		const composition = /<!-- regole-di-composizione:inizio -->([\s\S]*?)<!-- regole-di-composizione:fine -->/.exec(index)?.[1].trim();
		result = { recipeRules: data.recipeRules, composition, specialLinks: data.specialLinks, backgrounds: data.backgrounds, edges: data.edges };
	} else if (args.length === 1 && !command.startsWith('--')) {
		result = data.blocks.find((block) => block.type === command);
		if (!result) throw new Error(`blocco sconosciuto: ${command}`);
	} else throw new Error('argomenti non validi');
	console.log(JSON.stringify({ library: data.library, version: data.version, result }, null, 2));
} catch (cause) {
	console.error(`✗ ${(cause as Error).message}\n${usage}`);
	process.exitCode = 1;
}
