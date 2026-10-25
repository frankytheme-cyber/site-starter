# site-starter

Libreria di blocchi Astro + Tailwind v4 e template GitHub per siti vetrina di piccole attività. La specifica è `docs/specifica.md`: in caso di dubbio prevale, poi chiedi a Simone.

Un agente solo, Claude Code o Codex, lavora con Simone. Paperclip è in pausa: non caricare le istruzioni di `docs/agenti/`, `docs/skill/` e `docs/paperclip-runtime/` per il lavoro corrente. Brief, aspetto, messa online e merge li decide Simone; le autorizzazioni già date valgono, non richiederle a ogni passaggio.

## Prima di lavorare

- Verifica branch, stato Git e modalità. **Solo `SITE_STARTER_LIBRARY=1` identifica la libreria** (`.env`, CI, Vercel); senza è un sito cliente, anche in questa repo. Non impostarla per aggirare il lock di un sito.
- Nei siti cliente leggi `docs/sito.md`: note ed eccezioni vanno lì, mai in `AGENTS.md` o `CLAUDE.md`, entrambi gestiti.
- **Mai commit su `main`.** Nella libreria e nei siti già online: branch e PR per il lavoro (`codex/<nome>` con Codex). Prima del lancio di un sito: branch `lancio` e una PR in bozza. Apri la PR con `gh pr create`; merge e rilascio spettano a Simone.
- Leggi la skill pertinente, poi solo i riferimenti necessari. Riusa brief, decisioni e schede già lette se non sono cambiati; non rileggere tutto il catalogo o tutta la specifica a ogni passo.

## Confini e invarianti

- **Nei siti si compone con preset, varianti e ricette esistenti.** Niente CSS, componenti o pagine `.astro` nuovi nel sito; le skill di design generiche non autorizzano eccezioni. Un blocco, una variante o un preset mancante si propone a Simone e si realizza nella libreria dopo l'approvazione.
- **File gestiti in sola lettura nei siti.** `library.manifest.json` è l'elenco completo: include blocchi, core, temi, layout, script, skill, catalogo, documenti comuni, CI e file di infrastruttura. `blocks.lock.json` registra versione e hash; lo scrivono solo `site:init` e `blocks:sync`, mai a mano. Aggiornamenti: `npm run blocks:sync -- vX.Y.Z`, poi installazione e controlli. Dettagli: `docs/siti-cliente.md`.
- **Dati dell'attività solo in `src/content/settings/site.json`**, letti con `getSiteSettings()` (`@/core/settings`): nome, descrizione, recapiti, indirizzo, orari, dati legali, `defaultOgImage`. Mai duplicarli nei testi o negli schemi. Solo le fixture del catalogo ammettono dati palesemente finti. Niente fatti, recensioni, numeri o foto di lavori inventati; fonti nel brief. Testi legali forniti da Simone.
- **Immagini mancanti nel brief:** nelle anteprime usa placeholder pertinenti e dichiarati, salvo divieto esplicito o scelta tipografica motivata. Non simulano lavori, persone o sede. File con `DA-COMPILARE`, fonti e sostituzioni annotate: regola completa in `.agents/skills/nuovo-sito/immagini-placeholder.md`.
- **Solo classi semantiche** in `src/blocks`, `src/core`, `src/layouts`, `src/pages`: `bg-primary`, `text-fg-muted`, `font-heading`, `rounded-box`… Vietati colori fissi/arbitrari, classi della palette Tailwind (anche fill, stroke, ring e gradienti) e `!important`; il check le vieta anche se non generano CSS.
- **Schemi:** ogni campo, inclusi tema e layout, ha `.describe("Etichetta|Aiuto")` in italiano. Ogni `refine`/`superRefine` ha il commento `// rule:` con lo stesso testo in `meta.rules`. Varianti con `description` e `whenToUse`. Dopo uno schema: `npm run gen:decap`, includendo `public/admin/config.yml` nel commit. Mai editare a mano i file generati.
- **Blocchi:** contratto in `src/blocks/README.md`, radice `<Section>` e token del tono. Pulsanti solo tramite `src/core/ui/button/` (variant e size, niente colori/stati locali). Icone solo `<Icon>` e alias di `src/core/icons.ts`, negli schemi `iconSchema()`, mai SVG scritti a mano. JS vanilla, progressive enhancement, tastiera, focus, movimento ridotto, niente autoplay: `docs/blocchi-interattivi.md`.
- **Ricette JSON** in `src/content/pages/`, con `$schema` e sezioni piatte: un hero o uno slider in apertura, CTA salvo `kind: "legale"`, nessun header/footer nelle sezioni. Header/footer in `settings/layout.json`, menu solo in `settings/navigation.json`. Toni alternati; al massimo 3 effetti di sfondo non adiacenti e 2 bordi (non sulla prima sezione, solo tra toni diversi). Link interni a pagine/ancore esistenti; recapiti nei pulsanti con `@telefono`, `@whatsapp`, `@email`, `@mappa`. Foto in `src/assets/images`, percorsi relativi al JSON, alt descrittivo di almeno 5 caratteri. Formato: `src/content/pages/README.md`.
- **Qualità prima di chiudere:** `npm run check` deve passare; per blocchi/layout/pagine esegui `npm run qa`, che comprende già check e build. Prima di pubblicare un sito: `npm run qa -- --strict`. Non abbassare soglie o nascondere errori. Nella libreria, dopo blocchi (anche fixture/meta), preset o icone: `npm run catalog` e commit di `docs/catalogo`. Controlli e CI: `docs/controlli.md`.

