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
	category: 'navigazione',
	scope: 'layout',
	version: '1.0.0',
	source: { from: 'originale' },
	variants: {
		colonne:
			'Logo e descrizione, link del footer, contatti con indirizzo e «Apri in Maps», orari e social; sotto, la riga legale con i link a privacy e cookie e il credito. Per la maggior parte dei siti.',
		minimale: 'Una riga sola: nome, P.IVA (con REA e capitale per le società), link legali e social. Per siti di una o due pagine.',
	},
	fieldRules: {
		ctaBandTitle: 'Usato solo con ctaBand attivo.',
	},
};
