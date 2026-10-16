import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio generica: un'impresa di manutenzioni per la casa.
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: '3 colonne',
		props: {
			variant: '3-colonne',
			eyebrow: 'Perché sceglierci',
			title: 'Un lavoro fatto bene, con tempi e costi chiari',
			intro: 'Prima di iniziare ti diciamo cosa facciamo, quanto costa e quando finiamo.',
			items: [
				{ icon: 'preventivo', title: 'Preventivo scritto', text: 'Ricevi il costo del lavoro per iscritto, prima di iniziare.' },
				{ icon: 'calendario', title: 'Appuntamenti rispettati', text: 'Concordiamo un giorno e una fascia oraria, e li manteniamo.' },
				{ icon: 'garanzia', title: 'Lavori garantiti', text: 'Se qualcosa non va, torniamo a sistemarlo senza costi in più.' },
				{ icon: 'pulizie', title: 'Cantiere in ordine', text: 'A fine giornata lasciamo gli spazi puliti e pronti da usare.' },
				{ icon: 'telefono', title: 'Un solo referente', text: 'Per qualsiasi dubbio chiami sempre la stessa persona.' },
				{ icon: 'euro', title: 'Prezzi senza sorprese', text: 'Il prezzo concordato è quello che paghi, salvo tuoi cambi.' },
			],
		},
	},
	{
		name: 'Lista',
		tone: 'muted',
		props: {
			variant: 'lista',
			eyebrow: 'Il nostro metodo',
			title: 'Come lavoriamo ogni giorno',
			intro: 'Poche regole, sempre le stesse, per ogni cliente e per ogni lavoro.',
			items: [
				{ icon: 'chat', title: 'Ascoltiamo prima di proporre', text: 'Partiamo da cosa ti serve davvero, non da quello che abbiamo in magazzino.' },
				{ icon: 'lista-controllo', title: 'Ti spieghiamo ogni passaggio', text: 'Sai sempre cosa stiamo facendo e perché, con parole semplici.' },
				{ icon: 'orologio', title: 'Rispettiamo i tuoi tempi', text: 'Lavoriamo negli orari che scegli tu, senza lasciare il lavoro a metà.' },
				{ icon: 'stretta-di-mano', title: 'Restiamo a disposizione', text: 'Anche dopo la fine dei lavori puoi chiamarci per qualsiasi dubbio.' },
			],
		},
	},
	{
		name: '3 colonne, 4 punti',
		props: {
			variant: '3-colonne',
			title: 'Cosa trovi da noi',
			items: [
				{ icon: 'negozio', title: 'Prodotti scelti', text: 'Selezioniamo ogni articolo di persona.' },
				{ icon: 'pacco', title: 'Ritiro in negozio', text: 'Ordini oggi e ritiri quando vuoi.' },
				{ icon: 'regalo', title: 'Confezioni regalo', text: 'Su misura, per ogni occasione.' },
				{ icon: 'sorriso', title: 'Consigli sinceri', text: 'Ti diciamo cosa ti serve davvero.' },
			],
		},
	},
];
