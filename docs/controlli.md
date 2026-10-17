# Controlli automatici

Due comandi, un solo formato di report:

| Comando                     | Cosa esegue                                                                          | Quando                             |
| --------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| `npm run check`             | recipes, astro-check, decap, tokens, contrast, blocks, catalog, lock, build (+ release) | prima di ogni commit; CI sulle PR e sui push su `main` |
| `npm run qa`                | tutto `check`, poi su `astro preview`: links, a11y, interactive, buttons, lighthouse | prima di una PR; CI sulle PR       |
| `npm run check -- --strict` | come sopra con le regole di pubblicazione: recipes come errori, release attivo (nei siti cliente) | CI sulle PR verso `main`           |
| `npm run check:template`    | solo libreria: il template, inizializzato come sito, deve fallire `qa --strict` solo per i segnaposto | CI sulle PR (job `template-as-site`) |

Entrambi scrivono `reports/qa.md` (leggibile) e `reports/qa.json` (per strumenti), più i report HTML di Lighthouse in `reports/lighthouse/`; in CI `reports/` è un artifact del job. Escono con codice 1 se c'è almeno un **errore**; gli **avvisi** si leggono ma non bloccano.

In console, per ogni check: prima tutti gli errori, poi tutti gli avvisi, poi i segnaposto riassunti in una riga per tipo e livello (`! 57 segnaposto DA-COMPILARE in 6 file — dettaglio in reports/qa.md`), così un avviso di struttura non si perde tra i segnaposto. In `reports/qa.md` lo stesso ordine, con i segnaposto elencati uno per uno in «Segnaposto» sotto ogni check.

Un check singolo: `node scripts/checks/run.ts tokens` (anche più nomi). Scorciatoie: `npm run check:tokens`, `check:contrast`, `check:blocks` (uguale a `check:catalog`), `check:decap`, `check:lock`, `check:recipes`.

## Libreria e siti cliente

Gli stessi script girano nella repo site-starter (la **libreria**, solo con `SITE_STARTER_LIBRARY=1`: `src/core/mode.ts`) e nei **siti cliente** (il default). Dove impostare la variabile e come si crea e aggiorna un sito: `docs/siti-cliente.md`. Cambia questo:

- `blocks` gira solo nella libreria (compreso il confronto di `docs/catalogo`);
- `lock` gira solo nei siti cliente, e un `blocks.lock.json` mancante è un errore (sito non inizializzato: `npm run site:init`);
- con `--strict`, nella libreria `recipes` dà errori per le regole strutturali e avvisi per i segnaposto, e `release` è saltato: il template contiene segnaposto per scelta. Nei siti cliente tutto è errore;
- `decap`: se il repository GitHub del CMS non si trova, avviso; errore con `--strict` in un sito cliente;
- `build`: in un sito cliente fallisce se `/catalogo` è nel build.

## I check

