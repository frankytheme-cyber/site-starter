import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'gallery',
	name: 'Galleria',
	description: 'Le foto dei lavori svolti: una griglia che si ingrandisce al clic, coppie prima e dopo, oppure una foto grande alla volta.',
	whenToUse: 'Per mostrare lavori, locali o prodotti veri, quando le foto parlano da sole. Solo foto reali fornite dal cliente.',
	avoidWhen:
		'Senza foto vere: non si riempie con immagini d’archivio o inventate, si usa un altro blocco. Con meno di 2 foto. Per foto che accompagnano un testo (about, services). Per una serie da sfogliare con testo e link (carousel).',
	category: 'contenuti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		'griglia-popup': {
			description: 'Griglia di miniature; al clic la foto si apre grande in una finestra, con frecce e didascalia. Senza JavaScript la miniatura apre il file della foto.',
			whenToUse: 'Per tante foto di lavori diversi (da 4 a 12) da guardare nel dettaglio.',
		},
		'prima-dopo': {
			description: 'Coppie di foto «prima» e «dopo» con un cursore per confrontarle. Senza JavaScript le due foto stanno affiancate con la loro etichetta.',
			whenToUse: 'Per ristrutturazioni, restauri, pulizie, trasformazioni: ogni coppia con la stessa inquadratura.',
		},
		slider: {
			description: 'Una foto grande alla volta, con frecce, pallini e didascalia; scorre solo su comando.',
			whenToUse: 'Per poche foto di qualità (da 3 a 8) che meritano tutto lo spazio.',
		},
	},
	rules: ['La variante prima-dopo richiede la foto «prima» (before) in ogni elemento e al massimo 6 coppie.'],
	fieldRules: {
		'items[].before': { requiredFor: ['prima-dopo'], note: 'Le altre varianti non la mostrano. Stessa inquadratura del «dopo».' },
		items: { note: 'Prima-dopo: al massimo 6 coppie.' },
	},
};
