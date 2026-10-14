import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { blockSchemas } from './block-schemas';
import { TONES } from './block-types';

/*
 * Ricetta di una pagina (src/content/pages/*.json): metadati e sezioni in ordine.
 * Ogni sezione è PIATTA: le props del blocco stanno accanto a type, id e tone.
 *   { "type": "hero", "id": "inizio", "tone": "default", "variant": "split", "title": "..." }
 */

const sectionId = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id in kebab-case, solo minuscole, cifre e trattini (es. "preventivo-gratuito")');

/** Uno schema per blocco del registry: le sue props più i campi della sezione. */
function sectionSchemas(context: SchemaContext) {
	const sections = Object.entries(blockSchemas).map(([type, schema]) =>
		// safeExtend conserva i refine/superRefine del blocco (es. image obbligatoria per hero split).
		schema(context).safeExtend({
			type: z.literal(type),
			id: sectionId.optional(),
			tone: z.enum(TONES).default('default'),
		}),
	);
	if (sections.length === 0) throw new Error('Nessun blocco in src/blocks/');
	return sections as [(typeof sections)[number], ...typeof sections];
}

export const pageSchema = (context: SchemaContext) =>
	z.object({
		/** Titolo della pagina (<title> e anteprime social). */
		title: z.string().min(1).max(60),
		/** Descrizione per i risultati di ricerca e le anteprime social. */
		description: z.string().min(1).max(160),
		/** Le bozze non vengono pubblicate in produzione (e non sono indicizzate altrove). */
		draft: z.boolean().default(false),
		/** Immagine per le anteprime social: percorso relativo al JSON, ritagliata a 1200×630. */
		ogImage: context.image().optional(),
		noindex: z.boolean().optional(),
		sections: z.array(z.discriminatedUnion('type', sectionSchemas(context))).min(1),
	});

export type PageData = z.infer<ReturnType<typeof pageSchema>>;
export type SectionData = PageData['sections'][number];
