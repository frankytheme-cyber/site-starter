import { z } from 'astro/zod';

/** Preset del tema: ogni nome è un file in palettes/ o fonts/, o un blocco [data-shape] in base.css. */
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
