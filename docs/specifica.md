# site-starter — Specifica v1

Versione: allineata alla libreria v0.0.4

## Visione e principi

`site-starter` è una libreria di blocchi Astro + Tailwind v4 con cui una squadra di agenti su Paperclip **completa** siti vetrina per piccole attività, senza inventarli. Stack: Astro, Tailwind v4, Decap CMS, deploy su Vercel, font self-hosted (GDPR). Sito pilota: toscanaimbiancature.it.

**Principi**

1. **Il sito si completa, non si inventa.** Il Designer compone blocchi esistenti; un blocco nuovo nasce solo nella libreria, su task approvato.
2. **Solo classi semantiche** (`bg-primary`, `text-fg-muted`, `font-heading`). La palette di Tailwind è disattivata e vietata dai controlli.
3. **Temi intercambiabili.** Palette, coppie di font e forme sono preset verificati WCAG AA.
4. **La ricetta genera il sito.** Il Designer consegna JSON (tema, layout, pagine); le pagine si generano e si validano da sole.
5. **Niente dati inventati.** Recapiti e dati legali solo da `site.json`; recensioni e numeri con `fonte`; foto dei lavori solo reali.
6. **I controlli bloccano, gli agenti si correggono.** Ogni errore indica file, sezione, campo e cosa fare.
7. **Tre cancelli umani:** brief, design, messa online. Nessun agente pubblica da solo.

**Modalità.** La stessa repo funziona in due modi: **libreria** (solo con `SITE_STARTER_LIBRARY=1`) e **sito cliente** (default, la più severa). Nel dubbio un progetto è un sito cliente.

## 1. Architettura della repo e distribuzione

Ogni sito cliente è una **copia sincronizzata** della libreria: i file della libreria vengono copiati nel sito e bloccati da un lock con versione e hash. Un aggiornamento è un comando esplicito.

| Comando | Dove | Cosa fa |
| --- | --- | --- |
| Use this template (GitHub) | GitHub | Crea la repo del sito con un commit iniziale |
| `npm run site:init` | sito | Toglie le parti solo-libreria, imposta il repo Decap, scrive `blocks.lock.json`, crea `docs/sito.md` |
| `npm run blocks:sync -- vX.Y.Z` | sito | Porta file gestiti e `package.json` a una versione della libreria; riepiloga cambi e breaking change |
| `npm run release -- vX.Y.Z` | libreria | Catalogo, screenshot, controlli, commit e tag |

**Gestiti dalla libreria** (`library.manifest.json`, mai modificati nei siti): `src/blocks`, `src/core`, `src/themes`, `src/layouts`, `scripts/`, `docs/catalogo/`, `docs/skill/`, `docs/modelli/`, `docs/agenti/`, `content.config.ts`, `src/pages/[...slug].astro`, `astro.config.mjs`, il manifest stesso, `.github/workflows/`, `.github/CODEOWNERS`, `CLAUDE.md`, `AGENTS.md`.

**Proprietà del sito:** `src/content/**` (ricette e impostazioni), `src/assets/images/**`, `src/site.config.ts`, `docs/sito.md`, `docs/brief.md`, `docs/nota-design.md`, `docs/redirects.md`, `vercel.json`.

