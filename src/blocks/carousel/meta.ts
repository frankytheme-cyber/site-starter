import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'carousel',
	name: 'Carosello',
	description: 'Una fila di foto o di card che si scorre in orizzontale, col dito o con le frecce. Non scorre mai da sola.',
	whenToUse:
		'Per una serie di elementi dello stesso tipo che si sfogliano: foto dei lavori finiti, prima e dopo, progetti, recensioni con foto.',
	avoidWhen:
		'Per contenuti importanti: le slide dopo la prima le guarda poca gente, quindi un messaggio da far leggere a tutti va in un hero o in un testo aperto. Con meno di 3 elementi (usa una griglia, come services) o con testi lunghi. Mai come apertura della pagina al posto dell’hero, e mai a scorrimento automatico (non è previsto).',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		foto: 'Foto grandi con didascalia breve, quasi una per volta (due da tablet). Per i lavori finiti.',
		card: 'Card con foto, titolo, testo e link facoltativo; una e un pezzo su mobile, fino a tre da desktop.',
	},
	fieldRules: {
		'items[].title': 'Obbligatorio per la variante card; in foto è la didascalia.',
		'items[].text': 'Obbligatorio per la variante card.',
		'items[].cta': 'Mostrato solo nella variante card.',
	},
};
