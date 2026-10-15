import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import { ctaSchema } from './ui/button/cta';

/*
 * Menu del sito: sta solo in src/content/settings/navigation.json (collezione "navigation",
 * registrata in src/content.config.ts). Header e footer lo leggono con getNavigation():
 * items e cta per l'intestazione, footer per i link in fondo alla pagina.
 */

const link = z.object({
	label: z.string().min(1).max(25).describe('Testo|Al massimo 25 caratteri'),
	/** Percorso del sito ("/servizi/") o indirizzo completo. */
	href: z
		.string()
		.min(1)
		.describe('Link|Una pagina del sito (/servizi/), una sezione (/servizi/#interni) o un indirizzo completo'),
});

export const navigationSchema = z.object({
	items: z
		.array(
			link.extend({
				children: z.array(link).min(1).max(6).optional().describe('Sottomenu|Fino a 6 voci; lascia vuoto se non serve'),
			}),
		)
		.min(1)
		.max(7)
		.describe('Voci del menu|Al massimo 7, nell’ordine in cui compaiono'),
	/** Pulsante in evidenza, mostrato dai blocchi che lo prevedono (es. header con-cta). */
	cta: ctaSchema.optional().describe('Pulsante in evidenza|Mostrato dall’intestazione con-cta: compila testo e link, oppure nessuno dei due'),
	/** Link del footer: quelli legali in fondo a ogni pagina, i secondari nella colonna del footer colonne. */
	footer: z
		.object({
			links: z
				.array(link)
				.min(1)
				.max(8)
				.optional()
				.describe('Link del footer|Pagine da mostrare nella colonna «Link» del footer, fino a 8; lascia vuoto per ripetere le voci del menu'),
			legal: z
				.array(link)
				.min(1)
				.max(4)
				.describe('Link legali|Privacy e cookie (obbligatori) ed eventuali note legali: compaiono in fondo a ogni pagina'),
		})
		.describe('Footer|I link in fondo a ogni pagina'),
});

export type Navigation = z.infer<typeof navigationSchema>;
export type NavLink = z.infer<typeof link>;

export async function getNavigation(): Promise<Navigation> {
	const entry = await getEntry('navigation', 'navigation');
	if (!entry) throw new Error('Menu mancante: crea src/content/settings/navigation.json');
	return entry.data;
}

const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/**
 * true se href è la pagina in cui ci si trova (solo percorsi interni, slash finale ignorato).
 * Un link con ancora (/servizi/#interni) porta a una parte della pagina, non alla pagina: false.
 */
export function isCurrentPage(href: string, pathname: string): boolean {
	if (!href.startsWith('/') || href.includes('#')) return false;
	return trimSlash(href.split('?')[0]) === trimSlash(pathname);
}
