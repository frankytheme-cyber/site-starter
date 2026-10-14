import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';

const action = z.object({
	label: z.string().min(1).max(25).describe('Testo del pulsante|Al massimo 25 caratteri'),
	href: z
		.string()
		.min(1)
		.describe('Link|Una pagina del sito (/contatti/), una sezione (#preventivo) o un indirizzo completo'),
});

export const schema = () =>
	z.object({
		variant: z
			.enum(['banner', 'split-contatto'])
			.describe('Variante|banner: testo centrato e pulsanti · split-contatto: testo a sinistra, pulsanti a destra'),
		title: z.string().min(1).max(70).describe('Titolo|Al massimo 70 caratteri'),
		text: z.string().min(1).max(200).optional().describe('Testo|Una o due frasi, al massimo 200 caratteri'),
		primary: action.describe('Pulsante principale|L’azione che chiedi di fare'),
		secondary: action
			.optional()
			.describe('Pulsante secondario|Un’alternativa: compila testo e link, oppure nessuno dei due'),
		/** Mostra telefono e WhatsApp dell'attività, letti da src/content/settings/site.json: qui non si scrivono. */
		showContacts: z
			.boolean()
			.describe('Mostra telefono e WhatsApp|Aggiunge i pulsanti con i recapiti presi da «Dati attività»'),
	});

export type CtaProps = BlockProps<typeof schema>;
