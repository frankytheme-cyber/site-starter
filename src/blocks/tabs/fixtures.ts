import cucina from '@/assets/images/fixtures/ristorante-cucina.jpg';
import piatto from '@/assets/images/fixtures/ristorante-piatto.jpg';
import sala from '@/assets/images/fixtures/ristorante-sala.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Attività di esempio: uno studio professionale (testo) e un ristorante (testo e immagine).
export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Testo',
		props: {
			variant: 'testo',
			eyebrow: 'Per chi lavoriamo',
			title: 'Ogni cliente ha esigenze diverse',
			items: [
				{
					label: 'Famiglie',
					text: 'Dichiarazione dei redditi, successioni e pratiche per la casa: raccogliamo noi i documenti e ti spieghiamo ogni voce.\n\nIl primo incontro per capire cosa ti serve è gratuito.',
					cta: { label: 'Fissa un appuntamento', href: '#appuntamento' },
				},
				{
					label: 'Professionisti',
					text: 'Partita IVA, regime forfettario o ordinario, fatture elettroniche e contributi: ti diciamo quanto mettere da parte ogni mese per le tasse.',
				},
				{
					label: 'Imprese',
					text: 'Contabilità, bilanci, buste paga e rapporti con la banca, con un referente fisso che conosce la tua attività.',
				},
			],
		},
	},
	{
		name: 'Testo e immagine',
		tone: 'muted',
		props: {
			variant: 'testo-immagine',
			title: 'Pranzo, cena e cucina a vista',
			intro: 'Una sola cucina, tre modi di stare a tavola.',
			items: [
				{
					label: 'Pranzo',
					text: 'Menu del giorno con primo, secondo e caffè, pensato per chi ha un’ora di pausa.',
					image: { src: piatto, alt: 'Piatto di pasta al pomodoro visto dall’alto, con forchetta e coltello su una tovaglia a quadri' },
				},
				{
					label: 'Cena',
					text: 'Piatti della tradizione e proposte di stagione, con una carta dei vini della zona.',
					image: { src: sala, alt: 'Sala di un ristorante con tre tavoli apparecchiati sotto lampade a sospensione' },
					cta: { label: 'Prenota un tavolo', href: '#prenota', icon: 'calendario' },
				},
				{
					label: 'La cucina',
					text: 'Pasta fresca tirata ogni mattina e sughi che cuociono piano, sotto gli occhi dei clienti.',
					image: { src: cucina, alt: 'Cucina professionale con una pentola che fuma e una padella sui fornelli' },
				},
			],
		},
	},
];
