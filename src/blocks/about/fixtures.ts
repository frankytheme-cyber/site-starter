import laboratorio from '@/assets/images/fixtures/artigiano-laboratorio.jpg';
import riunione from '@/assets/images/fixtures/studio-riunione.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio generica. I numeri della fixture sono segnaposto del catalogo, dichiarati tali nella fonte:
// in un sito vanno sostituiti con dati veri del cliente.
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Immagine e testo',
		props: {
			variant: 'immagine-testo',
			eyebrow: 'Chi siamo',
			title: 'Una bottega di quartiere, con le persone al centro',
			paragraphs: [
				'Siamo una piccola attività di famiglia: lavoriamo con poche persone, così ogni cliente parla sempre con chi si occupa del suo lavoro.',
				'Ci piace spiegare cosa facciamo e perché, e consegnare solo quello di cui andiamo fieri.',
			],
			image: {
				src: laboratorio,
				alt: 'Banco da lavoro in legno con martello, scalpello e sega appesi a un pannello forato',
			},
			cta: { label: 'Contattaci', href: '#contatti' },
		},
	},
	{
		name: 'Con numeri',
		tone: 'muted',
		props: {
			variant: 'con-numeri',
			eyebrow: 'Chi siamo',
			title: 'Un team piccolo, un metodo collaudato',
			paragraphs: [
				'Lavoriamo con clienti privati e imprese della zona, con la stessa cura per un piccolo intervento e per un lavoro grande.',
			],
			image: {
				src: riunione,
				alt: 'Tavolo riunioni con quattro sedie e una lavagna con un grafico in crescita',
			},
			stats: [
				{ value: '00', label: 'anni di attività', fonte: 'Dato di esempio: sostituire con un dato reale' },
				{ value: '000+', label: 'lavori consegnati', fonte: 'Dato di esempio: sostituire con un dato reale' },
				{ value: '00', label: 'persone nel team', fonte: 'Dato di esempio: sostituire con un dato reale' },
			],
		},
	},
	{
		name: 'Con numeri, senza foto',
		props: {
			variant: 'con-numeri',
			title: 'La nostra storia in breve',
			paragraphs: [
				'Siamo nati come attività di una persona sola e oggi siamo un piccolo team, ma il modo di lavorare è rimasto lo stesso: poche cose, fatte bene.',
				'Ogni numero qui sotto ha la sua fonte, così puoi sapere da dove viene.',
			],
			cta: { label: 'Scrivici', href: '@email', style: 'primary' },
			stats: [
				{ value: '00', label: 'anni di attività', fonte: 'Dato di esempio: sostituire con un dato reale' },
				{ value: '0.000', label: 'interventi eseguiti', fonte: 'Dato di esempio: sostituire con un dato reale' },
				{ value: '00', label: 'collaboratori', fonte: 'Dato di esempio: sostituire con un dato reale' },
				{ value: '00%', label: 'clienti che tornano', fonte: 'Dato di esempio: sostituire con un dato reale' },
			],
		},
	},
];
