import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'tabs',
	name: 'Schede',
	description: 'Contenuti alternativi in schede: se ne vede uno alla volta, da desktop con le linguette, su mobile come elenco da aprire.',
	whenToUse:
		'Quando chi visita sceglie una strada tra poche alternative parallele dello stesso tipo: interni o esterni, privati o condomini, tipi di finitura.',
	avoidWhen:
		'Per informazioni che tutti devono leggere (prezzi, condizioni, garanzie): nelle schede chiuse non le vede quasi nessuno, meglio un testo aperto o services. Per più di 6 voci o etichette lunghe, per confrontare elementi fianco a fianco (servono card o una tabella) e per passaggi in sequenza (meglio accordion o un elenco numerato).',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		testo: 'Solo testo, eventualmente con un pulsante. Compatta.',
		'testo-immagine': 'Testo e foto affiancati in ogni scheda (foto sopra su mobile). Richiede una foto per scheda.',
	},
	fieldRules: {
		'items[].image': 'Obbligatoria per la variante testo-immagine; testo non la mostra.',
	},
};
