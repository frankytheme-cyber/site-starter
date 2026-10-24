import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { imageSchema } from '@/core/images';
import { ctaSchema } from '@/core/ui/button/cta';

/** Una slide: foto a tutta larghezza con velatura e testo bianco sopra. */
const slideSchema = (image: SchemaContext['image']) =>
	z.object({
		eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo della slide'),
		title: z
			.string()
			.min(1)
			.max(70)
			.describe('Titolo|Il titolo della slide, al massimo 70 caratteri; quello della prima è il titolo principale della pagina'),
		subtitle: z.string().min(1).max(200).optional().describe('Sottotitolo|Una o due frasi, al massimo 200 caratteri'),
		primaryCta: ctaSchema.optional().describe('Pulsante principale|Facoltativo: l’azione legata a questa slide'),
		secondaryCta: ctaSchema
			.optional()
			.describe('Pulsante secondario|Un’alternativa meno importante, solo insieme al pulsante principale'),
		image: imageSchema(image).describe('Foto|La foto della slide, sotto il testo bianco con la velatura scelta'),
	});

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['scorrimento', 'dissolvenza'])
				.describe('Variante|scorrimento: le slide scorrono di lato · dissolvenza: una slide sfuma nell’altra'),
			slides: z
				.array(slideSchema(image))
				.min(2)
				.max(5)
				.describe('Slide|Da 2 a 5, una alla volta; la prima è quella che si vede all’apertura della pagina'),
			arrows: z
				.enum(['sotto', 'lati', 'nessuna'])
				.meta({ optionLabels: { sotto: 'Sotto, accanto ai pallini', lati: 'Ai lati della foto', nessuna: 'Nessuna, solo pallini' } })
				.default('sotto')
				.describe(
					'Frecce|sotto: a destra sotto la foto, con i pallini · lati: sopra la foto, a sinistra e a destra (sotto su mobile) · nessuna: solo pallini, dito e tastiera',
				),
			animation: z
				.enum(['sale', 'dissolvenza', 'nessuna'])
				.meta({ optionLabels: { sale: 'Sale dal basso', dissolvenza: 'Dissolvenza', nessuna: 'Nessuna' } })
				.default('sale')
				.describe(
					'Animazione dei testi|Come entrano titolo, testi e pulsanti a ogni slide: salgono dal basso, compaiono in dissolvenza o nessuna; mai con il movimento ridotto',
				),
			/** La velatura sulle foto, sotto il testo bianco (src/themes/overlays.css). */
			overlay: z
				.enum(['scura', 'colorata'])
				.meta({ optionLabels: { scura: 'Scura', colorata: 'Colorata' } })
				.default('scura')
				.describe('Velatura|Sopra le foto: scura (nera) o colorata (col colore principale del sito); il testo resta bianco e leggibile'),
		})
		// rule: Il pulsante secondario di una slide va solo insieme al principale (primaryCta).
		.superRefine((props, ctx) => {
			props.slides.forEach((slide, index) => {
				if (slide.secondaryCta && !slide.primaryCta) {
					ctx.addIssue({
						code: 'custom',
						message: 'il pulsante secondario richiede il principale',
						path: ['slides', index, 'primaryCta'],
					});
				}
			});
		});

export type SliderProps = BlockProps<typeof schema>;
