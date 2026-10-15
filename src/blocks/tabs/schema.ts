import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';
import { ctaSchema } from '@/core/ui/button/cta';

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['testo', 'testo-immagine'])
				.describe('Variante|testo: solo testo nelle schede · testo-immagine: testo e foto affiancati in ogni scheda'),
			eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo'),
			title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
			intro: z.string().min(1).max(240).optional().describe('Introduzione|Al massimo 240 caratteri'),
			items: z
				.array(
					z.object({
						label: z.string().min(1).max(30).describe('Nome della scheda|Corto, al massimo 30 caratteri'),
						text: z
							.string()
							.min(1)
							.max(600)
							.describe('Testo|Al massimo 600 caratteri; una riga vuota separa i paragrafi'),
						image: imageSchema(image).optional().describe('Foto|Obbligatoria per la variante testo-immagine'),
						cta: ctaSchema.optional().describe('Pulsante|Facoltativo, sotto il testo'),
					}),
				)
				.min(2)
				.max(6)
				.describe('Schede|Da 2 a 6'),
		})
		// rule: La variante testo-immagine richiede la foto in ogni scheda.
		.superRefine((props, ctx) => {
			if (props.variant !== 'testo-immagine') return;
			props.items.forEach((item, index) => {
				if (!item.image) {
					ctx.addIssue({ code: 'custom', message: 'la variante testo-immagine richiede image', path: ['items', index, 'image'] });
				}
			});
		});

export type TabsProps = BlockProps<typeof schema>;
