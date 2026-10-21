---
name: nuovo-blocco
description: Usala nella libreria site-starter per creare o correggere blocchi e varianti, inclusi schema, fixture, CMS e catalogo. Un blocco o una variante nuovi richiedono che Simone abbia approvato cosa serve.
---

# Creazione e manutenzione di blocchi

Per l'agente che lavora con Simone nella libreria, mai in un sito cliente (lì i blocchi sono file gestiti). Per una correzione parti dal difetto riprodotto; per un blocco o una variante nuovi dal bisogno approvato. Non richiedere di nuovo un’approvazione già data.

## Prima

1. **Per una novità**, cosa serve, concordato con Simone: per quale sito e pagina, cosa mostra e cosa fa chi visita, perché nessun blocco o variante basta (quali hai provato), contenuto d'esempio vero, varianti. Spesso basta una variante o un campo in più di un blocco esistente: preferiscilo a un blocco nuovo.
Per una manutenzione: annota il caso che fallisce, le props coinvolte e il comportamento atteso; conserva la compatibilità delle ricette.

2. **Nella libreria:**

   ```sh
   git remote get-url origin       # https://github.com/frankytheme-cyber/site-starter.git
   rg '^SITE_STARTER_LIBRARY=' .env  # SITE_STARTER_LIBRARY=1
   git switch -c codex/<lavoro>     # riusa il branch del lavoro se esiste già
   ```

3. **Leggi** `src/blocks/README.md` (il contratto), il blocco da modificare o il solo riferimento più vicino (`hero` per aperture, `services` per griglie, `header`/`accordion`/`tabs`/`carousel` per interazioni), e soltanto le primitive usate di `src/core/ui/` (indice `docs/catalogo/ui.md`, anteprima `/catalogo/ui`) e, se il blocco ha JavaScript, `docs/blocchi-interattivi.md`.

## Passi

1. **`src/blocks/<tipo>/`** (kebab-case), quattro file:
   - `schema.ts`: `variant` come `z.enum`, limiti su ogni campo e `.describe("Etichetta|Aiuto")` in italiano; immagini con `imageSchema(image)`, icone con `iconSchema()`, pulsanti con `ctaSchema`; sopra ogni `refine`/`superRefine` il commento `// rule: <testo>`. Niente dati dell'attività: il componente li legge con `getSiteSettings()`.
   - `meta.ts`: `type`, `name`, `description`, `whenToUse`, `avoidWhen`, `category`, `scope: 'page'`, `version`, `source`, `interactive` se ha JS, `backgrounds` ammessi, `variants` con `description` e `whenToUse`, `rules` con lo stesso testo dei `// rule:`.
   - `fixtures.ts`: almeno una per variante; copri anche ogni opzione o fallback cambiato con una fixture mirata, attività di esempio generica, recapiti palesemente finti (`055 000 0000`, `info@esempio.it`), foto da `src/assets/images/fixtures/`.
   - `<Nome>.astro`: radice `<Section id={id} tone={tone}>`, solo classi semantiche, primitive del core.

   Per una variante nuova di un blocco esistente: valore in `variant`, campi e regole nello schema, una fixture, `version` del blocco alzata (minore: 1.1.0), il caso nel componente.

2. **Fonte esterna** (HyperUI, Flowbite gratuito, Preline): solo la struttura, con `source` e il testo della licenza in `docs/THIRD_PARTY_LICENSES.md`; mai Tailwind Plus, mai colori, font o testi altrui. Icona nuova: una riga in `src/core/icons.ts`.

3. **CMS e catalogo:** dopo uno schema rigenera Decap; dopo modifiche al blocco (fixture comprese), catalogo e screenshot. Esegui i generatori una volta dopo l’ultima modifica, non dopo ogni file.

   ```sh
   npm run gen:decap   # se è cambiato uno schema
   npm run catalog     # schede, catalogo.json e screenshot
   ```

4. **Revisione** con la skill `revisione-visiva`, sezione «Nella libreria»: ogni variante su un campione di temi, a 375 e 1280 px, confrontata con i blocchi di riferimento; se interattivo, anche da tastiera, senza JavaScript e con il movimento ridotto.

5. **Changelog:** una riga in `CHANGELOG.md`, «## Non rilasciato» → «### Novità» (o «### Breaking» se le ricette dei siti vanno cambiate).

6. **Controlli:** durante l’iterazione i check e le pagine interessati; prima di chiudere `npm run qa` senza errori (comprende già `check` e build, non duplicarli). Per un difetto riproducibile aggiungi una regressione mirata. Commit (con `public/admin/config.yml` e `docs/catalogo`), push e PR verso `main` con le immagini della revisione. Il rilascio (`npm run release -- vX.Y.Z`) e il merge li decide Simone; il sito riceve il blocco con la skill `aggiornamento-libreria`.

## Criterio di fine

`npm run qa` senza errori; ogni variante nel catalogo con scheda e screenshot, verificata su più temi; PR aperta per Simone.

## Non fare

- Niente classi della palette di Tailwind né colori arbitrari, niente `!important`, niente SVG scritti a mano, niente librerie JavaScript né autoplay.
- Non scrivere a mano `docs/catalogo` o `public/admin/config.yml`.
- Non cambiare core, temi o altri blocchi senza dirlo a Simone.
- Non fare merge né rilasci.
