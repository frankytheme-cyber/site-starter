import type { BlockFixture } from '@/core/block-types';
import { fixtures as contacts } from '../contact/fixtures';
import type { schema } from './schema';

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Richiesta di informazioni',
		props: { variant: 'contatto', title: 'Raccontaci la tua idea', text: 'Hai una domanda o un progetto in mente? Scrivici cosa vorresti realizzare e come possiamo aiutarti.', privacyHref: '/privacy/' },
		site: contacts[0].site,
	},
	{
		name: 'Richiesta di preventivo', tone: 'muted',
		props: { variant: 'preventivo', title: 'Partiamo dal tuo progetto', text: 'Scegli il servizio e raccontaci il lavoro. Indica il comune per aiutarci a organizzare un eventuale sopralluogo.', services: ['Mobili su misura', 'Restauro', 'Riparazioni'], privacyHref: '/privacy/', submitLabel: 'Richiedi un preventivo' },
		site: contacts[0].site,
	},
	{
		name: 'Contatto su tono primario', tone: 'primary',
		props: { variant: 'contatto', title: 'Parliamone insieme', privacyHref: '/privacy/' },
		site: contacts[0].site,
	},
];

fixtures.push({ ...fixtures[0], name: 'Contatto con occhiello personalizzato', props: { ...fixtures[0].props, title: 'Parliamo del tuo progetto', eyebrow: 'Il tuo progetto inizia qui' } });