**Solo libreria (escluso):** `src/library/` (catalogo web, iniettato da un'integrazione Astro solo in modalità libreria).

**Struttura principale**

- `src/blocks/<tipo>/`: componente, `schema.ts`, `meta.ts`, `fixtures.ts`
- `src/core/`: registry, page-schema, RenderSections, `mode.ts`, validazione dei contenuti, integrazioni, `icons.ts`
- `src/core/ui/`: primitive (`button/`, Accordion, Tabs, Carousel, Section, Container, Img, Icon)
- `src/themes/`: `base.css`, `palettes/`, `fonts/`
- `src/content/pages/*.json`, `src/content/settings/{site,navigation,theme,layout}.json`
- `scripts/`: generatori, `checks/`, `site-init`, `blocks-sync`, `release`
- `CLAUDE.md` importa `AGENTS.md` (regole di repo) e `docs/sito.md` (note del singolo sito)

Multipagina dalla v1; solo italiano.

## 2. Token e temi

I blocchi usano solo token semantici definiti in `@theme inline`, che puntano a variabili CSS; i preset cambiano solo le variabili. `--color-*: initial` elimina la palette di Tailwind.

| Gruppo | Token |
| --- | --- |
| Colori | `bg`, `fg`, `fg-muted`, `surface`, `surface-fg`, `primary`, `primary-fg`, `primary-hover`, `accent`, `accent-fg`, `accent-hover`, `border`, `ring`, più `white`, `black`, `transparent`, `current` |
| Font | `heading`, `body` |
| Raggi | `box`, `button` |

**Preset**, scelti con attributi su `<html>` (`data-palette`, `data-fonts`, `data-shape`, `data-pattern`, `data-texture`) letti da `src/content/settings/theme.json`:

- **Palette** (`palettes/*.css`): ogni coppia testo/sfondo, compresi gli stati hover, ≥ 4,5:1. Metadati `mood` e `adattoA` con più settori, nessuna città o settore unico nel nome.
- **Font** (`fonts/*.css`): coppie da `@fontsource-variable/*`, self-hosted. Il sito carica solo la coppia scelta, il catalogo tutte.
- **Forma**: `squadrato`, `morbido`, `arrotondato` (raggi di box e bottoni).
- **Decoro** (`patterns/*.css`, `pattern`, di partenza `nessuno`): il motivo delle sezioni con `background: "decoro"` (punti, griglia, righe, onde, cerchi, arco), nei colori del tono (`--decor-ink`, `--decor-fill` in `backgrounds.css`).
- **Texture** (`textures/*.css`, `texture`, di partenza `liscia`): grana o carta in soft-light sopra lo sfondo di ogni sezione, mai sopra il testo; rumore SVG con limiti dichiarati, che `check:contrast` usa per verificare i testi.

Il tema non è modificabile da Decap: lo sceglie il Designer, lo approvi tu.

## 3. Contratto dei blocchi e primitive

Un blocco è una cartella con quattro file; il registry li raccoglie da solo, senza registrazione manuale.

| File | Contenuto obbligatorio |
| --- | --- |
| `schema.ts` | Funzione `({ image }) => z.object(...)`: `variant` (enum) e campi con limiti; ogni campo con `.describe()` in italiano (etichetta e aiuto separati da una barra verticale); ogni `superRefine` con commento `// rule:` |
| `meta.ts` | `name`, `description`, `whenToUse`, `avoidWhen`, `category`, `version`, `scope` (`page` o `layout`), `variants` con descrizione, `source` (`originale` o fonte e licenza), `interactive?`, `rules` se ci sono regole incrociate |
| `fixtures.ts` | Almeno un esempio valido per variante; attività di esempio generica, recapiti palesemente finti |
| `<Nome>.astro` | Radice `<Section>`; solo classi semantiche e primitive del core |

**Campi comuni** aggiunti dal motore a ogni sezione: `id` (ancora, kebab-case), `tone` (`default`, `muted`, `primary`) `edge`, il bordo in alto (`dritto`, `onda`, `diagonale`, `curva`; CSS in `src/themes/edges.css`, non sulla prima sezione), e `background`, l'effetto di sfondo (`pieno`, `sfumato`, `alone`, `aurora`, `decoro`; ammessi per blocco in `meta.ts`, CSS solo con token in `src/themes/backgrounds.css`, contrasto verificato nel punto più carico).

**Primitive** (`src/core/ui/`, usate dai blocchi, mai nelle ricette):

- **Button** (`ui/button/`): varianti `primary`, `secondary`, `ghost`, `link`; taglie `sm`, `md`, `lg`; icona opzionale; si adatta al `tone`. Nessuna sottolineatura in nessuno stato, tranne `link`. Focus con anello solo da tastiera. Schema `cta` riusabile: `{ label ≤ 25, href, style?, icon? }`.
- **Link speciali**: `@telefono`, `@whatsapp`, `@email`, `@mappa`, risolti da `site.json`. Se il dato manca, errore.
- **Accordion** su `<details>`/`<summary>`; **Tabs** ARIA (su mobile diventano Accordion); **Carousel** con scroll-snap, senza autoplay; **Icon** dalla lista chiusa di `icons.ts`; **Img**, **Section**, **Container**.

**Blocchi interattivi** (`interactive: true`): JavaScript vanilla nel componente, funzionano anche senza JS, tastiera e focus completi, `prefers-reduced-motion` rispettato, nessun autoplay. Regole in `docs/blocchi-interattivi.md`.

## 4. Lista dei blocchi v1

Sedici blocchi: cinque di riferimento fatti da te (✦), gli altri dal Builder. Header e footer hanno scope `layout`: stanno in `layout.json`, non nelle ricette.

| Blocco | Scope | Varianti | Quando usarlo | Chi |
| --- | --- | --- | --- | --- |
| header ✦ | layout | `semplice`, `con-cta`; opzione `sticky`; hamburger sempre su mobile | Sempre | Tu |
| footer ✦ | layout | `colonne`, `minimale`; opzione `ctaBand` | Sempre; dati legali obbligatori | Tu |
| hero ✦ | page | `split`, `full`, `centered` | Apertura di ogni pagina, una sola per pagina | Tu |
| services ✦ | page | `cards-icone`, `cards-immagine`, `alternato`, `schede` | Elenco dei servizi principali | Tu |
| cta ✦ | page | `banner`, `split-contatto` | Chiusura di sezione o pagina | Tu |
| accordion | page | `faq` (con JSON-LD), `contenuti` | Domande frequenti, informative | Tu (prompt I) |
| tabs | page | `testo`, `testo-immagine` | Servizi per categoria, listini | Tu (prompt I) |
| features | page | `3-colonne`, `lista` | Vantaggi e punti di forza | Builder, lotto 2 |
| about | page | `immagine-testo`, `con-numeri` | Chi siamo; numeri con `fonte` | Builder, lotto 2 |
| process | page | `passi-numerati`, `timeline` | Come lavoriamo | Builder, lotto 2 |
| contact | page | `info-mappa`, `info-cta` | Pagina contatti; mappa solo come link o al clic | Builder, lotto 1 |
| gallery | page | `griglia-popup`, `prima-dopo`, `slider` | Lavori svolti, solo foto reali | Builder, lotto 3 |
| testimonials | page | `cards`, `singola`, `slider` | Solo recensioni reali con `fonte` | Builder, lotto 3 |
| carousel | page | `immagini`, `immagini-testo` | Prodotti o lavori in sequenza; mai nell'hero | Builder, lotto 3 |
| areas | page | `elenco-zone`, `mappa-link` | Zone servite, SEO locale | Builder, lotto 4 |
| form | page | `contatto`, `preventivo` | Richieste scritte, invio Resend su Vercel | Builder |

**Moduli di contatto**: blocco `form`, invio POST a `/api/contact` (Vercel Function indipendente dal sito statico), Resend via API server. Destinatario solo da `site.json.email`, mittente verificato e chiave API da variabili server. Validazione server, honeypot, controllo dell’origine, limite del corpo e chiave di idempotenza; nessuna conferma di successo se il provider fallisce. Senza JS il POST restituisce una pagina HTML con l’esito. Nel catalogo invio solo simulato ed esplicitamente indicato. Configurazione e informativa in `docs/form.md`.

## 5. Catalogo

Il catalogo ha tre forme generate dalla stessa fonte (schemi e `meta.ts`), quindi sempre allineate al codice.

| Forma | Dove | Per chi |
| --- | --- | --- |
| Pagina web `/catalogo` (Blocchi, Bottoni, Icone, UI) con selettori palette, font, forma | Solo libreria, Vercel protetto e `noindex`; voce "Catalogo" nel menu solo in modalità libreria | Tu, Designer in revisione, QA |
| `docs/catalogo/README.md` + `docs/catalogo/blocchi/<tipo>.md` + `catalogo.json` | Libreria e siti (gestiti, arrivano con `blocks:sync`) | Designer quando compone |
| `docs/catalogo/img/<tipo>-<variante>-{desktop,mobile}.webp` | Libreria e siti | Designer, tu dal telefono |

**L'indice** contiene: versione della libreria, regole d'oro delle ricette, link speciali, icone per categoria, preset con `mood` e `adattoA`, elenco dei blocchi.

**Ogni scheda** contiene: quando usarlo ed evitarlo, varianti con screenshot desktop e mobile, tabella Campo, Tipo, Obbligatorio, Limiti, Note, ed esempio JSON pronto.

**Icone**: lista curata di circa 150 icone per categoria (Lucide, licenza ISC) e marchi (Simple Icons, CC0), con alias italiani e ricerca nel catalogo. Una nuova icona si aggiunge con una riga in `icons.ts`.

Screenshot e schede si rigenerano a ogni `release`; `check:blocks` fallisce se non sono aggiornati.

## 6. Ricette e generazione delle pagine

Una “ricetta” è un insieme di JSON validati: quattro impostazioni per sito e un file per pagina. Le pagine si generano da sole con `[...slug].astro`.

| File | Contenuto | Chi lo scrive | In Decap |
| --- | --- | --- | --- |
| `settings/theme.json` | palette, font, forma | Designer | No |
| `settings/layout.json` | varianti di header e footer, `sticky`, `ctaBand` | Designer | No |
| `settings/site.json` | nome, tipo di attività (`businessType`) e zone servite (`areaServed`) per i dati strutturati, forma giuridica, P.IVA, REA e capitale (società), indirizzo, orari, recapiti, social, `defaultOgImage` | Builder dal brief | Sì |
| `settings/navigation.json` | menu principale e gruppo `footer` | Designer | Sì |
| `pages/<slug>.json` | `title` ≤ 60, `description` ≤ 160, `draft`, `ogImage?`, `noindex?`, `kind?` (`legale`), `sections` | Designer | Sì |

**Sezioni piatte**: `type`, `variant`, `id`, `tone`, `background`, `edge` e contenuti allo stesso livello, compatibile con Decap.

```json
{ "type": "hero", "variant": "split", "tone": "default",
  "title": "…", "cta": { "label": "Chiedi un preventivo", "href": "@telefono" },
  "image": { "src": "../../assets/images/hero.jpg", "alt": "…" } }
```

**Validazione su tre livelli**

1. **Zod al build**: struttura, limiti, varianti, icone, immagini esistenti. Messaggi in italiano, indici da 1, con pagina, sezione e campo.
2. **JSON Schema** con `$schema` nei file, per l'autocompletamento.
3. **`check:recipes`**: segnaposto, recapiti scritti nei testi, più di un hero, `id` duplicati, link interni rotti, `alt` uguale al nome file, `@link` senza dato in `site.json`. Avvisi: `tone` uguali consecutivi, più di 3 sezioni con effetto di sfondo o due vicine, più di 2 bordi in alto o un bordo sulla prima sezione o tra toni uguali, più di 12 sezioni, prima sezione non hero, nessuna cta (non per le pagine `legale`), più di un accordion `faq`.

**Bozze**: `draft: true` compare solo nelle anteprime Vercel, mai in produzione.

**Pagine del template**: `index`, `contatti`, `privacy`, `cookie`, con segnaposto `DA-COMPILARE` e `og-DA-COMPILARE.jpg`.

## 7. Decap CMS

`public/admin/config.yml` si genera dagli schemi con `gen:decap` e non si scrive a mano: un campo senza `describe()` o non traducibile blocca la build.

| Zod | Widget Decap |
| --- | --- |
| `string` ≤ 120 | `string` con `pattern` di lunghezza e messaggio in italiano |
| `string` > 120 | `text` |
| `enum` (variant, tone, icona) | `select` |
| `boolean` / `image()` / `object` | `boolean` / `image` / `object` |
| `array` | `list` con `min`/`max` |
| `sections` | `list` con `types`, `typeKey: type`: aggiungi, riordina, elimina sezioni |

- **Collezioni**: Pagine, Dati attività (`site.json`), Menu (`navigation.json`). Tema e layout non sono esposti.
- **Immagini**: `media_folder` e `public_folder` relativi (`../../assets/images`), così passano dall'ottimizzazione di Astro.
- **Anteprima interna disattivata**: l'anteprima vera è quella di Vercel.
- **Flusso editoriale** (`editorial_workflow`): ogni modifica del cliente diventa una PR, passa dalla CI e va online solo con il merge.
- **Login**: backend `github` con un **servizio OAuth condiviso** tra tutti i siti (una OAuth App, un worker). Il cliente serve un account GitHub invitato come collaboratore.
- **Bundle** servito in locale, `/admin` con `noindex`. Le vulnerabilità segnalate da `npm audit` riguardano solo `/admin`; si ricontrollano a ogni release.
- **Piano B**: Sveltia CMS usa la stessa configurazione; da valutare solo se supporta il flusso editoriale.

## 8. Controlli automatici e CI

Gli stessi comandi servono a CI, QA e Builder; tutti scrivono `reports/qa.json` e `reports/qa.md` nello stesso formato (`check`, `level`, `file`, `where`, `message`, `hint`, `placeholder?`).

| Livello | Comando | Quando | Contenuto |
| --- | --- | --- | --- |
| 1. Veloce | `npm run check` | Push su `main`, PR, a mano | recipes (prima della build), astro check, build, tokens, contrast, blocks (libreria), decap, lock (siti) |
| 2. Qualità | `npm run qa` | Ogni PR | Livello 1 + link interni (errore) ed esterni (avviso), axe a 375 e 1280 px, test da tastiera degli interattivi, test dei bottoni, Lighthouse |
| 3. Rilascio | `npm run qa -- --strict` | PR verso `main` | Libreria: errori strutturali bloccanti, segnaposto ad avviso. Sito: tutto bloccante, più controlli di rilascio |
| Template | `npm run check:template` | PR della libreria | Copia senza variabile, `site:init`, `qa --strict`: deve fallire solo per i segnaposto |

**Soglie Lighthouse** (mobile, mediana di 3 run, sul build locale in CI): prestazioni ≥ 90, accessibilità ≥ 95, best practices ≥ 95, SEO 100, CLS ≤ 0,05, LCP ≤ 2,5 s.

**Controlli di rilascio** (sito, `--strict`): nessun `DA-COMPILARE` e nessun `og-DA-COMPILARE`; nessuna bozza linkata; sitemap, robots, favicon, immagine OG; P.IVA, e REA e capitale se società; privacy e cookie linkate nel footer; `fonte` compilata; se il brief indica un sito esistente, mappa dei redirect decisa e in `vercel.json` solo le righe approvate.

**Workflow**: runner fissato a `ubuntu-24.04`, azioni aggiornate per Node 24, `permissions: contents: read`, `concurrency` per branch, variabile `SITE_STARTER_LIBRARY` passata da `vars`, errori riassunti come annotazioni. Un branch senza PR non fa girare la CI: in un sito la PR in bozza di `lancio` si apre all'avvio, nella libreria ogni task apre subito la sua.

**Protezione di `main`**: sulle repo private richiede GitHub Pro. Rimandata; da attivare prima del lavoro degli agenti sui siti (vedi Checklist).

## 9. Fonti esterne e licenze

Da una fonte esterna si prende solo la struttura (griglia, disposizione, responsive); colori, font, schema e varianti si riscrivono secondo il contratto.

| Fonte | Licenza | Uso |
| --- | --- | --- |
| HyperUI | MIT | Prima scelta come riferimento strutturale |
| Flowbite (parte gratuita) | MIT; la Pro ha una EULA separata | Ammessa la parte gratuita |
| Preline UI | MIT più Fair Use License | Ammessa, allegando entrambe le licenze; niente dipendenza dal suo JS |
| Tailwind Plus | Commerciale | **Vietata**: la licenza esclude template riusati per più clienti |
| Lucide / Simple Icons | ISC / CC0 | Icone |

**Regole**: campo `source` in `meta.ts` di ogni blocco; testi delle licenze in `docs/THIRD_PARTY_LICENSES.md`; `check:blocks` verifica che ogni fonte esterna abbia la sua licenza. I blocchi di riferimento sono originali.

Fonti: [Tailwind Plus, licenza](https://tailwindcss.com/plus/license), [Preline, licenza](https://preline.co/docs/license.html), [Flowbite, licenza](https://flowbite.com/docs/getting-started/license).

## 10. Squadra Paperclip: flussi e cancelli

> **In pausa dal 2026-10-20.** Si lavora con un agente solo, Claude Code o Codex, insieme a Simone: come in `AGENTS.md`, sezione «Lavorare con Claude Code o Codex», con le skill in `.agents/skills/`. Questa sezione e le istruzioni in `docs/agenti/` e `docs/skill/` restano per quando la squadra riparte; i tre cancelli (brief, design, messa online) restano decisioni di Simone.

Gli agenti sono gli stessi per tutti i Project; si attivano solo su assegnazione di un task, tranne il PM che fa un controllo giornaliero. Le fondamenta (prompt A-Q) le fai tu con Claude Code; Paperclip entra dopo il rilascio v1.

**Flusso di un sito cliente:**

1. Avvio sito (Builder)
2. Brief (PM)
3. **Cancello 1**
4. Dati (Builder), poi design (Designer)
5. **Cancello 2**
6. QA (ciclo fino al verde)
7. SEO pre-lancio
8. **Cancello 3** (merge: online)

Se al Designer manca un blocco, apre una richiesta nel Project Libreria; il sito lo riceve poi con `blocks:sync`.

| Agente | Modello | Fa | Non fa |
| --- | --- | --- | --- |
| Simone (vertice) | — | Nulla: heartbeat spento; passa al PM ciò che riceve | Non approva |
| PM | Sonnet | Unico che parla con te; crea e assegna i task; porta i cancelli; tiene il registro dello stato | Non scrive codice né contenuti |
| Designer | Opus | Tema, layout, menu, ricette, testi, nota di design; revisione visiva dei blocchi nuovi | Non scrive codice; non inventa blocchi, dati, recensioni, foto |
| Builder | Sonnet | `site:init`, `site.json`, immagini, SEO tecnica, proposta dei redirect, nuovi blocchi solo su task approvato | Non cambia testi o design; non tocca file gestiti nei siti |
| QA | Opus | `npm run qa -- --strict`, poi confronto con il brief; apre richieste | Non corregge mai |
| SEO | Haiku o Sonnet | Verifica pre-lancio, routine mensile, rischi dei redirect | Non riscrive; segnala |

**I tre cancelli**

| Cancello | Cosa approvi | Dove |
| --- | --- | --- |
| 1. Brief | `docs/brief.md` | Approval in Paperclip, portata dal PM |
| 2. Design | Anteprima Vercel della PR, nota di design, ed eventuale mappa dei redirect | Approval in Paperclip, portata dal PM |
| 3. Messa online | La PR verso `main` con tutti i controlli verdi | Merge su GitHub, fatto da te |

**Domande al titolare**: il PM usa italiano semplice, una decisione per domanda e al massimo
tre domande per richiesta. Presenta risultato/link verificato o valori da confermare,
raccomandazione e opzioni con effetti concreti. I riferimenti tecnici identificano la
versione a seguire; non sostituiscono la domanda. Grafica, destinazioni dei vecchi indirizzi
e testi legali si decidono separatamente. Le lacune già rinviate restano registrate fino
alla fase che ne dipende. Per testi legali si chiedono documenti approvati e responsabile,
non clausole da comporre al momento. Il PM resta assegnatario del coordinamento anche
quando il Board è destinatario di una decisione: verifica richiesta e ripresa senza far
gestire a Simone stati e assegnazioni. Un feedback riapre il lavoro pertinente; un input
esterno già mancante non giustifica cicli di correzione identici.

**Regole comuni a tutti gli agenti**

1. **Branch e PR** (skill `github-pr`). In un sito un solo branch, `lancio`, con una sola **PR aperta per volta** verso `main`, in bozza e inizialmente aperta all'avvio: tutti i task ci lavorano, ognuno nella sua cartella isolata di Paperclip (worktree), allineandosi a `origin/lancio` e facendo push su `lancio`; i cancelli usano la stessa anteprima Vercel. Dopo un merge, ulteriori correzioni autorizzate richiedono una nuova PR per il delta non ancora in main. Nella libreria ogni task lavora su un branch proprio e apre subito la sua PR in bozza.
2. Chi cambia il sito o i blocchi esegue `npm run qa` sul risultato finale; comprende `check`, quindi non occorre ripeterlo subito prima. Durante le correzioni usa controlli mirati. Il QA esegue la verifica indipendente; nel sito prima del cancello 3 serve `npm run qa -- --strict`, senza errori né eccezioni per i segnaposto. PM e SEO non duplicano la suite: il PM verifica CI ed evidenze, il SEO usa il PASS QA sul medesimo SHA e svolge la propria verifica.
3. Si legge `AGENTS.md` (tramite `CLAUDE.md`) e la scheda del catalogo prima di usare un blocco.
4. Un dato mancante non si inventa: il PM usa materiali e ricerche autorizzate e raggruppa le domande residue. Blocca solo le attività dipendenti da quel dato; un’anteprima approvata con lacune può procedere nel perimetro ricevuto.
5. Un blocco mancante non si improvvisa: richiesta di nuovo blocco nel Project Libreria.
6. Nessun agente fa merge su `main`, pubblica, cambia impostazioni della repo o di Vercel.
7. Identità GitHub: account `simone-agenti` tramite connessione e broker per operazione Paperclip; token vuoti nella shell sono previsti (checklist sotto).

**Redirect di un sito esistente**: il Builder prepara una proposta in `docs/redirects.md` e non applica nulla. Il PM la porta al cancello 2. Si applicano in `vercel.json` solo le righe approvate; se respinta, nessun redirect. Il SEO può segnalare rischi.

Il controllo `release` legge nel brief la riga `- Esiste un sito online? sì, <indirizzo>` oppure `- Esiste un sito online? no`. Se il sito esiste, richiede la mappa anche quando la proposta viene respinta. La mappa conserva le colonne `Vecchio URL`, `Nuovo URL`, `Decisione`, `Note`; lo stato è `approvata il gg/mm/aaaa` o `respinta il gg/mm/aaaa`, ogni decisione è `sì` o `no` e ogni rifiuto ha una motivazione. I redirect Vercel devono corrispondere esattamente alle righe approvate, con `permanent: true`. Anche senza sito precedente, eventuali redirect configurati richiedono una mappa decisa. Questo verifica la coerenza dei file: il PM verifica separatamente l'Approval in Paperclip.

**Foto**: lavori, prima/dopo, chi siamo e squadra solo con foto reali del cliente. Immagini stock con licenza commerciale libera solo per sfondi o hero generici, sempre dichiarate nel brief e nella nota di design.
Un'indicazione esplicita del titolare di riusare le immagini del sito esistente è una
fonte d'uso sufficiente nel suo perimetro: si registra con testo, data e URL, senza
chiedere di nuovo lo stesso permesso. Non prova fatti ulteriori sul lavoro ritratto:
le didascalie descrivono ciò che si vede. Il Builder importa e seleziona, il Designer
compone la gallery richiesta con il blocco esistente. L'assenza dei file locali o di
altro materiale non annulla l'autorizzazione e non rende facoltativa la sezione richiesta.

## Autonomia operativa e versioni delle consegne

Il PM gestisce prerequisiti, dipendenze e workspace dei task: ogni task ha un checkout
isolato e un branch locale proprio. Nei siti l’origine è `origin/main` per Avvio e
`origin/lancio` dopo; nella libreria main per lavori nuovi o il branch/SHA di INPUT per
correzioni e revisioni. Non si eredita il workspace del padre. Un checkout sporco di altri resta
intatto e viene sostituito nell’assegnazione del task con uno pulito; non richiede una
nuova decisione di prodotto. Il PM può cambiare queste impostazioni del task, non account,
permessi, agenti, segreti o politiche di sicurezza. La procedura è nelle istruzioni PM.

Le approvazioni esplicite già ricevute si registrano con fonte, data, artefatto/versione e
perimetro. L’approvazione per anteprima non autorizza pubblicazione né rende veri dati
mancanti. In anteprima le lacune autorizzate e i requisiti di rilascio ancora da completare
non fermano attività indipendenti; il PM assegna owner e fase di completamento. Prima del
merge devono passare QA strict, SEO e CI sullo SHA finale. Una CI rossa non è automaticamente
attesa: occorre leggere le cause e distinguere i soli requisiti di rilascio documentati
(dati/segnaposto, informative, redirect ancora da decidere) da regressioni da correggere.

Avvio e Dati sono tecnici. Il Designer compone direttamente tema, menu, pagine e testi
con i blocchi esistenti; non c’è un secondo task Builder per ricopiare il design.
Il Builder interviene dopo il design solo per integrazioni tecniche o redirect approvati.
I task esecutivi terminano con consegna e stato done; il PM gestisce i cancelli intermedi
sui risultati, senza usare l’approvazione finale del padre per ogni fase.

Ogni task dichiara l'ambito: anteprima, rilascio o libreria. Il QA di un'anteprima
esplicitamente autorizzata dal Board usa `npm run qa`, verifica il perimetro e registra
lacune e requisiti di pubblicazione ancora aperti. Il suo PASS non annulla un FAIL strict
storico e non certifica il rilascio; per quest'ultimo resta obbligatorio `qa --strict`
senza errori. Senza ambito esplicito, il QA di un sito resta una verifica di rilascio.
Un servizio già rinviato non genera riaperture identiche senza nuovi input. Una grafica
social ricavata da testi e tema approvati può essere assegnata come derivazione interna,
con provenienza registrata; non sostituisce foto reali con immagini inventate.
La verifica di un alias non certifica lo SHA del deployment: occorrono metadati che
colleghino commit, deployment e URL univoco; in assenza si dichiarano le prove separate.

Le domande non essenziali al risultato corrente si registrano con responsabile e fase
entro cui servono; il PM prosegue senza lasciarle come interazioni bloccanti. Può usare
una scelta provvisoria già nel mandato o omettere un contenuto opzionale. Le risposte
residue si raccolgono prima della consegna che ne dipende, senza consenso implicito,
dati inventati o deroghe ai requisiti di pubblicazione. Si ferma la sola attività che
richiede un dato, un accesso o un'autorizzazione indispensabile, non l'intero progetto.

Il PM separa la consegna corrente dalle attività rinviate in `docs/sito.md`: punto,
motivo, alternativa attuale, owner e condizione di ripresa. I relativi task restano in
backlog nel Project, fuori dai sottotask e dalle dipendenze dell'anteprima. Anche il SEO
può consegnare una verifica di anteprima dopo PASS QA non strict sullo stesso SHA,
senza certificare il rilascio. Composizione e correzioni richieste con input disponibili
restano lavoro corrente; un rinvio non giustifica omissioni come una gallery autorizzata.

Dopo un passaggio il PM verifica una volta che il destinatario sia effettivamente partito.
Un task `blocked` con dipendenze tutte concluse può avere un arresto di esecuzione: si
leggono diagnostica e `executionBlocker`, si preservano diff/commit e si usa la procedura
nativa di recupero. Non si aggira l'arresto con task duplicati né si ripetono azioni di
esito incerto. Il recupero riservato al Board va al gestore del runtime con evidenze;
non diventa una domanda di prodotto a Simone. Procedura in `docs/paperclip.md`.

## Istruzioni degli agenti

Le istruzioni di ruolo stanno in `docs/agenti/`, un file per agente: [`pm.md`](agenti/pm.md), [`designer.md`](agenti/designer.md), [`builder.md`](agenti/builder.md), [`qa.md`](agenti/qa.md), [`seo.md`](agenti/seo.md), [`simone.md`](agenti/simone.md). Ogni file è il testo esatto delle istruzioni dell'agente in Paperclip (Agents → agente → Instructions): ruolo, confini, passaggi di consegne, verdetti. Le regole tecniche stanno in `AGENTS.md`, le procedure nelle skill.

- Le istruzioni sono sempre nel contesto dell'agente; le skill le carica solo quando servono. Una regola che deve valere sempre (mai push su `main`, mai dati inventati, mai merge) sta nelle istruzioni; il come, con i comandi, in una skill.
- I testi del campo Capabilities sono versionati in `docs/agenti/capabilities.json`, una voce per agente. Non estendono i permessi né sostituiscono le istruzioni di ruolo.
- Instructions e Capabilities si cambiano nella libreria, poi si ricopiano nei rispettivi campi di Paperclip e si confrontano dopo il salvataggio. Le skill importate si aggiornano dopo il merge e il pull nel clone del Project: non confondere un file locale con la versione attiva.
- Convenzioni comuni: `VERDETTO: PASS | FAIL` sulla prima riga del commento finale di QA e SEO; `REVISIONE: OK | DA CORREGGERE` per la revisione visiva del Designer; nei siti tutti i task finiscono sul branch `lancio`, ognuno dalla sua cartella isolata.

Il PM distingue conclusione della verifica ed esito: PASS/OK porta alla fase successiva, FAIL/DA CORREGGERE riapre i task responsabili. Dopo FAIL SEO: correzioni → QA → SEO, con dipendenze esplicite. Prima del merge, PASS QA, PASS SEO e CI devono riferirsi allo SHA attuale della PR. Il padre resta aperto fino al merge di Simone.

## Skill condivise

Le procedure riusabili diventano company skill di Paperclip, assegnate solo agli agenti che le usano. Ogni skill è una sequenza di passi con un criterio di fine, non teoria.

| Skill | Agenti | Passi principali | Finita quando |
| --- | --- | --- | --- |
| `brief` | PM | Compila `docs/brief.md` sezione per sezione con Simone; segna "da chiedere" ogni dato mancante | Decisione sul brief registrata con versione e perimetro, lacune dell’anteprima esplicite |
| `modelli-task` | PM | Sceglie il modello, compila obiettivo, input, output, criteri, consegna | Task assegnato con tutti i campi |
| `avvio-sito` | Builder | Verifica repo e cartella, `site:init`, `npm run check`, commit, branch `lancio` e PR in bozza | Lock scritto, check verde |
| `ricetta-pagina` | Designer | Legge brief e catalogo, sceglie blocchi, scrive JSON e testi, `check:recipes`, nota di design | `npm run qa` senza errori, nota completa |
| `nuovo-blocco` | Builder | Cartella, schema con `describe` e `// rule:`, meta, fixture per variante, componente, `gen:catalog`, screenshot | `npm run qa` verde, blocco nel catalogo con tutti i preset |
| `richiesta-blocco` | Designer, PM | Cosa serve, perché nessun blocco basta, contenuto d'esempio, varianti | Richiesta approvata o respinta da Simone |
| `qa` | QA | Procedura delle istruzioni QA, formato delle richieste | Rapporto al PM |
| `seo-prelancio` | SEO | Checklist delle istruzioni SEO | Rapporto al PM |
| `redirect` | Builder, SEO | Raccolta dei vecchi URL dalla sitemap o da una scansione, mappa, stato della decisione | Mappa decisa da Simone |
| `github-pr` | PM, Designer, Builder | Branch (`lancio` nei siti, uno per task nella libreria), commit, push senza token nell'URL, PR in bozza con `npm run pr` (API di GitHub, broker gestito o token dall'env), link nel task; mai merge | PR in bozza aperta e linkata nel task |

Ogni skill si scrive con Claude Code in `docs/skill/<nome>/SKILL.md` nella libreria (frontmatter `name` e `description`, poi passi con i comandi, criterio di fine e cosa non fare), così resta versionata e arriva nei siti. I modelli di brief e di task sono in `docs/modelli/`.

**Come arrivano agli agenti.** Le skill si importano in Paperclip dalla cartella del Project della libreria (`<cartella gestita da Paperclip>/site-starter/docs/skill`, import da percorso locale; la sorgente GitHub non serve). Paperclip non le copia: a ogni run le collega con un link a quella cartella, quindi una skill cambiata arriva agli agenti dopo il merge su `main` e un `git pull` nel clone del Project (le cartelle dei task si aggiornano da sole, il clone principale no). Nello strumento Skill il nome ha un suffisso (`modelli-task--504a9f45d4`); per questo le istruzioni dicono agli agenti di cercare il prefisso e, in caso di dubbio, di leggere `docs/skill/<nome>/SKILL.md` nella propria cartella. Paperclip rifiuta all'import le skill con esecuzione dinamica (`node -e`, `bash -c`, `eval`, `curl … | sh`) o con `env`/`grep`, `TOKEN` e `curl` vicini: i comandi complessi vanno in uno script della repo (es. `npm run pr`).

## Modelli di task

Ogni task del PM segue la stessa forma (`docs/modelli/task.md`, con la tabella dei task tipici). Il primo esempio è il task del Builder per il lotto 1 dei blocchi.

```markdown
TITOLO: <verbo + oggetto>, es. "Pagina Servizi: ricetta e testi"
AGENTE: <Builder | Designer | QA | SEO>
PROJECT: <Libreria blocchi | nome sito>
OBIETTIVO: <una frase>
INPUT: <file, link, brief, richieste>
OUTPUT ATTESO: <file e PR>
CRITERI DI FINE:
- controlli del ruolo: implementazione npm run qa; QA finale --strict con rapporto PASS/FAIL; PM e SEO non duplicano la suite
- <criteri specifici>
VINCOLI: <cosa non toccare>
PASSA A: <agente successivo> | CANCELLO: <se serve approvazione>
```

`PASSA A` serve a chi legge: chi esegue chiude il task `done` e il passaggio lo fa il PM.

**Esempio, lotto 1 del Builder (Project Libreria)**

```markdown
TITOLO: Blocchi lotto 1: contact
AGENTE: Builder
OBIETTIVO: creare il blocco contact secondo il contratto (skill nuovo-blocco).
INPUT: specifica sezione 4 (varianti info-mappa, info-cta), blocchi di riferimento
  hero/cta/footer come modello, docs/blocchi-interattivi.md.
OUTPUT ATTESO: src/blocks/contact/ completo, catalogo e screenshot rigenerati, PR in bozza.
CRITERI DI FINE:
- recapiti letti da site.json, mai nello schema
- mappa solo come link "Apri in Maps" o caricata al clic, nessun iframe al caricamento
- fixture con attivita' di esempio generica e recapiti finti
- npm run qa verde
VINCOLI: nessuna modifica a core, temi o altri blocchi senza chiederlo.
PASSA A: Designer (revisione visiva sul catalogo) -> CANCELLO: approvazione di Simone.
```

**Sequenza dei lotti della libreria**: 1) contact; 2) features, about, process; 3) gallery, testimonials, carousel; 4) areas. Un lotto parte solo dopo il merge del precedente, così ogni lotto riusa quello che il precedente ha stabilito.

