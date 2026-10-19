import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'footer',
	name: 'Footer',
	description:
		'Piede del sito: recapiti cliccabili, orari, social e i dati legali obbligatori (ragione sociale, sede, P.IVA, REA e capitale per le società), con i link a privacy e cookie. Tutto da site.json e navigation.json.',
	whenToUse:
		'Sempre: è il piede di tutte le pagine. Non è una sezione delle ricette: variante e fascia di contatto si scelgono in src/content/settings/layout.json (chiave footer) e BaseLayout lo disegna in fondo a ogni pagina.',
	avoidWhen:
		'Nelle sezioni di una ricetta (la build lo rifiuta). Per chiudere una pagina con un invito diverso da chiamare o scrivere usa cta, e lascia ctaBand spento per non ripeterlo.',
	category: 'piè di pagina',
	scope: 'layout',
	version: '1.0.1',
	source: { from: 'originale' },
	variants: {
		colonne: {
			description: 'Logo e descrizione, link, contatti con «Apri in Maps», orari e social; sotto, la riga legale con privacy, cookie e credito.',
			whenToUse: 'Per la maggior parte dei siti.',
		},
		minimale: {
			description: 'Una riga sola: nome, P.IVA (con REA e capitale per le società), link legali e social.',
			whenToUse: 'Siti di una o due pagine, o quando contatti e orari sono già nelle pagine.',
		},
	},
	rules: [
		'Il titolo della fascia (ctaBandTitle) conta solo con ctaBand attivo.',
		'Il pulsante WhatsApp della fascia compare solo se site.json ha il numero WhatsApp.',
	],
	fieldRules: {
		ctaBandTitle: { note: 'Usato solo con ctaBand attivo.' },
	},
};
