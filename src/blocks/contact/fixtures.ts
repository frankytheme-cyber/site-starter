import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

/*
 * Attività di esempio generica: una falegnameria. Recapiti e indirizzo palesemente finti
 * (055 000 0000, info@esempio.it, Via dell’Esempio): il blocco legge site.json, qui `site` li sostituisce
 * solo nel catalogo, come nel footer.
 */

type Site = NonNullable<BlockFixture['site']>;

const bottega: Site = {
	businessName: 'Bottega Esempio',
	description: 'Falegnameria artigiana: mobili su misura, restauri e riparazioni per case, negozi e uffici.',
	url: 'https://www.esempio.it',
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
};

// Senza WhatsApp né orari fissi: il blocco deve reggere anche i dati minimi.
const minimo: Site = {
	...bottega,
	whatsapp: undefined,
	openingHours: [{ days: ['lun', 'mar', 'mer', 'gio', 'ven'], slots: [{ opens: '09:00', closes: '17:00' }] }],
};

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Info e mappa, con orari',
		props: {
			variant: 'info-mappa',
			title: 'Vieni a trovarci in bottega',
			text: 'Siamo in laboratorio dal lunedì al sabato mattina. Passa a vedere i campioni di legno o chiamaci prima, così ti aspettiamo.',
			showHours: true,
		},
		site: bottega,
	},
	{
		name: 'Info e mappa, senza orari',
		tone: 'muted',
		props: { variant: 'info-mappa', title: 'Dove siamo', showHours: false },
		site: minimo,
	},
	{
		name: 'Info e pulsante, con orari',
		tone: 'muted',
		props: {
			variant: 'info-cta',
			title: 'Parliamo del tuo progetto',
			text: 'Raccontaci cosa ti serve: ti richiamiamo entro un giorno lavorativo e fissiamo un sopralluogo gratuito.',
			showHours: true,
			cta: { label: 'Chiedi un preventivo', href: '#preventivo' },
		},
		site: bottega,
	},
	{
		name: 'Info e pulsante, dati minimi',
		props: {
			variant: 'info-cta',
			title: 'Scrivici o chiamaci',
			showHours: false,
			cta: { label: 'Prenota un sopralluogo', href: '#sopralluogo' },
		},
		site: minimo,
	},
	{
		name: 'Info e mappa, testi al limite',
		props: {
			variant: 'info-mappa',
			title: 'Laboratorio e showroom di mobili su misura, a pochi minuti dal centro',
			text: 'Nello showroom trovi campioni di legno, finiture e mobili finiti da provare di persona. Se vieni da fuori città chiamaci prima: ti diciamo dove parcheggiare e prepariamo il preventivo.',
			showHours: true,
		},
		site: bottega,
	},
];
