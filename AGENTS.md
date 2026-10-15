# site-starter

Libreria di blocchi Astro + Tailwind v4 per siti vetrina di piccole attività, usata anche come template GitHub per i siti cliente.

## Regole

- **Solo classi semantiche nei blocchi.** Usa `bg-primary`, `text-fg-muted`, `font-heading`, `rounded-box`... MAI colori Tailwind fissi (`bg-blue-600`, `text-gray-500`...) né valori arbitrari di colore (`bg-[#1e40af]`, `text-[rgb(...)]`...). La palette di Tailwind è disattivata, quindi i colori fissi non generano CSS; i valori arbitrari invece funzionano ancora e vanno evitati a mano.
- **Cartelle gestite in sola lettura nei siti cliente.** Le cartelle elencate in `library.manifest.json` → `managed` si modificano SOLO nella repo site-starter; nei siti cliente sono in sola lettura.
- **Dati dell'attività in un solo posto.** Nome, descrizione, indirizzo, telefono, email, dati legali (ragione sociale, forma giuridica, P.IVA, REA, capitale) e orari stanno solo in `src/content/settings/site.json`; mai scritti nei testi delle pagine né negli schemi dei blocchi, che li leggono con `getSiteSettings()` (`@/core/settings`).
- **Si compone con blocchi esistenti.** Il sito si costruisce con i blocchi già presenti: un blocco nuovo nasce solo in site-starter, su task approvato.
- **Ogni campo ha etichetta e aiuto.** Ogni campo degli schemi di blocchi, pagine e impostazioni ha `.describe("Etichetta|Aiuto")` in italiano: da lì nascono il CMS e la documentazione del catalogo. Dopo aver cambiato uno schema, `npm run gen:decap` e commit di `public/admin/config.yml`; nella libreria, dopo aver cambiato un blocco (schema, meta, fixture, aspetto), un preset del tema o le icone, `npm run catalog` e commit di `docs/catalogo`.
- **Controlli verdi prima di chiudere.** Prima di dichiarare finito un lavoro, `npm run check` deve passare (comprende la build); per blocchi, layout e pagine anche `npm run qa`. Elenco dei controlli in `docs/controlli.md`.

## Tema

L'aspetto del sito si sceglie in `src/content/settings/theme.json` (`palette`, `fonts`, `shape`) tra i preset di `src/themes/presets.ts`. Token disponibili:

- **Colori:** `bg`, `fg`, `fg-muted`, `surface`, `surface-fg`, `primary`, `primary-fg`, `accent`, `accent-fg`, `border`, `ring` (+ `white`, `black`, `transparent`, `current`)
- **Font:** `font-heading`, `font-body`
- **Raggi:** `rounded-box` (card, riquadri), `rounded-button` (pulsanti)

## Blocchi

- Il contratto è in `src/blocks/README.md`; i blocchi di riferimento sono `hero/`, `services/`, `cta/`, `header/` (interattivo), `footer/`, `accordion/`, `tabs/` e `carousel/` in `src/blocks/`. Le primitive (`Button`, `Accordion`, `Tabs`, `Carousel`...) sono in `src/core/ui/` e si vedono in `/catalogo/ui`.
- Blocchi interattivi (`interactive: true` in `meta.ts`): JS vanilla nel componente, progressive enhancement, tastiera, focus, movimento ridotto, niente autoplay. Regole in `docs/blocchi-interattivi.md`.
- **Blocchi di layout.** `header` e `footer` hanno `scope: "layout"` in `meta.ts`: non vanno nelle ricette (la build li rifiuta) ma si scelgono in `src/content/settings/layout.json` (variante e opzioni, schema in `src/core/layout.ts`) e li disegna `BaseLayout` su ogni pagina. Tutti gli altri blocchi hanno `scope: "page"`.
- Menu del sito: solo in `src/content/settings/navigation.json`, letto con `getNavigation()` (`@/core/navigation`): voci e pulsante dell'header, gruppo `footer` con i link secondari e quelli legali (privacy, cookie).
- Anteprima: `/catalogo` (tutti i blocchi con le loro fixture, selettori di palette, font e forma, «Copia JSON» per ogni variante), `/catalogo/<type>` e `/catalogo/<type>/<variante>/` (una variante da sola, `?palette=&fonts=&shape=`).
- **Catalogo in `docs/catalogo/`** (generato da `npm run gen:catalog`, gestito dalla libreria): una scheda per blocco con varianti, screenshot, tabella dei campi ed esempio JSON (`blocchi/<tipo>.md`), primitive (`ui.md`), temi (`temi.md`), icone (`icone.md`), le **regole di composizione** (`README.md`) e le **ricette tipo** da copiare (`ricette-tipo/`). Per comporre una pagina parti da lì.
- La radice di ogni blocco è `<Section>` (`tone`: `default`, `muted`, `primary`). Dentro usa sempre `text-fg`, `text-fg-muted`, `bg-primary`...: Section ridefinisce i token per il tono, così il contrasto resta quello verificato.
- Immagini: solo file in `src/assets/images`. Nelle ricette il percorso è relativo al JSON (`"../../assets/images/foto.jpg"`), nelle fixture il file si importa; `alt` di almeno 5 caratteri che descrive la foto.
- Icone: solo `<Icon name="..." />` (`@/core/ui/Icon.astro`) con gli alias di `src/core/icons.ts`, mai SVG scritti a mano; negli schemi `z.enum(ICON_NAMES)`. Elenco in `/catalogo/icone`; licenze in `docs/THIRD_PARTY_LICENSES.md`.

