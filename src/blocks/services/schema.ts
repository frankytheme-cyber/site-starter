import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { ICON_NAMES } from '@/core/icons';
import { imageSchema } from '@/core/images';
import { ctaSchema } from '@/core/ui/button/cta';

export const schema = ({ image }: SchemaContext) =>
	z
		.object({
			variant: z
				.enum(['cards-icone', 'cards-immagine', 'alternato', 'schede'])
				.describe('Variante|cards-icone: card con icona · cards-immagine: card con foto · alternato: righe di foto e testo · schede: un servizio per scheda'),
			eyebrow: z.string().min(1).optional().describe('Occhiello|Breve testo sopra il titolo'),
			title: z.string().min(1).max(70).describe('Titolo|Titolo della sezione, al massimo 70 caratteri'),
			intro: z
				.string()
				.min(1)
				.max(240)
				.optional()
				.describe('Introduzione|Una frase che presenta i servizi, al massimo 240 caratteri'),
			items: z
				.array(
					z.object({
						/** Obbligatoria per cards-icone; le altre varianti non la mostrano. */
						icon: z.enum(ICON_NAMES).optional().describe('Icona|Obbligatoria per la variante cards-icone'),
						/** Obbligatoria per cards-immagine e alternato; cards-icone non la mostra. */
						image: imageSchema(image)
							.optional()
							.describe('Foto|Obbligatoria per le varianti cards-immagine e alternato; facoltativa nelle schede'),
						title: z.string().min(1).max(50).describe('Nome del servizio|Al massimo 50 caratteri'),
						text: z.string().min(1).max(180).describe('Descrizione|Cosa comprende il servizio, al massimo 180 caratteri'),
						link: ctaSchema
							.optional()
							.describe('Link|Porta alla pagina o alla sezione del servizio: compila testo e link, oppure nessuno dei due'),
					}),
				)
				.min(2)
				.max(6)
				.describe('Servizi|Da 2 a 6 servizi'),
		})
		// rule: La variante cards-icone richiede l’icona in ogni servizio.
		// rule: Le varianti cards-immagine e alternato richiedono la foto in ogni servizio.
		.superRefine((props, ctx) => {
			const needsIcon = props.variant === 'cards-icone';
			const needsImage = props.variant === 'cards-immagine' || props.variant === 'alternato';
			props.items.forEach((item, index) => {
				if (needsIcon && !item.icon) {
					ctx.addIssue({ code: 'custom', message: 'la variante cards-icone richiede icon', path: ['items', index, 'icon'] });
				}
				if (needsImage && !item.image) {
					ctx.addIssue({
						code: 'custom',
						message: `la variante ${props.variant} richiede image`,
						path: ['items', index, 'image'],
					});
				}
			});
		});

export type ServicesProps = BlockProps<typeof schema>;
