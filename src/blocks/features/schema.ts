import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { iconSchema } from '@/core/icons';

export const schema = () =>
	z.object({
		variant: z
			.enum(['3-colonne', 'lista'])
			.describe('Variante|3-colonne: griglia di punti con icona · lista: titolo a sinistra, elenco di punti a destra'),
		eyebrow: z.string().min(1).max(40).optional().describe('Occhiello|Breve testo sopra il titolo'),
		title: z.string().min(1).max(70).describe('Titolo|Titolo della sezione, al massimo 70 caratteri'),
		intro: z.string().min(1).max(240).optional().describe('Introduzione|Una frase che presenta i punti, al massimo 240 caratteri'),
		items: z
			.array(
				z.object({
					icon: iconSchema().describe('Icona|Scegli l’icona che richiama il punto di forza'),
					title: z.string().min(1).max(50).describe('Titolo del punto|Al massimo 50 caratteri'),
					text: z.string().min(1).max(160).describe('Descrizione|Una o due frasi, al massimo 160 caratteri'),
				}),
			)
			.min(3)
			.max(6)
			.describe('Punti di forza|Da 3 a 6 punti'),
	});

export type FeaturesProps = BlockProps<typeof schema>;
