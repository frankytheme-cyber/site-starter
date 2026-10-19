/**
 * Effetti di sfondo delle sezioni: il campo `background` delle ricette, accanto a `tone`. Il CSS è in
 * backgrounds.css e usa solo i token della palette; core/SectionFrame.astro lo applica alla
 * sezione. Il check contrast legge quel CSS e verifica i testi nel punto più carico di ogni effetto,
 * per ogni palette e tono. Solo dati, senza import: lo usano anche gli script.
 */

export const BACKGROUNDS = ['pieno', 'sfumato', 'alone', 'aurora', 'decoro'] as const;
export type Background = (typeof BACKGROUNDS)[number];

/** Effetti ammessi da un blocco che non ne elenca altri in meta.backgrounds (BlockMeta). */
export const DEFAULT_BACKGROUNDS: readonly Background[] = ['pieno', 'sfumato', 'alone', 'decoro'];

/** Effetti ammessi nelle sezioni di un blocco: meta.backgrounds o, senza, DEFAULT_BACKGROUNDS. */
export const allowedBackgrounds = (meta: { backgrounds?: readonly Background[] }): readonly Background[] =>
	meta.backgrounds ?? DEFAULT_BACKGROUNDS;

/** Scheda di un effetto: la leggono il CMS (nome), il catalogo e chi compone le pagine. */
export interface BackgroundMeta {
	/** Nome leggibile, anche nel menu a tendina del CMS. */
	name: string;
	/** Com'è, in una frase. */
	description: string;
	/** Quando sceglierlo. */
	whenToUse: string;
}

export const BACKGROUND_META: Record<Background, BackgroundMeta> = {
	pieno: {
		name: 'Pieno',
		description: 'Solo il colore del tono, senza effetti.',
		whenToUse: 'La maggior parte delle sezioni: è il valore di partenza.',
	},
	sfumato: {
		name: 'Sfumato',
		description: 'Sfumatura leggera in diagonale verso un velo di primary; sul tono primary verso primary-hover.',
		whenToUse: 'Per dare profondità a una sezione senza farla notare; va bene anche dietro a moduli e domande.',
	},
	alone: {
		name: 'Alone',
		description: 'Due luci morbide in angoli opposti, in alto a destra e in basso a sinistra, con primary e accent molto diluiti.',
		whenToUse: 'Per scaldare una sezione da far notare: chi siamo, recensioni, invito finale.',
	},
	aurora: {
		name: 'Aurora',
		description: 'Tre aloni morbidi di primary, accent e del tono vicino, sparsi nella sezione (mesh gradient): l’effetto più scenografico.',
		whenToUse: 'Solo per l’apertura (hero) o l’invito finale (cta), una volta per pagina.',
	},
	decoro: {
		name: 'Decoro',
		description: 'Il motivo del sito (pattern di theme.json: punti, griglia, righe, onde, cerchi o arco) che sfuma verso il centro della sezione.',
		whenToUse: 'Per dare carattere a una o due sezioni con lo stesso segno in tutto il sito; con pattern «nessuno» la sezione resta piena.',
	},
};
