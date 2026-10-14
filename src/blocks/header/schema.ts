import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';

/*
 * Solo l'aspetto: nome, logo e telefono arrivano da src/content/settings/site.json,
 * le voci del menu e la CTA da src/content/settings/navigation.json.
 */
export const schema = () =>
	z.object({
		variant: z
			.enum(['semplice', 'con-cta'])
			.describe('Variante|semplice: logo e menu · con-cta: aggiunge il pulsante in evidenza del «Menu»'),
		/** Resta in cima durante lo scroll e si compatta dopo 80px. */
		sticky: z.boolean().describe('Resta in cima|L’intestazione resta visibile mentre si scorre la pagina'),
		/** testo: nome dell'attività · immagine: il logo indicato in site.json. */
		logo: z
			.enum(['testo', 'immagine'])
			.describe('Logo|testo: il nome dell’attività · immagine: il logo caricato in «Dati attività»'),
	});

export type HeaderProps = BlockProps<typeof schema>;
