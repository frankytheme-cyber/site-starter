import { CATEGORIES } from '@/core/block-types';
import { catalogVariants } from '@/core/catalog';
import { blocks } from '@/core/registry';

/** Blocchi raggruppati per categoria, nell'ordine della pagina: indice del catalogo, «tutti dal vivo» e menu «Blocchi». */
export const blockGroups = CATEGORIES.map((category) => ({
	category,
	blocks: blocks
		.filter((block) => block.meta.category === category)
		.map((block) => ({
			type: block.type,
			name: block.meta.name,
			description: block.meta.description,
			interactive: block.meta.interactive,
			layout: block.meta.scope === 'layout',
			variants: catalogVariants(block.meta, block.fixtures).map((variant) => variant.name),
		})),
})).filter((group) => group.blocks.length > 0);

/** Ancora di una variante nella pagina del blocco e in «tutti dal vivo»: hero-split. */
export const variantAnchor = (type: string, variant: string) => `${type}-${variant}`;

/** Scelta del tema ricordata tra le pagine del catalogo (sessionStorage). */
export const THEME_STORAGE_KEY = 'catalogo-tema';
