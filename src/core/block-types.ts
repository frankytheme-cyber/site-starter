import type { SchemaContext } from 'astro:content';
import type { z } from 'astro/zod';

/**
 * Schema delle props di un blocco (schema.ts): una funzione del contesto di Astro, come lo
 * schema di una collezione, così le immagini usano image() con percorsi relativi al JSON.
 */
export type BlockSchema = (context: SchemaContext) => z.ZodObject;

/** Props del componente di un blocco: quelle dello schema più id e tone della sezione. */
export type BlockProps<S extends BlockSchema> = z.infer<ReturnType<S>> & SectionProps;

/** Toni di sezione (core/ui/Section.astro). */
export const TONES = ['default', 'muted', 'primary'] as const;
export type Tone = (typeof TONES)[number];

/** Props che ogni blocco riceve dalla sezione della ricetta, oltre alle sue: non vanno negli schemi. */
export interface SectionProps {
	/** Ancora della sezione (#id), in kebab-case. */
	id?: string;
	tone?: Tone;
}

/** Scheda di un blocco (meta.ts): la leggono il catalogo e chi compone le pagine. */
export interface BlockMeta {
	/** Identificativo: uguale al nome della cartella in src/blocks (es. "hero"). */
	type: string;
	/** Nome leggibile. */
	name: string;
	/** Cosa fa il blocco, in una frase. */
	description: string;
	/** In quali casi usarlo. */
	whenToUse: string;
	/** In quali casi non usarlo, e cosa fare invece. */
	avoidWhen: string;
	/** Gruppo nel catalogo (es. "apertura", "contenuti", "contatti"). */
	category: string;
	/** Versione semver: la major sale quando lo schema cambia in modo incompatibile. */
	version: string;
	/**
	 * Provenienza del disegno: "originale" se il blocco è nato in site-starter. Altre
	 * provenienze (un sito cliente, una libreria esterna) si aggiungono qui quando servono.
	 */
	source: { from: 'originale' };
	/** true se il blocco ha un comportamento in JS: deve seguire docs/blocchi-interattivi.md. */
	interactive?: boolean;
	/** Varianti: nome → descrizione. I nomi sono i valori ammessi dalla prop `variant` dello schema. */
	variants: Record<string, string>;
}

/** Dati di esempio di un blocco (fixtures.ts), validati con lo schema del blocco. */
export interface BlockFixture<S extends BlockSchema = BlockSchema> {
	/** Nome mostrato nel catalogo. */
	name: string;
	/** Tono con cui il catalogo mostra la fixture (default "default"). */
	tone?: Tone;
	/** Le immagini sono file importati (import foto from '@/assets/images/...'), non percorsi. */
	props: z.input<ReturnType<S>>;
}
