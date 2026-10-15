import laboratorio from '@/assets/images/fixtures/artigiano-laboratorio.jpg';
import vetrina from '@/assets/images/fixtures/negozio-vetrina.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio di settori diversi: artigiano (split), negozio (full), studio professionale (centered).
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
