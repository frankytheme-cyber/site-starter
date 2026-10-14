import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Banner',
		tone: 'primary',
		props: {
			variant: 'banner',
			title: 'Pareti nuove prima delle feste?',
			text: 'Sopralluogo e preventivo gratuiti, senza impegno. Ti diciamo subito quanto costa e quanto dura il lavoro, e lo mettiamo per iscritto.',
			primary: { label: 'Chiedi un preventivo', href: '#preventivo' },
			secondary: { label: 'Guarda i lavori', href: '#lavori' },
			showContacts: false,
		},
	},
	{
		name: 'Banner con recapiti',
		tone: 'primary',
		props: {
			variant: 'banner',
			title: 'Hai una parete da sistemare?',
			text: 'Mandaci due foto su WhatsApp o chiamaci: per i lavori più piccoli ti diamo una prima stima già al telefono.',
			primary: { label: 'Prenota un sopralluogo', href: '#sopralluogo' },
			showContacts: true,
		},
	},
	{
		name: 'Split con recapiti',
		tone: 'muted',
		props: {
			variant: 'split-contatto',
			title: 'Parliamo del tuo lavoro',
			text: 'Raccontaci cosa vuoi rinnovare: veniamo a vedere di persona, prendiamo le misure e in pochi giorni ricevi un preventivo scritto e dettagliato.',
			primary: { label: 'Chiedi un preventivo', href: '#preventivo' },
			showContacts: true,
		},
	},
	{
		name: 'Split senza recapiti',
		tone: 'muted',
		props: {
			variant: 'split-contatto',
			title: 'Vuoi vedere come lavoriamo?',
			text: 'Nella galleria trovi le foto prima e dopo di case, uffici e condomini che abbiamo tinteggiato negli ultimi anni.',
			primary: { label: 'Guarda i lavori', href: '#lavori' },
			secondary: { label: 'Leggi le recensioni', href: '#recensioni' },
			showContacts: false,
		},
	},
	{
		name: 'Split, testi al limite',
		tone: 'muted',
		props: {
			variant: 'split-contatto',
			title: 'Rinnoviamo casa tua in pochi giorni, con un preventivo chiaro e fisso',
			text: 'Veniamo a vedere le pareti, ti consigliamo i prodotti più adatti a ogni stanza e ti lasciamo un preventivo scritto con le date di inizio e di fine. Il prezzo concordato è quello che paghi alla fine.',
			primary: { label: 'Chiedi un preventivo oggi', href: '#preventivo' },
			secondary: { label: 'Guarda i lavori terminati', href: '#lavori' },
			showContacts: true,
		},
	},
];
