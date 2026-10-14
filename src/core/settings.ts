import type { SchemaContext } from 'astro:content';
import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import type { Theme } from '@/themes/presets';

/*
 * Dati dell'attività: stanno solo in src/content/settings/site.json (collezione "settings",
 * registrata in src/content.config.ts). I blocchi li leggono con getSiteSettings(), mai
 * dalle proprie props. Lo schema sta qui, nelle cartelle gestite, così un campo nuovo
 * arriva ai siti cliente con l'aggiornamento della libreria.
 */

/** Valore dei campi ancora da compilare: lo schema lo accetta, così il template compila. */
export const PLACEHOLDER = 'DA-COMPILARE';
const placeholder = z.literal(PLACEHOLDER);

export const siteSettingsSchema = ({ image }: SchemaContext) =>
	z.object({
		businessName: z.string().min(1).describe('Nome dell’attività|Come compare sul sito e su Google'),
		/** Usato anche come site di Astro (astro.config.mjs): canonical, Open Graph e JSON-LD. */
		url: z.url({ protocol: /^https$/ }).describe('Indirizzo del sito|Completo, es. https://www.esempio.it'),
		/** Percorso relativo a questo JSON (es. "../../assets/images/logo.png"); il testo alternativo è businessName. */
		logo: image().optional().describe('Logo|PNG o WebP con sfondo trasparente, almeno 400 px di larghezza'),
		phone: z
			.string()
			.regex(/^\+?\d[\d\s./-]{4,18}\d$/, 'numero di telefono non valido (es. "055 123 4567")')
			.or(placeholder)
			.describe('Telefono|Come va mostrato, es. 055 123 4567'),
		whatsapp: z
			.string()
			.regex(/^\+\d[\d\s]{6,18}\d$/, 'numero WhatsApp con prefisso internazionale (es. "+39 333 123 4567")')
			.or(placeholder)
			.optional()
			.describe('WhatsApp|Con il prefisso internazionale, es. +39 333 123 4567; lascia vuoto se non lo usi'),
		email: z.email().describe('Email|Indirizzo a cui scrivere, es. info@esempio.it'),
		address: z
			.object({
				street: z.string().min(1).describe('Via e numero civico|Es. Via Roma 12'),
				postalCode: z.string().regex(/^\d{5}$/, 'CAP di 5 cifre').or(placeholder).describe('CAP|5 cifre, es. 50121'),
				city: z.string().min(1).describe('Comune|Es. Firenze'),
				province: z
					.string()
					.regex(/^[A-Z]{2}$/, 'sigla della provincia in maiuscolo (es. "FI")')
					.or(placeholder)
					.describe('Provincia|Sigla in maiuscolo, es. FI'),
			})
			.describe('Indirizzo|Sede dell’attività'),
		vatNumber: z
			.string()
			.regex(/^\d{11}$/, 'partita IVA di 11 cifre')
			.or(placeholder)
			.describe('Partita IVA|11 cifre, senza IT davanti'),
		openingHours: z
			.array(
				z.object({
					days: z.string().min(1).describe('Giorni|Es. Lunedì–Venerdì'),
					hours: z.string().min(1).describe('Orario|Es. 8:00–12:30, 14:00–18:00, oppure Chiuso'),
				}),
			)
			.min(1)
			.describe('Orari|Una riga per gruppo di giorni, come vanno mostrati'),
		/** Le chiavi sono anche alias di core/icons.ts. */
		social: z
			.object({
				facebook: z.url({ protocol: /^https$/ }).optional().describe('Facebook|Indirizzo completo della pagina'),
				instagram: z.url({ protocol: /^https$/ }).optional().describe('Instagram|Indirizzo completo del profilo'),
				google: z
					.url({ protocol: /^https$/ })
					.optional()
					.describe('Google|Indirizzo della scheda Google dell’attività'),
			})
			.optional()
			.describe('Profili social|Lascia vuoti quelli che non usi'),
	});

export type SiteSettings = z.infer<ReturnType<typeof siteSettingsSchema>>;

export async function getSiteSettings(): Promise<SiteSettings> {
	const entry = await getEntry('settings', 'site');
	if (!entry) throw new Error('Dati dell’attività mancanti: crea src/content/settings/site.json');
	return entry.data;
}

/** Aspetto del sito: src/content/settings/theme.json (schema in src/themes/presets.ts). */
export async function getTheme(): Promise<Theme> {
	const entry = await getEntry('theme', 'theme');
	if (!entry) throw new Error('Tema mancante: crea src/content/settings/theme.json');
	return entry.data;
}

/** Link tel: dal numero come è scritto, senza spazi e separatori. */
export const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** Link a una chat WhatsApp: wa.me vuole il numero internazionale senza "+" e senza spazi. */
export const whatsappHref = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`;
