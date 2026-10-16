import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';

export const schema = () =>
	z
		.object({
			variant: z
				.enum(['cards', 'singola', 'slider'])
				.describe('Variante|cards: recensioni in griglia · singola: una sola recensione in evidenza · slider: recensioni che si sfogliano'),
			eyebrow: z.string().min(1).max(40).optional().describe('Occhiello|Breve testo sopra il titolo'),
			title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
			items: z
				.array(
					z.object({
						quote: z.string().min(10).max(400).describe('Recensione|Le parole del cliente, copiate senza cambiarle, al massimo 400 caratteri'),
						author: z.string().min(1).max(60).describe('Autore|Come firma la recensione, es. «Marco R.»'),
						role: z.string().min(1).max(60).optional().describe('Chi è|Facoltativo, es. «cliente da 5 anni»'),
						rating: z.number().int().min(1).max(5).optional().describe('Stelle|Facoltativo, da 1 a 5, solo se la recensione le riporta'),
						fonte: z
							.string()
							.min(2)
							.max(60)
							.describe('Fonte|Obbligatoria: dove è stata scritta, es. «Google, marzo 2025» o «messaggio WhatsApp»'),
						href: z.url().optional().describe('Link alla recensione|Facoltativo, indirizzo completo della recensione originale'),
					}),
				)
				.min(1)
				.max(10)
				.describe('Recensioni|Solo recensioni reali, ognuna con la sua fonte'),
		})
		// rule: La variante singola vuole una sola recensione, cards da 2 a 6, slider da 3 a 10.
		.superRefine((props, ctx) => {
			const range = { singola: [1, 1], cards: [2, 6], slider: [3, 10] }[props.variant];
			if (props.items.length < range[0] || props.items.length > range[1]) {
				ctx.addIssue({
					code: 'custom',
					message: `la variante ${props.variant} vuole ${range[0] === range[1] ? range[0] : `da ${range[0]} a ${range[1]}`} recensioni`,
					path: ['items'],
				});
			}
		});

export type TestimonialsProps = BlockProps<typeof schema>;
