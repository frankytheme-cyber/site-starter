import attrezzi from '@/assets/images/fixtures/artigiano-attrezzi.jpg';
import laboratorio from '@/assets/images/fixtures/artigiano-laboratorio.jpg';
import mobile from '@/assets/images/fixtures/artigiano-mobile.jpg';
import cucina from '@/assets/images/fixtures/ristorante-cucina.jpg';
import piatto from '@/assets/images/fixtures/ristorante-piatto.jpg';
import sala from '@/assets/images/fixtures/ristorante-sala.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio: ristorante (scorrimento), falegnameria (dissolvenza).
const trattoria = [
	{
		eyebrow: 'Trattoria di quartiere',
		title: 'Cucina di casa, a pranzo e a cena',
		subtitle: 'Piatti della tradizione con ingredienti del mercato, in una sala tranquilla a due passi dal centro.',
		primaryCta: { label: 'Prenota un tavolo', href: '#prenota' },
		secondaryCta: { label: 'Il menu', href: '#menu' },
		image: { src: sala, alt: 'Sala della trattoria con tavoli apparecchiati e luci calde' },
	},
	{
		eyebrow: 'La cucina',
		title: 'La pasta la tiriamo a mano ogni mattina',
		subtitle: 'Tagliatelle, ravioli e gnocchi preparati in cucina, con i sughi della stagione.',
		primaryCta: { label: 'Guarda il menu', href: '#menu' },
		image: { src: cucina, alt: 'Cucina della trattoria con pentole sui fornelli' },
	},
	{
		title: 'Feste e cene private su prenotazione',
		image: { src: piatto, alt: 'Piatto di pasta al pomodoro servito su una tovaglia a quadri' },
	},
];

const falegnameria = [
	{
		eyebrow: 'Falegnameria artigiana',
		title: 'Mobili su misura, fatti a mano in bottega',
		subtitle: 'Progettiamo con te cucine, armadi e librerie, e li montiamo a casa tua.',
		primaryCta: { label: 'Chiedi un preventivo', href: '#contatti' },
		secondaryCta: { label: 'Guarda i lavori', href: '#lavori' },
		image: { src: laboratorio, alt: 'Laboratorio di falegnameria con banco da lavoro e tavole di legno' },
	},
	{
		title: 'Restauro di mobili antichi',
		subtitle: 'Riportiamo a nuovo cassettoni, sedie e tavoli di famiglia, con le tecniche di una volta.',
		primaryCta: { label: 'Scopri il restauro', href: '#restauro' },
		image: { src: attrezzi, alt: 'Attrezzi da falegname appesi alla parete della bottega' },
	},
	{
		title: 'Legno massello scelto pezzo per pezzo',
		image: { src: mobile, alt: 'Mobile in legno massello appena finito nella bottega' },
	},
];

// Stesse slide partendo dalla seconda: nel catalogo ogni slider ha un nome diverso (la prima slide).
const rotate = <T>(slides: T[]) => [...slides.slice(1), slides[0]];

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Scorrimento',
		props: { variant: 'scorrimento', slides: trattoria },
	},
	{
		name: 'Dissolvenza',
		props: { variant: 'dissolvenza', slides: falegnameria },
	},
	{
		name: 'Scorrimento, frecce ai lati',
		props: { variant: 'scorrimento', arrows: 'lati', slides: rotate(falegnameria) },
	},
	{
		name: 'Dissolvenza, senza frecce e testi in dissolvenza',
		props: { variant: 'dissolvenza', arrows: 'nessuna', animation: 'dissolvenza', slides: rotate(trattoria) },
	},
	{
		name: 'Scorrimento, velatura colorata e testi al limite',
		props: {
			variant: 'scorrimento',
			overlay: 'colorata',
			arrows: 'lati',
			animation: 'nessuna',
			slides: [
				{
					eyebrow: 'Trattoria di quartiere dal 1987',
					title: 'Cucina di casa a pranzo e cena, con piatti del mercato di ogni giorno',
					subtitle:
						'Piatti della tradizione preparati con ingredienti scelti ogni mattina al mercato, serviti in una sala tranquilla a due passi dal centro, con un menu che cambia spesso.',
					primaryCta: { label: 'Prenota un tavolo stasera', href: '#prenota' },
					secondaryCta: { label: 'Leggi il menu del giorno', href: '#menu' },
					image: { src: sala, alt: 'Sala della trattoria con tavoli apparecchiati e luci calde' },
				},
				{
					title: 'Feste e cene private su prenotazione',
					primaryCta: { label: 'Chiedi una data', href: '#prenota' },
					image: { src: piatto, alt: 'Piatto di pasta al pomodoro servito su una tovaglia a quadri' },
				},
			],
		},
	},
];
