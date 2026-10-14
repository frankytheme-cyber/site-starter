import { z } from 'astro/zod';

/*
 * Solo l'aspetto: nome, logo e telefono arrivano da src/content/settings/site.json,
 * le voci del menu e la CTA da src/content/settings/navigation.json.
 */
export const schema = z.object({
	variant: z.enum(['semplice', 'con-cta']),
	/** Resta in cima durante lo scroll e si compatta dopo 80px. */
	sticky: z.boolean(),
	/** testo: nome dell'attività · immagine: il logo indicato in site.json. */
	logo: z.enum(['testo', 'immagine']),
});

export type HeaderProps = z.infer<typeof schema>;
