import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio: un ristorante (faq) e un artigiano (contenuti).
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'FAQ',
		props: {
			variant: 'faq',
			eyebrow: 'Domande frequenti',
			title: 'Prima di prenotare',
			intro: 'Le risposte alle domande che ci fate più spesso al telefono.',
			items: [
				{
					title: 'Serve prenotare?',
					text: 'A pranzo di solito no. A cena, il venerdì e il sabato, conviene prenotare: chiamaci o scrivici su WhatsApp.',
				},
				{
					title: 'Avete piatti senza glutine o vegetariani?',
					text: 'Sì: ogni giorno in carta ci sono almeno due piatti vegetariani e la pasta senza glutine, cotta a parte.\n\nSe hai un’allergia, dillo quando prenoti: la cucina prepara il tuo piatto separatamente.',
				},
				{
					title: 'Si può portare il cane?',
					text: 'Sì, i cani di piccola e media taglia sono i benvenuti in sala e in giardino. Una ciotola d’acqua la portiamo noi.',
				},
				{
					title: 'Organizzate cene per gruppi?',
					text: 'Fino a quaranta persone, con un menu fisso concordato prima. Per le feste private possiamo riservare tutta la sala.',
				},
			],
		},
	},
	{
		name: 'Contenuti, una alla volta',
		tone: 'muted',
		props: {
			variant: 'contenuti',
			title: 'Come lavoriamo',
			intro: 'Dal primo contatto al montaggio, ogni fase ha tempi e responsabilità chiari.',
			single: true,
			items: [
				{ title: 'Sopralluogo', text: 'Veniamo a vedere gli spazi, prendiamo le misure e ascoltiamo cosa ti serve.' },
				{ title: 'Progetto e preventivo', text: 'Ti mandiamo il disegno del mobile e un preventivo scritto entro tre giorni lavorativi.' },
				{ title: 'Lavorazione', text: 'Scegliamo insieme legno e finiture, poi costruiamo il mobile nel nostro laboratorio.' },
				{ title: 'Consegna e montaggio', text: 'Portiamo il mobile a casa, lo montiamo e a fine lavoro lasciamo tutto pulito e in ordine.' },
			],
		},
	},
];
