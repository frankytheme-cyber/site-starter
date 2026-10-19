import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'cta',
	name: 'Invito all’azione',
	description: 'Fascia che chiede a chi visita di fare il passo successivo: chiedere un preventivo, chiamare, scrivere.',
	whenToUse:
		'Dopo i blocchi che convincono (servizi, lavori, recensioni) e in fondo alla pagina, prima del footer. Con showContacts mostra telefono e WhatsApp dell’attività presi da site.json.',
	avoidWhen:
		'In apertura di pagina (lì va l’hero) o più di due volte nella stessa pagina: troppi inviti si annullano a vicenda.',
	category: 'contatti',
	scope: 'page',
	backgrounds: ['pieno', 'sfumato', 'alone', 'aurora'],
	version: '1.1.0',
	source: { from: 'originale' },
	variants: {
		banner: {
			description: 'Testo centrato e uno o due pulsanti; con tone primary diventa una fascia piena.',
			whenToUse: 'L’invito principale della pagina, verso la fine: al massimo uno per pagina.',
		},
		'split-contatto': {
			description: 'Testo a sinistra e pulsanti a destra; con showContacts aggiunge Chiama e WhatsApp.',
			whenToUse: 'Per chiudere la pagina con i recapiti, di solito con tone muted (contatti, fondo della home).',
		},
	},
	rules: [
		'Con showContacts il pulsante WhatsApp compare solo se site.json ha il numero WhatsApp.',
	],
	fieldRules: {
		showContacts: { note: 'Il pulsante WhatsApp compare solo se site.json ha il numero WhatsApp.' },
	},
};
