import { z } from 'astro/zod';
import type { BlockProps, SiteProps } from '@/core/block-types';
import { ctaSchema } from '@/core/ui/button/cta';

/*
 * Solo titolo, testo e opzioni: telefono, WhatsApp, email, indirizzo e orari arrivano da
 * src/content/settings/site.json (getSiteSettings), mai dallo schema.
 */
export const schema = () =>
	z
		.object({
			variant: z
				.enum(['info-mappa', 'info-cta'])
				.describe('Variante|info-mappa: recapiti e orari con la mappa al clic · info-cta: recapiti e orari con un pulsante d’azione'),
			title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
			text: z.string().min(1).max(200).optional().describe('Testo|Una o due frasi, al massimo 200 caratteri'),
			showHours: z.boolean().describe('Mostra gli orari|Aggiunge gli orari di apertura presi da «Dati attività»'),
			cta: ctaSchema.optional().describe('Pulsante|L’azione che chiedi di fare, es. «Chiedi un preventivo»; serve nella variante info-cta'),
		})
		// rule: La variante info-cta richiede il pulsante (cta).
		.refine((props) => props.variant !== 'info-cta' || props.cta, {
			message: 'La variante info-cta richiede il pulsante (cta)',
			path: ['cta'],
		});

export type ContactProps = BlockProps<typeof schema> & SiteProps;
