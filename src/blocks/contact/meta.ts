import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'contact',
	name: 'Contatti',
	description: 'Recapiti, indirizzo e orari dell’attività, presi da «Dati attività», con la mappa o un invito all’azione.',
	whenToUse:
		'Nella pagina contatti, o in fondo a una pagina che deve far trovare l’attività. Telefono, WhatsApp, email, indirizzo e orari non si scrivono nel blocco: arrivano da site.json.',
	avoidWhen:
		'Per un semplice invito a chiamare o chiedere un preventivo (lì va cta) o quando serve un modulo da compilare: il form è rimandato alla v1.1.',
	category: 'contatti',
	scope: 'page',
	version: '1.0.0',
	source: { from: 'originale' },
	interactive: true,
	variants: {
		'info-mappa': {
			description:
				'Recapiti e orari da una parte, dall’altra un riquadro con «Apri in Maps» e il pulsante «Mostra la mappa», che carica la mappa solo al clic.',
			whenToUse: 'La pagina contatti di un’attività con una sede da raggiungere: negozio, studio, laboratorio.',
		},
		'info-cta': {
			description: 'Recapiti e orari in due colonne, con un pulsante d’azione e il link «Apri in Maps».',
			whenToUse: 'Attività che lavora a domicilio o su appuntamento, dove la sede conta meno di un preventivo o di una prenotazione.',
		},
	},
	rules: ['La variante info-cta richiede il pulsante (cta).'],
	fieldRules: {
		cta: { requiredFor: ['info-cta'], note: 'Nella variante info-mappa non viene mostrato.' },
		showHours: { note: 'Se è attivo, gli orari vengono da site.json.' },
	},
};
