import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';
import { ctaSchema } from '@/core/ui/button/cta';

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['foto', 'card'])
				.describe('Variante|foto: foto grandi con didascalia · card: foto, titolo, testo e link per ogni elemento'),
			eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo'),
			title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
			intro: z.string().min(1).max(240).optional().describe('Introduzione|Al massimo 240 caratteri'),
			items: z
				.array(
					z.object({
						image: imageSchema(image).describe('Foto|JPG, PNG o WebP'),
						title: z
							.string()
							.min(1)
							.max(60)
							.optional()
							.describe('Titolo|Obbligatorio per la variante card; nelle foto è la didascalia'),
						text: z.string().min(1).max(200).optional().describe('Testo|Obbligatorio per la variante card, al massimo 200 caratteri'),
						cta: ctaSchema.optional().describe('Link|Facoltativo, solo nella variante card'),
					}),
				)
				.min(3)
				.max(12)
				.describe('Elementi|Da 3 a 12'),
		})
		.superRefine((props, ctx) => {
			if (props.variant !== 'card') return;
			props.items.forEach((item, index) => {
				for (const field of ['title', 'text'] as const) {
					if (!item[field]) ctx.addIssue({ code: 'custom', message: `la variante card richiede ${field}`, path: ['items', index, field] });
				}
			});
		});

export type CarouselProps = BlockProps<typeof schema>;
