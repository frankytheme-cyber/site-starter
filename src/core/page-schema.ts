import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import { allowedBackgrounds, BACKGROUND_META, type Background } from '../themes/backgrounds';
import { EDGE_META, EDGES } from '../themes/edges';
import { blockMetas, blockSchemas, blockTypesOf } from './block-schemas';
import { TONES } from './block-types';

/*
 * Ricetta di una pagina (src/content/pages/*.json): metadati e sezioni in ordine.
 * Ogni sezione è PIATTA: le props del blocco stanno accanto a type, id, tone, background ed edge.
 *   { "type": "hero", "id": "inizio", "tone": "default", "background": "alone", "variant": "split", "title": "..." }
 */

const sectionId = z
	.string()
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id in kebab-case, solo minuscole, cifre e trattini (es. "preventivo-gratuito")')
	.optional()
	.describe('Ancora|Nome della sezione per i link (#nome): minuscole, cifre e trattini');

const backgroundNames = Object.fromEntries(Object.entries(BACKGROUND_META).map(([key, { name }]) => [key, name]));

/** Effetto di sfondo della sezione: solo quelli ammessi dalla scheda del blocco (meta.backgrounds). */
const sectionBackground = (type: string) =>
	z
		.enum(allowedBackgrounds(blockMetas[type]) as [Background, ...Background[]])
		.meta({ optionLabels: backgroundNames })
		.default('pieno')
		.describe(
			'Effetto dello sfondo|Sopra il colore dello sfondo: sfumato (leggero), alone (luce negli angoli), aurora (più colori, solo apertura e invito finale). Al massimo 3 sezioni per pagina, mai due vicine',
		);

/** Bordo in alto della sezione: la forma che copre il fondo della sezione precedente. */
const sectionEdge = z
	.enum(EDGES)
	.meta({ optionLabels: Object.fromEntries(Object.entries(EDGE_META).map(([key, { name }]) => [key, name])) })
	.default('dritto')
	.describe(
		'Bordo in alto|Forma del bordo superiore della sezione, nel suo colore: dritto, onda, diagonale, curva. Al massimo 2 per pagina, mai sulla prima sezione, solo dopo una sezione di sfondo diverso',
	);

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
			background: sectionBackground(type),
			edge: sectionEdge,
		}),
	);
	if (sections.length === 0) throw new Error('Nessun blocco di pagina in src/blocks/');
	return sections as [(typeof sections)[number], ...typeof sections];
}

/** Tipi di pagina: le pagine legali (privacy, cookie...) non chiedono un'azione, quindi recipes non vuole una cta. */
export const PAGE_KINDS = ['pagina', 'legale'] as const;
const PAGE_KIND_NAMES: Record<(typeof PAGE_KINDS)[number], string> = { pagina: 'Pagina', legale: 'Pagina legale' };

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
		/** Immagine per le anteprime social: percorso relativo al JSON, ritagliata a 1200×630. Senza, vale defaultOgImage di site.json. */
		ogImage: context
			.image()
			.optional()
			.describe('Immagine per i social|Compare quando la pagina viene condivisa; se manca si usa quella dei Dati attività. Viene ritagliata a 1200×630'),
		noindex: z
			.boolean()
			.optional()
			.describe('Nascondi ai motori di ricerca|Solo per pagine che non devono comparire su Google'),
		kind: z
			.enum(PAGE_KINDS)
			.meta({ optionLabels: PAGE_KIND_NAMES })
			.optional()
			.describe('Tipo di pagina|«Pagina legale» per privacy, cookie e note legali, che non hanno un invito all’azione; vuoto = pagina normale'),
		sections: z
			.array(z.discriminatedUnion('type', sectionSchemas(context), { error: layoutBlockError }))
			.min(1)
			.describe('Sezioni|I blocchi della pagina, dall’alto in basso'),
	});

export type PageData = z.infer<ReturnType<typeof pageSchema>>;
export type SectionData = PageData['sections'][number];
