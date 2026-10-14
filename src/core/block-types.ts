import type { z } from 'astro/zod';

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
export interface BlockFixture<S extends z.ZodType = z.ZodType> {
	/** Nome mostrato nel catalogo. */
	name: string;
	props: z.input<S>;
}
