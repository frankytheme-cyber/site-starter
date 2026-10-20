# site-starter

Libreria di blocchi Astro + Tailwind v4 per siti vetrina di piccole attività, usata anche come template GitHub per i siti cliente.

La specifica completa del sistema è in `docs/specifica.md`; in caso di dubbio prevale la specifica, poi chiedi a Simone. Si lavora con un agente solo, Claude Code o Codex, insieme a Simone: sezione «Lavorare con Claude Code o Codex» qui sotto. La squadra di agenti su Paperclip è in pausa: le sue istruzioni di ruolo sono in `docs/agenti/`, le sue procedure in `docs/skill/`; i modelli di brief e di task in `docs/modelli/`.

## Regole

- **Solo classi semantiche nei blocchi.** Usa `bg-primary`, `text-fg-muted`, `font-heading`, `rounded-box`... MAI colori Tailwind fissi (`bg-blue-600`, `text-gray-500`...) né valori arbitrari di colore (`bg-[#1e40af]`, `text-[rgb(...)]`...). Non contare sul fatto che, con la palette di Tailwind disattivata, una classe come `bg-blue-600` «non genera CSS»: `check:tokens` vieta come errore le classi della palette (anche `fill-*`, `stroke-*`, `ring-*`, `from-`/`via-`/`to-*`) e i valori arbitrari di colore in `src/blocks`, `src/core` e `src/layouts`.
- **Libreria o sito: lo dice `SITE_STARTER_LIBRARY`.** La repo site-starter è la libreria solo con `SITE_STARTER_LIBRARY=1` (in `.env`, vedi `.env.example`; in CI e su Vercel nelle variabili del progetto); senza, ogni progetto è un sito cliente, anche la libreria (e i controlli falliscono sul lock). Cosa cambia tra le due: «Libreria e siti cliente» qui sotto.
- **Cartelle e file gestiti in sola lettura nei siti cliente.** Quelli di `library.manifest.json` (`managed`, `managedFiles`: elenco qui sotto) si modificano SOLO nella repo site-starter; nei siti cliente il check `lock` ferma ogni modifica e si aggiornano con `npm run blocks:sync -- vX.Y.Z`. Note ed eccezioni del singolo sito vanno in `docs/sito.md`, mai in `AGENTS.md` o `CLAUDE.md` (gestiti).
- **Dati dell'attività in un solo posto.** Nome, descrizione, indirizzo, telefono, email, dati legali (ragione sociale, forma giuridica, P.IVA, REA, capitale), orari e immagine per i social di ripiego (`defaultOgImage`) stanno solo in `src/content/settings/site.json`; mai scritti nei testi delle pagine né negli schemi dei blocchi, che li leggono con `getSiteSettings()` (`@/core/settings`). Unica eccezione, le fixture: i dati `site` di prova del footer (`src/blocks/footer/fixtures.ts`) servono al catalogo e hanno recapiti palesemente finti (`055 000 0000`, `info@esempio.it`); `check:recipes` non legge le fixture.
- **Si compone con blocchi esistenti.** Il sito si costruisce con i blocchi già presenti: un blocco nuovo nasce solo in site-starter, se Simone lo approva.
- **Ogni campo ha etichetta e aiuto.** Ogni campo degli schemi di blocchi, pagine e impostazioni (anche `themeSchema` e `layoutSchema`, che il CMS non mostra) ha `.describe("Etichetta|Aiuto")` in italiano: da lì nascono il CMS e la documentazione del catalogo, e `gen:decap` e `gen:catalog` si fermano su un campo senza. Dopo aver cambiato uno schema, `npm run gen:decap` e commit di `public/admin/config.yml`; nella libreria, dopo aver cambiato un blocco (schema, meta, fixture, aspetto), un preset del tema o le icone, `npm run catalog` e commit di `docs/catalogo`.
- **Controlli verdi prima di chiudere.** Prima di dichiarare finito un lavoro, `npm run check` deve passare (comprende la build); per blocchi, layout e pagine anche `npm run qa`. Elenco dei controlli in `docs/controlli.md`.

## Lavorare con Claude Code o Codex

Un agente solo lavora con Simone in conversazione: compone le pagine, sistema dati e immagini, fa i controlli. Le decisioni restano a Simone: brief, aspetto del sito, messa online, merge.

