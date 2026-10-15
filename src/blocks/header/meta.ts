import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'header',
	name: 'Header',
	description:
		'Intestazione del sito: logo o nome, menu con sottomenu e, su mobile, un pannello a tutta altezza. Voci e recapiti arrivano da navigation.json e site.json.',
	whenToUse:
		'Sempre: è l’intestazione di tutte le pagine. Non è una sezione delle ricette: variante, sticky e logo si scelgono in src/content/settings/layout.json (chiave header) e BaseLayout la disegna in cima a ogni pagina.',
	avoidWhen:
		'Nelle sezioni di una ricetta (la build lo rifiuta). Per un invito all’azione a metà pagina usa cta.',
	category: 'navigazione',
	scope: 'layout',
	version: '2.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		semplice: 'Logo e menu; su desktop a destra c’è il telefono. Per siti con poche pagine o senza un’azione principale.',
		'con-cta':
			'Logo, menu e un pulsante in evidenza a destra (la cta di navigation.json), ripetuto nel menu mobile. Per spingere preventivi o prenotazioni.',
	},
	fieldRules: {
		variant: 'con-cta richiede la cta in navigation.json.',
		logo: 'immagine richiede il logo in site.json; vuoto: immagine se il logo c’è, altrimenti il nome.',
	},
};
