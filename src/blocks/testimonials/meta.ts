import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'testimonials',
	name: 'Recensioni',
	description: 'Le parole dei clienti: recensioni vere con autore e fonte, in griglia, una sola in evidenza o da sfogliare.',
	whenToUse: 'Quando il cliente ha recensioni reali (Google, Facebook, messaggi) e può dire dove sono state scritte.',
	avoidWhen:
		'Senza recensioni reali: non si inventano né si riassumono. Senza la fonte di ognuna. Per numeri e statistiche (about, con-numeri). Per voti medi o conteggi complessivi, che non sono nel blocco.',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		cards: {
			description: 'Recensioni in card, su una, due o tre colonne; ognuna con autore e fonte.',
			whenToUse: 'Con 2-6 recensioni brevi da leggere tutte insieme.',
		},
		singola: {
			description: 'Una sola recensione in grande, centrata, con autore e fonte.',
			whenToUse: 'Quando una recensione è particolarmente forte, ad esempio sopra a una richiesta di contatto.',
		},
		slider: {
			description: 'Una recensione alla volta, con frecce e pallini; scorre solo su comando.',
			whenToUse: 'Con 3-10 recensioni, quando non c’è spazio per mostrarle tutte.',
		},
	},
	rules: ['La variante singola vuole una sola recensione, cards da 2 a 6, slider da 3 a 10.'],
	fieldRules: {
		items: { note: 'Singola: 1 recensione · cards: da 2 a 6 · slider: da 3 a 10.' },
		'items[].fonte': { note: 'Obbligatoria per ogni recensione; compare sotto l’autore.' },
		'items[].href': { note: 'Se c’è, la fonte diventa un link alla recensione originale.' },
	},
};