- **Skill** in `.agents/skills/<nome>/SKILL.md`, dove le trova Codex; per Claude Code, `.claude/skills/<nome>/SKILL.md` ha un rimando con lo stesso nome e la stessa descrizione (check `skills`). Per il design: `direzione-visiva` (scegliere il tema con Simone, sul sito vero) e `revisione-visiva` (guardare le pagine a 375 e 1280 px e correggerle). Le procedure di `docs/skill/` sono della squadra Paperclip: valgono i comandi, non i passaggi tra agenti, task e cancelli.
- **Guardare il sito:** `npx astro dev --background`. In sviluppo ogni pagina accetta un tema di prova nell'indirizzo, senza toccare `theme.json`: `/?palette=laguna&fonts=fresco&shape=arrotondato&pattern=onde&texture=liscia` (valori di `src/themes/presets.ts`; i link interni lo portano con sé, nella build non c'è). `npm run design:shots` fa gli screenshot delle pagine, anche con più temi a confronto, in `reports/design/`.
- **Design nei siti cliente:** solo preset, varianti e ricette. Le skill di design generiche installate sul computer (es. `frontend-design`) qui non valgono: niente CSS, componenti o pagine `.astro` scritti nel sito. Se i blocchi non bastano, proponi a Simone una variante o un blocco nuovo nella libreria.

## Libreria e siti cliente

La stessa repo vive in due modi, e la modalità la decide solo `SITE_STARTER_LIBRARY` (`src/core/mode.ts`; guida completa in `docs/siti-cliente.md`):

| | Libreria (la repo site-starter) | Sito cliente (il default) |
| --- | --- | --- |
| Quando | `SITE_STARTER_LIBRARY=1` in `.env`, nella variabile del repository GitHub e nel progetto Vercel della libreria | la variabile manca, è vuota o vale altro |
| `/catalogo`, `gen:catalog`, `screenshots`, `release`, `check:template` | sì | `/catalogo` non c'è nel build, i comandi si fermano |
| `site:init`, `blocks:sync` | si fermano | sì |
| check `blocks` / `lock` | sì / saltato | saltato / sì: senza `blocks.lock.json` è un errore |
| `--strict` | regole strutturali delle ricette come errori; segnaposto del template (`DA-COMPILARE`, `og-DA-COMPILARE`) ad avviso; `release` saltato | tutto errore: ricette, segnaposto, `release`, repository del CMS |

- **Creare un sito:** «Use this template» su GitHub, clone, `npm install`, poi una volta `npm run site:init` (working tree pulito): toglie la parte della libreria, scrive il repository del CMS in `src/site.config.ts` e rigenera `config.yml`, scrive `blocks.lock.json` e crea `docs/sito.md`. Prima di pubblicare: `npm run qa -- --strict` senza errori.
- **Aggiornare un sito:** `npm run blocks:sync -- vX.Y.Z` (working tree pulito), poi `npm install`, `npm run gen:decap`, `npm run qa -- --strict` e commit. Sostituisce cartelle e file gestiti con quelli del tag, unisce script e dipendenze in `package.json`, aggiorna il lock e mostra i breaking change di `CHANGELOG.md`.
- **Cosa è gestito** (`library.manifest.json`, elenco completo lì):
  - `managed`, cartelle: `src/blocks`, `src/core`, `src/themes`, `src/layouts`, `scripts`, `.agents/skills` e `.claude/skills` (le skill), `docs/catalogo`, `docs/skill`, `docs/modelli`, `docs/agenti`, `docs/paperclip-runtime`, `.github/workflows`;
  - `managedFiles`: `AGENTS.md`, `CLAUDE.md`, `.github/CODEOWNERS`, `library.manifest.json`, `astro.config.mjs`, `src/content.config.ts`, `src/pages/[...slug].astro`, `src/pages/robots.txt.ts`, `tsconfig.json`, `.env.example`, `public/admin/index.html` e i documenti comuni di `docs/` (`controlli.md`, `decap.md`, `siti-cliente.md`, `blocchi-interattivi.md`, `specifica.md`, `THIRD_PARTY_LICENSES.md`);
  - `exclude`: percorsi né controllati né copiati da `blocks:sync` (`src/library`);
  - `libraryOnly` (`src/library` con il catalogo, `docs/README.md`, `CHANGELOG.md`) e `libraryScripts`: solo nella libreria, `site:init` li toglie e `blocks:sync` non li porta;
  - del sito, liberi: `src/content/**`, `src/assets/images/**`, `src/site.config.ts`, le altre pagine di `src/pages`, `public/` (tranne `admin/index.html`), `docs/sito.md` e gli altri documenti del sito (`docs/brief.md`, `docs/nota-design.md`, `docs/redirects.md`), `README.md`, `name` e `version` di `package.json`.
