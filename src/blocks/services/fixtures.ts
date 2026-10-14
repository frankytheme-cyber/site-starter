import antimuffa from '@/assets/images/fixtures/imbianchino-antimuffa.jpg';
import cartongesso from '@/assets/images/fixtures/imbianchino-cartongesso.jpg';
import decorazioni from '@/assets/images/fixtures/imbianchino-decorazioni.jpg';
import facciata from '@/assets/images/fixtures/imbianchino-facciata.jpg';
import interno from '@/assets/images/fixtures/imbianchino-interno.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

const images = {
	interno: {
		src: interno,
		alt: 'Parete tinteggiata a metà in verde salvia, con un rullo appoggiato',
	},
	facciata: {
		src: facciata,
		alt: 'Facciata di una casa color ocra con persiane verdi',
	},
	decorazioni: {
		src: decorazioni,
		alt: 'Parete a stucco veneziano color ocra con una spatola appoggiata',
	},
	cartongesso: {
		src: cartongesso,
		alt: 'Lastre di cartongesso montate su una parete, con i giunti stuccati e una livella',
	},
	antimuffa: {
		src: antimuffa,
		alt: 'Angolo di una stanza con macchie di muffa a sinistra e parete risanata a destra',
	},
};

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Card con icona',
		props: {
			variant: 'cards-icone',
			eyebrow: 'Cosa facciamo',
			title: 'Tutto quello che serve alle tue pareti',
			intro:
				'Dalla singola stanza al condominio intero: un’unica squadra per preparare, tinteggiare e rifinire, con tempi concordati prima di iniziare.',
			items: [
				{
					icon: 'rullo',
					title: 'Tinteggiature interne',
					text: 'Pareti e soffitti con pitture traspiranti o lavabili. Copriamo mobili e pavimenti, stucchiamo le crepe e lasciamo tutto pulito.',
				},
				{
					icon: 'edificio',
					title: 'Facciate esterne',
					text: 'Pulizia, ripristino degli intonaci e pitture ai silossani che resistono a pioggia, sole e smog per molti anni.',
				},
				{
					icon: 'pennello',
					title: 'Decorazioni e velature',
					text: 'Stucco veneziano, velature e spatolati per dare carattere all’ingresso o a una parete del soggiorno.',
				},
				{
					icon: 'goccia',
					title: 'Trattamenti antimuffa',
					text: 'Eliminiamo muffa e condensa alla radice con prodotti risananti e pitture termiche anticondensa.',
				},
				{
					icon: 'muro',
					title: 'Cartongesso',
					text: 'Contropareti, controsoffitti e nicchie su misura, montati, stuccati e tinteggiati dalla stessa squadra.',
				},
				{
					icon: 'scala',
					title: 'Vani scala condominiali',
					text: 'Lavori programmati con l’amministratore e divisi a fasce orarie, per disturbare il meno possibile chi ci abita.',
				},
			],
		},
	},
	{
		name: 'Card con immagine',
		props: {
			variant: 'cards-immagine',
			eyebrow: 'I nostri servizi',
			title: 'Lavori fatti bene, dentro e fuori casa',
			items: [
				{
					image: images.interno,
					title: 'Tinteggiature interne',
					text: 'Pitture traspiranti, lavabili o antimuffa, scelte in base alla stanza. Proteggiamo mobili e pavimenti e a fine giornata puliamo.',
					link: { label: 'Vedi gli interni', href: '#interni' },
				},
				{
					image: images.facciata,
					title: 'Facciate esterne',
					text: 'Ripristino di intonaci e cornicioni, trattamento delle infiltrazioni e pitture ai silossani che durano negli anni.',
					link: { label: 'Vedi le facciate', href: '#facciate' },
				},
				{
					image: images.decorazioni,
					title: 'Decorazioni e velature',
					text: 'Stucco veneziano, velature e spatolati: proviamo i campioni sulle tue pareti prima di scegliere.',
					link: { label: 'Vedi le decorazioni', href: '#decorazioni' },
				},
			],
		},
	},
	{
		name: 'Alternato',
		props: {
			variant: 'alternato',
			eyebrow: 'Servizi',
			title: 'Come possiamo aiutarti',
			intro:
				'Ogni lavoro parte da un sopralluogo gratuito: guardiamo le pareti, ascoltiamo cosa ti serve e ti lasciamo un preventivo scritto e dettagliato.',
			items: [
				{
					image: images.interno,
					title: 'Tinteggiature interne',
					text: 'Dalla stuccatura delle crepe all’ultima mano di colore. Copriamo mobili e pavimenti e lavoriamo una stanza alla volta, così puoi continuare a vivere in casa.',
					link: { label: 'Chiedi un preventivo', href: '#preventivo' },
				},
				{
					image: images.cartongesso,
					title: 'Cartongesso e controsoffitti',
					text: 'Contropareti isolanti, controsoffitti con faretti, nicchie e librerie su misura: montiamo, stucchiamo e tinteggiamo, senza passare il lavoro ad altri.',
				},
				{
					image: images.antimuffa,
					title: 'Trattamenti antimuffa',
					text: 'Cerchiamo la causa prima di coprire la macchia: puliamo con prodotti risananti e applichiamo pitture termiche che riducono la condensa.',
					link: { label: 'Come trattiamo la muffa', href: '#antimuffa' },
				},
			],
		},
	},
	{
		name: 'Card con immagine, 4 servizi',
		tone: 'muted',
		props: {
			variant: 'cards-immagine',
			title: 'Interni, esterni e finiture',
			items: [
				{
					image: images.interno,
					title: 'Tinteggiature interne',
					text: 'Pareti e soffitti con pitture traspiranti o lavabili, scelte stanza per stanza.',
				},
				{
					image: images.facciata,
					title: 'Facciate esterne',
					text: 'Intonaci ripristinati e pitture ai silossani che resistono a pioggia e smog.',
				},
				{
					image: images.cartongesso,
					title: 'Cartongesso',
					text: 'Contropareti, controsoffitti e nicchie su misura, già pronti da tinteggiare.',
				},
				{
					image: images.antimuffa,
					title: 'Trattamenti antimuffa',
					text: 'Prodotti risananti e pitture termiche contro muffa e condensa.',
				},
			],
		},
	},
	{
		name: 'Card con icona, testi al limite',
		props: {
			variant: 'cards-icone',
			eyebrow: 'Imbiancature, decorazioni e cartongesso',
			title: 'Tinteggiature, decorazioni e cartongesso per case, uffici e condomini',
			intro:
				'Lavoriamo in tutta la provincia con una squadra fissa di quattro persone. Prima di iniziare concordiamo date, colori e prodotti, e durante il cantiere hai sempre un solo referente da chiamare per qualsiasi dubbio o cambio di programma.',
			items: [
				{
					icon: 'scudo',
					title: 'Garanzia scritta di cinque anni su tutti i lavori',
					text: 'Se una parete si crepa o la pittura si stacca entro cinque anni dalla fine dei lavori torniamo a sistemarla senza costi, con la stessa squadra e gli stessi prodotti usati allora.',
					link: { label: 'Leggi come funziona tutto', href: '#garanzia' },
				},
				{
					icon: 'calendario',
					title: 'Date di inizio e di fine fissate nel preventivo',
					text: 'Nel preventivo scriviamo il giorno di inizio e quello di fine. Se il cantiere finisce in ritardo per colpa nostra, ogni giorno in più ti viene scalato dal totale del preventivo.',
					link: { label: 'Chiedi un preventivo oggi', href: '#preventivo' },
				},
			],
		},
	},
];
