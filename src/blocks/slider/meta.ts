import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'slider',
	name: 'Slider',
	description:
		'Apertura con da 2 a 5 foto a tutta larghezza, velatura e testo bianco, una alla volta: si sfogliano con frecce, pallini, dito o tastiera e non scorrono mai da sole. Il titolo della prima slide è l’h1.',
	whenToUse:
		'Come primo blocco della home, al posto della hero, quando l’attività ha più servizi o ambienti da mettere in evidenza subito e una foto di qualità per ognuno.',
	avoidWhen:
		'Con una foto sola (hero full), con foto piccole o confuse, o a metà pagina: contiene l’h1. Per mostrare lavori o locali più in basso usa gallery.',
	category: 'apertura',
	scope: 'page',
	backgrounds: ['pieno', 'sfumato', 'alone', 'aurora', 'decoro'],
	interactive: true,
	version: '1.0.0',
	source: { from: 'originale' },
	variants: {
		scorrimento: {
			description: 'Le slide scorrono di lato, come un carosello: si trascinano col dito o col trackpad.',
			whenToUse: 'Quasi sempre: chi visita capisce subito che ci sono altre foto e le sfoglia col dito.',
		},
		dissolvenza: {
			description: 'Le slide restano ferme e una sfuma nell’altra; col dito si passa alla successiva con uno swipe.',
			whenToUse: 'Per attività dal tono calmo o elegante (ristoranti, benessere, studi), con foto simili per luce e inquadratura.',
		},
	},
	rules: ['Il pulsante secondario di una slide va solo insieme al principale (primaryCta).'],
	fieldRules: {
		'slides[].secondaryCta': { note: 'Solo insieme a slides[].primaryCta.' },
		arrows: { note: 'Con lati, sotto i 768 px le frecce vanno sotto la foto, per non coprire il testo.' },
		animation: { note: 'Con il movimento ridotto i testi compaiono subito, senza animazione.' },
	},
};
