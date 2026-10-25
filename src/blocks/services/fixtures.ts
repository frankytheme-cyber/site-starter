import archivio from '@/assets/images/fixtures/studio-archivio.jpg';
import attrezzi from '@/assets/images/fixtures/artigiano-attrezzi.jpg';
import cucina from '@/assets/images/fixtures/ristorante-cucina.jpg';
import laboratorio from '@/assets/images/fixtures/artigiano-laboratorio.jpg';
import mobile from '@/assets/images/fixtures/artigiano-mobile.jpg';
import piatto from '@/assets/images/fixtures/ristorante-piatto.jpg';
import regalo from '@/assets/images/fixtures/negozio-regalo.jpg';
import riunione from '@/assets/images/fixtures/studio-riunione.jpg';
import sala from '@/assets/images/fixtures/ristorante-sala.jpg';
import scaffali from '@/assets/images/fixtures/negozio-scaffali.jpg';
import scrivania from '@/assets/images/fixtures/studio-scrivania.jpg';
import vetrina from '@/assets/images/fixtures/negozio-vetrina.jpg';
import type { BlockFixture } from '@/core/block-types';
import type { schema } from './schema';

// Ogni fixture è un'attività di esempio di un settore diverso: ristorante, impianti, negozio, studio, artigiano.
const images = {
	sala: { src: sala, alt: 'Sala di un ristorante con tre tavoli apparecchiati sotto lampade a sospensione' },
	piatto: { src: piatto, alt: 'Piatto di pasta al pomodoro visto dall’alto, con forchetta e coltello su una tovaglia a quadri' },
	cucina: { src: cucina, alt: 'Cucina professionale con una pentola che fuma e una padella sui fornelli' },
	vetrina: { src: vetrina, alt: 'Vetrina di una bottega con la tenda a righe bianche e rosse e la porta verde' },
	scaffali: { src: scaffali, alt: 'Scaffali di legno con barattoli e scatole colorate in fila' },
	regalo: { src: regalo, alt: 'Pacco regalo rosso con il fiocco giallo appoggiato sul banco' },
	scrivania: { src: scrivania, alt: 'Scrivania con computer portatile, lampada e una pianta in vaso' },
	riunione: { src: riunione, alt: 'Tavolo riunioni con quattro sedie e una lavagna con un grafico in crescita' },
	archivio: { src: archivio, alt: 'Libreria con file di raccoglitori colorati su tre ripiani' },
	laboratorio: { src: laboratorio, alt: 'Banco da lavoro in legno con martello, scalpello e sega appesi a un pannello forato' },
	attrezzi: { src: attrezzi, alt: 'Martello, cacciavite e metro giallo appoggiati su un piano di legno' },
	mobile: { src: mobile, alt: 'Credenza in legno a due ante con maniglie dorate, in una stanza chiara' },
};