**Sequenza dei task di un sito**: Avvio (Builder) → Brief (PM) → cancello 1 → Dati, immagini, redirect (Builder) → Design (Designer), che compone con i dati e le foto già su `lancio` → cancello 2 → QA → correzioni → SEO pre-lancio → cancello 3. Tutti i task lavorano nel proprio branch locale e consegnano su `lancio` e sulla sua PR, che al cancello 3 Simone unisce a `main`.

## Modello di brief

Il brief è la base di tutto: il Designer compone dal brief, il Builder ne prende i dati, il QA confronta col brief. Un campo obbligatorio vuoto richiede chiarimento per il brief completo; un’anteprima può procedere con lacune solo su approvazione esplicita del Board, registrata con perimetro e versione. Il modello è `docs/modelli/brief.md`; nel sito si compila in `docs/brief.md`.

```markdown
# Brief — <nome attività>
Stato: bozza | approvato il <data> | approvato per sola anteprima il <data>
Decisione: <riferimento alla risposta/Approval e versione presentata>
Lacune autorizzate: <dato, attività esclusa, responsabile e fase di completamento>

## 1. Attività (obbligatorio)
- Nome commerciale / ragione sociale / forma giuridica
- P.IVA; se società: REA, capitale sociale, sede legale
- Indirizzo operativo, telefono, WhatsApp, email, orari
- Social (link)

## 2. Cosa fa e per chi (obbligatorio)
- Servizi principali (max 6), con una riga ciascuno
- Clienti tipo (privati, aziende, condomini...)
- Zone servite
- Cosa la distingue (solo fatti verificabili)

## 3. Obiettivo del sito (obbligatorio)
- Azione principale richiesta al visitatore (chiamata, WhatsApp, preventivo...)
- Pagine previste (es. Home, Servizi, Chi siamo, Lavori, Contatti, Privacy, Cookie)

## 4. Tono e stile
- Tono dei testi (es. diretto e rassicurante)
- Preferenze o vincoli di colore e stile; siti che piacciono / non piacciono
- Logo disponibile: si/no, formato

## 5. Materiali
- Foto reali disponibili (lavori, squadra, sede) e chi le fornisce
- Immagini stock ammesse? solo per sfondi/hero generici: si/no
- Recensioni da pubblicare: testo, autore, fonte e data (es. Google 03/2026)
- Numeri da pubblicare (anni di attività, lavori fatti...): valore e fonte

## 6. Sito esistente e dominio
- Esiste un sito online? da chiedere (compilare con «sì, <indirizzo>» oppure «no»)
- Se si: redirect da proporre? (la decisione è di Simone al cancello 2)
- Dominio del nuovo sito (es. www.esempio.it) e chi lo gestisce

## 7. Aspetti legali
- Cookie o servizi di terze parti previsti (analytics, mappe, video)
- Chi fornisce i testi di privacy e cookie

## Da chiedere
- <dati mancanti, uno per riga>
```

