import type { ImageMetadata } from 'astro';
import { screenshotName } from '@/core/catalog';

/*
 * Screenshot desktop delle varianti in docs/catalogo/img/ (npm run catalog): le miniature
 * dell'indice. Una variante nuova non ha ancora il suo: l'indice mostra un segnaposto.
 */
const screenshots = import.meta.glob<ImageMetadata>('/docs/catalogo/img/*-desktop.webp', { eager: true, import: 'default' });

export const variantScreenshot = (type: string, variant: string): ImageMetadata | undefined =>
	screenshots[`/docs/catalogo/img/${screenshotName(type, variant, 'desktop')}`];
