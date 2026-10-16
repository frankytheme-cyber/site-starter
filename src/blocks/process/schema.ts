import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { ctaSchema } from '@/core/ui/button/cta';

export const schema = () =>
	z.object({
		variant: z
			.enum(['passi-numerati', 'timeline'])
			.describe('Variante|passi-numerati: griglia di passi con il numero · timeline: passi in colonna lungo una linea verticale'),
		eyebrow: z.string().min(1).max(40).optional().describe('Occhiello|Breve testo sopra il titolo'),
		title: z.string().min(1).max(70).describe('Titolo|Titolo della sezione, al massimo 70 caratteri'),
		intro: z.string().min(1).max(240).optional().describe('Introduzione|Una frase che presenta il percorso, al massimo 240 caratteri'),
		steps: z
			.array(
				z.object({
					title: z.string().min(1).max(50).describe('Titolo del passo|Al massimo 50 caratteri'),
					text: z.string().min(1).max(200).describe('Descrizione|Cosa succede in questo passo, al massimo 200 caratteri'),
					timing: z.string().min(1).max(30).optional().describe('Tempi|Facoltativo, es. «In giornata» o «Entro 3 giorni»; solo se il tempo è reale'),
				}),
			)
			.min(3)
			.max(6)
			.describe('Passi|Da 3 a 6 passi, nell’ordine in cui avvengono'),
		cta: ctaSchema.optional().describe('Pulsante|Facoltativo, dopo l’ultimo passo, es. «Chiedi un preventivo»'),
	});

export type ProcessProps = BlockProps<typeof schema>;