export const fixtures: BlockFixture<typeof schema>[] = [
	{
		name: 'Schede',
		props: {
			variant: 'schede',
			eyebrow: 'Il ristorante',
			title: 'Pranzo, cena o una serata tutta per voi',
			intro: 'Ogni momento ha il suo menu e i suoi orari: qui trovi cosa proponiamo.',
			items: [
				{
					image: images.piatto,
					title: 'Pranzo di lavoro',
					text: 'Un primo, un secondo e il caffè in meno di un’ora, con piatti che cambiano ogni giorno in base al mercato.',
					link: { label: 'Prenota un tavolo', href: '#prenota' },
				},
				{
					image: images.sala,
					title: 'Cena alla carta',
					text: 'Pasta fatta in casa, carni alla brace e una carta dei vini con molte etichette della zona.',
				},
				{
					title: 'Feste ed eventi privati',
					text: 'Compleanni, cene aziendali e ricorrenze: riserviamo la sala e componiamo il menu con te.',
					link: { label: 'Scrivici su WhatsApp', href: '@whatsapp', icon: 'whatsapp', style: 'secondary' },
				},
			],
		},
	},
	{
		name: 'Card con icona',
		props: {
			variant: 'cards-icone',
			eyebrow: 'Cosa facciamo',
			title: 'Manutenzioni e impianti per la casa',
			intro:
				'Dal rubinetto che perde al nuovo condizionatore: un’unica squadra di tecnici per gli impianti di casa, con appuntamenti in giornata per le urgenze.',
			items: [
				{
					icon: 'rubinetto',
					title: 'Impianti idraulici',
					text: 'Riparazioni, sostituzione di sanitari e rubinetti, ricerca delle perdite senza rompere i muri.',
				},
				{
					icon: 'lampadina',
					title: 'Impianti elettrici',
					text: 'Nuove prese e punti luce, quadri elettrici a norma e certificazione degli impianti.',
				},
				{
					icon: 'aria-condizionata',
					title: 'Clima e riscaldamento',
					text: 'Installazione e pulizia di condizionatori, manutenzione delle caldaie e dei termosifoni.',
				},
				{
					icon: 'fiamma',
					title: 'Impianti a gas',
					text: 'Allacci, prove di tenuta e controlli periodici fatti da tecnici abilitati.',
				},
				{
					icon: 'porta',
					title: 'Porte e serramenti',
					text: 'Regolazione di porte e finestre, sostituzione di serrature e maniglie.',
				},
				{
					icon: 'scale',
					title: 'Parti comuni dei condomini',
					text: 'Manutenzioni programmate con l’amministratore, a fasce orarie per disturbare il meno possibile.',
				},
			],
		},
	},
	{
		name: 'Card con immagine',
		props: {
			variant: 'cards-immagine',
			eyebrow: 'In negozio',
			title: 'Tutto per la casa e per i regali',
			items: [
				{
					image: images.scaffali,
					title: 'Casalinghi e dispensa',
					text: 'Barattoli, utensili da cucina e prodotti del territorio scelti da piccoli produttori della zona.',
					link: { label: 'Vedi i prodotti', href: '#prodotti' },
				},
				{
					image: images.regalo,
					title: 'Confezioni regalo',
					text: 'Componiamo cesti e confezioni su misura per ogni budget, anche per le aziende.',
					link: { label: 'Vedi le confezioni', href: '#regali' },
				},
				{
					image: images.vetrina,
					title: 'Ritiro in negozio',
					text: 'Ordina al telefono o su WhatsApp e passa a ritirare quando vuoi, senza fare la fila.',
					link: { label: 'Come funziona', href: '#ritiro' },
				},
			],
		},
	},
	{
		name: 'Alternato',
		props: {
			variant: 'alternato',
			eyebrow: 'Servizi',
			title: 'Come possiamo aiutarti',
			intro:
				'Ogni incarico parte da un primo incontro gratuito: ascoltiamo cosa ti serve, guardiamo i documenti e ti lasciamo un preventivo scritto e dettagliato.',
			items: [
				{
					image: images.scrivania,
					title: 'Contabilità e bilanci',
					text: 'Teniamo la contabilità della tua attività, prepariamo il bilancio e ti avvisiamo per tempo di ogni scadenza, così non hai sorprese.',
					link: { label: 'Fissa un appuntamento', href: '#appuntamento' },
				},
				{
					image: images.riunione,
					title: 'Consulenza per le imprese',
					text: 'Business plan, richieste di finanziamento e scelta della forma societaria: ne parliamo insieme, con numeri alla mano.',
				},
				{
					image: images.archivio,
					title: 'Dichiarazioni dei redditi',
					text: 'Modello 730 e Redditi per famiglie e professionisti: raccogliamo noi i documenti e controlliamo ogni detrazione.',
					link: { label: 'Quali documenti servono', href: '#documenti' },
				},
			],
		},
	},
	{
		name: 'Card con immagine, 4 servizi',
		tone: 'muted',
		props: {
			variant: 'cards-immagine',
			title: 'Dal laboratorio a casa tua',
			items: [
				{
					image: images.mobile,
					title: 'Mobili su misura',
					text: 'Credenze, librerie e cucine disegnate sugli spazi di casa tua.',
				},
				{
					image: images.laboratorio,
					title: 'Restauro',
					text: 'Mobili antichi e di famiglia riportati come nuovi, nel rispetto del legno.',
				},
				{
					image: images.attrezzi,
					title: 'Riparazioni',
					text: 'Cassetti, ante e sedie sistemati in laboratorio o direttamente a casa.',
				},
				{
					image: images.cucina,
					title: 'Arredi per locali',
					text: 'Banconi, tavoli e mensole per ristoranti, bar e negozi.',
				},
			],
		},
	},
	{
		name: 'Card con icona, testi al limite',
		props: {
			variant: 'cards-icone',
			eyebrow: 'Contabilità, consulenza e dichiarazioni',
			title: 'Contabilità, consulenza e dichiarazioni per famiglie e piccole imprese',
			intro:
				'Lavoriamo con clienti di tutta la provincia, con uno studio di quattro professionisti. Prima di iniziare concordiamo servizi, costi e scadenze, e durante l’anno hai sempre un solo referente da chiamare per qualsiasi dubbio o novità fiscale.',
			items: [
				{
					icon: 'garanzia',
					title: 'Assicurazione professionale su tutte le pratiche',
					text: 'Se un errore nostro ti costa una sanzione, la copriamo noi con la nostra assicurazione professionale, senza discussioni e senza costi in più per te o per la tua attività.',
					link: { label: 'Leggi come funziona tutto', href: '#garanzia' },
				},
				{
					icon: 'calendario',
					title: 'Scadenze fiscali segnate e ricordate in anticipo',
					text: 'Ogni mese ti mandiamo l’elenco delle scadenze e gli importi da pagare. Se una pratica arriva in ritardo per colpa nostra, il costo dell’intera pratica è a carico dello studio.',
					link: { label: 'Fissa un appuntamento ora', href: '#appuntamento' },
				},
			],
		},
	},
];

fixtures.push({
	name: 'Card con foto e icone',
	props: {
		...fixtures[2].props,
		items: [
			fixtures[2].props.items[0],
			{ icon: 'regalo', title: 'Confezioni regalo', text: 'Prepariamo confezioni per ogni occasione, anche su ordinazione.' },
			{ icon: 'negozio', title: 'Ritiro in negozio', text: 'Ordina e passa a ritirare quando preferisci.' },
		],
	},
});

const botanical = {
	title: 'Tre modi di vivere il verde',
	intro: 'Dalla scelta delle piante alla cura dei piccoli spazi di casa.',
	items: [
		{ title: 'Piante da interno', text: 'Una guida alla scelta, partendo dalla luce e dallo spazio disponibili in casa.', link: { label: 'Parliamo di piante', href: '#contatti' } },
		{ title: 'Rinvasi', text: 'Un servizio dedicato al cambio del vaso e alla cura delle piante che hai già.' },
		{ title: 'Consulenza verde', text: 'Idee per balconi e piccoli angoli di casa, anche quando lo spazio è poco.' },
	],
};
fixtures.push(
	{ name: 'Elenco', props: { variant: 'elenco', ...botanical } },
	{ name: 'Editoriale', props: { variant: 'editoriale', ...botanical } },
	...(['elenco', 'editoriale'] as const).map((variant) => ({
		name: `${variant} con icone e testi lunghi`, tone: 'primary' as const,
		props: { ...fixtures[5].props, variant, items: fixtures[5].props.items.map((item, index) => ({ ...item, ...(index === 1 ? { link: undefined } : {}) })) },
	})),
);
