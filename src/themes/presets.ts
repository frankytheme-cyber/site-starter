import { z } from 'astro/zod';

/**
 * Preset del tema: ogni nome è un file in palettes/, fonts/, shapes/, patterns/ o textures/
 * (<nome>.css), con accanto la sua scheda <nome>.meta.ts (PresetMeta, PaletteMeta per le palette)
 * per il catalogo.
 */
export const palettes = ['terracotta', 'ardesia', 'salvia', 'cipria', 'laguna', 'bordeaux', 'cobalto', 'antracite', 'prugna', 'notte'] as const;
export const fonts = ['moderno', 'classico', 'elegante', 'autorevole', 'fresco', 'amichevole', 'carattere', 'robusto', 'gourmet', 'preciso'] as const;
export const shapes = ['squadrato', 'morbido', 'arrotondato'] as const;
/** Decoro: il motivo delle sezioni con background "decoro" (patterns/). */
export const patterns = ['nessuno', 'punti', 'griglia', 'righe', 'onde', 'cerchi', 'arco'] as const;
/** Texture: la grana sopra lo sfondo di ogni sezione (textures/). */
export const textures = ['liscia', 'grana', 'carta'] as const;

export type Palette = (typeof palettes)[number];
export type Fonts = (typeof fonts)[number];
export type Shape = (typeof shapes)[number];
export type Pattern = (typeof patterns)[number];
export type Texture = (typeof textures)[number];

/** Aspetto del sito (src/content/settings/theme.json): i valori ammessi sono i preset qui sopra. */
export const themeSchema = z.object({
	palette: z.enum(palettes).describe('Palette|I colori del sito: ogni palette ha il contrasto AA verificato (check contrast)'),
	fonts: z.enum(fonts).describe('Caratteri|La coppia di font per titoli (font-heading) e testo (font-body)'),
	shape: z.enum(shapes).describe('Forma|Il raggio degli angoli di card e riquadri (rounded-box) e dei pulsanti (rounded-button)'),
	pattern: z
		.enum(patterns)
		.default('nessuno')
		.describe('Decoro|Il motivo delle sezioni con background "decoro", uno per sito; con «nessuno» quelle sezioni restano piene'),
	texture: z
		.enum(textures)
		.default('liscia')
		.describe('Texture|La grana sopra lo sfondo di ogni sezione, mai sopra il testo: liscia (nessuna), grana, carta'),
});

export type Theme = z.infer<typeof themeSchema>;

/** Scheda di un preset (<nome>.meta.ts accanto al CSS): la leggono il catalogo e chi sceglie il tema. */
export interface PresetMeta {
	/** Nome leggibile. */
	name: string;
	/** Che impressione dà: da 2 a 4 aggettivi (lo verifica npm run gen:catalog). */
	mood: string[];
	/** Settori e attività a cui si adatta meglio. */
	adattoA: string[];
}

/** Token colore di una palette (src/themes/palettes/*.css). */
export const COLOR_TOKENS = [
	'bg',
	'fg',
	'fg-muted',
	'surface',
	'surface-fg',
	'primary',
	'primary-fg',
	'primary-hover',
	'accent',
	'accent-fg',
	'accent-hover',
	'border',
	'ring',
] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];

export interface PaletteMeta extends PresetMeta {
	/** Colori da mostrare nel catalogo, token → valore: uguali a quelli del CSS (lo verifica il check "blocks"). */
	colors: Partial<Record<ColorToken, string>>;
}
