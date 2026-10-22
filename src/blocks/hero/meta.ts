import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'hero',
	name: 'Hero',
	description: 'Apertura della pagina: titolo principale, sottotitolo e invito all’azione.',
	whenToUse:
		'Come primo blocco di una pagina, per dire subito cosa fa l’attività e cosa può fare chi visita (chiedere un preventivo, prenotare, chiamare).',
	avoidWhen:
		'A metà pagina o più di una volta nella stessa pagina: contiene l’unico h1. Per inviti all’azione intermedi serve un blocco dedicato.',
	category: 'apertura',
	scope: 'page',
	backgrounds: ['pieno', 'sfumato', 'alone', 'aurora', 'decoro'],
	interactive: true,
	version: '1.4.0',
	source: { from: 'originale' },
	variants: {
		split: {
			description: 'Testo a sinistra e foto a destra (sotto su mobile).',
			whenToUse: 'Quasi sempre: equilibrata, va bene per la home di qualsiasi attività che ha una buona foto.',
		},
		full: {
			description: 'Foto a tutta larghezza con velatura (scura o colorata, campo overlay) e testo chiaro sopra.',
			whenToUse: 'Quando c’è una foto di grande qualità e si vuole impatto; non con foto piccole o confuse.',
		},
		slider: {
			description:
				'Da 2 a 5 foto con velatura e testo bianco, una alla volta, da sfogliare con frecce, pallini, dito o tastiera; non scorre mai da sola. Il titolo della prima slide è l’h1.',
			whenToUse:
				'Quando l’attività ha più servizi o ambienti da mettere in evidenza subito e foto di qualità per ognuno; con una foto sola usa full.',
		},
		centered: {
			description: 'Solo testo, centrato, senza foto.',
			whenToUse: 'Pagine interne (servizi, contatti, note legali) o quando manca una foto adatta.',
		},
	},
	rules: [
		'Le varianti split, full e slider richiedono la foto (image).',
		'La variante slider richiede almeno un’altra slide (slides).',
	],
	fieldRules: {
		image: { requiredFor: ['split', 'full', 'slider'], note: 'centered non la mostra; nello slider è la foto della prima slide.' },
		slides: { requiredFor: ['slider'], note: 'Le altre varianti la ignorano.' },
		imageShape: { note: 'Solo per la variante split; nelle altre non ha effetto.' },
		overlay: { note: 'Per le varianti full e slider (tutte le slide); nelle altre non ha effetto.' },
	},
};
