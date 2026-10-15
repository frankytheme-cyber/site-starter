import logo from '@/assets/images/fixtures/logo-segnaposto.png';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

/*
 * Il footer mostra i dati di site.json: qui ogni fixture ne porta di prova (`site`), così il
 * catalogo fa vedere una ditta individuale e una SRL (con REA e capitale), entrambe «Bottega Esempio». Link legali e
 * colonna «Link» vengono da navigation.json, il credito da site.config.ts.
 * Recapiti e indirizzo palesemente finti (055 000 0000, info@esempio.it, Via dell’Esempio, CAP 00000): sono l'unica eccezione alla regola dei
 * dati solo in site.json, e il check recipes non legge le fixture.
 */

type Site = NonNullable<BlockFixture['site']>;

const dittaIndividuale: Site = {
	businessName: 'Bottega Esempio',
	description: 'Falegnameria artigiana: mobili su misura, restauri e riparazioni per case, negozi e uffici, con sopralluogo e preventivo gratuiti.',
	url: 'https://www.esempio.it',
	logo,
	phone: '055 000 0000',
	whatsapp: '+39 333 000 0000',
	email: 'info@esempio.it',
	address: { street: 'Via dell’Esempio 1', postalCode: '00000', city: 'Esempio', province: 'ES' },
	legalName: 'Bottega Esempio di Mario Rossi',
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
	businessName: 'Bottega Esempio',
	description: 'Casalinghi, articoli da regalo e prodotti del territorio dal 1987, con confezioni su misura e consegna a domicilio.',
	url: 'https://www.esempio.it',
	phone: '055 000 0000',
	email: 'info@esempio.it',
	address: { street: 'Piazza dell’Esempio 2', postalCode: '00000', city: 'Esempio', province: 'ES' },
	legalName: 'Bottega Esempio S.r.l.',
	legalForm: 'srl',
	vatNumber: '09876543217',
	rea: 'ES-123456',
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
		props: { variant: 'colonne', ctaBand: true, ctaBandTitle: 'Cerchi un regalo su misura? Chiamaci' },
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
