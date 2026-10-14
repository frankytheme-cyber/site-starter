import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'FAQ',
		props: {
			variant: 'faq',
			eyebrow: 'Domande frequenti',
			title: 'Prima di iniziare i lavori',
			intro: 'Le risposte alle domande che ci fate più spesso al primo sopralluogo.',
			items: [
				{
					title: 'Il sopralluogo e il preventivo sono gratuiti?',
					text: 'Sì. Veniamo a vedere le pareti, prendiamo le misure e ti lasciamo un preventivo scritto, senza costi e senza impegno.',
				},
				{
					title: 'Quanto tempo serve per tinteggiare un appartamento?',
					text: 'Per un trilocale di solito bastano tre o quattro giorni lavorativi, compresa la stuccatura delle crepe.\n\nI tempi esatti sono scritti nel preventivo: se finiamo in ritardo per colpa nostra, ogni giorno in più è scalato dal totale.',
				},
				{
					title: 'Devo spostare io i mobili?',
					text: 'No. Spostiamo noi i mobili al centro delle stanze e li copriamo con teli; proteggiamo anche pavimenti, porte e prese.',
				},
				{
					title: 'Che pitture usate?',
					text: 'Pitture traspiranti o lavabili a basse emissioni, scelte in base alla stanza: antimuffa per bagni e cucine, lavabili per corridoi e camere dei bambini.',
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
			intro: 'Dal primo contatto alla pulizia finale, ogni fase ha tempi e responsabilità chiari.',
			single: true,
			items: [
				{ title: 'Sopralluogo', text: 'Guardiamo le pareti, valutiamo umidità e crepe e ascoltiamo cosa ti serve.' },
				{ title: 'Preventivo scritto', text: 'Riceviamo le tue scelte su colori e finiture e ti mandiamo il preventivo entro tre giorni lavorativi.' },
				{ title: 'Preparazione', text: 'Copriamo mobili e pavimenti, stucchiamo le crepe e carteggiamo le superfici.' },
				{ title: 'Tinteggiatura e pulizia', text: 'Diamo le mani di colore previste e a fine lavoro lasciamo le stanze pulite e in ordine.' },
			],
		},
	},
];