| Check         | Suite | Livello                         | Cosa controlla                                                                                                     | Se fallisce                                                                                                    |
| ------------- | ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `astro-check` | check | errore (avvisi TS = avviso)     | Tipi di `.astro` e `.ts` (`astro check`)                                                                            | Correggi il tipo alla riga indicata.                                                                            |
| `decap`       | check | errore (repo mancante: avviso, errore con `--strict` nei siti) | `public/admin/config.yml` uguale a quello generato dagli schemi; ogni campo ha `.describe()` ed è mappabile; repository GitHub del CMS trovato | `npm run gen:decap` e commit del file; per un campo, aggiungi `.describe("Etichetta\|Aiuto")` (`docs/decap.md`); per il repository, `cms.repo` in `src/site.config.ts`. |
| `tokens`      | check | errore                          | In `src/blocks`, `src/core` e `src/layouts` (`.astro`, `.css`, `.ts`): niente classi della palette di Tailwind (`bg-blue-600`, `text-gray-500`, `fill-*`, `stroke-*`, `ring-*`, `from-`/`via-`/`to-*`... anche se non generano CSS), `bg-[#..]`, colori letterali, `style` con color/background, `!important` | Usa i token semantici (`bg-primary`, `text-fg-muted`...) o una variabile della palette.                          |
| `contrast`    | check | errore                          | Contrasto WCAG AA delle coppie di ogni palette (4.5:1 testi, 3:1 anello di focus), compresi i passaggi dei pulsanti: `primary-fg` su `primary-hover`, `accent-fg` su `accent-hover`, `primary-hover` su `bg` e `surface` | Cambia i colori della palette in `src/themes/palettes/` finché il rapporto basta.                               |
| `blocks`      | check | errore (screenshot in più = avviso) | Libreria: 4 file per blocco, `meta` completo con `source` e `scope`, licenza in `THIRD_PARTY_LICENSES.md` se esterno, fixture valide (e i dati `site` di prova contro lo schema di `site.json`), una per variante; ogni blocco di layout ha la sua chiave in `layoutSchema`. Poi rigenera in memoria `docs/catalogo` e fallisce se README, schede o `catalogo.json` sono diversi (la sezione «Regole di composizione» esclusa) o se c'è un file in più; varianti con descrizione e «quando usarla», ogni refine/superRefine col suo `// rule:` riportato in `meta.rules`, `fieldRules` su campi e varianti esistenti, mood di 2-4 aggettivi, colori delle palette uguali al CSS; due screenshot per variante e uno per palette; ricette tipo valide, con foto esistenti e link interni all'insieme | Segui il contratto di `src/blocks/README.md`; per `docs/catalogo`, `npm run catalog` (genera e rifà gli screenshot) e commit. Il messaggio dice file e campo. |
| `lock`        | check | errore                          | Siti cliente: `blocks.lock.json` c'è, e gli hash sha256 di cartelle e file gestiti (`library.manifest.json`) sono quelli registrati | «Modifica locale vietata, va fatta in site-starter»: annulla la modifica e proponila nella libreria; per aggiornare, `npm run blocks:sync -- vX.Y.Z`. Lock mancante: `npm run site:init`. |
| `recipes`     | check | schema, immagini e link speciali senza dato: sempre errore; il resto avviso, errore con `--strict` (segnaposto: avviso nella libreria) | Prima della build, ricette e impostazioni contro i loro schemi, con gli stessi messaggi in italiano della build (`src/core/content-validation.ts`), immagini che esistono e link speciali (`@telefono`, `@whatsapp`, `@email`, `@mappa`) di ricette e `navigation.json` con il loro dato in `site.json` (`src/core/links.ts`; la build si ferma con lo stesso messaggio). Poi segnaposto (`DA-COMPILARE`, `og-DA-COMPILARE`, lorem, TODO), recapiti scritti nei testi (tutti quelli di ogni testo), più di un hero, id duplicati, link o ancore rotti, alt uguale al nome file; avvisi di struttura (tone uguali vicini, troppe sezioni, più di un accordion faq, nessuna cta). Non legge le fixture dei blocchi | Il messaggio dice file, sezione e campo, con indici da 1: `src/content/pages/index.json → sezione 3 (services) → items[2].title`. Vedi `src/content/pages/README.md`. |
| `build`       | check | errore                          | `npm run build` (schemi delle ricette, fixture, configurazione di Decap); nei siti cliente, niente `/catalogo` nel build. Saltato, come `astro-check`, se `recipes` ha trovato dati non validi per lo schema | Il messaggio riporta l'errore della build; per i contenuti è in italiano, es. «pagina index.json → sezione 3 (services) → items[2].title: troppo lungo: 90 caratteri, al massimo 70». Per il catalogo, togli `SITE_STARTER_LIBRARY` e `src/library` (`npm run site:init`). |
| `release`     | check | errore, solo con `--strict`     | Niente `DA-COMPILARE` in impostazioni e `site.config.ts`; immagine per i social vera (`defaultOgImage` di `site.json` e `ogImage` delle pagine senza `DA-COMPILARE` nel nome); nessuna bozza linkata; sitemap, robots.txt, favicon e Open Graph completo; nel footer di ogni pagina P.IVA e, per le società, REA e capitale sociale; link a privacy e cookie nel footer che portano a una pagina pubblicata (o a un indirizzo https esterno); campi «fonte» compilati | Completa i dati (anche dal CMS, «Dati attività» e «Menu» → Footer), carica l'immagine per i social («Dati attività» → Immagine per i social), pubblica o slinka le bozze, crea e pubblica le pagine privacy e cookie. |
| `links`       | qa    | interni errore, esterni avviso  | Crawl del sito servito (linkinator), ancore comprese; `/admin/`, `tel:`, `mailto:` esclusi                          | Correggi il link o crea la pagina/ancora; per gli esterni verifica l'indirizzo.                                 |
| `a11y`        | qa    | serious/critical errore, il resto avviso | axe-core su ogni pagina a 375 e 1280 px (WCAG 2.2 AA + best practice)                                       | Il messaggio indica regola, pagina, larghezza e selettori; il link spiega la correzione.                        |
| `buttons`     | qa    | errore                          | Pulsanti con Playwright, sotto una regola globale `a:hover, a:focus { text-decoration: underline }`: primary, secondary e ghost con `textDecorationLine` `none` in hover e con il focus da tastiera, link `underline` in hover (su `/catalogo/bottoni/` nella libreria, sulle pagine del sito altrove) | Vedi `src/core/ui/button/button.css`: la regola senza sottolineatura deve restare fuori dai layer e con la sua specificità. |
| `interactive` | qa    | errore                          | Header da tastiera: Invio apre il menu, focus nel dialog, Esc chiude e riporta il focus, scroll bloccato e sbloccato; sottomenu con Invio, Tab, Esc | Vedi `docs/blocchi-interattivi.md`.                                                                              |
| `lighthouse`  | qa    | errore                          | Mobile, 3 esecuzioni, mediana: performance ≥ 90, accessibilità ≥ 95, best practices ≥ 95, SEO 100, CLS ≤ 0,05, LCP ≤ 2500 ms (pagine del sito, non il catalogo) | Apri `reports/lighthouse/<pagina>.html`: il messaggio elenca le voci da guardare.                                |

