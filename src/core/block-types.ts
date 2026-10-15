import type { SchemaContext } from 'astro:content';
import type { z } from 'astro/zod';
import type { SiteSettings, siteSettingsSchema } from './settings';

/**
 * Schema delle props di un blocco (schema.ts): una funzione del contesto di Astro, come lo
 * schema di una collezione, così le immagini usano image() con percorsi relativi al JSON.
 */
export type BlockSchema = (context: SchemaContext) => z.ZodObject;

/** Props del componente di un blocco: quelle dello schema più id e tone della sezione. */
export type BlockProps<S extends BlockSchema> = z.infer<ReturnType<S>> & SectionProps;

/** Toni di sezione (core/ui/Section.astro). */
export const TONES = ['default', 'muted', 'primary'] as const;
export type Tone = (typeof TONES)[number];

/** Props che ogni blocco riceve dalla sezione della ricetta, oltre alle sue: non vanno negli schemi. */
export interface SectionProps {
	/** Ancora della sezione (#id), in kebab-case. */
	id?: string;
	tone?: Tone;
}

/**
 * Dove si usa un blocco: "page" nelle sezioni delle ricette di pagina; "layout" una volta per
 * tutto il sito, in src/content/settings/layout.json (header e footer, disegnati da BaseLayout).
 */
export const SCOPES = ['page', 'layout'] as const;
export type Scope = (typeof SCOPES)[number];

/**
 * Categorie dei blocchi, nell'ordine in cui compaiono in una pagina: intestazione in cima, poi
 * apertura, contenuti, contatti e piè di pagina. Catalogo, documentazione e CMS mostrano i blocchi
 * in quest'ordine (compareBlocks). Solo import di tipo in questo file: lo importano anche gli script.
 */
export const CATEGORIES = ['intestazione', 'apertura', 'contenuti', 'contatti', 'piè di pagina'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Ordine dei blocchi: per posizione della categoria nella pagina, poi per nome. */
export const compareBlocks = (a: Pick<BlockMeta, 'category' | 'name'>, b: Pick<BlockMeta, 'category' | 'name'>) =>
	CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name, 'it');

/** Scheda di un blocco (meta.ts): la leggono il catalogo e chi compone le pagine. */
export interface BlockMeta {
	/** Identificativo: uguale al nome della cartella in src/blocks (es. "hero"). */
	type: string;
	/** Nome leggibile. */
	name: string;
	/** Cosa fa il blocco, in una frase. */
	description: string;
	/** In quali casi usarlo. */
	whenToUse: string;
	/** In quali casi non usarlo, e cosa fare invece. */
	avoidWhen: string;
	/** Gruppo nel catalogo e posizione nella pagina: una di CATEGORIES. */
	category: Category;
	/** page: sezione di una ricetta · layout: in layout.json, uguale su tutte le pagine. */
	scope: Scope;
	/** Versione semver: la major sale quando lo schema cambia in modo incompatibile. */
	version: string;
	/**
	 * Provenienza del disegno: "originale" se il blocco è nato in site-starter; "esterno" se
	 * deriva da un progetto di terzi, la cui licenza va riportata in docs/THIRD_PARTY_LICENSES.md
	 * (lo verifica npm run check, check "blocks").
	 */
	source:
		| { from: 'originale' }
		| {
				from: 'esterno';
				/** Progetto o autore da cui deriva il disegno, come compare in THIRD_PARTY_LICENSES.md. */
				name: string;
				/** Indirizzo del progetto o del componente di partenza. */
				url: string;
				/** Licenza, identificativo SPDX (es. "MIT"). */
				license: string;
		  };
	/** true se il blocco ha un comportamento in JS: deve seguire docs/blocchi-interattivi.md. */
	interactive?: boolean;
	/** Varianti: nome → com'è e quando usarla. I nomi sono i valori ammessi dalla prop `variant` dello schema. */
	variants: Record<string, VariantMeta>;
	/**
	 * Le regole del blocco a parole: ogni refine/superRefine dello schema (lo stesso testo del suo
	 * commento `// rule:`, obbligatorio) e i vincoli sui dati di site.json e navigation.json.
	 */
	rules?: string[];
	/**
	 * Vincoli tra campi che lo schema non dice da solo: quelli di refine/superRefine (es. foto
	 * obbligatoria solo per alcune varianti) o che dipendono da site.json e navigation.json.
	 * Percorso del campo come nella tabella del catalogo ("image", "items[].icon") → FieldRule.
	 * Obbligatorio se lo schema ha refine o superRefine (check "blocks", con gen:catalog).
	 */
	fieldRules?: Record<string, FieldRule>;
}

/** Una variante di un blocco (BlockMeta.variants). */
export interface VariantMeta {
	/** Com'è fatta, in una frase. */
	description: string;
	/** Quando sceglierla rispetto alle altre. */
	whenToUse: string;
}

/** Vincolo di un campo (BlockMeta.fieldRules): colonne «Obbl.» e «Note» della scheda del catalogo. */
export interface FieldRule {
	/** Varianti per cui il campo è obbligatorio anche se lo schema lo ha facoltativo (lo verifica refine/superRefine). */
	requiredFor?: string[];
	/** Il resto della regola, in una frase: cosa fanno le altre varianti, da quali dati dipende. */
	note?: string;
}

/** Dati di esempio di un blocco (fixtures.ts), validati con lo schema del blocco. */
export interface BlockFixture<S extends BlockSchema = BlockSchema> {
	/** Nome mostrato nel catalogo. */
	name: string;
	/** Tono con cui il catalogo mostra la fixture (default "default"). */
	tone?: Tone;
	/** Le immagini sono file importati (import foto from '@/assets/images/...'), non percorsi. */
	props: z.input<ReturnType<S>>;
	/**
	 * Dati dell'attività di prova al posto di site.json, per i blocchi che cambiano con quei dati
	 * (es. il footer di una ditta individuale e di una SRL). Validati con lo schema di site.json;
	 * il catalogo li passa al componente nella prop `site` (SiteProps).
	 */
	site?: z.input<ReturnType<typeof siteSettingsSchema>>;
}

/**
 * Prop facoltativa dei blocchi che leggono site.json e hanno fixture con `site`: se c'è, il
 * componente la usa al posto di getSiteSettings(). Solo per il catalogo: nelle pagine non si passa.
 */
export interface SiteProps {
	site?: SiteSettings;
}
