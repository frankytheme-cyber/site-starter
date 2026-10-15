import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio: un artigiano (banner), un negozio e uno studio professionale (split).
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Banner',
		tone: 'primary',
		props: {
			variant: 'banner',
			title: 'Un mobile nuovo prima delle feste?',
			text: 'Sopralluogo e preventivo gratuiti, senza impegno. Ti diciamo subito quanto costa e quanto tempo serve, e lo mettiamo per iscritto.',
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
			title: 'Hai un mobile da sistemare?',
			text: 'Mandaci due foto su WhatsApp o chiamaci: per le riparazioni più piccole ti diamo una prima stima già al telefono.',
			primary: { label: 'Prenota un sopralluogo', href: '#sopralluogo' },
			showContacts: true,
		},
	},
	{
		name: 'Split con recapiti',
		tone: 'muted',
		props: {
			variant: 'split-contatto',
			title: 'Cerchi un regalo su misura?',
			text: 'Dicci per chi è e quanto vuoi spendere: prepariamo la confezione in negozio e la puoi ritirare quando vuoi, anche il giorno dopo.',
			primary: { label: 'Ordina una confezione', href: '#regali' },
			showContacts: true,
		},
	},
	{
		name: 'Split senza recapiti',
		tone: 'muted',
		props: {
			variant: 'split-contatto',
			title: 'Vuoi conoscere lo studio?',
			text: 'Nella pagina dello studio trovi chi siamo, di cosa si occupa ognuno di noi e cosa dicono i clienti che seguiamo da anni.',
			primary: { label: 'Chi siamo', href: '#studio' },
			secondary: { label: 'Leggi le recensioni', href: '#recensioni' },
			showContacts: false,
		},
	},
	{
		name: 'Split, testi al limite',
		tone: 'muted',
		props: {
			variant: 'split-contatto',
			title: 'Mobili su misura in poche settimane, con un preventivo chiaro e fisso',
			text: 'Veniamo a vedere gli spazi, ti consigliamo il legno e le finiture più adatti e ti lasciamo un preventivo scritto con la data di consegna. Il prezzo concordato è quello che paghi alla fine.',
			primary: { label: 'Chiedi un preventivo oggi', href: '#preventivo' },
			secondary: { label: 'Guarda i lavori terminati', href: '#lavori' },
			showContacts: true,
		},
	},
];
