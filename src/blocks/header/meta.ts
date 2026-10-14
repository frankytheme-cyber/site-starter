import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'header',
	name: 'Header',
	description:
		'Intestazione del sito: logo o nome, menu con sottomenu e, su mobile, un pannello a tutta altezza. Voci e recapiti arrivano da navigation.json e site.json.',
	whenToUse: 'In cima a ogni pagina, una sola volta, prima di tutti gli altri blocchi.',
	avoidWhen:
		'Dentro la pagina o più di una volta: è l’intestazione del sito. Per un invito all’azione a metà pagina usa cta.',
	category: 'navigazione',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		semplice: 'Logo e menu; su desktop a destra c’è il telefono. Per siti con poche pagine o senza un’azione principale.',
		'con-cta':
			'Logo, menu e un pulsante in evidenza a destra (la cta di navigation.json), ripetuto nel menu mobile. Per spingere preventivi o prenotazioni.',
	},
};