Note:

- **Redirect al rilascio.** Nei siti con `--strict`, `release` legge la risposta esplicita a «Esiste un sito online?» in `docs/brief.md`. Con sito esistente o redirect configurati richiede `docs/redirects.md`, decisione datata, righe decise e corrispondenza esatta con `vercel.json` (solo `source`, `destination`, `permanent: true`). La procedura e il formato sono nella skill `redirect`. Il template senza brief e senza redirect resta valido per `check:template`; un brief presente con risposta mancante è un errore. L'Approval Paperclip va verificata dal PM.
- **Test del controllo redirect.** `node --test scripts/checks/redirects.test.ts` verifica anche proposte pendenti, mappe respinte, configurazioni non approvate e redirect mancanti.
- **Ordine.** `recipes` gira per primo: dati non validi o un'immagine che manca si leggono con file, sezione e campo, e `astro-check` e `build`, che si fermerebbero sullo stesso errore, vengono saltati. `decap` gira prima della build: il `prebuild` rigenera `config.yml`, e dopo il confronto non direbbe più niente.
- **Messaggi dei contenuti.** Ricette e impostazioni si validano con l'error map italiana di `src/core/content-validation.ts`, sia in `recipes` sia nella build (i loader di `src/content.config.ts`): sezioni ed elementi si contano da 1, con il tipo del blocco.
- **Check `blocks` incompleto.** Un blocco con un file mancante o che non si carica non ferma il controllo degli altri; il confronto con `docs/catalogo` in quel caso è saltato, con un avviso.
- **Build della suite qa.** Usa `SITE_URL` = indirizzo dell'anteprima, così canonical e `og:url` restano sullo stesso host durante i controlli. Quella `dist/` non va pubblicata a mano: Vercel ricostruisce da sé.
- **Font e CLS.** I font del tema arrivano con `font-display: swap`: finché non sono scaricati il testo usa un ripiego con le loro misure (`"<font> ripiego"` in `src/themes/fonts/`, generato da `scripts/font-fallbacks.ts`), così lo scambio non sposta la pagina anche dove mancano Georgia e i font di sistema di macOS (Linux, Android, il runner della CI).
- **Avvisi del catalogo.** Nella libreria axe segnala `landmark-unique` sulle pagine del catalogo, che mostrano più header e footer uno sotto l'altro.
- **Header e footer su ogni pagina.** Li disegna `BaseLayout` da `layout.json`: `links` segue anche le voci del menu e i link del footer, quindi devono portare a pagine e ancore che esistono (per questo il template ha `privacy.json` e `cookie.json`). `interactive` prova l'header sulla prima pagina del sito.
- **Sottomenu.** Un sito cliente con un menu senza sottomenu riceve un avviso da `interactive`, non un errore.
- **Pagine legali.** «Nessuna cta» non vale per le pagine con `"kind": "legale"` (privacy e cookie del template) né per quelle con `noindex`.

