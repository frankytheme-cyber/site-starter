import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { blockSchemas, blockTypesOf } from './block-schemas';
import { TONES } from './block-types';

/*
 * Ricetta di una pagina (src/content/pages/*.json): metadati e sezioni in ordine.
 * Ogni sezione è PIATTA: le props del blocco stanno accanto a type, id e tone.
 *   { "type": "hero", "id": "inizio", "tone": "default", "variant": "split", "title": "..." }
 */

const sectionId = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id in kebab-case, solo minuscole, cifre e trattini (es. "preventivo-gratuito")')
	.optional()
	.describe('Ancora|Nome della sezione per i link (#nome): minuscole, cifre e trattini');

/** Uno schema per blocco di pagina (scope "page"): le sue props più i campi della sezione. */
function sectionSchemas(context: SchemaContext) {
	const sections = blockTypesOf('page').map((type) =>
		// safeExtend conserva i refine/superRefine del blocco (es. image obbligatoria per hero split).
		blockSchemas[type](context).safeExtend({
			type: z.literal(type),
			id: sectionId,
			tone: z
				.enum(TONES)
				.default('default')
				.describe('Sfondo|default: chiaro · muted: tenue · primary: colore principale. Alterna gli sfondi tra sezioni vicine'),
		}),
	);
	if (sections.length === 0) throw new Error('Nessun blocco di pagina in src/blocks/');
	return sections as [(typeof sections)[number], ...typeof sections];
}

/** Un blocco di layout (header, footer) messo tra le sezioni: messaggio che dice dove va. */
function layoutBlockError(issue: { code?: string; input?: unknown }) {
	const type = (issue.input as { type?: unknown } | undefined)?.type;
	if (issue.code !== 'invalid_union' || typeof type !== 'string' || !blockTypesOf('layout').includes(type)) return undefined;
	return `«${type}» è un blocco di layout, uguale su tutte le pagine: non va nelle sezioni ma in src/content/settings/layout.json`;
}

export const pageSchema = (context: SchemaContext) =>
	z.object({
		/** Titolo della pagina (<title> e anteprime social). */
		title: z
			.string()
			.min(1)
			.max(60)
			.describe('Titolo della pagina|Compare nella scheda del browser e su Google, al massimo 60 caratteri'),
		/** Descrizione per i risultati di ricerca e le anteprime social. */
		description: z
			.string()
			.min(1)
			.max(160)
			.describe('Descrizione|Il testo sotto il titolo nei risultati di Google, al massimo 160 caratteri'),
		/** Le bozze non vengono pubblicate in produzione (e non sono indicizzate altrove). */
		draft: z.boolean().default(false).describe('Bozza|Una bozza non compare sul sito pubblicato'),
		/** Immagine per le anteprime social: percorso relativo al JSON, ritagliata a 1200×630. */
		ogImage: context
			.image()
			.optional()
			.describe('Immagine per i social|Compare quando la pagina viene condivisa; viene ritagliata a 1200×630'),
		noindex: z
			.boolean()
			.optional()
			.describe('Nascondi ai motori di ricerca|Solo per pagine che non devono comparire su Google'),
		sections: z
			.array(z.discriminatedUnion('type', sectionSchemas(context), { error: layoutBlockError }))
			.min(1)
			.describe('Sezioni|I blocchi della pagina, dall’alto in basso'),
	});

export type PageData = z.infer<ReturnType<typeof pageSchema>>;
export type SectionData = PageData['sections'][number];
