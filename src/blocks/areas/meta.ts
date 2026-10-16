import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'areas',
	name: 'Zone servite',
	description: 'Elenco delle zone coperte dal servizio, con un eventuale link alla mappa della sede.',
	whenToUse: 'Per rendere chiara la copertura locale di un servizio a domicilio o di un’attività. Usa nomi di comuni e quartieri realmente serviti.',
	avoidWhen: 'Per recapiti e orari completi (usa contact), oppure per elencare servizi (usa services). Non aggiungere zone solo per posizionarsi sui motori di ricerca.',
	category: 'contatti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	variants: {
		'elenco-zone': {
			description: 'Titolo e introduzione seguiti da una lista di zone su una, due o tre colonne in base allo spazio disponibile.',
			whenToUse: 'Quando conta la copertura del servizio e non serve mostrare la sede.',
		},
		'mappa-link': {
			description: 'Elenco delle zone affiancato all’indirizzo della sede e al pulsante «Apri in Maps», senza mappe incorporate.',
			whenToUse: 'Quando vuoi indicare sia le zone servite sia la sede da raggiungere. La mappa mostra la sede, non i confini della copertura.',
		},
	},
	rules: ['Nella variante mappa-link l’indirizzo e il link Maps della sede arrivano da site.json; la mappa non rappresenta i confini delle zone servite.'],
	fieldRules: {
		variant: { note: 'mappa-link legge l’indirizzo della sede da site.json; elenco-zone non mostra dati della sede. Nessuna richiesta a Google prima di aprire il link.' },
	},
};
