import { getEntry } from 'astro:content';
import { z } from 'astro/zod';

/*
 * Dati dell'attività: stanno solo in src/content/settings/site.json (collezione "settings",
 * registrata in src/content.config.ts). I blocchi li leggono con getSiteSettings(), mai
 * dalle proprie props. Lo schema sta qui, nelle cartelle gestite, così un campo nuovo
 * arriva ai siti cliente con l'aggiornamento della libreria.
 */

/** Valore dei campi ancora da compilare: lo schema lo accetta, così il template compila. */
export const PLACEHOLDER = 'DA-COMPILARE';
const placeholder = z.literal(PLACEHOLDER);

export const siteSettingsSchema = z.object({
	businessName: z.string().min(1),
	/** Come va mostrato, es. "055 123 4567" o "+39 333 123 4567". */
	phone: z
		.string()
		.regex(/^\+?\d[\d\s./-]{4,18}\d$/, 'numero di telefono non valido (es. "055 123 4567")')
		.or(placeholder),
	/** Con prefisso internazionale, es. "+39 333 123 4567": serve per il link wa.me. */
	whatsapp: z
		.string()
		.regex(/^\+\d[\d\s]{6,18}\d$/, 'numero WhatsApp con prefisso internazionale (es. "+39 333 123 4567")')
		.or(placeholder)
		.optional(),
	email: z.email(),
	address: z.object({
		street: z.string().min(1),
		postalCode: z.string().regex(/^\d{5}$/, 'CAP di 5 cifre').or(placeholder),
		city: z.string().min(1),
		/** Sigla, es. "FI". */
		province: z.string().regex(/^[A-Z]{2}$/, 'sigla della provincia in maiuscolo (es. "FI")').or(placeholder),
	}),
	/** Partita IVA italiana, 11 cifre senza prefisso IT. */
	vatNumber: z.string().regex(/^\d{11}$/, 'partita IVA di 11 cifre').or(placeholder),
	/** Righe di orario così come vanno mostrate, es. { "days": "Lunedì–Venerdì", "hours": "8:00–18:00" }. */
	openingHours: z.array(z.object({ days: z.string().min(1), hours: z.string().min(1) })).min(1),
	/** Profili dell'attività: le chiavi sono anche alias di core/icons.ts. */
	social: z
		.object({
			facebook: z.url({ protocol: /^https$/ }).optional(),
			instagram: z.url({ protocol: /^https$/ }).optional(),
			google: z.url({ protocol: /^https$/ }).optional(),
		})
		.optional(),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export async function getSiteSettings(): Promise<SiteSettings> {
	const entry = await getEntry('settings', 'site');
	if (!entry) throw new Error('Dati dell’attività mancanti: crea src/content/settings/site.json');
	return entry.data;
}

/** Link tel: dal numero come è scritto, senza spazi e separatori. */
export const phoneHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** Link a una chat WhatsApp: wa.me vuole il numero internazionale senza "+" e senza spazi. */
export const whatsappHref = (number: string) => `https://wa.me/${number.replace(/\D/g, '')}`;
