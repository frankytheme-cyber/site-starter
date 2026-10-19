import { CATEGORIES } from '@/core/block-types';
import { catalogVariants } from '@/core/catalog';
import { blocks } from '@/core/registry';
import { fonts, palettes, patterns, shapes, textures } from '@/themes/presets';

/** Blocchi raggruppati per categoria, nell'ordine della pagina: indice del catalogo e menu «Blocchi». */
export const blockGroups = CATEGORIES.map((category) => ({
	category,
	blocks: blocks
		.filter((block) => block.meta.category === category)
		.map((block) => ({
			type: block.type,
			name: block.meta.name,
			variants: catalogVariants(block.meta, block.fixtures).length,
		})),
})).filter((group) => group.blocks.length > 0);

/** Valori ammessi per ogni selettore del tema: data-palette, data-fonts, data-shape, data-pattern e data-texture di <html>. */
export const themePresets = { palette: palettes, fonts, shape: shapes, pattern: patterns, texture: textures };

/** Scelta del tema ricordata tra le pagine del catalogo (sessionStorage). */
export const THEME_STORAGE_KEY = 'catalogo-tema';
