# Controlli automatici

Due comandi, un solo formato di report:

| Comando                     | Cosa esegue                                                                          | Quando                             |
| --------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| `npm run check`             | astro-check, decap, tokens, contrast, blocks, lock, recipes, build (+ release)       | prima di ogni commit; CI su ogni push |
| `npm run qa`                | tutto `check`, poi su `astro preview`: links, a11y, interactive, lighthouse          | prima di una PR; CI sulle PR       |
| `npm run check -- --strict` | come sopra con le regole di pubblicazione: recipes come errori, release attivo       | CI sulle PR verso `main`           |

Entrambi scrivono `reports/qa.md` (leggibile) e `reports/qa.json` (per strumenti), più i report HTML di Lighthouse in `reports/lighthouse/`; in CI `reports/` è un artifact del job. Escono con codice 1 se c'è almeno un **errore**; gli **avvisi** si leggono ma non bloccano.

Un check singolo: `node scripts/checks/run.ts tokens` (anche più nomi). Scorciatoie: `npm run check:tokens`, `check:contrast`, `check:blocks`, `check:decap`, `check:lock`, `check:recipes`.

## Libreria e siti cliente

Gli stessi script girano nella repo site-starter (la **libreria**, riconosciuta dalla cartella `src/pages/catalogo`) e nei **siti cliente**. Cambia questo:

- `blocks` gira solo nella libreria;
- `lock` gira solo dove esiste `blocks.lock.json` (i siti cliente);
- nella libreria `recipes` resta un report di avvisi e `release` è saltato anche con `--strict`: il template contiene segnaposto per scelta.

## I check

| Check         | Suite | Livello                         | Cosa controlla                                                                                                     | Se fallisce                                                                                                    |
| ------------- | ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `astro-check` | check | errore (avvisi TS = avviso)     | Tipi di `.astro` e `.ts` (`astro check`)                                                                            | Correggi il tipo alla riga indicata.                                                                            |
| `decap`       | check | errore                          | `public/admin/config.yml` uguale a quello generato dagli schemi; ogni campo ha `.describe()` ed è mappabile        | `npm run gen:decap` e commit del file; per un campo, aggiungi `.describe("Etichetta\|Aiuto")` (`docs/decap.md`). |
| `tokens`      | check | errore                          | In `src/blocks` e `src/core` (`.astro`, `.css`): niente `bg-[#..]`, colori letterali, `style` con color/background, `!important` | Usa i token semantici (`bg-primary`, `text-fg-muted`...) o una variabile della palette.                          |
| `contrast`    | check | errore                          | Contrasto WCAG AA delle coppie di ogni palette (4.5:1 testi, 3:1 anello di focus)                                    | Cambia i colori della palette in `src/themes/palettes/` finché il rapporto basta.                               |
| `blocks`      | check | errore                          | Libreria: 4 file per blocco, `meta` completo con `source` e `scope`, licenza in `THIRD_PARTY_LICENSES.md` se esterno, fixture valide (e i dati `site` di prova contro lo schema di `site.json`), una per variante; ogni blocco di layout ha la sua chiave in `layoutSchema` | Segui il contratto di `src/blocks/README.md`; il messaggio dice blocco, fixture e campo.                         |
| `lock`        | check | errore                          | Siti cliente: hash sha256 dei file delle cartelle gestite uguali a `blocks.lock.json`                               | «Modifica locale vietata, va fatta in site-starter»: annulla la modifica e proponila nella libreria.              |
| `recipes`     | check | avviso; errore con `--strict`   | Segnaposto, recapiti scritti nei testi, più di un hero, id duplicati, link o ancore rotti, alt uguale al nome file; avvisi di struttura | Il messaggio dice file, sezione e campo; vedi `src/content/pages/README.md`.                                     |
| `build`       | check | errore                          | `npm run build` (schemi delle ricette, fixture, configurazione di Decap)                                            | Il messaggio riporta l'errore di Astro con file e campo.                                                         |
| `release`     | check | errore, solo con `--strict`     | Niente `DA-COMPILARE` in impostazioni e `site.config.ts`; nessuna bozza linkata; sitemap, robots.txt, favicon e Open Graph completo; nel footer di ogni pagina P.IVA e, per le società, REA e capitale sociale; link a privacy e cookie nel footer che portano a una pagina pubblicata (o a un indirizzo https esterno); campi «fonte» compilati | Completa i dati (anche dal CMS, «Dati attività» e «Menu» → Footer), pubblica o slinka le bozze, aggiungi `ogImage`, crea e pubblica le pagine privacy e cookie. |
| `links`       | qa    | interni errore, esterni avviso  | Crawl del sito servito (linkinator), ancore comprese; `/admin/`, `tel:`, `mailto:` esclusi                          | Correggi il link o crea la pagina/ancora; per gli esterni verifica l'indirizzo.                                 |
| `a11y`        | qa    | serious/critical errore, il resto avviso | axe-core su ogni pagina a 375 e 1280 px (WCAG 2.2 AA + best practice)                                       | Il messaggio indica regola, pagina, larghezza e selettori; il link spiega la correzione.                        |
| `interactive` | qa    | errore                          | Header da tastiera: Invio apre il menu, focus nel dialog, Esc chiude e riporta il focus, scroll bloccato e sbloccato; sottomenu con Invio, Tab, Esc | Vedi `docs/blocchi-interattivi.md`.                                                                              |
| `lighthouse`  | qa    | errore                          | Mobile, 3 esecuzioni, mediana: performance ≥ 90, accessibilità ≥ 95, best practices ≥ 95, SEO 100, CLS ≤ 0,05, LCP ≤ 2500 ms (pagine del sito, non il catalogo) | Apri `reports/lighthouse/<pagina>.html`: il messaggio elenca le voci da guardare.                                |

