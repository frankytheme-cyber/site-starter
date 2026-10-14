import { z } from 'astro/zod';
import { imageSchema } from '@/core/images';

const cta = z.object({
	label: z.string().min(1).max(25),
	href: z.string().min(1),
});

export const schema = z
	.object({
		variant: z.enum(['split', 'full', 'centered']),
		eyebrow: z.string().min(1).optional(),
		title: z.string().min(1).max(70),
		subtitle: z.string().min(1).max(200).optional(),
		primaryCta: cta,
		secondaryCta: cta.optional(),
		/** Obbligatoria per split e full; centered non la mostra. */
		image: imageSchema.optional(),
	})
	.refine((props) => props.variant === 'centered' || props.image, {
		message: 'le varianti split e full richiedono image',
		path: ['image'],
	});

export type HeroProps = z.infer<typeof schema>;