## Checklist: messa in servizio e nuovo sito

**Autenticazione di ogni Project Paperclip (libreria e siti)**

Nel runtime gestito si assegna agli agenti la connessione GitHub di `simone-agenti`,
con accesso alla repo cliente. L'identità della run è risolta da Paperclip: Git usa il
launcher e `npm run pr` il broker delle credenziali per operazione. L'assenza di
`GH_TOKEN` e `GITHUB_TOKEN` nella shell è prevista. Non aggiungere token statici per
compensarla e non usare l'account personale come ripiego. Un rifiuto di accesso
resta un limite da correggere nel runtime, senza cambiare identità autonomamente.

Fuori dal runtime gestito lo script PR supporta `GH_TOKEN`/`GITHUB_TOKEN` forniti
in modo sicuro dall'ambiente; mai nei remote, nei file o nei log.
`SITE_STARTER_LIBRARY=1` va impostato solo per la libreria, anche su Vercel e CI.

**Messa in servizio della squadra (una volta)**

- [ ] Prompt Q eseguito (catalogo nel menu, testi neutri, icone) e `npm run release -- v1.0.0` (o v1.1.0)
- [ ] Spuntato "Template repository" su GitHub
- [ ] `.env` locale con `SITE_STARTER_LIBRARY=1`; stessa variabile nella repo GitHub (Variables) e su Vercel
- [ ] Account GitHub `simone-agenti`, invitato con permesso *Write*; connessione gestita assegnata agli agenti
- [ ] Paperclip: identità GitHub gestita `simone-agenti` verificata nella run
- [ ] Paperclip, Project "Libreria blocchi": repo nella cartella gestita da Paperclip (non il tuo clone), Execution Workspaces con «Enable isolated task checkouts» e «New tasks default to isolated checkout» attivi e, nelle impostazioni avanzate, la cartella dei worktree fuori dal clone (`<cartella del Project>/worktrees`, non `.paperclip/worktrees` dentro il clone: lì `astro check` e la build falliscono), autenticazione gestita come sopra (con `SITE_STARTER_LIBRARY=1`)
- [ ] Istruzioni di ruolo dei 6 agenti copiate da `docs/agenti/` in Paperclip; skill create e assegnate
- [ ] Agenti attivi solo su assegnazione (heartbeat spento); per ora i task li avvia Simone a mano, compreso il controllo giornaliero del PM; routine giornaliera e budget per Project da definire
- [ ] Skill in `docs/skill/` scritte con Claude Code e rilasciate
- [ ] Decisione su GitHub Pro e protezione di `main` (da prendere prima del primo sito)

