import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';
import { ctaSchema } from '@/core/ui/button/cta';

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['immagine-testo', 'con-numeri'])
				.describe('Variante|immagine-testo: foto e racconto affiancati · con-numeri: racconto con una fila di numeri, ognuno con la sua fonte'),
			eyebrow: z.string().min(1).max(40).optional().describe('Occhiello|Breve testo sopra il titolo'),
			title: z.string().min(1).max(70).describe('Titolo|Titolo della sezione, al massimo 70 caratteri'),
			paragraphs: z
				.array(z.string().min(1).max(400).describe('Paragrafo|Al massimo 400 caratteri'))
				.min(1)
				.max(3)
				.describe('Testo|Da 1 a 3 paragrafi che raccontano chi siete'),
			/** Obbligatoria per immagine-testo; in con-numeri è facoltativa. */
			image: imageSchema(image)
				.optional()
				.describe('Foto|Obbligatoria per la variante immagine-testo; facoltativa in con-numeri. Meglio una foto vera del luogo o delle persone'),
			cta: ctaSchema.optional().describe('Pulsante|Facoltativo, es. «Conosci il team»'),
			/** Solo per con-numeri: ogni numero ha la sua fonte, mai inventato. */
			stats: z
				.array(
					z.object({
						value: z.string().min(1).max(12).describe('Numero|Es. «25» o «1.200+», al massimo 12 caratteri'),
						label: z.string().min(1).max(40).describe('Cosa misura|Es. «anni di attività», al massimo 40 caratteri'),
						fonte: z
							.string()
							.min(3)
							.max(80)
							.describe('Fonte|Da dove viene il numero, es. «registro interno dei lavori, 2025». Obbligatoria: i numeri non si inventano'),
					}),
				)
				.min(2)
				.max(4)
				.optional()
				.describe('Numeri|Da 2 a 4 numeri veri, solo per la variante con-numeri'),
		})
		// rule: La variante immagine-testo richiede la foto (image).
		// rule: La variante con-numeri richiede da 2 a 4 numeri (stats), ognuno con la sua fonte.
		.superRefine((props, ctx) => {
			if (props.variant === 'immagine-testo' && !props.image) {
				ctx.addIssue({ code: 'custom', message: 'la variante immagine-testo richiede image', path: ['image'] });
			}
			if (props.variant === 'con-numeri' && !props.stats) {
				ctx.addIssue({ code: 'custom', message: 'la variante con-numeri richiede stats, con la fonte di ogni numero', path: ['stats'] });
			}
		});

export type AboutProps = BlockProps<typeof schema>;
