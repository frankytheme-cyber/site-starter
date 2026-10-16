import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['griglia-popup', 'prima-dopo', 'slider'])
				.describe(
					'Variante|griglia-popup: miniature che si ingrandiscono al clic · prima-dopo: coppie di foto da confrontare · slider: una foto grande alla volta',
				),
			eyebrow: z.string().min(1).max(40).optional().describe('Occhiello|Breve testo sopra il titolo'),
			title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
			intro: z.string().min(1).max(240).optional().describe('Introduzione|Al massimo 240 caratteri'),
			items: z
				.array(
					z.object({
						image: imageSchema(image).describe('Foto|Solo foto reali dei lavori; nel prima-dopo è la foto «dopo»'),
						before: imageSchema(image).optional().describe('Foto «prima»|Obbligatoria per la variante prima-dopo, stessa inquadratura del «dopo»'),
						caption: z.string().min(1).max(100).optional().describe('Didascalia|Dove e cosa, al massimo 100 caratteri'),
					}),
				)
				.min(2)
				.max(12)
				.describe('Foto|Da 2 a 12, solo foto reali'),
		})
		// rule: La variante prima-dopo richiede la foto «prima» (before) in ogni elemento e al massimo 6 coppie.
		.superRefine((props, ctx) => {
			if (props.variant !== 'prima-dopo') return;
			if (props.items.length > 6) ctx.addIssue({ code: 'custom', message: 'la variante prima-dopo ammette al massimo 6 coppie', path: ['items'] });
			props.items.forEach((item, index) => {
				if (!item.before) ctx.addIssue({ code: 'custom', message: 'la variante prima-dopo richiede la foto before', path: ['items', index, 'before'] });
			});
		});

export type GalleryProps = BlockProps<typeof schema>;
