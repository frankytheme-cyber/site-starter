import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';

/**
 * Le immagini dei blocchi si indicano con un percorso relativo a src/assets/images
 * (es. "fixtures/foto.jpg"), così le props restano JSON e le ricette delle pagine
 * non devono importare file. Qui i percorsi diventano immagini ottimizzabili da Astro.
 */
const ROOT = '/src/assets/images/';

const images = import.meta.glob<ImageMetadata>('/src/assets/images/**/*.{avif,gif,jpeg,jpg,png,webp}', {
	eager: true,
	import: 'default',
});

export function resolveImage(path: string): ImageMetadata {
	const image = images[ROOT + path];
	if (!image) throw new Error(`Immagine "${path}" non trovata in src/assets/images/`);
	return image;
}

/** Immagine nelle props di un blocco: percorso esistente e testo alternativo obbligatorio. */
export const imageSchema = z.object({
	src: z.string().refine((path) => ROOT + path in images, 'immagine non trovata in src/assets/images/'),
	alt: z.string().min(1, 'il testo alternativo è obbligatorio'),
});
