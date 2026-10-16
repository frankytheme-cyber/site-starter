import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Recensioni di prova: in un sito vanno solo recensioni vere, copiate dalla fonte.
const reviews = [
	{
		quote: 'Puntuali e precisi. Mi hanno spiegato tutto prima di iniziare e il lavoro è finito nei tempi.',
		author: 'Marco R.',
		role: 'Cliente da 3 anni',
		rating: 5,
		fonte: 'Google, marzo 2025',
	},
	{
		quote: 'Gentili e disponibili anche dopo la consegna. Rifarei tutto con loro.',
		author: 'Giulia B.',
		rating: 5,
		fonte: 'Facebook, gennaio 2025',
	},
	{
		quote: 'Un preventivo chiaro e nessuna sorpresa a fine lavori. Consigliati.',
		author: 'Paolo S.',
		role: 'Titolare di un negozio',
		fonte: 'Messaggio WhatsApp, febbraio 2025',
	},
	{
		quote: 'Hanno risolto in un pomeriggio un problema che altri non riuscivano a sistemare.',
		author: 'Elena T.',
		rating: 4,
		fonte: 'Google, dicembre 2024',
	},
];

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Cards',
		props: { variant: 'cards', eyebrow: 'Dicono di noi', title: 'Cosa raccontano i clienti', items: reviews.slice(0, 3) },
	},
	{
		name: 'Singola',
		tone: 'muted',
		props: { variant: 'singola', title: 'Un cliente racconta', items: [{ ...reviews[0], href: 'https://example.com/' }] },
	},
	{
		name: 'Slider',
		props: { variant: 'slider', title: 'Le parole di chi ci ha scelto', items: reviews },
	},
];
