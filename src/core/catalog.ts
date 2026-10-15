import type { BlockMeta, Tone } from './block-types';

/*
 * Pezzi del catalogo comuni al sito (/catalogo) e agli script (gen-catalog, screenshots, check
 * "catalog"): le varianti di un blocco con la loro fixture, i nomi degli screenshot e l'esempio
 * JSON da incollare in una ricetta o in layout.json.
 * Solo import di tipo: gli script lo importano direttamente con Node.
 */

/** Variante di un blocco che non ne ha: la pagina è /catalogo/<tipo>/base/. */
export const NO_VARIANT = 'base';

interface FixtureLike {
	name: string;
	tone?: Tone;
	props: Record<string, unknown>;
}

/** Una voce per variante (nell'ordine di meta.variants), con la prima fixture che la usa. */
export function catalogVariants<F extends FixtureLike>(meta: BlockMeta, fixtures: F[]) {
	const variants = Object.entries(meta.variants);
	if (variants.length === 0) {
		return fixtures.length > 0 ? [{ name: NO_VARIANT, description: meta.description, whenToUse: meta.whenToUse, fixture: fixtures[0] }] : [];
	}
	return variants.flatMap(([name, { description, whenToUse }]) => {
		const fixture = fixtures.find((item) => item.props.variant === name);
		return fixture ? [{ name, description, whenToUse, fixture }] : [];
	});
}

export type ScreenSize = 'desktop' | 'mobile';
export const SCREEN_WIDTHS: Record<ScreenSize, number> = { desktop: 1280, mobile: 375 };

/** Screenshot di una variante, in docs/catalogo/img/: <tipo>-<variante>-desktop.webp e -mobile.webp. */
export const screenshotName = (type: string, variant: string, size: ScreenSize) => `${type}-${variant}-${size}.webp`;
/** Screenshot desktop dell'hero con una palette, in docs/catalogo/img/. */
export const paletteScreenshotName = (palette: string) => `hero-palette-${palette}-desktop.webp`;
/** Qualità WebP degli screenshot. */
export const SCREENSHOT_QUALITY = 75;

/** Percorso di un file di src/assets/images ("/src/assets/images/foto.jpg") visto da una ricetta in src/content/pages. */
export const recipeImagePath = (sourcePath: string) => `../..${sourcePath.replace(/^\/?src(?=\/)/, '')}`;

/** Sostituisce in profondità le immagini importate con il loro percorso per le ricette. */
function withImagePaths(value: unknown, imagePath: (value: unknown) => string | undefined): unknown {
	const path = imagePath(value);
	if (path !== undefined) return path;
	if (Array.isArray(value)) return value.map((item) => withImagePaths(item, imagePath));
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, withImagePaths(item, imagePath)]));
	}
	return value;
}

/**
 * Esempio da incollare: per un blocco di pagina una sezione della ricetta (type, tone e props),
 * per un blocco di layout la sua chiave di layout.json. imagePath trasforma un'immagine importata
 * nella fixture nel percorso relativo alla ricetta (recipeImagePath), o undefined se non lo è.
 */
export function blockExample(meta: BlockMeta, fixture: Omit<FixtureLike, 'name'>, imagePath: (value: unknown) => string | undefined) {
	const props = withImagePaths(fixture.props, imagePath) as Record<string, unknown>;
	if (meta.scope === 'layout') return { [meta.type]: props };
	return { type: meta.type, ...(fixture.tone && { tone: fixture.tone }), ...props };
}

export const exampleJson = (...args: Parameters<typeof blockExample>) => JSON.stringify(blockExample(...args), null, '\t');
