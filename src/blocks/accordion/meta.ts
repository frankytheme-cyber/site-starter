import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'accordion',
	name: 'Accordion',
	description: 'Domande frequenti o sezioni di testo che si aprono una per una: tanti contenuti in poco spazio.',
	whenToUse:
		'Per le domande frequenti (variante faq, che Google può mostrare nei risultati) o per informazioni di dettaglio che solo alcuni cercano: condizioni, tempi, cosa preparare prima di un appuntamento.',
	avoidWhen:
		'Per informazioni che tutti devono leggere (prezzi, garanzie principali): nascoste in una voce chiusa le legge poca gente, meglio un testo aperto. Con una voce sola o più di 12: dividi in più blocchi.',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	rules: [
		'Al massimo un accordion faq per pagina: ognuno scrive i dati strutturati FAQPage, che Google vuole uno solo (il check recipes avvisa). Per altre sezioni da aprire si usa contenuti.',
	],
	variants: {
		faq: {
			description: 'Domande e risposte centrate, con i dati strutturati FAQPage per Google.',
			whenToUse: 'Per le domande frequenti: una sola faq per pagina.',
		},
		contenuti: {
			description: 'Titolo a sinistra e voci a destra (sotto su mobile).',
			whenToUse: 'Per testi di dettaglio da aprire: condizioni, tempi, fasi del lavoro.',
		},
	},
};
