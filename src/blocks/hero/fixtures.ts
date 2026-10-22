import laboratorio from '@/assets/images/fixtures/artigiano-laboratorio.jpg';
import vetrina from '@/assets/images/fixtures/negozio-vetrina.jpg';
import cucina from '@/assets/images/fixtures/ristorante-cucina.jpg';
import piatto from '@/assets/images/fixtures/ristorante-piatto.jpg';
import sala from '@/assets/images/fixtures/ristorante-sala.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio di settori diversi: artigiano (split), negozio (full), ristorante (slider), studio professionale (centered).
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Split',
		props: {
			variant: 'split',
			eyebrow: 'Falegnameria su misura',
			title: 'Mobili fatti a mano, pensati per casa tua',
			subtitle:
				'Progettiamo e costruiamo mobili su misura e restauriamo quelli di famiglia. Prendiamo le misure a casa tua e ti seguiamo fino al montaggio.',
			primaryCta: { label: 'Chiedi un preventivo', href: '#preventivo' },
			secondaryCta: { label: 'Guarda i lavori', href: '#lavori' },
			image: {
				src: laboratorio,
				alt: 'Banco da lavoro in legno con martello, scalpello e sega appesi a un pannello forato',
			},
		},
	},
	{
		name: 'Full',
		props: {
			variant: 'full',
			eyebrow: 'Bottega in centro',
			title: 'Prodotti scelti con cura, a due passi da casa',
			subtitle:
				'Casalinghi, articoli da regalo e prodotti del territorio. Ti consigliamo di persona e prepariamo confezioni su misura per ogni occasione.',
			primaryCta: { label: 'Vieni a trovarci', href: '#dove-siamo' },
			secondaryCta: { label: 'Gli orari', href: '#orari' },
			image: {
				src: vetrina,
				alt: 'Vetrina di una bottega con la tenda a righe bianche e rosse e la porta verde',
			},
		},
	},
	{
		name: 'Full, velatura colorata',
		props: {
			variant: 'full',
			overlay: 'colorata',
			eyebrow: 'Bottega in centro',
			title: 'Prodotti scelti con cura, a due passi da casa',
			subtitle: 'Casalinghi, articoli da regalo e prodotti del territorio, con confezioni su misura per ogni occasione.',
			primaryCta: { label: 'Vieni a trovarci', href: '#dove-siamo' },
			image: {
				src: vetrina,
				alt: 'Vetrina di una bottega con la tenda a righe bianche e rosse e la porta verde',
			},
		},
	},
	{
		name: 'Slider',
		props: {
			variant: 'slider',
			eyebrow: 'Trattoria di quartiere',
			title: 'Cucina di casa, a pranzo e a cena',
			subtitle: 'Piatti della tradizione con ingredienti del mercato, in una sala tranquilla a due passi dal centro.',
			primaryCta: { label: 'Prenota un tavolo', href: '#prenota' },
			secondaryCta: { label: 'Il menu', href: '#menu' },
			image: { src: sala, alt: 'Sala della trattoria con tavoli apparecchiati e luci calde' },
			slides: [
				{
					eyebrow: 'La cucina',
					title: 'La pasta la tiriamo a mano ogni mattina',
					subtitle: 'Tagliatelle, ravioli e gnocchi preparati in cucina, con i sughi della stagione.',
					cta: { label: 'Guarda il menu', href: '#menu' },
					image: { src: cucina, alt: 'Cucina della trattoria con pentole sui fornelli' },
				},
				{
					title: 'Feste e cene private su prenotazione',
					image: { src: piatto, alt: 'Piatto di pasta al pomodoro servito su una tovaglia a quadri' },
				},
			],
		},
	},
	{
		name: 'Slider, velatura colorata e testi al limite',
		props: {
			variant: 'slider',
			overlay: 'colorata',
			title: 'Cucina di casa a pranzo e cena, con piatti del mercato di ogni giorno',
			subtitle:
				'Piatti della tradizione preparati con ingredienti scelti ogni mattina al mercato, serviti in una sala tranquilla a due passi dal centro, con un menu che cambia spesso.',
			primaryCta: { label: 'Prenota un tavolo stasera', href: '#prenota' },
			image: { src: sala, alt: 'Sala della trattoria con tavoli apparecchiati e luci calde' },
			slides: [
				{
					title: 'Feste e cene private su prenotazione',
					cta: { label: 'Chiedi una data', href: '#prenota' },
					image: { src: piatto, alt: 'Piatto di pasta al pomodoro servito su una tovaglia a quadri' },
				},
			],
		},
	},
	{
		name: 'Centered',
		props: {
			variant: 'centered',
			eyebrow: 'Studio di consulenza',
			title: 'Conti in ordine, scadenze sotto controllo',
			subtitle:
				'Seguiamo la contabilità di famiglie, professionisti e piccole imprese, con un referente fisso e risposte chiare in tempi certi.',
			primaryCta: { label: 'Fissa un appuntamento', href: '#appuntamento' },
		},
	},
	{
		name: 'Split, testi al limite',
		props: {
			variant: 'split',
			title: 'Mobili su misura, restauri e piccole riparazioni con un’unica bottega',
			subtitle:
				'Dal primo disegno al montaggio finale seguiamo ogni fase del lavoro nel nostro laboratorio, con un solo referente, così sai sempre a che punto è il tuo mobile e quando lo vedrai finito a casa tua.',
			primaryCta: { label: 'Chiedi un preventivo oggi', href: '#preventivo' },
			secondaryCta: { label: 'Guarda i lavori terminati', href: '#lavori' },
			image: {
				src: laboratorio,
				alt: 'Banco da lavoro in legno con martello, scalpello e sega appesi a un pannello forato',
			},
		},
	},
];

fixtures.push({ name: 'Split con foto orizzontale', props: { ...fixtures[0].props, imageShape: 'orizzontale' } });
