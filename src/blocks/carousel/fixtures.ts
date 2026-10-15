import antimuffa from '@/assets/images/fixtures/imbianchino-antimuffa.jpg';
import cartongesso from '@/assets/images/fixtures/imbianchino-cartongesso.jpg';
import decorazioni from '@/assets/images/fixtures/imbianchino-decorazioni.jpg';
import facciata from '@/assets/images/fixtures/imbianchino-facciata.jpg';
import interno from '@/assets/images/fixtures/imbianchino-interno.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

const photos = {
	interno: { src: interno, alt: 'Parete tinteggiata a metà in verde salvia, con un rullo appoggiato' },
	facciata: { src: facciata, alt: 'Facciata di una casa color ocra con persiane verdi' },
	decorazioni: { src: decorazioni, alt: 'Parete a stucco veneziano color ocra con una spatola appoggiata' },
	cartongesso: { src: cartongesso, alt: 'Lastre di cartongesso montate su una parete, con i giunti stuccati' },
	antimuffa: { src: antimuffa, alt: 'Angolo di una stanza con macchie di muffa a sinistra e parete risanata a destra' },
};

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Foto',
		props: {
			variant: 'foto',
			eyebrow: 'Lavori finiti',
			title: 'Gli ultimi cantieri',
			items: [
				{ image: photos.interno, title: 'Soggiorno in verde salvia, Firenze centro' },
				{ image: photos.facciata, title: 'Facciata ai silossani, Sesto Fiorentino' },
				{ image: photos.decorazioni, title: 'Stucco veneziano in un ingresso' },
				{ image: photos.cartongesso, title: 'Controsoffitto con faretti in cucina' },
				{ image: photos.antimuffa, title: 'Bagno risanato dalla muffa' },
			],
		},
	},
	{
		name: 'Card',
		tone: 'muted',
		props: {
			variant: 'card',
			title: 'Progetti recenti',
			intro: 'Ogni lavoro con il racconto di cosa abbiamo fatto e in quanto tempo.',
			items: [
				{
					image: photos.interno,
					title: 'Trilocale in tre giorni',
					text: 'Stuccatura delle crepe e due mani di pittura lavabile in tutte le stanze.',
					cta: { label: 'Leggi il progetto', href: '#trilocale' },
				},
				{
					image: photos.facciata,
					title: 'Facciata di una villetta',
					text: 'Pulizia, ripristino dei cornicioni e pittura ai silossani color ocra.',
					cta: { label: 'Leggi il progetto', href: '#villetta' },
				},
				{ image: photos.decorazioni, title: 'Ingresso decorato', text: 'Stucco veneziano su una parete d’accento, provato prima su un campione.' },
				{ image: photos.antimuffa, title: 'Bagno senza muffa', text: 'Trattamento risanante e pittura termica anticondensa.' },
			],
		},
	},
];
