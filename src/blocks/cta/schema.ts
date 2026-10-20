import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';
import { ctaSchema } from '@/core/ui/button/cta';

export const schema = () =>
	z.object({
		variant: z
			.enum(['banner', 'split-contatto'])
			.describe('Variante|banner: testo centrato e pulsanti · split-contatto: testo a sinistra, pulsanti a destra'),
		title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
		text: z.string().min(1).max(200).optional().describe('Testo|Una o due frasi, al massimo 200 caratteri'),
		primary: ctaSchema.describe('Pulsante principale|L’azione che chiedi di fare'),
		secondary: ctaSchema
			.optional()
			.describe('Pulsante secondario|Un’alternativa: compila testo e link, oppure nessuno dei due'),
		/** Mostra telefono e WhatsApp dell'attività, letti da src/content/settings/site.json: qui non si scrivono. */
		showContacts: z
			.boolean()
			.describe('Mostra telefono e WhatsApp|Aggiunge i pulsanti con i recapiti presi da «Dati attività»'),
		/** Testi dei pulsanti dei recapiti, con showContacts: senza, «Chiama <numero>» e «Scrivici su WhatsApp». */
		phoneLabel: z
			.string()
			.min(1)
			.max(25)
			.optional()
			.describe('Testo del pulsante Chiama|Solo con i recapiti in vista; vuoto: «Chiama» seguito dal numero. Senza numeri scritti a mano'),
		whatsappLabel: z
			.string()
			.min(1)
			.max(25)
			.optional()
			.describe('Testo del pulsante WhatsApp|Solo con i recapiti in vista; vuoto: «Scrivici su WhatsApp»'),
	});

export type CtaProps = BlockProps<typeof schema>;
