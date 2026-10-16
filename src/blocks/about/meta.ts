import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'about',
	name: 'Chi siamo',
	description: 'Presentazione dell’attività: titolo, da 1 a 3 paragrafi, foto e, se ci sono, numeri veri con la loro fonte.',
	whenToUse: 'Nella pagina «Chi siamo» o come sezione di presentazione in home. Con i numeri solo se il cliente li ha forniti e sa dire da dove vengono.',
	avoidWhen:
		'Per elencare i servizi (services) o i punti di forza (features). Mai con numeri inventati o arrotondati per fare effetto: senza fonte il numero non va nel blocco.',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	variants: {
		'immagine-testo': {
			description: 'Foto da una parte e racconto dall’altra, su due colonne; su mobile la foto sta sopra.',
			whenToUse: 'Quando c’è una foto vera del luogo, del titolare o del team.',
		},
		'con-numeri': {
			description: 'Racconto con foto facoltativa e, sotto, una fila di 2-4 numeri; ogni numero mostra la sua fonte.',
			whenToUse: 'Quando il cliente ha dati verificabili (anni di attività, lavori fatti) e indica la fonte di ciascuno.',
		},
	},
	rules: [
		'La variante immagine-testo richiede la foto (image).',
		'La variante con-numeri richiede da 2 a 4 numeri (stats), ognuno con la sua fonte.',
	],
	fieldRules: {
		image: { requiredFor: ['immagine-testo'], note: 'Facoltativa in con-numeri.' },
		stats: { requiredFor: ['con-numeri'], note: 'La variante immagine-testo non li mostra.' },
		'stats[].fonte': { note: 'Obbligatoria per ogni numero; compare sotto il numero.' },
	},
};
