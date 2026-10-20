import { z } from 'astro/zod';
import type { BlockProps, SiteProps } from '@/core/block-types';

export const schema = () =>
	z.object({
		variant: z.enum(['contatto', 'preventivo']).describe('Variante|contatto: nome, email, telefono e messaggio · preventivo: aggiunge servizio e comune dell’intervento'),
		eyebrow: z.string().trim().min(1).max(40).optional().describe('Occhiello|Breve testo sopra il titolo, al massimo 40 caratteri; vuoto: «Scrivici» o, nel preventivo, «Il tuo prossimo progetto»'),
		title: z.string().trim().min(1).max(70).describe('Titolo|Titolo della sezione, al massimo 70 caratteri'),
		text: z.string().trim().min(1).max(240).optional().describe('Introduzione|Spiega quali informazioni servono, senza promettere tempi di risposta non concordati'),
		services: z.array(z.string().trim().min(1).max(80).describe('Servizio|Nome di un servizio realmente offerto, al massimo 80 caratteri'))
			.min(1).max(12).optional().describe('Servizi richiesti|Da 1 a 12 opzioni per il preventivo; non vengono mostrate nel modulo contatto'),
		privacyHref: z.string().max(200).regex(/^\/(?!\/)[a-z0-9/-]*\/$/, 'percorso interno dell’informativa, es. /privacy/').describe('Informativa privacy|Percorso di una pagina privacy esistente, es. /privacy/; il testo va approvato per il servizio di invio scelto'),
		submitLabel: z.string().trim().min(1).max(25).default('Invia la richiesta').describe('Testo del pulsante|L’azione richiesta, al massimo 25 caratteri'),
	})
	// rule: La variante preventivo richiede un elenco di servizi (services).
	.refine((props) => props.variant !== 'preventivo' || Boolean(props.services?.length), {
		message: 'La variante preventivo richiede un elenco di servizi (services)', path: ['services'],
	});

export type FormProps = BlockProps<typeof schema> & SiteProps;
