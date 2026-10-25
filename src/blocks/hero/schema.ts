import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';
import { ctaSchema } from '@/core/ui/button/cta';

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['split', 'full', 'centered', 'editoriale', 'manifesto'])
				.describe('Variante|split: testo e foto affiancati · full: foto a tutta larghezza · centered: testo centrato · editoriale: titolo e introduzione su colonne · manifesto: titolo grande e azioni sotto'),
			eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo, es. il settore'),
			title: z.string().min(1).max(70).describe('Titolo|Il titolo principale della pagina, al massimo 70 caratteri'),
			subtitle: z
				.string()
				.min(1)
				.max(200)
				.optional()
				.describe('Sottotitolo|Una o due frasi su cosa offri, al massimo 200 caratteri'),
			primaryCta: ctaSchema.describe('Pulsante principale|L’azione più importante, es. «Chiedi un preventivo»'),
			secondaryCta: ctaSchema
				.optional()
				.describe('Pulsante secondario|Un’alternativa meno importante: compila testo e link, oppure nessuno dei due'),
			/** Obbligatoria per split e full; le varianti testuali non la mostrano. */
			image: imageSchema(image).optional().describe('Foto|Obbligatoria per le varianti split e full'),
			/** Solo per split: il formato della foto su desktop (su mobile è sempre 4:3). */
			imageShape: z
				.enum(['verticale', 'orizzontale'])
				.meta({ optionLabels: { verticale: 'Verticale (4:5)', orizzontale: 'Orizzontale (4:3)' } })
				.default('verticale')
				.describe('Formato della foto|Solo per la variante split, su desktop: verticale (4:5) oppure orizzontale (4:3), per non tagliare una foto larga'),
			/** Solo per full: la velatura sulla foto, sotto il testo bianco (src/themes/overlays.css). */
			overlay: z
				.enum(['scura', 'colorata'])
				.meta({ optionLabels: { scura: 'Scura', colorata: 'Colorata' } })
				.default('scura')
				.describe('Velatura|Sopra la foto della variante full: scura (nera) o colorata (col colore principale del sito); il testo resta bianco e leggibile'),
		})
		// rule: Le varianti split e full richiedono la foto (image).
		.refine((props) => !['split', 'full'].includes(props.variant) || Boolean(props.image), {
			message: 'le varianti split e full richiedono image',
			path: ['image'],
		});

export type HeroProps = BlockProps<typeof schema>;
