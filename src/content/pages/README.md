# Pagine

Una ricetta JSON per pagina: `index.json` è la home (`/`), `chi-siamo.json` diventa `/chi-siamo/`. Niente sottocartelle.
Schema in `src/core/page-schema.ts`; `"$schema"` in testa al file dà completamento e controlli nell'editor (il file si genera con `npm run dev` o `npm run build`).

```json
{
	"$schema": "../../../.astro/collections/pages.schema.json",
	"title": "Titolo della pagina, al massimo 60 caratteri",
	"description": "Frase per i risultati di ricerca, al massimo 160 caratteri.",
	"draft": false,
	"ogImage": "../../assets/images/anteprima.jpg",
	"sections": [
		{ "type": "hero", "variant": "split", "title": "...", "primaryCta": { "label": "...", "href": "#preventivo" },
		  "image": { "src": "../../assets/images/foto.jpg", "alt": "Cosa mostra la foto" } },
		{ "type": "cta", "id": "preventivo", "tone": "primary", "variant": "banner", "title": "...",
		  "primary": { "label": "...", "href": "/contatti/" }, "showContacts": true }
	]
}
```

- **Sezioni piatte:** `type` è il blocco (cartella in `src/blocks/`), `id` un'ancora facoltativa in kebab-case, `tone` uno tra `default`, `muted`, `primary` (default `default`); tutti gli altri campi sono le props del blocco, descritte in `/catalogo/<type>`.
- **Header e footer non sono sezioni:** sono blocchi di layout, uguali su tutte le pagine; si scelgono in `src/content/settings/layout.json` e li aggiunge `BaseLayout`. La ricetta contiene solo il contenuto della pagina (dentro `<main>`).
- **Immagini:** percorso relativo a questo file, quindi `../../assets/images/...`; `alt` di almeno 5 caratteri che descrive la foto.
- **Bozze:** `"draft": true` pubblica la pagina in sviluppo e nelle anteprime, non nella produzione su Vercel, ed esclude la pagina dai motori di ricerca.
- **Recapiti:** mai nei testi. Nei link dei pulsanti usa `"@telefono"`, `"@whatsapp"`, `"@email"` o `"@mappa"` (risolti da site.json); la cta ha anche `"showContacts": true`.
- **Prima di pubblicare:** `npm run check -- --strict` (controlli in `docs/controlli.md`).

`index.json` e `contatti.json` del template sono esempi con testi `DA-COMPILARE`; `privacy.json` e `cookie.json` sono le pagine legali linkate dal footer (`navigation.json` → `footer.legal`), con la struttura dell'informativa da riempire. In un sito cliente `npm run check -- --strict` li segnala finché non vengono riscritti; se privacy e cookie stanno su un servizio esterno (es. un'informativa generata online), togli le due ricette e metti in `footer.legal` gli indirizzi https.
