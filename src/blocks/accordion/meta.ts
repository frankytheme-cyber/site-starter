import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'accordion',
	name: 'Accordion',
	description: 'Domande frequenti o sezioni di testo che si aprono una per una: tanti contenuti in poco spazio.',
	whenToUse:
		'Per le domande frequenti (variante faq, che Google può mostrare nei risultati) o per informazioni di dettaglio che solo alcuni cercano: condizioni, tempi, preparazione del cantiere.',
	avoidWhen:
		'Per informazioni che tutti devono leggere (prezzi, garanzie principali): nascoste in una voce chiusa le legge poca gente, meglio un testo aperto. Con una voce sola o più di 12: dividi in più blocchi.',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		faq: 'Domande e risposte centrate, con i dati strutturati FAQPage per Google. Una sola faq per pagina.',
		contenuti: 'Titolo a sinistra e voci a destra (sotto su mobile). Per sezioni di testo da aprire.',
	},
};
