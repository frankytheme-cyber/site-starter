import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

const site: NonNullable<BlockFixture['site']> = {
	businessName: 'Bottega Esempio',
	description: 'Attività dimostrativa con servizio a domicilio nelle zone di esempio.',
	url: 'https://www.esempio.it',
	phone: '055 000 0000',
	email: 'info@esempio.it',
	address: { street: 'Via dell’Esempio 1', postalCode: '00000', city: 'Esempio', province: 'ES' },
	legalName: 'Bottega Esempio di Mario Rossi',
	legalForm: 'ditta-individuale',
	vatNumber: '01234567897',
	openingHours: [{ days: ['lun', 'mar', 'mer', 'gio', 'ven'], slots: [{ opens: '09:00', closes: '17:00' }] }],
};

const items = [
	{ name: 'Centro di Esempio', text: 'Interventi su appuntamento per case e negozi.' },
	{ name: 'Quartiere del Parco', text: 'Sopralluoghi e consegne concordati insieme.' },
	{ name: 'Borgo Dimostrativo', text: 'Servizio a domicilio per piccoli e grandi progetti.' },
	{ name: 'Zona del Mercato', text: 'Appuntamenti in base alle esigenze del lavoro.' },
	{ name: 'Colline di Esempio', text: 'Contattaci per concordare il sopralluogo.' },
	{ name: 'Quartiere della Stazione', text: 'Consegne e montaggio su appuntamento.' },
];

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Zone servite con dettagli',
		props: { variant: 'elenco-zone', title: 'Un servizio vicino a te', intro: 'Lavoriamo a domicilio nelle zone elencate. Ogni intervento parte da un appuntamento concordato insieme.', items },
	},
	{
		name: 'Zone servite e sede',
		tone: 'muted',
		site,
		props: { variant: 'mappa-link', title: 'Dove lavoriamo', intro: 'Vieni in bottega oppure concorda un intervento a domicilio nelle zone servite.', items: items.slice(0, 4) },
	},
	{
		name: 'Una sola zona senza dettagli',
		tone: 'primary',
		props: { variant: 'elenco-zone', title: 'Il nostro quartiere', items: [{ name: 'Centro di Esempio' }] },
	},
	{
		name: 'Mappa e nomi lunghi',
		tone: 'primary',
		site,
		props: { variant: 'mappa-link', title: 'Le zone raggiunte dal nostro servizio a domicilio e dai sopralluoghi', items: [{ name: 'Quartiere dimostrativo del parco e delle colline di Esempio', text: 'Per gli interventi nelle zone più distanti concordiamo insieme tempi, modalità del sopralluogo e condizioni del servizio prima di fissare l’appuntamento.' }] },
	},
	{
		name: 'Diciotto zone senza dettagli',
		tone: 'muted',
		props: { variant: 'elenco-zone', title: 'Tutte le zone servite', items: Array.from({ length: 18 }, (_, index) => ({ name: `Quartiere di esempio ${index + 1}` })) },
	},
];
