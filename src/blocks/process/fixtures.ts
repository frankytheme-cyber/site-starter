import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio generica: un'impresa di manutenzioni per la casa.
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Passi numerati',
		props: {
			variant: 'passi-numerati',
			eyebrow: 'Come lavoriamo',
			title: 'Dalla prima chiamata al lavoro finito',
			intro: 'Quattro passi, sempre gli stessi: sai in ogni momento a che punto siamo.',
			steps: [
				{ title: 'Ci racconti cosa ti serve', text: 'Ci chiami o ci scrivi: ascoltiamo il problema e fissiamo un sopralluogo.' },
				{ title: 'Sopralluogo e preventivo', text: 'Vediamo il lavoro sul posto e ti lasciamo un preventivo scritto, senza impegno.' },
				{ title: 'Eseguiamo il lavoro', text: 'Lavoriamo nei giorni concordati, tenendo in ordine gli spazi.' },
				{ title: 'Controllo e consegna', text: 'Controlliamo insieme il risultato e ti lasciamo i documenti del lavoro.' },
			],
			cta: { label: 'Chiedi un preventivo', href: '@telefono' },
		},
	},
	{
		name: 'Timeline',
		tone: 'muted',
		props: {
			variant: 'timeline',
			title: 'Cosa succede dopo la tua richiesta',
			steps: [
				{ title: 'Ti richiamiamo', text: 'Una persona del team ti chiama per capire di cosa hai bisogno.', timing: 'Primo contatto' },
				{ title: 'Fissiamo il sopralluogo', text: 'Scegliamo insieme giorno e fascia oraria più comodi per te.', timing: 'Dopo il contatto' },
				{ title: 'Ricevi il preventivo', text: 'Costi e tempi per iscritto, da leggere con calma e confrontare.', timing: 'Dopo il sopralluogo' },
				{ title: 'Iniziamo i lavori', text: 'Se il preventivo ti convince, concordiamo la data di inizio.' },
				{ title: 'Consegna e assistenza', text: 'A lavoro finito restiamo a disposizione per qualsiasi dubbio.' },
			],
		},
	},
	{
		name: 'Passi numerati, 6 passi',
		props: {
			variant: 'passi-numerati',
			title: 'Un percorso chiaro, passo dopo passo',
			steps: [
				{ title: 'Contatto', text: 'Ci scrivi o ci chiami.' },
				{ title: 'Ascolto', text: 'Capiamo cosa ti serve.' },
				{ title: 'Sopralluogo', text: 'Vediamo il lavoro sul posto.' },
				{ title: 'Preventivo', text: 'Costi e tempi per iscritto.' },
				{ title: 'Lavoro', text: 'Eseguiamo quanto concordato.' },
				{ title: 'Consegna', text: 'Controlliamo insieme il risultato.' },
			],
		},
	},
];
