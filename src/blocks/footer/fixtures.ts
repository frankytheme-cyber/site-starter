import logo from '@/assets/images/fixtures/logo-segnaposto.png';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

/*
 * Il footer mostra i dati di site.json: qui ogni fixture ne porta di prova (`site`), così il
 * catalogo fa vedere una ditta individuale e una SRL (con REA e capitale). Link legali e
 * colonna «Link» vengono da navigation.json, il credito da site.config.ts.
 * Recapiti palesemente finti (055 000 0000, @esempio.it): sono l'unica eccezione alla regola dei
 * dati solo in site.json, e il check recipes non legge le fixture.
 */

type Site = NonNullable<BlockFixture['site']>;

const dittaIndividuale: Site = {
	businessName: 'Imbiancature Rossi',
	description: 'Tinteggiature, cartongesso e decorazioni per case e uffici a Firenze e provincia, con sopralluogo e preventivo gratuiti.',
	url: 'https://www.esempio.it',
	logo,
	phone: '055 000 0000',
	whatsapp: '+39 333 000 0000',
	email: 'info@esempio.it',
	address: { street: 'Via dei Pittori 12', postalCode: '50121', city: 'Firenze', province: 'FI' },
	legalName: 'Imbiancature Rossi di Mario Rossi',
	legalForm: 'ditta-individuale',
	vatNumber: '01234567897',
	openingHours: [
		{
			days: ['lun', 'mar', 'mer', 'gio', 'ven'],
			slots: [
				{ opens: '08:00', closes: '12:30' },
				{ opens: '14:00', closes: '18:00' },
			],
		},
		{ days: ['sab'], slots: [{ opens: '08:30', closes: '12:30' }] },
		{ days: ['dom'], slots: [] },
	],
	social: {
		facebook: 'https://www.facebook.com/esempio',
		instagram: 'https://www.instagram.com/esempio',
	},
};

const srl: Site = {
	businessName: 'Colorificio Bianchi',
	description: 'Pitture, vernici e accessori per professionisti e privati a Prato dal 1987, con tintometro e consegna in cantiere.',
	url: 'https://www.esempio.it',
	phone: '0574 000 000',
	email: 'negozio@esempio.it',
	address: { street: 'Viale della Repubblica 45', postalCode: '59100', city: 'Prato', province: 'PO' },
	legalName: 'Colorificio Bianchi S.r.l.',
	legalForm: 'srl',
	vatNumber: '09876543217',
	rea: 'PO-123456',
	shareCapital: '20.000 € i.v.',
	openingHours: [
		{ days: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab'], slots: [{ opens: '08:30', closes: '19:30' }] },
		{ days: ['dom'], slots: [] },
	],
	social: {
		facebook: 'https://www.facebook.com/esempio',
		instagram: 'https://www.instagram.com/esempio',
		youtube: 'https://www.youtube.com/@esempio',
		google: 'https://g.page/esempio',
	},
};

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Colonne, ditta individuale',
		props: { variant: 'colonne', ctaBand: false },
		site: dittaIndividuale,
	},
	{
		name: 'Colonne, SRL, con fascia di contatto',
		props: { variant: 'colonne', ctaBand: true, ctaBandTitle: 'Ti serve un colore su misura? Chiamaci' },
		site: srl,
	},
	{
		name: 'Minimale, ditta individuale, con fascia (titolo predefinito, anche WhatsApp)',
		props: { variant: 'minimale', ctaBand: true },
		site: dittaIndividuale,
	},
	{
		name: 'Minimale, SRL',
		props: { variant: 'minimale', ctaBand: false },
		site: srl,
	},
];
