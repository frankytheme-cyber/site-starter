import { getEntry } from 'astro:content';
import { z } from 'astro/zod';
import { schema as footerSchema } from '@/blocks/footer/schema';
import { schema as headerSchema } from '@/blocks/header/schema';

/*
 * Blocchi di layout (scope "layout"): uguali su tutte le pagine, non stanno nelle ricette.
 * Si scelgono in src/content/settings/layout.json (collezione "layout", registrata in
 * src/content.config.ts), una chiave per blocco con le sue props; BaseLayout li disegna
 * intorno a <main>. Non è esposto nel CMS: lo decide chi fa il sito, come il tema.
 */
export const layoutSchema = z.object({
	header: headerSchema().describe('Intestazione|In cima a ogni pagina: variante, sticky e logo'),
	footer: footerSchema().describe('Footer|In fondo a ogni pagina: variante e fascia di contatto'),
});

export type Layout = z.infer<typeof layoutSchema>;

export async function getLayout(): Promise<Layout> {
	const entry = await getEntry('layout', 'layout');
	if (!entry) throw new Error('Layout mancante: crea src/content/settings/layout.json');
	return entry.data;
}
