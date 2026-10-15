import cartongesso from '@/assets/images/fixtures/imbianchino-cartongesso.jpg';
import facciata from '@/assets/images/fixtures/imbianchino-facciata.jpg';
import interno from '@/assets/images/fixtures/imbianchino-interno.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Testo',
		props: {
			variant: 'testo',
			eyebrow: 'Per chi lavoriamo',
			title: 'Ogni cliente ha esigenze diverse',
			items: [
				{
					label: 'Privati',
					text: 'Lavoriamo una stanza alla volta, così puoi continuare a vivere in casa. Copriamo mobili e pavimenti e a fine giornata puliamo.\n\nTi aiutiamo a scegliere colori e finiture provando i campioni sulle tue pareti.',
					cta: { label: 'Chiedi un preventivo', href: '#preventivo' },
				},
				{
					label: 'Condomini',
					text: 'Concordiamo i lavori con l’amministratore e li dividiamo a fasce orarie, per disturbare il meno possibile chi ci abita. Vani scala, androni e facciate con un unico referente.',
				},
				{
					label: 'Negozi e uffici',
					text: 'Interveniamo la sera o nel fine settimana, per non fermare la tua attività. Pitture lavabili e resistenti, adatte agli ambienti di passaggio.',
				},
			],
		},
	},
	{
		name: 'Testo e immagine',
		tone: 'muted',
		props: {
			variant: 'testo-immagine',
			title: 'Interni, esterni e cartongesso',
			intro: 'Tre squadre specializzate, un solo preventivo.',
			items: [
				{
					label: 'Interni',
					text: 'Pareti e soffitti con pitture traspiranti o lavabili, scelte stanza per stanza.',
					image: { src: interno, alt: 'Parete tinteggiata a metà in verde salvia, con un rullo appoggiato' },
				},
				{
					label: 'Facciate',
					text: 'Ripristino degli intonaci e pitture ai silossani che resistono a pioggia e smog.',
					image: { src: facciata, alt: 'Facciata di una casa color ocra con persiane verdi' },
					cta: { label: 'Prenota un sopralluogo', href: '#sopralluogo', icon: 'calendario' },
				},
				{
					label: 'Cartongesso',
					text: 'Contropareti, controsoffitti e nicchie su misura, montati e tinteggiati dalla stessa squadra.',
					image: { src: cartongesso, alt: 'Lastre di cartongesso montate su una parete, con i giunti stuccati' },
				},
			],
		},
	},
];
