import { getEntry } from 'astro:content';
import { z } from 'astro/zod';

/*
 * Menu del sito: sta solo in src/content/settings/navigation.json (collezione "navigation",
 * registrata in src/content.config.ts). Header e footer lo leggono con getNavigation().
 */

const link = z.object({
	label: z.string().min(1).max(25),
	/** Percorso del sito ("/servizi/") o indirizzo completo. */
	href: z.string().min(1),
});

export const navigationSchema = z.object({
	items: z
		.array(link.extend({ children: z.array(link).min(1).max(6).optional() }))
		.min(1)
		.max(7),
	/** Pulsante in evidenza, mostrato dai blocchi che lo prevedono (es. header con-cta). */
	cta: link.optional(),
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
