import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'process',
	name: 'Come lavoriamo',
	description: 'Il percorso dal primo contatto al lavoro finito, in 3-6 passi numerati, con tempi facoltativi.',
	whenToUse: 'Quando il cliente deve sapere cosa succede dopo averti contattato: preventivo, sopralluogo, lavoro, consegna.',
	avoidWhen:
		'Per un elenco di vantaggi senza ordine (lì va features) o per la storia dell’attività (about). Non inventare tempi: se non sono garantiti, lascia vuoto il campo.',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	variants: {
		'passi-numerati': {
			description: 'Griglia di passi (3 colonne su desktop), ognuno con un grande numero, titolo e testo.',
			whenToUse: 'Percorsi di 3, 4 o 6 passi brevi, da vedere tutti insieme a colpo d’occhio.',
		},
		timeline: {
			description: 'Passi in colonna lungo una linea verticale con i numeri, uno sotto l’altro.',
			whenToUse: 'Percorsi con testi più lunghi o tempi da mostrare, o di 5 passi.',
		},
	},
	rules: [],
};
