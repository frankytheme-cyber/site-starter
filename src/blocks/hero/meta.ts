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
	version: '1.2.1',
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
		centered: {
			description: 'Solo testo, centrato, senza foto.',
			whenToUse: 'Pagine interne (servizi, contatti, note legali) o quando manca una foto adatta.',
		},
	},
	rules: [
		'Le varianti split e full richiedono la foto (image).',
	],
	fieldRules: {
		image: { requiredFor: ['split', 'full'], note: 'centered non la mostra.' },
		overlay: { note: 'Solo per la variante full; nelle altre non ha effetto.' },
	},
};
