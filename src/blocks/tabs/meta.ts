import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'tabs',
	name: 'Schede',
	description: 'Contenuti alternativi in schede: se ne vede uno alla volta, da desktop con le linguette, su mobile come elenco da aprire.',
	whenToUse:
		'Quando chi visita sceglie una strada tra poche alternative parallele dello stesso tipo: pranzo o cena, privati o imprese, servizi di base o completi.',
	avoidWhen:
		'Per informazioni che tutti devono leggere (prezzi, condizioni, garanzie): nelle schede chiuse non le vede quasi nessuno, meglio un testo aperto o services. Per più di 6 voci o etichette lunghe, per confrontare elementi fianco a fianco (servono card o una tabella) e per passaggi in sequenza (meglio accordion o un elenco numerato).',
	category: 'contenuti',
	scope: 'page',
	backgrounds: ['pieno', 'sfumato'],
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		testo: {
			description: 'Solo testo in ogni scheda, eventualmente con un pulsante.',
			whenToUse: 'Per informazioni parallele e brevi, senza foto: fasi del lavoro, tipi di intervento.',
		},
		'testo-immagine': {
			description: 'Testo e foto affiancati in ogni scheda (foto sopra su mobile).',
			whenToUse: 'Quando ogni scheda ha una sua foto: storia, metodo, squadra.',
		},
	},
	rules: [
		'La variante testo-immagine richiede la foto in ogni scheda.',
	],
	fieldRules: {
		'items[].image': { requiredFor: ['testo-immagine'], note: 'testo non la mostra.' },
	},
};
