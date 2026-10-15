import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';

export const schema = () =>
	z.object({
		variant: z
			.enum(['faq', 'contenuti'])
			.describe('Variante|faq: domande e risposte, segnalate anche a Google · contenuti: sezioni di testo da aprire, accanto al titolo'),
		eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo'),
		title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
		intro: z.string().min(1).max(240).optional().describe('Introduzione|Al massimo 240 caratteri'),
		items: z
			.array(
				z.object({
					title: z.string().min(1).max(120).describe('Domanda o titolo|Al massimo 120 caratteri'),
					text: z
						.string()
						.min(1)
						.max(1200)
						.describe('Risposta o testo|Al massimo 1200 caratteri; una riga vuota separa i paragrafi'),
				}),
			)
			.min(2)
			.max(12)
			.describe('Voci|Da 2 a 12'),
		single: z.boolean().default(false).describe('Una alla volta|Aprendo una voce si chiudono le altre'),
	});

export type AccordionProps = BlockProps<typeof schema>;
