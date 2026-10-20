import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'form', name: 'Modulo di contatto',
	description: 'Modulo di contatto o richiesta di preventivo, con invio tramite Resend su Vercel e collegamento all’informativa privacy.',
	whenToUse: 'Quando chi visita deve inviare una richiesta scritta. Configura Resend secondo docs/form.md; il destinatario è l’email di site.json. Il catalogo simula l’invio senza spedire email.',
	avoidWhen: 'Per un semplice invito a chiamare (usa cta o contact), prenotazioni con calendario, pagamenti, allegati o raccolta di dati sensibili.',
	category: 'contatti', scope: 'page', version: '1.1.0', source: { from: 'originale' }, interactive: true, backgrounds: ['pieno', 'sfumato'],
	variants: {
		contatto: {
			description: 'Introduzione e recapiti affiancati a nome, email, telefono facoltativo e messaggio; su mobile tutto in colonna.',
			whenToUse: 'Per domande generiche, disponibilità e richieste di informazioni.',
		},
		preventivo: {
			description: 'Modulo con scelta del servizio e comune dell’intervento, oltre ai dati di contatto e alla descrizione della richiesta.',
			whenToUse: 'Per raccogliere le prime informazioni utili a preparare un preventivo o un sopralluogo.',
		},
	},
	rules: [
		'La variante preventivo richiede un elenco di servizi (services).',
		'L’informativa privacy deve esistere ed essere approvata per il trattamento e il servizio di invio utilizzati.',
		'Il destinatario arriva solo dall’email di site.json; chiave API e mittente Resend sono variabili server, mai campi del blocco.',
	],
	fieldRules: {
		services: { requiredFor: ['preventivo'], note: 'Ignorato nella variante contatto.' },
		privacyHref: { note: 'Pagina interna esistente. La presa visione è obbligatoria e separata da eventuali consensi marketing, che il blocco non raccoglie.' },
	},
};
