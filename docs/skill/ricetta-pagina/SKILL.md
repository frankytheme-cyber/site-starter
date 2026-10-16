---
name: ricetta-pagina
description: Usala quando devi scegliere tema, layout e menu o comporre le pagine di un sito cliente con i blocchi della libreria.
---

# Ricette delle pagine

Per il Designer, nei siti cliente, dopo il cancello 1. Il sito si completa, non si inventa: solo blocchi e varianti del catalogo.

## Passi

1. **Branch** `designer/<argomento>` e PR in bozza al primo commit (skill `github-pr`).
2. **Leggi prima di scegliere:** `docs/brief.md` (con `Stato: approvato il …`), `docs/sito.md`, `docs/catalogo/README.md` (regole d'oro e di composizione, temi, link speciali, icone) e `docs/catalogo/ricette-tipo/README.md`; poi, per ogni blocco che pensi di usare, la scheda `docs/catalogo/blocchi/<tipo>.md` e gli screenshot `docs/catalogo/img/<tipo>-<variante>-desktop.webp` e `-mobile.webp`.
3. **Tema** in `src/content/settings/theme.json`: `palette`, `fonts` e `shape` per affinità tra tono e settore del brief e `mood`/`adattoA` dei preset (tabelle «Temi» del catalogo).
4. **Layout** in `src/content/settings/layout.json`: header (`variant`, `sticky`, `logo`) e footer (`variant`, `ctaBand`, spento se le pagine chiudono con una cta).
5. **Menu** in `src/content/settings/navigation.json`: una voce per pagina del brief, `cta` se l'header è `con-cta`, `footer.legal` con privacy e cookie.
6. **Pagine:** un file per ogni pagina prevista dal brief in `src/content/pages/<slug>.json` (`index.json` è la home), partendo da una ricetta tipo quando somiglia:

   ```sh
   cp docs/catalogo/ricette-tipo/artigiano-servizi.json src/content/pages/servizi.json
   ```

   `"$schema": "../../../.astro/collections/pages.schema.json"`, `title` ≤ 60, `description` ≤ 160, sezioni piatte (`type`, `variant`, `id`, `tone` e i campi della scheda), toni alternati. Privacy e cookie con `"kind": "legale"` e i testi indicati nel brief.
7. **Testi e immagini.** Testi nel tono del brief, entro i limiti delle schede, solo con fatti del brief. Recapiti mai nei testi: nei link `@telefono`, `@whatsapp`, `@email`, `@mappa`, nelle cta `showContacts`. Recensioni e numeri solo dal brief, con `fonte`. Foto solo tra quelle in `src/assets/images/` (le carica il Builder; le foto di prova di `fixtures/` vanno sostituite), con un `alt` che dice cosa mostra; senza foto, la variante senza foto.
8. **Controlli**, finché non ci sono errori:

   ```sh
   npm run check:recipes
   npm run qa
   ```

   I messaggi dicono file, sezione e campo: `src/content/pages/index.json → sezione 3 (services) → items[2].title`.
9. **Nota di design** in `docs/nota-design.md`:

   ```markdown
   # Nota di design — <nome attività>
   ## Tema e layout
   palette, font, forma, header e footer: scelta e perché
   ## Pagine
   ### <slug>
   - <blocco> `<variante>` (`<tone>`): perché
   ## Immagini stock
   file, dove è usato, fonte e licenza (oppure «nessuna»)
   ## Domande aperte
   - …
   ```

10. **Commit e push**, poi nel task: link della PR e dell'anteprima Vercel (la pubblica Vercel nella PR), esito di `npm run qa`. Il cancello 2 lo porta il PM.

## Criterio di fine

`npm run qa` senza errori, una ricetta per ogni pagina del brief, nota di design completa (pagine, tema, stock, domande aperte), link nel task.

## Non fare

- Non scrivere codice, non toccare i file gestiti (`src/blocks`, `src/core`, `src/themes`, `src/layouts`…) né `site.json`, che compila il Builder.
- Non improvvisare blocchi o varianti: se manca qualcosa, skill `richiesta-blocco`.
- Mai dati inventati: recapiti, P.IVA, indirizzi, recensioni, numeri o foto che non sono nel brief.
- Foto di lavori, squadra e sede solo reali; stock solo per sfondi o hero generici, dichiarato nella nota.
- Mai più di un hero per pagina, e sempre come prima sezione.
- Non fare merge.
