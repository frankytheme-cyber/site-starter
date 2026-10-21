import attrezzi from '@/assets/images/fixtures/artigiano-attrezzi.jpg';
import laboratorio from '@/assets/images/fixtures/artigiano-laboratorio.jpg';
import mobile from '@/assets/images/fixtures/artigiano-mobile.jpg';
import cucina from '@/assets/images/fixtures/ristorante-cucina.jpg';
import piatto from '@/assets/images/fixtures/ristorante-piatto.jpg';
import sala from '@/assets/images/fixtures/ristorante-sala.jpg';
import regalo from '@/assets/images/fixtures/negozio-regalo.jpg';
import scaffali from '@/assets/images/fixtures/negozio-scaffali.jpg';
import vetrina from '@/assets/images/fixtures/negozio-vetrina.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Foto di prova di attività generiche: in un sito vanno solo foto vere dei lavori del cliente.
const photos = {
	vetrina: { src: vetrina, alt: 'Vetrina di una bottega con la tenda a righe bianche e rosse e la porta verde' },
	scaffali: { src: scaffali, alt: 'Scaffali di legno con barattoli e scatole colorate in fila' },
	regalo: { src: regalo, alt: 'Pacco regalo rosso con il fiocco giallo appoggiato sul banco' },
	mobile: { src: mobile, alt: 'Credenza in legno a due ante con maniglie dorate, in una stanza chiara' },
	laboratorio: { src: laboratorio, alt: 'Banco da lavoro in legno con martello, scalpello e sega appesi a un pannello forato' },
	attrezzi: { src: attrezzi, alt: 'Martello, cacciavite e metro giallo appoggiati su un piano di legno' },
	sala: { src: sala, alt: 'Sala di un ristorante con i tavoli apparecchiati' },
	cucina: { src: cucina, alt: 'Cucina professionale con i fornelli accesi' },
	piatto: { src: piatto, alt: 'Piatto impiattato su un tavolo di legno' },
};

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Griglia con popup',
		props: {
			variant: 'griglia-popup',
			eyebrow: 'I nostri lavori',
			title: 'Dalla bottega, qualche lavoro recente',
			intro: 'Tocca una foto per ingrandirla.',
			items: [
				{ image: photos.mobile, caption: 'Credenza in rovere, consegnata a Firenze' },
				{ image: photos.laboratorio, caption: 'Il banco da lavoro in laboratorio' },
				{ image: photos.attrezzi, caption: 'Gli attrezzi di tutti i giorni' },
				{ image: photos.vetrina, caption: 'Vetrina rinnovata per un negozio del centro' },
				{ image: photos.scaffali, caption: 'Scaffali su misura' },
				{ image: photos.regalo, caption: 'Confezioni regalo' },
			],
		},
	},
	{
		name: 'Prima e dopo',
		tone: 'muted',
		props: {
			variant: 'prima-dopo',
			title: 'Prima e dopo',
			intro: 'Sposta il cursore per confrontare le foto.',
			items: [
				{
					before: { src: laboratorio, alt: 'Il laboratorio prima del riordino, con il banco libero' },
					image: { src: sala, alt: 'La sala dopo il rifacimento, con i tavoli apparecchiati' },
					caption: 'Sala di un ristorante, rifatta in due settimane',
				},
				{
					before: { src: scaffali, alt: 'Gli scaffali del negozio prima dei lavori' },
					image: { src: vetrina, alt: 'La vetrina del negozio dopo i lavori' },
					caption: 'Negozio del centro, scaffali e vetrina nuovi',
				},
			],
		},
	},
	{
		name: 'Slider',
		props: {
			variant: 'slider',
			title: 'Il ristorante in foto',
			items: [
				{ image: photos.sala, caption: 'La sala, pronta per la sera' },
				{ image: photos.cucina, caption: 'La cucina, dove si prepara tutto al momento' },
				{ image: photos.piatto, caption: 'Un piatto del menu di stagione' },
				{ image: photos.vetrina, caption: 'L’ingresso' },
			],
		},
	},
];

fixtures.push({ name: 'Griglia con didascalie visibili', props: { ...fixtures[0].props, showCaptions: true } });