## In CI

`.github/workflows/ci.yml`:

- la modalità viene dalla variabile del repository `SITE_STARTER_LIBRARY` (`vars.SITE_STARTER_LIBRARY`): `1` solo nella repo site-starter, assente nei siti (`docs/siti-cliente.md`);
- quando parte: sulle pull request, sui push su `main` e a mano (**Actions → CI → Run workflow**, su qualsiasi branch). I push sugli altri branch non lo fanno partire: un branch con una pull request aperta gira una volta sola, come pull request, e non anche per il push dello stesso commit. Per provare un branch senza pull request, aprine una in bozza o lancia il workflow a mano;
- `concurrency`: una sola esecuzione per branch, un push nuovo annulla quella in corso;
- `permissions: contents: read`: il token del workflow legge soltanto, nessun job scrive nel repository;
- job **check** sempre;
- job **qa** sulle pull request e a mano, dopo check (con cache npm e cache dei browser di Playwright);
- job **template-as-site**, solo nella libreria, sulle pull request e a mano, dopo check: copia la repo in una cartella temporanea senza la variabile, esegue `site:init` e `qa --strict`, e passa solo se fallisce esclusivamente per i segnaposto attesi (`DA-COMPILARE`, `og-DA-COMPILARE`). È `npm run check:template`;
- sulle pull request verso `main` check e qa con `--strict`;
- `reports/` caricata come artifact (`reports-check`, `reports-qa`, `reports-template-as-site`) anche quando il job fallisce;
- quando qa o template-as-site falliscono, il passo «Motivo del fallimento» (`scripts/checks/ci-summary.ts`) stampa gli errori del report nel log e li mostra come annotazioni `::error` nella pagina della pull request, senza scaricare gli artifact; in template-as-site i segnaposto attesi restano solo nel log;
- runner fissato a `ubuntu-24.04`, non `ubuntu-latest`: un'immagine nuova cambia pacchetti e font di sistema, e con loro le misure di Lighthouse e axe. Si passa a una versione nuova con una pull request apposta. Le azioni sono all'ultima versione maggiore, tutte su Node 24.

## Proteggere `main` su GitHub

Il modello importabile per i siti cliente è [`github-ruleset-sito.json`](github-ruleset-sito.json): in **Settings → Rules → Rulesets** scegli **Import a ruleset**. Richiede `check` e `qa`, revisione dei Code Owners sui file gestiti indicati in `.github/CODEOWNERS` e nessun bypass. Dopo l'import verifica che i due check siano riconosciuti e che il proprietario abbia accesso al repository. L'import e l'attivazione li fa Simone; il file da solo non cambia le impostazioni di GitHub.

Formato del modello: [documentazione GitHub dei ruleset](https://docs.github.com/en/rest/repos/rules). Per la libreria aggiungi anche `template-as-site` ai check obbligatori.

Nel repository: **Settings → Rules → Rulesets → New branch ruleset** (o **Settings → Branches → Add branch protection rule**):

1. **Target:** il ramo `main` (o «Default branch»), stato **Active**.
2. **Restrict deletions** e **Block force pushes**.
3. **Require a pull request before merging**: niente push diretti su `main`. Lascia a 0 le approvazioni obbligatorie: il CMS pubblica unendo la pull request del cliente, e con una revisione obbligatoria non potrebbe farlo (`docs/decap.md`). Nei siti cliente attiva invece **Require review from Code Owners**: vale solo per le pull request che toccano i percorsi di `.github/CODEOWNERS` (il lock e chi lo controlla), mai toccati dal CMS (`docs/siti-cliente.md` → «Chi può cambiare il lock»). Nella libreria non serve: non c'è un lock.
4. **Require status checks to pass**, con **Require branches to be up to date**: aggiungi **check** e **qa**, e nella libreria anche **template-as-site** (compaiono nell'elenco dopo la prima esecuzione del workflow).
5. **Bypass list** vuota, o solo l'amministratore dell'agenzia, per le emergenze e per unire i propri aggiornamenti con `blocks:sync` quando nessun altro può approvarli (GitHub non lascia approvare la propria pull request).

Così ogni modifica, anche dal CMS, arriva su `main` solo con build, controlli e regole di pubblicazione verdi.
