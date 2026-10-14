import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Le voci e i recapiti mostrati vengono da navigation.json e site.json, non da qui.
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Semplice, logo testo',
		props: { variant: 'semplice', sticky: false, logo: 'testo' },
	},
	{
		name: 'Semplice, logo immagine, sticky',
		props: { variant: 'semplice', sticky: true, logo: 'immagine' },
	},
	{
		name: 'Con CTA, logo immagine',
		props: { variant: 'con-cta', sticky: false, logo: 'immagine' },
	},
	{
		name: 'Con CTA, logo testo, sticky',
		props: { variant: 'con-cta', sticky: true, logo: 'testo' },
	},
];
