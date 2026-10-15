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
	version: '1.1.0',
	source: { from: 'originale' },
	variants: {
		split: 'Testo a sinistra e immagine a destra (sotto su mobile). Equilibrata, va bene per quasi tutte le attività.',
		full: 'Immagine a tutta larghezza con velatura scura e testo chiaro sopra. Di grande impatto, richiede una foto di qualità.',
		centered: 'Solo testo, centrato, senza immagine. Per pagine interne o quando manca una foto adatta.',
	},
	fieldRules: {
		image: 'Obbligatoria per le varianti split e full; centered non la mostra.',
	},
};
