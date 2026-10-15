import { z } from 'astro/zod';
import { ICON_NAMES } from '@/core/icons';

/**
 * Pulsante o link d'azione nelle props dei blocchi (hero, services, cta) e nel menu.
 * href accetta anche quattro valori speciali, risolti da site.json al momento della build
 * (core/links.ts): così i recapiti non si scrivono mai nei testi.
 */
export const SPECIAL_HREFS = ['@telefono', '@whatsapp', '@email', '@mappa'] as const;
export type SpecialHref = (typeof SPECIAL_HREFS)[number];

export const BUTTON_STYLES = ['primary', 'secondary', 'ghost', 'link'] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

const HREF = new RegExp(String.raw`^(?:${SPECIAL_HREFS.join('|')}|[^@\s]\S*)$`);

export const ctaSchema = z.object({
	label: z.string().min(1).max(25).describe('Testo del pulsante|Al massimo 25 caratteri'),
	href: z
		.string()
		.regex(HREF, 'un link (/pagina/, #sezione, https://...) oppure @telefono, @whatsapp, @email, @mappa')
		.describe(
			'Link|Una pagina del sito (/contatti/), una sezione (#preventivo), un indirizzo completo, oppure @telefono, @whatsapp, @email o @mappa per i recapiti di «Dati attività»',
		),
	style: z
		.enum(BUTTON_STYLES)
		.optional()
		.describe('Stile|primary: pieno · secondary: bordato · ghost: solo testo · link: sottolineato. Vuoto: quello previsto dal blocco'),
	icon: z.enum(ICON_NAMES).optional().describe('Icona|Facoltativa, accanto al testo (le frecce vanno dopo il testo)'),
});

export type Cta = z.infer<typeof ctaSchema>;