**Nuovo sito (ogni volta)**

Il titolare può automatizzare creazione della repo privata dal template, invito Write a
`simone-agenti` e progetto Vercel con `npm run site:create -- nome-cliente --apply`, eseguito
dalla libreria. Senza `--apply` mostra solo il piano offline. Credenziali dedicate del titolare,
ripresa e limiti in [`provisioning.md`](provisioning.md): il comando non è un compito degli
agenti e non usa la loro company secret. Su Vercel imposta `SITE_STARTER_LIBRARY` vuota nei tre
ambienti, mantenendo la modalità sito anche se esiste un valore condiviso del team. Non crea
il Project Paperclip né esegue `site:init`; l'invito pendente deve essere accettato.

- [ ] GitHub: Use this template, repo privata, invito a `simone-agenti`
- [ ] Ruleset importato da `docs/github-ruleset-sito.json` (se hai Pro)
- [ ] Clone in locale (GitHub Desktop) nella cartella dei siti
- [ ] Paperclip: Add Project, Configuration → repo nella cartella gestita da Paperclip (non il clone di GitHub Desktop), Execution Workspaces con le cartelle isolate attive e predefinite e la cartella dei worktree fuori dal clone, autenticazione gestita come sopra (senza `SITE_STARTER_LIBRARY`)
- [ ] Vercel: Import della repo
- [ ] Task "Avvio sito" al Builder (`site:init`)
- [ ] Brief con il PM → cancello 1
- [ ] Design e dati → cancello 2 (con mappa redirect se c'è un sito esistente)
- [ ] QA e SEO verdi
- [ ] Servizio OAuth: aggiunto il dominio del sito
- [ ] Merge su `main` (cancello 3), dominio su Vercel, DNS
- [ ] Cliente invitato come collaboratore, istruzioni Decap consegnate

## Rimandato alla v1.1

- Immagine OG generata in automatico da nome e palette
- Confronto visivo automatico degli screenshot dei blocchi
- Lighthouse non bloccante anche sull'anteprima Vercel
- Protezione di `main` sulle repo private (richiede GitHub Pro)
- Valutazione di Sveltia CMS al posto di Decap
