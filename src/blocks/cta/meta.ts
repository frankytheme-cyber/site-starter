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
	version: '1.0.0',
	source: { from: 'originale' },
	variants: {
		banner: 'Fascia piena nel colore primario, testo centrato e 1-2 pulsanti. Molto visibile: al massimo una per pagina.',
		'split-contatto':
			'Testo a sinistra e pulsanti a destra, su fondo tenue; con showContacts aggiunge Chiama e WhatsApp. Adatta a chiudere la pagina.',
	},
};
