import { z } from 'astro/zod';

/**
 * Preset del tema: ogni nome è un file in palettes/, fonts/ o shapes/ (<nome>.css), con accanto la
 * sua scheda <nome>.meta.ts (PresetMeta, PaletteMeta per le palette) per il catalogo.
 */
export const palettes = ['terracotta', 'ardesia'] as const;
export const fonts = ['moderno', 'classico'] as const;
export const shapes = ['squadrato', 'morbido', 'arrotondato'] as const;

export type Palette = (typeof palettes)[number];
export type Fonts = (typeof fonts)[number];
export type Shape = (typeof shapes)[number];

/** Aspetto del sito (src/content/settings/theme.json): i valori ammessi sono i preset qui sopra. */
export const themeSchema = z.object({
	palette: z.enum(palettes),
	fonts: z.enum(fonts),
	shape: z.enum(shapes),
});

export type Theme = z.infer<typeof themeSchema>;

/** Scheda di un preset (<nome>.meta.ts accanto al CSS): la leggono il catalogo e chi sceglie il tema. */
export interface PresetMeta {
	/** Nome leggibile. */
	name: string;
	/** Che impressione dà, in una frase. */
	mood: string;
	/** Settori e attività a cui si adatta meglio. */
	adattoA: string[];
}

/** Token colore di una palette (src/themes/palettes/*.css). */
export const COLOR_TOKENS = ['bg', 'fg', 'fg-muted', 'surface', 'surface-fg', 'primary', 'primary-fg', 'accent', 'accent-fg', 'border', 'ring'] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

export interface PaletteMeta extends PresetMeta {
	/** Colori da mostrare nel catalogo, token → valore: uguali a quelli del CSS (lo verifica il check "catalog"). */
	colors: Partial<Record<ColorToken, string>>;
}
