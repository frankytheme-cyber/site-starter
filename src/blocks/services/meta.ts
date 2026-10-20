import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'services',
	name: 'Servizi',
	description: 'Elenco dei servizi dell’attività, da 2 a 6, ognuno con titolo, descrizione breve e link facoltativo.',
	whenToUse:
		'Per dire cosa fa l’attività, di solito subito dopo l’hero. Nella pagina dei servizi, con la variante alternato, per dare più spazio a ciascuno.',
	avoidWhen:
		'Per un solo servizio (basta un blocco di testo) o per più di 6 (meglio dividerli in più blocchi con un titolo ciascuno). Non per mostrare i lavori svolti: lì servono le foto dei lavori, non un elenco.',
	category: 'contenuti',
	scope: 'page',
	version: '1.2.0',
	source: { from: 'originale' },
	variants: {
		'cards-icone': {
			description: 'Griglia di card con icona, titolo e testo, su 2 o 3 colonne.',
			whenToUse: 'Servizi brevi e simili tra loro, quando non c’è una foto per ognuno.',
		},
		'cards-immagine': {
			description: 'Griglia di card con una foto in alto; un servizio senza foto mostra la sua icona nello stesso spazio.',
			whenToUse: 'Quando c’è una foto adatta per quasi tutti i servizi: più concreta delle icone.',
		},
		alternato: {
			description: 'Righe di foto e testo che si alternano a destra e a sinistra.',
			whenToUse: 'Da 2 a 4 servizi da raccontare con calma, di solito nella pagina dei servizi.',
		},
		schede: {
			description: 'Un servizio per scheda, con testo, foto facoltativa e link; su mobile un elenco da aprire.',
			whenToUse: 'Servizi alternativi tra cui scegliere; non per servizi che tutti devono vedere.',
		},
	},
	rules: [
		'La variante cards-icone richiede l’icona in ogni servizio.',
		'La variante alternato richiede la foto in ogni servizio.',
		'Nella variante cards-immagine ogni servizio ha la foto o, se manca, l’icona.',
	],
	fieldRules: {
		'items[].icon': { requiredFor: ['cards-icone'], note: 'In cards-immagine si vede al posto della foto che manca; alternato e schede non la mostrano.' },
		'items[].image': { requiredFor: ['alternato'], note: 'In cards-immagine la foto o l’icona; facoltativa in schede; cards-icone non la mostra.' },
	},
};
