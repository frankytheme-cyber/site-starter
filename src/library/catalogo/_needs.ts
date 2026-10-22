import type { BlockInfo, FieldInfo } from '../../../scripts/gen-catalog.ts';
import catalog from '../../../docs/catalogo/catalogo.json';

/*
 * Cosa serve per usare un blocco, dalla sua scheda in docs/catalogo/catalogo.json (npm run
 * gen:catalog; il check "blocks" la vuole aggiornata): foto, icone, elenchi, dati di site.json.
 * Lo usano l'indice (ricerca e filtri) e la pagina del blocco («Cosa serve»).
 * Un blocco nuovo senza scheda non ha voci: la pagina lo dice.
 */
const infos = new Map((catalog.blocks as BlockInfo[]).map((block) => [block.type, block]));

export const blockInfo = (type: string) => infos.get(type);

/** Una riga di «Cosa serve»: «Foto» → «obbligatorie in split, full». */
export interface Need {
	label: string;
	detail: string;
}

/** Varianti in cui il campo è obbligatorio, contando anche i gruppi che lo contengono (items[].image.src). */
export function requiredIn(block: BlockInfo, field: FieldInfo): string[] {
	const byPath = new Map(block.fields.map((item) => [item.path, item]));
	const parts = field.path.split('.');
	const chain = parts
		.slice(0, -1)
		.map((_, index) => byPath.get(parts.slice(0, index + 1).join('.').replace(/\[\]$/, '')))
		.filter((item): item is FieldInfo => item !== undefined);
	chain.push(field);
	return block.variants
		.map((variant) => variant.name)
		.filter((variant) => chain.every((item) => item.required || item.requiredFor?.includes(variant)));
}

/** «obbligatorie», «obbligatorie in split, full» o «facoltative», per un gruppo di campi. */
function requirement(block: BlockInfo, fields: FieldInfo[], plural: boolean) {
	const variants = new Set(fields.flatMap((field) => requiredIn(block, field)));
	const word = plural ? 'obbligatorie' : 'obbligatorio';
	if (variants.size === 0) return { detail: plural ? 'facoltative' : 'facoltativo', variants };
	if (variants.size === block.variants.length) return { detail: word, variants };
	return { detail: `${word} in ${[...variants].join(', ')}`, variants };
}

/**
 * Il blocco legge i dati dell'attività: lo dicono descrizione, regole, aiuti o note dei campi.
 * Non gli aiuti dei link, che citano tutti @telefono e gli altri link speciali (facoltativi).
 */
const readsSite = (block: BlockInfo) =>
	[
		block.description,
		block.whenToUse,
		...block.rules,
		...block.fields.flatMap((field) => [field.path.endsWith('.href') ? undefined : field.hint, field.note]),
	].some(
		(text) => text !== undefined && /site\.json|Dati attività/.test(text),
	);

export function blockNeeds(type: string) {
	const block = infos.get(type);
	if (!block) return undefined;
	const needs: Need[] = [];

	const photos = block.fields.filter((field) => field.type === 'immagine');
	const photo = requirement(block, photos, true);
	if (photos.length > 0) needs.push({ label: 'Foto', detail: photo.detail });
	else needs.push({ label: 'Foto', detail: 'nessuna' });

	// Le icone dei pulsanti sono sempre facoltative: conta solo un'icona chiesta dal blocco.
	const icons = block.fields.filter((field) => field.type === 'icona' && requiredIn(block, field).length > 0);
	if (icons.length > 0) needs.push({ label: 'Icone', detail: requirement(block, icons, true).detail });

	for (const list of block.fields.filter((field) => field.type === 'elenco' && requiredIn(block, field).length > 0)) {
		const { variants } = requirement(block, [list], false);
		const only = variants.size < block.variants.length ? ` (solo ${[...variants].join(', ')})` : '';
		const detail = `${list.limits}${only}`;
		// Un elenco che si chiama come una voce già data (la galleria: «Foto») si aggiunge a quella.
		const same = needs.find((need) => need.label === list.label);
		if (same) same.detail += `, ${detail}`;
		else needs.push({ label: list.label, detail });
	}

	const site = readsSite(block);
	if (site) needs.push({ label: 'Dati dell’attività', detail: 'da site.json (recapiti, orari, dati legali)' });

	return {
		block,
		needs,
		/** Almeno una variante si usa senza foto. */
		photoFree: photo.variants.size < block.variants.length,
		site,
	};
}

/** Limiti senza i link markdown della scheda: «[lista icone](../README.md#icone)» → «lista icone». */
export const plainLimits = (limits: string) => limits.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replaceAll('`', '');
