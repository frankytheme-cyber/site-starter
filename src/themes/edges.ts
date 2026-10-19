/**
 * Bordi tra sezioni: il campo `edge` delle ricette, accanto a `tone` e `background`. Il bordo in
 * alto della sezione prende una forma nel suo colore e copre il fondo della sezione precedente. Il
 * CSS è in edges.css; core/SectionFrame.astro lo applica alla sezione. Solo dati, senza import: lo
 * usano anche gli script.
 */

export const EDGES = ['dritto', 'onda', 'diagonale', 'curva'] as const;
export type Edge = (typeof EDGES)[number];

/** Scheda di un bordo: la leggono il CMS (nome), il catalogo e chi compone le pagine. */
export interface EdgeMeta {
	/** Nome leggibile, anche nel menu a tendina del CMS. */
	name: string;
	/** Com'è, in una frase. */
	description: string;
	/** Quando sceglierlo. */
	whenToUse: string;
}

export const EDGE_META: Record<Edge, EdgeMeta> = {
	dritto: {
		name: 'Dritto',
		description: 'Il bordo in alto è una linea dritta, come sempre.',
		whenToUse: 'La maggior parte delle sezioni: è il valore di partenza.',
	},
	onda: {
		name: 'Onda',
		description: 'Il bordo in alto è un’onda morbida, nel colore della sezione.',
		whenToUse: 'Siti dal tono morbido o naturale: benessere, mare, natura, bambini.',
	},
	diagonale: {
		name: 'Diagonale',
		description: 'Il bordo in alto sale in diagonale da sinistra a destra.',
		whenToUse: 'Siti dal tono deciso o tecnico: officine, edilizia, sport.',
	},
	curva: {
		name: 'Curva',
		description: 'Il bordo in alto è un arco largo e basso, più alto al centro.',
		whenToUse: 'Per far risaltare una sezione di chiusura, come l’invito finale.',
	},
};
