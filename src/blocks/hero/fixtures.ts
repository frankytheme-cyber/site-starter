import facciata from '@/assets/images/fixtures/imbianchino-facciata.jpg';
import interno from '@/assets/images/fixtures/imbianchino-interno.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Split',
		props: {
			variant: 'split',
			eyebrow: 'Tinteggiature e decorazioni',
			title: 'Pareti come nuove, senza pensieri',
			subtitle:
				'Tinteggiamo case, uffici e condomini con pitture traspiranti e lavabili. Proteggiamo mobili e pavimenti e a fine lavoro lasciamo tutto pulito.',
			primaryCta: { label: 'Chiedi un preventivo', href: '#preventivo' },
			secondaryCta: { label: 'Guarda i lavori', href: '#lavori' },
			image: {
				src: interno,
				alt: 'Parete tinteggiata a metà in verde salvia, con un rullo appoggiato',
			},
		},
	},
	{
		name: 'Full',
		props: {
			variant: 'full',
			eyebrow: 'Esterni e facciate',
			title: 'Facciate protette da sole, pioggia e smog',
			subtitle:
				'Ripristiniamo intonaci e cornicioni, trattiamo muffe e infiltrazioni e applichiamo pitture ai silossani che durano negli anni.',
			primaryCta: { label: 'Prenota un sopralluogo', href: '#sopralluogo' },
			secondaryCta: { label: 'Come lavoriamo', href: '#metodo' },
			image: {
				src: facciata,
				alt: 'Facciata di una casa color ocra con persiane verdi',
			},
		},
	},
	{
		name: 'Centered',
		props: {
			variant: 'centered',
			eyebrow: 'Consulenza colore',
			title: 'Il colore giusto per ogni stanza',
			subtitle:
				'Ti aiutiamo a scegliere tinte e finiture, dalle velature agli stucchi decorativi, provando i campioni direttamente sulle tue pareti.',
			primaryCta: { label: 'Fissa una consulenza', href: '#consulenza' },
		},
	},
	{
		name: 'Split, testi al limite',
		props: {
			variant: 'split',
			title: 'Tinteggiature, cartongesso e piccole riparazioni con un’unica squadra',
			subtitle:
				'Dalla stuccatura delle crepe alla tinteggiatura finale, seguiamo ogni fase del lavoro con la stessa squadra e un solo referente, così sai sempre chi entra in casa tua e quando avremo finito i lavori.',
			primaryCta: { label: 'Chiedi un preventivo oggi', href: '#preventivo' },
			secondaryCta: { label: 'Guarda i lavori terminati', href: '#lavori' },
			image: {
				src: interno,
				alt: 'Parete tinteggiata a metà in verde salvia, con un rullo appoggiato',
			},
		},
	},
];
