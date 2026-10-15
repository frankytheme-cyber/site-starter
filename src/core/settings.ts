import type { SchemaContext } from 'astro:content';
import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import type { Theme } from '@/themes/presets';
import { DAY_NAMES, DAYS } from './opening-hours';

/*
 * Dati dell'attività: stanno solo in src/content/settings/site.json (collezione "settings",
 * registrata in src/content.config.ts). I blocchi li leggono con getSiteSettings(), mai
 * dalle proprie props. Lo schema sta qui, nelle cartelle gestite, così un campo nuovo
 * arriva ai siti cliente con l'aggiornamento della libreria.
 */

/** Valore dei campi ancora da compilare: lo schema lo accetta, così il template compila. */
export const PLACEHOLDER = 'DA-COMPILARE';
const placeholder = z.literal(PLACEHOLDER);

/** Forme giuridiche. Le società (COMPANY_FORMS) devono indicare anche REA e capitale sociale. */
export const LEGAL_FORMS = ['ditta-individuale', 'srl', 'srls', 'snc', 'sas', 'altro'] as const;
export type LegalForm = (typeof LEGAL_FORMS)[number];
export const LEGAL_FORM_NAMES: Record<LegalForm, string> = {
	'ditta-individuale': 'Ditta individuale',
	srl: 'S.r.l.',
	srls: 'S.r.l.s.',
	snc: 'S.n.c.',
	sas: 'S.a.s.',
	altro: 'Altro',
};
export const COMPANY_FORMS: readonly LegalForm[] = ['srl', 'srls', 'snc', 'sas'];
export const isCompany = (form: LegalForm) => COMPANY_FORMS.includes(form);

/** Partita IVA italiana: 11 cifre, l'ultima è il controllo (Luhn) sulle prime 10. */
export function isValidVatNumber(value: string): boolean {
	if (!/^\d{11}$/.test(value) || /^0+$/.test(value)) return false;
	const digits = [...value].map(Number);
	const sum = digits.slice(0, 10).reduce((total, digit, index) => {
		if (index % 2 === 0) return total + digit;
		const doubled = digit * 2;
		return total + (doubled > 9 ? doubled - 9 : doubled);
	}, 0);
	return (10 - (sum % 10)) % 10 === digits[10];
}

/** Ora di 24 ore "08:30". */
const time = z
	.string()
	.regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'ora nel formato 08:30, da 00:00 a 23:59')
	.or(placeholder);

const toMinutes = (value: string) => (value === PLACEHOLDER ? undefined : Number(value.slice(0, 2)) * 60 + Number(value.slice(3)));

const openingHours = z
	.array(
		z.object({
			days: z
				.array(z.enum(DAYS).meta({ optionLabels: DAY_NAMES }))
				.min(1)
				.describe('Giorni|Tutti i giorni che hanno questo orario, es. da lunedì a venerdì'),
			slots: z
				.array(
					z.object({
						opens: time.describe('Apre alle|Es. 08:30'),
						closes: time.describe('Chiude alle|Es. 12:30'),
					}),
				)
				.max(3)
				.default([])
				.describe('Fasce orarie|Una per ogni apertura della giornata, es. mattina e pomeriggio; nessuna fascia = chiuso'),
		}),
	)
	.min(1)
	.max(7)
	.superRefine((rows, ctx) => {
		const seen = new Map<string, number>();
		rows.forEach((row, index) => {
			for (const day of row.days) {
				const first = seen.get(day);
				if (first === undefined) seen.set(day, index);
				else ctx.addIssue({ code: 'custom', path: [index, 'days'], message: `${DAY_NAMES[day]} è già nella riga ${first + 1}: ogni giorno va in una riga sola` });
			}
			let previousClose: number | undefined;
			row.slots.forEach((slot, slotIndex) => {
				const [opens, closes] = [toMinutes(slot.opens), toMinutes(slot.closes)];
				if (opens === undefined || closes === undefined) return;
				if (closes <= opens) {
					ctx.addIssue({ code: 'custom', path: [index, 'slots', slotIndex, 'closes'], message: 'la chiusura deve venire dopo l’apertura' });
				} else if (previousClose !== undefined && opens < previousClose) {
					ctx.addIssue({ code: 'custom', path: [index, 'slots', slotIndex, 'opens'], message: 'le fasce vanno in ordine e non si sovrappongono' });
				}
				previousClose = closes;
			});
		});
	})
	.describe('Orari|Una riga per gruppo di giorni con lo stesso orario; aggiungi una riga senza fasce per i giorni di chiusura');

const https = () => z.url({ protocol: /^https$/ });

