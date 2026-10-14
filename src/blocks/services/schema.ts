import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { ICON_NAMES } from '@/core/icons';
import { imageSchema } from '@/core/images';

const link = z.object({
	label: z.string().min(1).max(25),
	href: z.string().min(1),
});

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z.enum(['cards-icone', 'cards-immagine', 'alternato']),
			eyebrow: z.string().min(1).optional(),
			title: z.string().min(1).max(70),
			intro: z.string().min(1).max(240).optional(),
			items: z
				.array(
					z.object({
						/** Obbligatoria per cards-icone; le altre varianti non la mostrano. */
						icon: z.enum(ICON_NAMES).optional(),
						/** Obbligatoria per cards-immagine e alternato; cards-icone non la mostra. */
						image: imageSchema(image).optional(),
						title: z.string().min(1).max(50),
						text: z.string().min(1).max(180),
						link: link.optional(),
					}),
				)
				.min(2)
				.max(6),
		})
		.superRefine((props, ctx) => {
			const needsIcon = props.variant === 'cards-icone';
			props.items.forEach((item, index) => {
				if (needsIcon && !item.icon) {
					ctx.addIssue({ code: 'custom', message: 'la variante cards-icone richiede icon', path: ['items', index, 'icon'] });
				}
				if (!needsIcon && !item.image) {
					ctx.addIssue({
						code: 'custom',
						message: `la variante ${props.variant} richiede image`,
						path: ['items', index, 'image'],
					});
				}
			});
		});

export type ServicesProps = BlockProps<typeof schema>;
