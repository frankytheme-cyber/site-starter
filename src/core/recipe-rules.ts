/*
 * Regole d'oro delle ricette di pagina: le pubblica docs/catalogo (npm run gen:catalog) e le
 * verificano i controlli indicati in `check`. Solo dati, senza import: lo usano anche gli script.
 */

/** Oltre questo numero di sezioni il check recipes avvisa: la pagina va divisa. */
export const MAX_SECTIONS = 12;

/** Oltre questo numero di sezioni con un effetto di sfondo (background diverso da pieno) il check recipes avvisa. */
export const MAX_BACKGROUNDS = 3;

export interface RecipeRule {
	rule: string;
	/** Chi la verifica: la build (schema delle pagine), il check recipes (errore con --strict) o release. */
	check?: 'build' | 'recipes' | 'release';
}

export const RECIPE_RULES: RecipeRule[] = [
	{ rule: 'Un solo hero per pagina, come prima sezione: contiene l’unico h1.', check: 'recipes' },
	{ rule: 'Di norma una cta, verso la fine, dopo i blocchi che convincono (servizi, lavori, domande); non nelle pagine legali ("kind": "legale").', check: 'recipes' },
	{ rule: 'Due sezioni vicine non hanno lo stesso tone (default, muted, primary).', check: 'recipes' },
	{ rule: `Effetto dello sfondo (background) su poche sezioni: al massimo ${MAX_BACKGROUNDS} per pagina, mai in due sezioni vicine.`, check: 'recipes' },
	{ rule: 'Ogni blocco ammette solo gli effetti di sfondo della sua scheda: aurora solo in hero e cta, moduli, domande, schede e contatti solo pieno o sfumato.', check: 'build' },
	{ rule: `Al massimo ${MAX_SECTIONS} sezioni: oltre, meglio dividere la pagina.`, check: 'recipes' },
	{ rule: 'Al massimo un accordion faq per pagina: i dati strutturati FAQPage per Google sono uno solo.', check: 'recipes' },
	{ rule: 'Solo blocchi e varianti del catalogo; header e footer non sono sezioni ma stanno in layout.json.', check: 'build' },
	{ rule: 'Recapiti mai nei testi: nei pulsanti i link speciali (@telefono, @whatsapp, @email, @mappa), nelle cta showContacts.', check: 'recipes' },
	{ rule: 'Link interni solo a pagine e ancore che esistono; ogni id di sezione è in kebab-case e unico nella pagina.', check: 'recipes' },
	{ rule: 'Ogni foto ha un alt che dice cosa mostra, non il nome del file.', check: 'recipes' },
	{ rule: 'Testi entro i limiti dei campi (titoli 70 caratteri, pulsanti 25...): sono nelle schede dei blocchi.', check: 'build' },
	{ rule: 'Niente segnaposto (DA-COMPILARE, lorem, TODO) in una pagina pubblicata.', check: 'release' },
];
