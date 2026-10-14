import { z } from 'astro/zod';
import type { BlockProps, SiteProps } from '@/core/block-types';

/*
 * Solo l'aspetto, scelto in src/content/settings/layout.json (chiave footer): nome, recapiti,
 * orari, social e dati legali arrivano da src/content/settings/site.json, i link da
 * src/content/settings/navigation.json (gruppo footer), il credito da src/site.config.ts.
 */
export const schema = () =>
	z.object({
		variant: z
			.enum(['colonne', 'minimale'])
			.describe('Variante|colonne: logo, link, contatti, orari e social · minimale: una riga con nome, P.IVA, link legali e social'),
		/** Fascia tone primary sopra il footer, con i pulsanti Chiama e WhatsApp. */
		ctaBand: z.boolean().describe('Fascia di contatto|Sopra il footer, un titolo con i pulsanti per chiamare e scrivere su WhatsApp'),
		ctaBandTitle: z
			.string()
			.min(1)
			.max(70)
			.optional()
			.describe('Titolo della fascia|Al massimo 70 caratteri; vuoto: «Parliamo del tuo progetto»'),
	});

export type FooterProps = BlockProps<typeof schema> & SiteProps;
