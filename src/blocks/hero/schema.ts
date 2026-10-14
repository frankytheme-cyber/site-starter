import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';

const cta = z.object({
	label: z.string().min(1).max(25).describe('Testo del pulsante|Al massimo 25 caratteri'),
	href: z
		.string()
		.min(1)
		.describe('Link|Una pagina del sito (/contatti/), una sezione (#preventivo) o un indirizzo completo'),
});

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['split', 'full', 'centered'])
				.describe('Variante|split: testo e foto affiancati · full: foto a tutta larghezza · centered: solo testo'),
			eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo, es. il settore'),
			title: z.string().min(1).max(70).describe('Titolo|Il titolo principale della pagina, al massimo 70 caratteri'),
			subtitle: z
				.string()
				.min(1)
				.max(200)
				.optional()
				.describe('Sottotitolo|Una o due frasi su cosa offri, al massimo 200 caratteri'),
			primaryCta: cta.describe('Pulsante principale|L’azione più importante, es. «Chiedi un preventivo»'),
			secondaryCta: cta
				.optional()
				.describe('Pulsante secondario|Un’alternativa meno importante: compila testo e link, oppure nessuno dei due'),
			/** Obbligatoria per split e full; centered non la mostra. */
			image: imageSchema(image).optional().describe('Foto|Obbligatoria per le varianti split e full'),
		})
		.refine((props) => props.variant === 'centered' || props.image, {
			message: 'le varianti split e full richiedono image',
			path: ['image'],
		});

export type HeroProps = BlockProps<typeof schema>;
