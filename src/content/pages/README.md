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
- **Immagini:** percorso relativo a questo file, quindi `../../assets/images/...`; `alt` di almeno 5 caratteri che descrive la foto.
- **Bozze:** `"draft": true` pubblica la pagina in sviluppo e nelle anteprime, non nella produzione su Vercel, ed esclude la pagina dai motori di ricerca.
- **Recapiti:** mai nei testi; telefono e WhatsApp si mostrano con `"showContacts": true` della cta.
- **Prima di pubblicare:** `npm run check:recipes -- --strict`.

`index.json` del template è un esempio con testi `DA-COMPILARE`: `check:recipes --strict` lo segnala finché non viene riscritto.
