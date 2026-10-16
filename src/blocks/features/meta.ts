import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'features',
	name: 'Punti di forza',
	description: 'Da 3 a 6 vantaggi o punti di forza dell’attività, ognuno con icona, titolo e frase breve.',
	whenToUse:
		'Per dire perché scegliere l’attività: garanzie, modo di lavorare, cosa la distingue. Di solito dopo i servizi o prima della cta.',
	avoidWhen:
		'Per elencare i servizi (lì va services) o per dare numeri e risultati (lì va about con-numeri, con la fonte). Non per promesse che non si possono dimostrare.',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	variants: {
		'3-colonne': {
			description: 'Griglia su 3 colonne (2 su tablet, 1 su mobile) con icona, titolo e testo centrati sul punto.',
			whenToUse: 'Punti brevi e di pari peso, da 3 o 6 (le righe restano piene).',
		},
		lista: {
			description: 'Titolo e introduzione a sinistra, a destra un elenco verticale di punti con icona.',
			whenToUse: 'Quando i punti sono 4 o 5, o hanno testi più lunghi e si leggono meglio uno sotto l’altro.',
		},
	},
	rules: [],
};
