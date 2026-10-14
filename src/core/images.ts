import type { ImageMetadata } from 'astro';
import type { ImageFunction } from 'astro:content';
import { z } from 'astro/zod';

/**
 * Immagine nelle props di un blocco. Nelle ricette di pagina src è un percorso relativo al
 * file JSON (es. "../../assets/images/foto.jpg"): image() di Astro lo verifica e lo rende
 * ottimizzabile. Nelle fixture è un file importato.
 */
export const imageSchema = (image: ImageFunction) =>
	z.object({
		src: image(),
		alt: z.string().min(5, 'il testo alternativo deve descrivere l’immagine (almeno 5 caratteri)'),
	});

/*
 * Immagini indicate con un percorso relativo a src/assets/images (es. il logo in site.json):
 * qui il percorso diventa un'immagine ottimizzabile.
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