## Pagine

- Ogni pagina è una ricetta JSON in `src/content/pages/` (`index.json` → `/`, `chi-siamo.json` → `/chi-siamo/`), con `"$schema"` per il completamento nell'editor. Formato in `src/content/pages/README.md`, schema in `src/core/page-schema.ts`.
- Le sezioni sono piatte: `type` (il blocco), `id` facoltativo (ancora in kebab-case), `tone` (`default`, `muted`, `primary`) e accanto le props del blocco. Alterna i toni tra sezioni vicine.
- Nei link dei pulsanti i recapiti si scrivono `@telefono`, `@whatsapp`, `@email`, `@mappa`: la build li risolve da `site.json`, mai `tel:` o numeri scritti a mano.
- Una pagina ha un solo `hero`, in apertura, e di norma una `cta`. Header e footer non sono sezioni. Link interni solo a pagine e ancore che esistono.
- Prima di pubblicare: `npm run check -- --strict` (recipes come errori e release: segnaposto, recapiti scritti a mano, link rotti, bozze linkate, dati legali e link a privacy e cookie nel footer, Open Graph...).

## CMS

- Il cliente modifica pagine, Dati attività e Menu con Decap CMS su `/admin/` (flusso editoriale: ogni modifica è una pull request). Tema (`theme.json`) e layout (`layout.json`) non sono esposti.
- `public/admin/config.yml` è generato da `scripts/gen-decap-config.ts`: mai a mano. Setup, inviti e limiti in `docs/decap.md`.

## Comandi

| Comando                  | Cosa fa                                           |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Server di sviluppo su `localhost:4321`            |
| `npm run build`          | Build di produzione in `dist/`                    |
| `npm run preview`        | Anteprima locale della build                      |
| `npm run check`          | Controlli statici + build; `-- --strict` con le regole di pubblicazione |
| `npm run qa`             | `check` + link, accessibilità, interattivi, Lighthouse sul sito servito |
| `npm run check:contrast` | Verifica il contrasto WCAG AA di tutte le palette |
| `npm run check:recipes`  | Controlla ricette e dati del sito; `-- --strict` esce con errore |
| `npm run gen:decap`      | Genera `public/admin/config.yml` dagli schemi (anche in `prebuild`) |
| `npm run check:decap`    | Fallisce se `config.yml` non è aggiornato                  |
| `npm run gen:catalog`    | Genera i .md di `docs/catalogo` da schemi, meta e fixture |
| `npm run screenshots`    | Build, anteprima e screenshot di ogni variante in `docs/catalogo/img` |
| `npm run catalog`        | `gen:catalog` + `screenshots`                     |
| `npm run check:catalog`  | Fallisce se `docs/catalogo` non è aggiornato o manca uno screenshot |
| `npm run cms:local`      | `decap-server` per provare `/admin/` in locale, senza GitHub |

Per gli agenti: avvia il server di sviluppo in background con `npx astro dev --background` e gestiscilo con `astro dev stop`, `astro dev status` e `astro dev logs`.

## Documentazione Astro

Documentazione completa: https://docs.astro.build

Consulta queste guide prima di lavorare sui temi corrispondenti:

- [Pagine, route dinamiche, middleware](https://docs.astro.build/en/guides/routing/)
- [Componenti Astro](https://docs.astro.build/en/basics/astro-components/)
- [Componenti di altri framework](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Stili e Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internazionalizzazione](https://docs.astro.build/en/guides/internationalization/)
