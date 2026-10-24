# Changelog

Le modifiche della libreria site-starter, una sezione per versione. `npm run release` dà alla sezione «Non rilasciato» il titolo della versione; `npm run blocks:sync` mostra ai siti cliente le voci di «### Breaking» delle versioni che installa.

Formato: `## vX.Y.Z (data)`, poi `### Breaking` (cosa va cambiato nei siti: ricette, impostazioni, comandi), `### Novità`, `### Correzioni`. Solo nella libreria: `site:init` lo toglie dai siti.

## Non rilasciato

### Correzioni

- Screenshot di design: le immagini senza sorgente del popup non consumano il timeout; risorse visibili fallite sono segnalate. Chromium viene verificato prima di avviare Astro e le risorse si chiudono anche in caso di errore.
- Inventario delle foto ricorsivo, senza fixture o symlink; preparazione in posizione con sostituzione solo dopo la codifica riuscita.

### Novità

- Blocco `slider` 1.0.0, di apertura al posto della hero: da 2 a 5 slide con foto, velatura e testo bianco (la prima con l’h1), da sfogliare con frecce, pallini, dito o tastiera, senza scorrimento automatico. Varianti `scorrimento` e `dissolvenza`; frecce `sotto`, `lati` o `nessuna`; testi e pulsanti che entrano a ogni slide (`animation`: `sale`, `dissolvenza`, `nessuna`), mai col movimento ridotto. JavaScript vanilla, senza librerie. La variante `slider` della hero, mai rilasciata, è sostituita da questo blocco. Il controllo delle ricette accetta `hero` o `slider` in apertura, uno solo per pagina.
- Catalogo più comodo: `/catalogo` è un indice a schede con miniatura, varianti (link alla variante nella pagina del blocco) e categorie; tutti i blocchi dal vivo passano a `/catalogo/tutti`. La barra sta su una riga, con palette, font, forma, decoro e texture nel pannello «Tema»; su mobile non resta fissa in alto.
- Pagina del blocco divisa per variante: in alto le varianti con descrizione e numero di esempi; per ognuna «Quando usarla», «Copia JSON», «Apri da sola» e subito sotto le sue fixture dal vivo, non più mescolate in fondo.
- Indice del catalogo con ricerca (nome, descrizioni, varianti, campi, regole) e filtri «si usa senza foto» e «interattivo», salvati nell'indirizzo; ogni scheda dice se servono foto.
- Pagina del blocco con «Cosa serve»: foto, icone ed elenchi obbligatori per variante, dati di `site.json`, sfondi ammessi, regole e la tabella dei campi con limiti e note (da `docs/catalogo/catalogo.json`).
- `catalog:query` per consultare solo blocchi, temi, icone o regole utili; istruzioni e skill condivise più mirate, con riferimenti su richiesta.
- `design:shots -- --riusa`, con manifest e hash dei sorgenti, per riusare screenshot invariati. QA finale completa e revisione visiva mantenute.
- Fixture e regressioni per hero orizzontale, servizi con foto e icone, didascalie, occhiello del form ed etichette CTA; controlli `tooling` e `design` nelle suite.

## v0.0.5 (2026-10-20)
### Breaking

- `check:tokens` controlla anche `src/pages`: in un sito cliente una pagina `.astro` scritta a mano con classi della palette di Tailwind, colori fissi, `style` con colori o `!important` ora è un errore. Va riscritta con i token semantici (`bg-primary`, `text-fg-muted`...), o meglio come ricetta in `src/content/pages`.

### Novità