Note:

- **Ordine.** `decap` gira prima della build: il `prebuild` rigenera `config.yml`, e dopo il confronto non direbbe più niente.
- **Build della suite qa.** Usa `SITE_URL` = indirizzo dell'anteprima, così canonical e `og:url` restano sullo stesso host durante i controlli. Quella `dist/` non va pubblicata a mano: Vercel ricostruisce da sé.
- **Avvisi del catalogo.** Nella libreria axe segnala `landmark-unique` sulle pagine del catalogo, che mostrano più header e footer uno sotto l'altro.
- **Header e footer su ogni pagina.** Li disegna `BaseLayout` da `layout.json`: `links` segue anche le voci del menu e i link del footer, quindi devono portare a pagine e ancore che esistono (per questo il template ha `privacy.json` e `cookie.json`). `interactive` prova l'header sulla prima pagina del sito.
- **Sottomenu.** Un sito cliente con un menu senza sottomenu riceve un avviso da `interactive`, non un errore.
- **Pagine legali.** `recipes` avvisa «nessuna cta» anche su privacy e cookie: per quelle pagine si può ignorare.

## In CI

`.github/workflows/ci.yml`:

- job **check** su ogni push e su ogni pull request;
- job **qa** solo sulle pull request, dopo check (con cache npm e cache dei browser di Playwright);
- sulle pull request verso `main` entrambi con `--strict`;
- `reports/` caricata come artifact (`reports-check`, `reports-qa`) anche quando il job fallisce.

## Proteggere `main` su GitHub

Nel repository: **Settings → Rules → Rulesets → New branch ruleset** (o **Settings → Branches → Add branch protection rule**):

1. **Target:** il ramo `main` (o «Default branch»), stato **Active**.
2. **Restrict deletions** e **Block force pushes**.
3. **Require a pull request before merging**: niente push diretti su `main`. Lascia a 0 le approvazioni obbligatorie: il CMS pubblica unendo la pull request del cliente, e con una revisione obbligatoria non potrebbe farlo (`docs/decap.md`).
4. **Require status checks to pass**, con **Require branches to be up to date**: aggiungi **check** e **qa** (compaiono nell'elenco dopo la prima esecuzione del workflow).
5. **Bypass list** vuota, o solo l'amministratore dell'agenzia per le emergenze.

Così ogni modifica, anche dal CMS, arriva su `main` solo con build, controlli e regole di pubblicazione verdi.