- **Il lock.** `blocks.lock.json` registra la versione della libreria e l'hash sha256 di ogni file gestito; lo scrivono solo `site:init` e `blocks:sync`, mai a mano. `.github/CODEOWNERS` chiede la revisione del proprietario sulle pull request che toccano il lock o chi lo controlla (`.github/`, `scripts/`, `library.manifest.json`, `package.json`).
- **Note del sito.** `CLAUDE.md` importa `AGENTS.md` (le regole comuni) e `docs/sito.md` (note ed eccezioni del sito: l'unico dei tre che il sito scrive). Con un altro agente, in un sito cliente leggi `docs/sito.md` prima di iniziare.

## Tema

L'aspetto del sito si sceglie in `src/content/settings/theme.json` (`palette`, `fonts`, `shape`, `pattern`, `texture`) tra i preset di `src/themes/presets.ts`: `pattern` è il decoro delle sezioni con `"background": "decoro"` (`nessuno` di partenza), `texture` la grana sopra lo sfondo di ogni sezione (`liscia` di partenza). In sviluppo un altro tema si prova dall'indirizzo, senza toccare il file (sezione «Lavorare con Claude Code o Codex»). Token disponibili:

- **Colori:** `bg`, `fg`, `fg-muted`, `surface`, `surface-fg`, `primary`, `primary-fg`, `primary-hover`, `accent`, `accent-fg`, `accent-hover`, `border`, `ring` (+ `white`, `black`, `transparent`, `current`)
- **Font:** `font-heading`, `font-body`
- **Raggi:** `rounded-box` (card, riquadri), `rounded-button` (pulsanti)

## Blocchi

- Il contratto è in `src/blocks/README.md`; i blocchi di riferimento sono `hero/`, `services/`, `cta/`, `header/` (interattivo), `footer/`, `accordion/`, `tabs/` e `carousel/` in `src/blocks/`. Le primitive (`Accordion`, `Tabs`, `Carousel`...) sono in `src/core/ui/` e si vedono in `/catalogo/ui`. I pulsanti sono un modulo a parte, `src/core/ui/button/` (`Button`, `CtaButton`, `button.css` con stati e toni, schema `cta.ts`): mai classi di colore o di stato sui pulsanti nei blocchi, si sceglie solo `variant` e `size`; tutte le combinazioni in `/catalogo/bottoni`.
- Blocchi interattivi (`interactive: true` in `meta.ts`): JS vanilla nel componente, progressive enhancement, tastiera, focus, movimento ridotto, niente autoplay. Regole in `docs/blocchi-interattivi.md`.
- **Blocchi di layout.** `header` e `footer` hanno `scope: "layout"` in `meta.ts`: non vanno nelle ricette (la build li rifiuta) ma si scelgono in `src/content/settings/layout.json` (variante e opzioni, schema in `src/core/layout.ts`) e li disegna `BaseLayout` su ogni pagina. Tutti gli altri blocchi hanno `scope: "page"`.
- Menu del sito: solo in `src/content/settings/navigation.json`, letto con `getNavigation()` (`@/core/navigation`): voci e pulsante dell'header, gruppo `footer` con i link secondari e quelli legali (privacy, cookie).
- Anteprima, solo in modalità libreria (pagine in `src/library/catalogo`, registrate da `src/core/integrations/library.ts`; nel menu del sito la voce «Catalogo», aggiunta da `BaseLayout` senza toccare `navigation.json`): `/catalogo` (tutti i blocchi con le loro fixture, selettori di palette, font, forma, decoro e texture, «Copia JSON» per ogni variante), `/catalogo/<type>` (con blocco precedente e successivo) e `/catalogo/<type>/<variante>/` (una variante da sola, `?palette=&fonts=&shape=&pattern=&texture=`, che valgono anche nelle altre pagine del catalogo); `/catalogo/temi` mette a confronto palette, font e forme con anteprima, mood e settori; `/catalogo/sfondi` mostra gli effetti di sfondo sui tre toni.
- **Catalogo in `docs/catalogo/`** (generato da `npm run gen:catalog`, gestito dalla libreria, mai scritto a mano): `README.md` con versione della libreria, regole d'oro delle ricette, regole di composizione, blocchi, opzioni di `layout.json`, link speciali, temi e icone; una scheda per blocco (`blocchi/<tipo>.md`: quando usarlo, varianti con screenshot, campi, regole, esempio pronto); `catalogo.json` con gli stessi dati per le macchine; `ui.md` (primitive); le **ricette tipo** da copiare (`ricette-tipo/`, scritte a mano). Per comporre una pagina parti da lì.
- **Schede dei blocchi per il catalogo.** In `meta.ts` ogni variante ha `description` e `whenToUse`; `rules` descrive a parole ogni regola tra campi e ogni vincolo sulla pagina (es. un solo accordion `faq`); ogni `refine`/`superRefine` dello schema ha sopra un commento `// rule: <testo>` con lo stesso testo di una voce di `rules`. Senza, `gen:catalog` si ferma.
- La radice di ogni blocco è `<Section>` (`tone`: `default`, `muted`, `primary`). Dentro usa sempre `text-fg`, `text-fg-muted`, `bg-primary`...: Section ridefinisce i token per il tono, così il contrasto resta quello verificato.
- Immagini: solo file in `src/assets/images`. Nelle ricette il percorso è relativo al JSON (`"../../assets/images/foto.jpg"`), nelle fixture il file si importa; `alt` di almeno 5 caratteri che descrive la foto.
- Icone: solo `<Icon name="..." />` (`@/core/ui/Icon.astro`) con gli alias di `src/core/icons.ts` (raggruppati per categoria, solo nomi che esistono in Lucide e Simple Icons), mai SVG scritti a mano; negli schemi `iconSchema()`. Elenco con ricerca in `/catalogo/icone`; licenze in `docs/THIRD_PARTY_LICENSES.md`.

## Pagine

- Ogni pagina è una ricetta JSON in `src/content/pages/` (`index.json` → `/`, `chi-siamo.json` → `/chi-siamo/`), con `"$schema"` per il completamento nell'editor. Formato in `src/content/pages/README.md`, schema in `src/core/page-schema.ts`.
- Le sezioni sono piatte: `type` (il blocco), `id` facoltativo (ancora in kebab-case), `tone` (`default`, `muted`, `primary`) e accanto le props del blocco. Alterna i toni tra sezioni vicine.
- Effetto di sfondo: `background` accanto a `tone` (`pieno` di partenza, `sfumato`, `alone`, `aurora`, `decoro` con il motivo scelto in `theme.json`; CSS in `src/themes/backgrounds.css`, solo token). Ogni blocco ammette quelli del suo `meta.ts` (`backgrounds`); al massimo 3 sezioni con effetto per pagina, mai due vicine. `check:contrast` verifica i testi nel punto più carico di ogni effetto, per ogni palette, tono e texture; l'intensità dei veli è della palette (`--fx-default`, `--fx-muted`), calcolata da `node scripts/effect-strength.ts`.
- Bordo in alto: `edge` accanto a `tone` (`dritto` di partenza, `onda`, `diagonale`, `curva`; CSS in `src/themes/edges.css`): la sezione copre il fondo della precedente con quella forma, nel suo colore. Si vede solo dopo una sezione di tone diverso, non si applica alla prima; al massimo 2 per pagina.
- Nei link dei pulsanti i recapiti si scrivono `@telefono`, `@whatsapp`, `@email`, `@mappa`: la build li risolve da `site.json`, mai `tel:` o numeri scritti a mano.
- Una pagina ha un solo `hero`, in apertura, e di norma una `cta`; le pagine legali (privacy, cookie) hanno `"kind": "legale"` e la cta non serve. Header e footer non sono sezioni. Link interni solo a pagine e ancore che esistono.
- Prima di pubblicare un sito: `npm run qa -- --strict` (recipes come errori e release: segnaposto `DA-COMPILARE` e `og-DA-COMPILARE`, recapiti scritti a mano, link rotti, bozze linkate, dati legali e link a privacy e cookie nel footer, Open Graph...). Nella libreria `--strict` ferma le regole strutturali e lascia ad avviso i segnaposto del template.

## CMS

- Il cliente modifica pagine, Dati attività e Menu con Decap CMS su `/admin/` (flusso editoriale: ogni modifica è una pull request). Tema (`theme.json`) e layout (`layout.json`) non sono esposti.
- `public/admin/config.yml` è generato da `scripts/gen-decap-config.ts`: mai a mano. Setup, inviti e limiti in `docs/decap.md`.

## Comandi

| Comando                  | Cosa fa                                           |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Server di sviluppo su `localhost:4321`            |
| `npm run build`          | Build di produzione in `dist/`                    |
| `npm run preview`        | Anteprima locale della build                      |
| `npm run design:shots`   | Screenshot delle pagine a 1280 e 375 px, anche con temi di prova a confronto, in `reports/design/` (skill `direzione-visiva` e `revisione-visiva`) |
| `npm run check`          | Controlli statici + build; `-- --strict` con le regole di pubblicazione |
| `npm run qa`             | `check` + link, accessibilità, interattivi, Lighthouse sul sito servito |
| `npm run check:contrast` | Verifica il contrasto WCAG AA di tutte le palette |
| `npm run check:recipes`  | Schema e immagini di ricette e impostazioni (prima della build, con pagina, sezione e campo), poi regole di contenuto; `-- --strict` esce con errore |
| `npm run check:tokens`   | Niente classi della palette Tailwind, colori fissi né `!important` in `src/blocks`, `src/core` e `src/layouts` |
| `npm run check:lock`     | Sito cliente: niente modifiche locali a cartelle e file gestiti (`blocks.lock.json`, con versione e hash) |
| `npm run gen:decap`      | Genera `public/admin/config.yml` dagli schemi (anche in `prebuild`); senza repository GitHub usa un segnaposto con un avviso |
| `npm run check:decap`    | Fallisce se `config.yml` non è aggiornato                  |
| `npm run site:init`      | Sito cliente, una volta: toglie la parte della libreria, repository del CMS, `blocks.lock.json`, `docs/sito.md` |
| `npm run site:create -- nome-cliente` | Solo titolare, dalla libreria: piano offline di repo privata, invito agente e progetto Vercel; `--apply` esegue (guida `docs/provisioning.md`) |
| `npm run test:provisioning` | Libreria: test di `site:create` con API simulate, senza creare risorse |
| `npm run blocks:sync -- vX.Y.Z` | Sito cliente: aggiorna cartelle e file gestiti, `package.json` e lock alla versione indicata della libreria |
| `npm run gen:catalog`    | Libreria: genera `docs/catalogo` (README, schede, catalogo.json) da schemi, meta e fixture |
| `npm run screenshots`    | Libreria: build, anteprima e screenshot di ogni variante in `docs/catalogo/img` |
| `npm run catalog`        | Libreria: `gen:catalog` + `screenshots`           |
| `npm run check:blocks`   | Libreria: contratto dei blocchi; fallisce anche se `docs/catalogo` non è aggiornato o manca uno screenshot (`check:catalog` è lo stesso) |
| `npm run check:template` | Libreria: il template inizializzato come sito deve fallire `qa --strict` solo per i segnaposto (job CI `template-as-site`) |
| `npm run release -- vX.Y.Z` | Libreria: versione in `library.manifest.json`, `CHANGELOG.md` e `docs/specifica.md`, `gen:catalog`, `screenshots`, `check`, commit e tag (working tree pulito; push a mano) |
| `npm run cms:local`      | `decap-server` per provare `/admin/` in locale, senza GitHub |
| `npm run pr -- --dest <branch>` | Agenti: cerca la PR aperta dal branch; con `--title` (e `--body-file`) la apre in bozza (skill `github-pr`) |

In CI (`.github/workflows/ci.yml`, gestito): `check` sulle pull request, sui push su `main` e a mano; `qa` (e nella libreria `template-as-site`) sulle pull request; `--strict` sulle pull request verso `main`. Dettagli e protezione di `main` in `docs/controlli.md`.

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