- Migliorie ai blocchi chieste dal sito pilota, tutte facoltative (i siti non cambiano finché non le usano; dopo `blocks:sync`, `npm run gen:decap` per vederle nel CMS):
  - hero 1.3.0: `imageShape` (`verticale` di partenza, 4:5, o `orizzontale`, 4:3) sceglie il formato della foto della variante `split` su desktop;
  - services 1.2.0: in `cards-immagine` la foto diventa facoltativa per voce, e un servizio senza foto mostra la sua icona nello stesso spazio (serve la foto o l'icona); `Icon` ha la misura `xl`;
  - gallery 1.1.0: `showCaptions` mostra le didascalie anche sotto le miniature di `griglia-popup`;
  - form 1.1.0: `eyebrow` facoltativo al posto dell'occhiello fisso;
  - cta 1.2.0: `phoneLabel` e `whatsappLabel` per i testi dei pulsanti dei recapiti con `showContacts`.
- Il resto del flusso per un agente solo, al posto delle procedure di Paperclip: skill `nuovo-sito` (inizializzazione, brief con Simone, `site.json`, foto), `redirect`, `messa-online` (controlli strict, confronto col brief, SEO, riepilogo per Simone), `aggiornamento-libreria` (`blocks:sync`) e, nella libreria, `nuovo-blocco` (blocco o variante nuova). `AGENTS.md` le elenca nell'ordine del lavoro, con le regole su branch e PR.
- `npm run images`: senza argomenti elenca le foto del sito con dimensioni e orientamento; con file o cartelle le prepara in `src/assets/images` (raddrizzate secondo l'EXIF, lato lungo al massimo 2400 px, senza metadati né posizione GPS, nomi in kebab-case senza accenti).
- Regole di composizione definitive nel catalogo (`docs/catalogo/README.md`), le stesse della skill `composizione`: il materiale decide le varianti, una sezione vuota si toglie, effetti e bordi con misura, ritmo vario, almeno una cta per pagina.
- Tre ricette tipo nuove, la home di un ristorante, di un negozio e di uno studio professionale (`docs/catalogo/ricette-tipo/ristorante-home.json`, `negozio-home.json`, `studio-home.json`), con le foto di prova delle fixture.

### Correzioni

- Hero 1.2.1: sulla foto della variante `full` i pulsanti si staccano con ogni palette. Il pieno è bianco con il testo del colore della velatura colorata, il passaggio un bianco appena tinto, anello del focus e link bianchi; prima un pulsante primary scuro (antracite, bordeaux) quasi spariva sulla velatura dello stesso colore. Colori in `src/themes/overlays.css` (`--photo-btn-fg`, `--photo-btn-hover`), regole in `core/ui/button/button.css` (`[data-on-photo]`); `check:contrast` verifica il testo sul pieno e sul passaggio per ogni palette.
- Il check `blocks` verifica i link delle ricette tipo dentro il loro insieme: con più insiemi, ognuno con la sua home `/`, le ancore delle altre home risultavano mancanti.

## v0.0.4 (2026-10-20)
### Novità

- Skill `composizione` e `testi-sito` per l'agente che costruisce un sito con Simone. `composizione` prende il posto di `ricetta-pagina`: inventario del materiale, varianti scelte in base alle foto, alle recensioni e ai numeri che ci sono, ritmo di toni, effetti di sfondo e bordi, layout e menu, nota di design breve; le strutture di partenza per tipo di pagina e settore (lavori a domicilio, locali, studi professionali, ospitalità) sono in `.agents/skills/composizione/strutture.md`. `testi-sito` scrive i testi dai fatti del brief: regole, indicazioni campo per campo con esempi, frasi da evitare, controllo delle righe a 375 px.

- Lavoro con un agente solo, Claude Code o Codex, insieme a Simone: la squadra Paperclip è in pausa (nuova sezione «Lavorare con Claude Code o Codex» in `AGENTS.md`). Per il design:
  - in sviluppo ogni pagina del sito accetta un tema di prova nell'indirizzo (`?palette=&fonts=&shape=&pattern=&texture=`, valori di `themePresets` in `src/themes/presets.ts`) senza toccare `theme.json`, e i link interni lo portano con sé; la build non cambia;
  - `npm run design:shots`: screenshot delle pagine a 1280 e 375 px, con il tema di `theme.json` o con temi di prova a confronto (prima schermata, panoramica, sezioni, pagina intera e un `index.html` che le affianca), su un server di sviluppo tutto suo, in `reports/design/`;
  - skill `direzione-visiva` (tre temi motivati dal brief, scelti da Simone sul sito vero) e `revisione-visiva` (screenshot, domande oltre i difetti, due passate), in `.agents/skills/` per Codex con un rimando in `.claude/skills/` per Claude Code. Le due cartelle sono gestite e arrivano ai siti con `blocks:sync`; il nuovo check `skills` verifica frontmatter e rimandi.

- Effetti di sfondo e decori più visibili. Ogni palette ha le sue intensità (`--fx-default`, `--fx-muted`), calcolate dal nuovo `node scripts/effect-strength.ts` come le più alte che lasciano i testi AA con ogni effetto e texture: le palette con più margine hanno veli fino al 50% più forti di prima, terracotta resta com'era sul tono default. Sul tono muted aloni, aurora e sfumato usano anche una luce verso `--fx-glow` (bianco nelle palette chiare, nero in `notte`), che alza il contrasto. I decori hanno punti più grandi, linee più spesse e una sfumatura che copre più spazio. `check:contrast` legge le intensità della palette e si ferma se una è troppo alta. Ogni palette ha tre variabili in più (`--fx-glow`, `--fx-default`, `--fx-muted`).

- Bordi tra sezioni: nelle ricette il campo `edge` (`dritto` di partenza, `onda`, `diagonale`, `curva`) dà una forma al bordo in alto della sezione, che copre il fondo della precedente nel suo colore (`src/themes/edges.css`, solo maschere, nessun colore). Non si applica alla prima sezione; `check:recipes` avvisa con più di 2 bordi, un bordo sulla prima sezione o tra due sezioni dello stesso tone. Dal vivo in fondo a `/catalogo/sfondi` e su `/catalogo/sfondi/bordi/`, nel catalogo la sezione «Bordi tra sezioni».
- Hero 1.2.0: nella variante `full` il campo `overlay` sceglie la velatura sulla foto, `scura` (di partenza, nero al 60% come prima) o `colorata`, col primary della palette scurito col nero (`src/themes/overlays.css`). `check:contrast` verifica il testo bianco sulla velatura colorata sopra una foto tutta bianca, per ogni palette.
- `core/SectionBackground.astro` diventa `core/SectionFrame.astro`: oltre all'effetto di sfondo porta il bordo in alto.

- Decoro e texture del sito: in `theme.json` due preset nuovi, con un valore di partenza che lascia i siti come sono. `pattern` (`nessuno`, `punti`, `griglia`, `righe`, `onde`, `cerchi`, `arco`) è il motivo delle sezioni con il nuovo effetto `"background": "decoro"`, ammesso di partenza da tutti i blocchi tranne `form`, `accordion`, `tabs` e `contact`. `texture` (`liscia`, `grana`, `carta`) è una grana in soft-light sopra lo sfondo di ogni sezione, header e footer compresi, mai sopra il testo. `check:contrast` verifica i colori del decoro e i testi anche sui punti schiariti e scuriti dalla grana; per dare margine alla grana, primary e accent di `aurora` sul tono default scendono dal 14 al 12%. `check:recipes` avvisa per un `decoro` con `pattern` `nessuno`. Nel catalogo selettori di decoro e texture nella barra, schede e screenshot nella sezione «Temi».

- Effetti di sfondo delle sezioni: nelle ricette, accanto a `tone`, il campo `background` (`pieno` di partenza, `sfumato`, `alone`, `aurora`) aggiunge un effetto sopra il colore del tono, con i colori della palette e solo CSS. Ogni blocco ammette gli effetti del suo `meta.ts` (`backgrounds`: `aurora` solo in `hero` e `cta`, solo `pieno` e `sfumato` in `form`, `accordion`, `tabs` e `contact`). `check:contrast` verifica testi, link e anello di focus nel punto più carico di ogni effetto, per ogni palette e tono; `check:recipes` avvisa con più di 3 effetti per pagina o due sezioni vicine con effetto. Con `prefers-contrast: more` o i colori forzati resta il tono pieno. Dal vivo su `/catalogo/sfondi`, nel catalogo la sezione «Effetti di sfondo». Nei siti nulla cambia finché una sezione non sceglie un effetto; dopo `blocks:sync` serve `npm run gen:decap` per vedere il campo nel CMS.

- Otto coppie di font nuove, da scegliere in `theme.json` (`fonts`) come le due di prima: `elegante` (Cormorant + Jost), `autorevole` (Newsreader + Public Sans), `fresco` (Outfit + Figtree), `amichevole` (Nunito + Nunito Sans), `carattere` (Bricolage Grotesque + Hanken Grotesk), `robusto` (Big Shoulders + Archivo), `gourmet` (Playfair Display + Work Sans) e `preciso` (Sora + Instrument Sans). Arrivano da `@fontsource-variable` e le serve il sito, con i ripieghi misurati contro il CLS; mood e settori sono nella sezione «Temi» del catalogo. Dopo `blocks:sync` serve `npm install` per i pacchetti nuovi.

- Otto palette nuove, dieci in tutto, tutte con contrasto AA verificato: `salvia` (salute, benessere), `cipria` (estetica, fioristi), `laguna` (mare, turismo), `bordeaux` (vino, ristoranti gastronomici), `cobalto` (professionisti, tecnologia), `antracite` (edilizia, artigiani), `prugna` (creativi, scuole) e `notte`, la prima palette scura (locali serali, barbieri, palestre). Si scelgono in `theme.json` come le altre.
- Catalogo più facile da navigare: nuova pagina `/catalogo/temi` con palette, font e forme a confronto (anteprima dal vivo, mood, settori, «Usa questa»); nella barra nomi leggibili nei selettori, campione dei colori della palette attiva, menu «Blocchi» per categoria e pagina attiva evidenziata; l’indice raggruppa i blocchi per categoria con il numero di varianti; la pagina del singolo blocco ha precedente e successivo. `?palette=&fonts=&shape=&pattern=&texture=` vale in tutte le pagine del catalogo.

### Correzioni

- La build di `npm run check` e `npm run qa` (e quella di `npm run screenshots`) ora è quella di produzione: il caricatore Vite dei controlli lasciava `NODE_ENV=development` nel processo, e la build lo ereditava (`import.meta.env.DEV` vero, `PROD` falso). `scripts/checks/lib/vite.ts` lo rimette com'era.

## v0.0.3 (2026-10-19)
### Novità

- Email protetta dai bot dello spam: footer, form e contact non scrivono più l’indirizzo in chiaro nell’HTML. Il nuovo `EmailLink` (`src/core/ui`) lo tiene codificato e lo ricompone con JavaScript nel testo e nel `mailto:`; senza JavaScript si legge «nome chiocciola dominio». I pulsanti `@email` passano da `EmailLink` e compaiono solo con JavaScript. Il JSON-LD dell’attività non ha più l’email. Il check `interactive` ferma ogni pagina con un `mailto:` o l’email di `site.json` in chiaro. Blocchi `footer`, `form` e `contact` alla 1.0.1.

- Dati strutturati dell’attività: `businessType` in `site.json` (facoltativo) sceglie il sottotipo schema.org di `LocalBusiness` (es. `HousePainter`, `Restaurant`, `Plumber`; elenco in `BUSINESS_TYPES`), `areaServed` (facoltativo) elenca le zone servite. Il JSON-LD ha anche un `@id` stabile e, senza logo, usa `defaultOgImage` come `image`. Dopo `blocks:sync` serve `npm run gen:decap` per vedere i due campi nel CMS.

### Correzioni

- Footer e blocco `contact` mostrano il numero WhatsApp scritto tutto attaccato (`+393331234567`) nel formato `+39 333 123 4567`; i numeri con gli spazi restano com’erano.

## v0.0.2 (2026-10-18)
### Breaking

- Nei siti cliente `--strict` verifica anche i redirect: un brief presente deve rispondere esplicitamente a «Esiste un sito online?». Con sito esistente o redirect configurati serve una mappa decisa in `docs/redirects.md`, nel formato della skill `redirect`, corrispondente a `vercel.json`.
- Modalità esplicita: la libreria è tale solo con `SITE_STARTER_LIBRARY=1` (`src/core/mode.ts`); senza, ogni progetto è un sito cliente. Nella libreria va impostata in `.env`, nelle variabili del repository GitHub e nel progetto Vercel.
- Il catalogo si sposta da `src/pages/catalogo` a `src/library/catalogo` e si registra con l’integrazione `src/core/integrations/library.ts`, solo in modalità libreria.
- `blocks.lock.json` registra la versione della libreria e copre anche i file gestiti (`managedFiles` del manifest). Lo scrivono solo `npm run site:init` e `npm run blocks:sync`: `npm run lock:write` non c’è più.
- Nei siti cliente un `blocks.lock.json` mancante è un errore del check `lock`.
- Sono gestiti anche `.github/workflows/` (tutta la cartella: un workflow aggiunto nel sito è una modifica vietata), `CLAUDE.md` e `.github/CODEOWNERS`. `CLAUDE.md` non è più un link ad `AGENTS.md`: importa `AGENTS.md` e `docs/sito.md`, dove vanno le note del sito.
- CI: i push partono solo su `main`; gli altri branch girano come pull request (una volta sola per commit) o a mano (`workflow_dispatch`).
- Icone: `scala` diventa `scale` (scale di casa, vano scala; Lucide non ha una scala a pioli), `scudo` diventa `garanzia`, `secchio-vernice` non c’è più. Nelle ricette va cambiato l’alias, altrimenti la build si ferma.
- Sono gestite anche `docs/skill/`, `docs/modelli/` e `docs/agenti/`: nei siti cliente un file aggiunto lì è una modifica vietata, e `blocks:sync` lo toglie. Brief, nota di design e redirect del sito restano in `docs/brief.md`, `docs/nota-design.md` e `docs/redirects.md`.

### Novità

- Attivazione esplicita dei form con `CONTACT_FORM_ENABLED=1`: senza attivazione o credenziali l’anteprima mostra il modulo disabilitato e i recapiti; la funzione server rifiuta invii prima dell’attivazione. Consente di predisporre i siti mentre informativa e servizio sono ancora da completare.
- Blocco `form` nelle varianti `contatto` e `preventivo`, accessibile e utilizzabile senza JavaScript. Invio Resend tramite funzione Vercel `/api/contact`, destinatario da `site.json`, validazione server, honeypot e protezione dai retry duplicati. Il catalogo simula l’invio; configurazione in `docs/form.md`, test automatici inclusi in `check` e `qa`.
- `npm run site:create -- nome-cliente`: provisioning del titolare per repo privata dal template, invito Write a `simone-agenti` e progetto Vercel Astro. Anteprima offline di default, esecuzione con `--apply`, credenziali separate e ripresa senza duplicare risorse; guida `docs/provisioning.md` e test con API simulate.
- Modello importabile `docs/github-ruleset-sito.json` per proteggere `main` nei siti cliente (PR, Code Owners, check e qa, niente force push o cancellazione); incluso nei file gestiti. L'attivazione resta manuale su GitHub.
- Controllo dei redirect al rilascio, con test di regressione; corretta l'istruzione del Builder: prima del cancello 3 non sono ammessi errori di segnaposto.
- Blocco `areas`: varianti `elenco-zone` e `mappa-link`, con zone servite e link Maps della sede letto da `site.json`, senza mappa incorporata.
- Blocchi `gallery` (`griglia-popup`, `prima-dopo`, `slider`: solo foto reali), `testimonials` (`cards`, `singola`, `slider`: ogni recensione ha la `fonte`, obbligatoria) e `carousel` (`immagini`, `immagini-testo`: scroll-snap, mai autoplay, mai nell’hero). Il check `interactive` prova anche la finestra della galleria e il cursore prima-dopo.
- Blocchi `features` (`3-colonne`, `lista`), `about` (`immagine-testo`, `con-numeri`: ogni numero ha il campo `fonte`, obbligatorio) e `process` (`passi-numerati`, `timeline`).
- Blocco `contact` (varianti `info-mappa`, `info-cta`): recapiti, indirizzo e orari letti da `site.json`. La mappa è il link «Apri in Maps»; con JavaScript il pulsante «Mostra la mappa qui» carica l’iframe solo al clic.
- `docs/specifica.md`: la specifica completa del sistema, gestita (arriva nei siti con `blocks:sync`). `AGENTS.md` la indica come riferimento in caso di dubbio; `npm run release` ne aggiorna la riga «Versione».
- `npm run site:init` inizializza un sito copiato dal template; `npm run blocks:sync -- vX.Y.Z` lo aggiorna a una versione della libreria.
- `--strict` nella libreria: errori per le regole strutturali delle ricette, avvisi per i segnaposto. Nei siti cliente tutto errore.
- `gen:decap` senza repository GitHub usa un segnaposto con un avviso; in un sito cliente con `--strict` è un errore. Il repository del sito sta in `src/site.config.ts` (`cms.repo`).
- Immagine per i social: `defaultOgImage` in `site.json` vale per le pagine senza `ogImage`; il template la imposta a `og-DA-COMPILARE.jpg` e toglie `ogImage` dalle pagine. Con `--strict`, `release` fallisce finché il nome contiene `DA-COMPILARE`.
- Messaggi di validazione di ricette e impostazioni in italiano, con percorsi come «pagina index.json → sezione 3 (services) → items[2].title» (indici da 1), sia nella build sia in `check:recipes`: i loader di `src/content.config.ts` validano con `checkedLoader` (`src/core/content-validation.ts`).
- `check:recipes` valida schema e immagini prima della build e gira per primo in `npm run check`; con dati non validi `astro-check` e `build` sono saltati.
- Job CI `template-as-site` (`npm run check:template`): il template, inizializzato come sito, deve fallire solo per i segnaposto.
- Campo `kind` delle pagine: `"legale"` per privacy, cookie e note legali. Su queste pagine e su quelle con `noindex`, `recipes` non avvisa più «nessuna cta»; il template lo imposta su `privacy.json` e `cookie.json`.
- CI: il job `template-as-site` gira con `SITE_STARTER_LIBRARY` vuota, cioè da sito cliente; lo script riconosce la libreria da `src/library`. Il messaggio di `lock` spiega come creare la variabile di repository su GitHub.
- `check:tokens` vieta le classi della palette di Tailwind (`bg-blue-600`, `text-gray-500`, `fill-*`, `stroke-*`, `ring-*`, `from-`/`via-`/`to-*`...) anche se non generano CSS, e guarda anche `src/layouts` e i file `.ts`.
- Un link speciale senza il suo dato in `site.json` (es. `@whatsapp` senza `whatsapp`) dice pagina, sezione e campo: «pagina index.json → sezione 3 (cta) → primary.href: @whatsapp ma site.json non ha whatsapp». `check:recipes` lo dà come errore prima della build, per le ricette e per `navigation.json`; la build si ferma con lo stesso messaggio prima di disegnare la pagina o l’header.
- CI: runner fissato a `ubuntu-24.04` (non più `ubuntu-latest`); azioni all'ultima versione maggiore su Node 24 (`checkout@v7`, `setup-node@v7`, `cache@v6`, `upload-artifact@v7`); quando qa o template-as-site falliscono, il passo «Motivo del fallimento» mostra gli errori nel log e come annotazioni `::error` (`scripts/checks/ci-summary.ts`).
- Console di `check` e `qa`: per ogni check prima gli errori, poi tutti gli avvisi, poi i segnaposto riassunti («55 segnaposto DA-COMPILARE in 6 file — dettaglio in reports/qa.md»). Gli avvisi non sono più limitati ai primi 10; in `reports/qa.md` i segnaposto stanno in fondo a ogni check, in «Segnaposto».
- `.github/CODEOWNERS`: con «Require review from Code Owners», le pull request che toccano `blocks.lock.json`, `.github/`, `scripts/`, `library.manifest.json` o `package.json` richiedono l’approvazione del proprietario della libreria.
- CI con `permissions: contents: read` e una sola esecuzione per branch (`concurrency`).
- `check:recipes` avvisa se una pagina ha più di un accordion `faq` (nuova regola d’oro); `accordion` ha le sue `rules`.
- `gen:catalog` (e quindi il check `blocks`) si ferma su un campo senza `.describe()` negli schemi dei blocchi, in `themeSchema` e nelle chiavi di `layoutSchema`; `themeSchema` ha le sue descrizioni e il README del catalogo le chiavi di `theme.json`.
- `site:init` scrive in `docs/sito.md` una traccia per le note del sito.
- `README.md` con le istruzioni per la libreria e per i siti cliente.
- Icone: lista curata di 164 alias in 21 categorie (20 di simboli più i marchi) (`iconGroups` in `src/core/icons.ts`: casa e cantiere, attrezzi, impianti, cibo, salute, negozio, ufficio, marchi...), con i marchi linkedin, pinterest, threads, x, telegram, booking e airbnb. `/catalogo/icone` le mostra per categoria con la ricerca per alias o nome; nel CMS la select mostra la categoria accanto all’alias (`iconSchema()`); `check:blocks` verifica che ogni nome esista in Lucide o Simple Icons.
- Nella libreria il menu ha la voce «Catalogo» (Blocchi, Bottoni, Icone, UI), aggiunta da `BaseLayout` senza toccare `navigation.json`; nei siti cliente non esiste. La barra del catalogo ha il link «← Sito» e lo sfondo pieno.
- Fixture neutre: un’attività di esempio, «Bottega Esempio», e settori diversi tra i blocchi (artigiano, negozio, ristorante, studio professionale), con foto segnaposto nuove e recapiti finti; palette e forme senza settori unici nell’«adatto a».
- Skill degli agenti Paperclip in `docs/skill/<nome>/SKILL.md`, dalla specifica: `brief`, `modelli-task`, `avvio-sito`, `ricetta-pagina`, `nuovo-blocco`, `richiesta-blocco`, `qa`, `seo-prelancio`, `redirect` e `github-pr` (branch, push senza token nell’URL, PR in bozza con l’API GitHub via curl, mai merge). Modelli del brief e dei task in `docs/modelli/`.
- Siti cliente: un solo branch, `lancio`, con una sola PR in bozza verso `main` aperta dal task «Avvio sito»; tutti i task del sito ci lavorano e i cancelli usano la stessa anteprima Vercel. Nella libreria resta un branch e una PR per task.
- Skill `github-pr` per le cartelle isolate di Paperclip (un git worktree per task, nella cartella `worktrees` del Project accanto al clone, non dentro: dentro, Vite trovava il `tsconfig.json` del clone senza `node_modules` e `astro check` falliva; `.paperclip/` resta ignorata da git per le cartelle create prima): si lavora sul branch della propria cartella e si fa push verso il branch di destinazione (`HEAD:lancio` nei siti), mai `git switch` su un branch aperto altrove. Nel sito i Dati del Builder vengono prima del Design.
- Istruzioni degli agenti: paragrafo «Skill» (in Paperclip le skill della squadra hanno un suffisso nel nome; fa fede `docs/skill/<nome>/SKILL.md`; le altre skill installate sul computer si ignorano). Specifica: come arrivano le skill agli agenti e cosa Paperclip rifiuta all'import.
- `npm run pr` (`scripts/github-pr.ts`): cerca la PR aperta da un branch e, con `--title`, la apre in bozza con l'API di GitHub e `GH_TOKEN`, senza `gh`. La skill `github-pr` lo usa al posto delle chiamate `curl`; le skill non usano più `node -e`, che Paperclip non accetta nelle skill importate.
- Istruzioni di ruolo degli agenti Paperclip in `docs/agenti/<ruolo>.md` (PM, Designer, Builder, QA, SEO, Simone), copiate tali e quali in Paperclip; la specifica rimanda lì.

### Correzioni

- Flusso Paperclip: verifica del passaggio dopo ogni consegna, diagnosi degli arresti
  runtime e registro delle attività rinviate separato dall’anteprima. QA e SEO seguono
  lo stesso ambito; OAuth e requisiti futuri non riattivano cicli di correzione identici.
  Procedura e limiti del recupero in `docs/paperclip.md`.

- Riuso di immagini dal sito esistente: l'istruzione esplicita del titolare viene registrata e applicata, con passaggio Builder → Designer per la gallery richiesta, senza domande duplicate o attribuzioni inventate.
- Domande rinviabili registrate con responsabile e fase di completamento, senza bloccare attività indipendenti né considerare il silenzio un'approvazione.
- QA con ambito esplicito: anteprima autorizzata distinta dal rilascio strict, senza cicli sulle lacune già rinviate. Consegne dopo un merge tramite nuova PR in bozza e prove di deployment distinte dalle risposte di un alias.
- Domande del PM al titolare: una decisione per domanda, proposte e opzioni comprensibili, valori e anteprime visibili; grafica, redirect e testi legali separati. Il PM conserva il coordinamento durante le attese e riprende i feedback senza chiedere di gestire manualmente i task.
- Flusso agenti coerente: workspace isolati per task, riparazione a carico PM, approvazioni già registrate riutilizzate, anteprima con lacune esplicite e criteri di fine per ruolo. Script PR distribuito anche con la skill attiva per i checkout precedenti.

- PR compatibili con il broker GitHub per operazione di Paperclip; ripresa autonoma dei task senza interpretare i token vuoti nella shell come guasto. Nessun cambio automatico di identità o permessi.

- Ruoli Paperclip e Capabilities allineati: passaggi distinti per PASS/FAIL, QA della libreria senza brief cliente, verifiche legate allo SHA, SEO dopo il lancio, dipendenze delle correzioni e letture/report mirati per ridurre i token senza saltare i controlli. Capabilities versionate in `docs/agenti/capabilities.json`.

- `check:blocks` raccoglie tutti i problemi: un file mancante in un blocco non interrompe più il controllo degli altri.
- `check:recipes` segnala tutti i recapiti scritti in uno stesso testo, non solo il primo.
- Le fixture del footer usano recapiti palesemente finti (`055 000 0000`, `info@esempio.it`).
- CLS dei font: ogni coppia di `src/themes/fonts/` ha ripieghi con le misure dei font veri (`"<font> ripiego"`, generati da `scripts/font-fallbacks.ts`). Prima, dove mancano Georgia e i font di sistema di macOS (Linux, Android, il runner della CI), lo scambio dei font spostava i titoli: CLS 0,074 su `/privacy/` in CI, oltre il limite di 0,05 di Lighthouse.