export const siteSettingsSchema = ({ image }: SchemaContext) =>
	z
		.object({
			businessName: z.string().min(1).describe('Nome dell’attività|Come compare sul sito e su Google'),
			description: z
				.string()
				.min(1)
				.max(160)
				.describe('Descrizione dell’attività|Una frase su cosa fa e dove: compare nel footer e su Google, al massimo 160 caratteri'),
			/** Usato anche come site di Astro (astro.config.mjs): canonical, Open Graph e JSON-LD. */
			url: https().describe('Indirizzo del sito|Completo, es. https://www.esempio.it'),
			/** Percorso relativo a questo JSON (es. "../../assets/images/logo.png"); il testo alternativo è businessName. */
			logo: image().optional().describe('Logo|PNG o WebP con sfondo trasparente, almeno 400 px di larghezza'),
			/** Open Graph delle pagine senza ogImage propria (BaseLayout). Il template ha og-DA-COMPILARE.jpg: release lo ferma. */
			defaultOgImage: image()
				.optional()
				.describe(
					'Immagine per i social|Compare quando una pagina del sito viene condivisa, se la pagina non ne ha una sua; JPG orizzontale, almeno 1200×630 px',
				),
			phone: z
				.string()
				.regex(/^\+?\d[\d\s./-]{4,18}\d$/, 'numero di telefono non valido (es. "051 123 4567")')
				.or(placeholder)
				.describe('Telefono|Come va mostrato, es. 051 123 4567'),
			whatsapp: z
				.string()
				.regex(/^\+\d[\d\s]{6,18}\d$/, 'numero WhatsApp con prefisso internazionale (es. "+39 333 123 4567")')
				.or(placeholder)
				.optional()
				.describe('WhatsApp|Con il prefisso internazionale, es. +39 333 123 4567; lascia vuoto se non lo usi'),
			email: z.email().describe('Email|Indirizzo a cui scrivere, es. info@esempio.it'),
			/** Sede dell'attività: indirizzo nei contatti del footer, sede legale nella riga finale, JSON-LD. */
			address: z
				.object({
					street: z.string().min(1).describe('Via e numero civico|Es. Via Roma 12'),
					postalCode: z.string().regex(/^\d{5}$/, 'CAP di 5 cifre').or(placeholder).describe('CAP|5 cifre, es. 40121'),
					city: z.string().min(1).describe('Comune|Es. Bologna'),
					province: z
						.string()
						.regex(/^[A-Z]{2}$/, 'sigla della provincia in maiuscolo (es. "BO")')
						.or(placeholder)
						.describe('Provincia|Sigla in maiuscolo, es. BO'),
				})
				.describe('Indirizzo|Sede dell’attività'),
			legalName: z
				.string()
				.min(1)
				.max(120)
				.describe(
					'Ragione sociale|Il nome registrato in Camera di commercio, forma giuridica compresa: es. «Bottega Esempio S.r.l.» o «Bottega Esempio di Mario Rossi»',
				),
			legalForm: z
				.enum(LEGAL_FORMS)
				.meta({ optionLabels: LEGAL_FORM_NAMES })
				.describe('Forma giuridica|Per S.r.l., S.r.l.s., S.n.c. e S.a.s. compila anche REA e capitale sociale'),
			vatNumber: z
				.string()
				.regex(/^\d{11}$/, 'partita IVA di 11 cifre, senza IT davanti')
				// Solo sulle 11 cifre: un formato sbagliato ha già il suo messaggio.
				.refine(
					(value) => !/^\d{11}$/.test(value) || isValidVatNumber(value),
					'partita IVA non valida: la cifra di controllo non torna, ricontrolla i numeri',
				)
				.or(placeholder)
				.describe('Partita IVA|11 cifre, senza IT davanti'),
			/** Obbligatorio per le società (superRefine sotto). */
			rea: z
				.string()
				.regex(/^[A-Z]{2}[- ]?\d{1,7}$/, 'sigla della provincia e numero, es. BO-123456')
				.or(placeholder)
				.optional()
				.describe('Numero REA|Sigla della provincia e numero, es. BO-123456; obbligatorio per le società'),
			/** Obbligatorio per le società (superRefine sotto). Testo libero: l'importo versato, come va mostrato. */
			shareCapital: z
				.string()
				.max(40)
				.regex(/^\D*\d/, 'indica l’importo, es. 10.000 € i.v.')
				.or(placeholder)
				.optional()
				.describe('Capitale sociale|Quello versato, come va mostrato: es. 10.000 € i.v.; obbligatorio per le società'),
			openingHours,
			/** Le chiavi sono anche alias di core/icons.ts. */
			social: z
				.object({
					facebook: https().optional().describe('Facebook|Indirizzo completo della pagina'),
					instagram: https().optional().describe('Instagram|Indirizzo completo del profilo'),
					google: https().optional().describe('Google|Indirizzo della scheda Google dell’attività'),
					youtube: https().optional().describe('YouTube|Indirizzo completo del canale'),
					tiktok: https().optional().describe('TikTok|Indirizzo completo del profilo'),
					tripadvisor: https().optional().describe('Tripadvisor|Indirizzo della scheda dell’attività'),
				})
				.optional()
				.describe('Profili social|Lascia vuoti quelli che non usi'),
		})
		.superRefine((site, ctx) => {
			if (!isCompany(site.legalForm)) return;
			const required = [
				['rea', 'il numero REA'],
				['shareCapital', 'il capitale sociale'],
			] as const;
			for (const [field, label] of required) {
				if (!site[field]) {
					ctx.addIssue({ code: 'custom', path: [field], message: `una società (${LEGAL_FORM_NAMES[site.legalForm]}) deve indicare ${label}` });
				}
			}
		});

export type SiteSettings = z.infer<ReturnType<typeof siteSettingsSchema>>;
export type SocialNetwork = keyof NonNullable<SiteSettings['social']>;

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
