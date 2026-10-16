import { z } from 'astro/zod';
import type { BlockProps, SiteProps } from '@/core/block-types';

export const schema = () =>
	z.object({
		variant: z.enum(['elenco-zone', 'mappa-link']).describe('Variante|elenco-zone: lista delle zone servite · mappa-link: lista con indirizzo e link alla mappa della sede'),
		title: z.string().trim().min(1).max(70).describe('Titolo|Titolo della sezione, al massimo 70 caratteri'),
		intro: z.string().trim().min(1).max(240).optional().describe('Introduzione|Spiega dove è disponibile il servizio, al massimo 240 caratteri'),
		items: z.array(
			z.object({
				name: z.string().trim().min(1).max(70).describe('Zona|Comune, quartiere o territorio realmente servito, al massimo 70 caratteri'),
				text: z.string().trim().min(1).max(160).optional().describe('Dettaglio|Eventuali condizioni del servizio nella zona, al massimo 160 caratteri'),
			}),
		).min(1).max(18).describe('Zone servite|Da 1 a 18 zone; indica solo territori realmente coperti, senza ripetere i recapiti dell’attività'),
	});

export type AreasProps = BlockProps<typeof schema> & SiteProps;
