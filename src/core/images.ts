import type { ImageFunction } from 'astro:content';
import { z } from 'astro/zod';

/**
 * Immagine nelle props di un blocco o nei dati del sito. Nei JSON src è un percorso relativo
 * al file (es. "../../assets/images/foto.jpg"): image() di Astro lo verifica e lo rende
 * ottimizzabile. Nelle fixture è un file importato.
 */
export const imageSchema = (image: ImageFunction) =>
	z.object({
		src: image().describe('File|JPG, PNG o WebP; per le foto grandi almeno 1600 px di larghezza'),
		alt: z
			.string()
			.min(5, 'il testo alternativo deve descrivere l’immagine (almeno 5 caratteri)')
			.describe('Testo alternativo|Descrive la foto a chi non la vede, es. «Soggiorno con pareti verde salvia»'),
	});
