import attrezzi from '@/assets/images/fixtures/artigiano-attrezzi.jpg';
import laboratorio from '@/assets/images/fixtures/artigiano-laboratorio.jpg';
import mobile from '@/assets/images/fixtures/artigiano-mobile.jpg';
import regalo from '@/assets/images/fixtures/negozio-regalo.jpg';
import scaffali from '@/assets/images/fixtures/negozio-scaffali.jpg';
import vetrina from '@/assets/images/fixtures/negozio-vetrina.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio: un negozio (foto) e un artigiano (card).
const photos = {
	vetrina: { src: vetrina, alt: 'Vetrina di una bottega con la tenda a righe bianche e rosse e la porta verde' },
	scaffali: { src: scaffali, alt: 'Scaffali di legno con barattoli e scatole colorate in fila' },
	regalo: { src: regalo, alt: 'Pacco regalo rosso con il fiocco giallo appoggiato sul banco' },
	mobile: { src: mobile, alt: 'Credenza in legno a due ante con maniglie dorate, in una stanza chiara' },
	laboratorio: { src: laboratorio, alt: 'Banco da lavoro in legno con martello, scalpello e sega appesi a un pannello forato' },
	attrezzi: { src: attrezzi, alt: 'Martello, cacciavite e metro giallo appoggiati su un piano di legno' },
};

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Foto',
		props: {
			variant: 'foto',
			eyebrow: 'La bottega',
			title: 'Vieni a trovarci',
			items: [
				{ image: photos.vetrina, title: 'La vetrina, rinnovata ogni stagione' },
				{ image: photos.scaffali, title: 'Barattoli e dispensa dei produttori locali' },
				{ image: photos.regalo, title: 'Confezioni regalo preparate al banco' },
				{ image: photos.mobile, title: 'Gli arredi del negozio, fatti su misura' },
				{ image: photos.attrezzi, title: 'L’angolo della ferramenta' },
			],
		},
	},
	{
		name: 'Card',
		tone: 'muted',
		props: {
			variant: 'card',
			title: 'Lavori recenti',
			intro: 'Ogni lavoro con il racconto di cosa abbiamo fatto e in quanto tempo.',
			items: [
				{
					image: photos.mobile,
					title: 'Credenza in rovere',
					text: 'Disegnata sulle misure del soggiorno e consegnata in tre settimane.',
					cta: { label: 'Leggi il progetto', href: '#credenza' },
				},
				{
					image: photos.laboratorio,
					title: 'Restauro di un tavolo',
					text: 'Un tavolo di famiglia riportato al legno naturale e rifinito a cera.',
					cta: { label: 'Leggi il progetto', href: '#tavolo' },
				},
				{ image: photos.attrezzi, title: 'Sedie riparate', text: 'Sei sedie da trattoria rincollate e rinforzate in due giorni.' },
				{ image: photos.vetrina, title: 'Arredi per una bottega', text: 'Bancone e scaffali su misura per un negozio del centro.' },
			],
		},
	},
];