## Skill da usare quando servono

Fonte unica: `.agents/skills/<nome>/SKILL.md`; `.claude/skills/<nome>/SKILL.md` contiene il rimando con identici nome e descrizione, verificati dal check `skills`.

| Lavoro | Skill |
| --- | --- |
| Inizializzazione, brief, dati e foto | `nuovo-sito` |
| Sostituzione di un sito online | `redirect` |
| Tema: tre direzioni sul sito vero | `direzione-visiva` |
| Layout, menu e pagine | `composizione` |
| Testi dai fatti del brief | `testi-sito` |
| Revisione a 375 e 1280 px | `revisione-visiva` |
| Controlli finali e consegna a Simone | `messa-online` |
| Aggiornamento di un sito dalla libreria | `aggiornamento-libreria` |
| Creazione o manutenzione di blocchi nella libreria | `nuovo-blocco` |

## Consultazione mirata e strumenti

- `npm run catalog:query`: indice compatto. `-- hero`: campi, limiti, regole ed esempio del blocco. `-- --cerca foto`, `-- --temi artigiano`, `-- --icone telefono`, `-- --regole`: filtri locali. La ricerca è testuale; verifica sempre requisiti e materiale prima di scegliere. Le schede complete sono in `docs/catalogo/blocchi/`, le ricette iniziali in `docs/catalogo/ricette-tipo/`.
- `npm run images`: inventario ricorsivo senza fixture. `-- <file o cartella>`: prepara foto (cartella d'ingresso non ricorsiva); `--sovrascrivi` permette anche di normalizzare un file già nel sito.
- `npm run design:shots -- --pagine index --sezioni --riusa`: immagini a 375/1280 px. `--riusa` evita il lavoro solo con sorgenti, opzioni e artefatti identici. Manifest con hash ed esito in `reports/design/`. Per iterare limita alle pagine coinvolte; tema/layout/core condivisi richiedono tutte le pagine interessate. La QA completa finale resta obbligatoria.
- Server: `npx astro dev --background`; gestione con `astro dev status`, `logs`, `stop`. Temi di prova solo in sviluppo: `/?palette=laguna&fonts=fresco&shape=arrotondato&pattern=onde&texture=liscia` (non modifica `theme.json`). Se manca Chromium: `npx playwright install chromium`.
- Dettagli su modalità, token, blocchi, pagine, CMS e tabella comandi: **`docs/riferimento-agenti.md`**, solo la sezione pertinente. CMS: `docs/decap.md`; moduli: `docs/form.md`; creazione risorse del titolare: `docs/provisioning.md`.

## Documentazione Astro

Prima di lavorare sul tema relativo consulta la guida ufficiale: [routing](https://docs.astro.build/en/guides/routing/), [componenti Astro](https://docs.astro.build/en/basics/astro-components/), [framework](https://docs.astro.build/en/guides/framework-components/), [content collections](https://docs.astro.build/en/guides/content-collections/), [stili e Tailwind](https://docs.astro.build/en/guides/styling/), [internazionalizzazione](https://docs.astro.build/en/guides/internationalization/).
