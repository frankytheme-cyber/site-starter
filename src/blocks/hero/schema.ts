import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';
import { ctaSchema } from '@/core/ui/button/cta';

/** Una slide della variante slider dalla seconda in poi: la prima sono i campi della hero. */
const slideSchema = (image: SchemaContext['image']) =>
	z.object({
		eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo della slide'),
		title: z.string().min(1).max(70).describe('Titolo|Il titolo della slide, al massimo 70 caratteri'),
		subtitle: z.string().min(1).max(200).optional().describe('Sottotitolo|Una o due frasi, al massimo 200 caratteri'),
		cta: ctaSchema.optional().describe('Pulsante|Facoltativo: l’azione legata a questa slide'),
		image: imageSchema(image).describe('Foto|La foto della slide, sotto il testo bianco con la velatura scelta'),
	});

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['split', 'full', 'centered', 'slider'])
				.describe(
					'Variante|split: testo e foto affiancati · full: foto a tutta larghezza · centered: solo testo · slider: da 2 a 5 foto con testo, da sfogliare',
				),
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
			/** Obbligatoria per split, full e slider (la prima slide); centered non la mostra. */
			image: imageSchema(image).optional().describe('Foto|Obbligatoria per le varianti split, full e slider (nello slider è la prima slide)'),
			/** Solo per split: il formato della foto su desktop (su mobile è sempre 4:3). */
			imageShape: z
				.enum(['verticale', 'orizzontale'])
				.meta({ optionLabels: { verticale: 'Verticale (4:5)', orizzontale: 'Orizzontale (4:3)' } })
				.default('verticale')
				.describe('Formato della foto|Solo per la variante split, su desktop: verticale (4:5) oppure orizzontale (4:3), per non tagliare una foto larga'),
			/** Per full e slider: la velatura sulla foto, sotto il testo bianco (src/themes/overlays.css). */
			overlay: z
				.enum(['scura', 'colorata'])
				.meta({ optionLabels: { scura: 'Scura', colorata: 'Colorata' } })
				.default('scura')
				.describe('Velatura|Sopra la foto delle varianti full e slider: scura (nera) o colorata (col colore principale del sito); il testo resta bianco e leggibile'),
			/** Solo per slider: le slide dopo la prima, che usa i campi qui sopra. */
			slides: z
				.array(slideSchema(image))
				.min(1)
				.max(4)
				.optional()
				.describe('Altre slide|Solo per la variante slider: da 1 a 4 slide dopo la prima (che usa titolo, testi, pulsanti e foto qui sopra)'),
		})
		// rule: Le varianti split, full e slider richiedono la foto (image).
		.refine((props) => props.variant === 'centered' || props.image, {
			message: 'le varianti split, full e slider richiedono image',
			path: ['image'],
		})
		// rule: La variante slider richiede almeno un’altra slide (slides).
		.refine((props) => props.variant !== 'slider' || (props.slides?.length ?? 0) > 0, {
			message: 'la variante slider richiede slides, da 1 a 4',
			path: ['slides'],
		});

export type HeroProps = BlockProps<typeof schema>;
