# Changelog

Le modifiche della libreria site-starter, una sezione per versione. `npm run release` dà alla sezione «Non rilasciato» il titolo della versione; `npm run blocks:sync` mostra ai siti cliente le voci di «### Breaking» delle versioni che installa.

Formato: `## vX.Y.Z (data)`, poi `### Breaking` (cosa va cambiato nei siti: ricette, impostazioni, comandi), `### Novità`, `### Correzioni`. Solo nella libreria: `site:init` lo toglie dai siti.

## Non rilasciato

### Breaking

- Modalità esplicita: la libreria è tale solo con `SITE_STARTER_LIBRARY=1` (`src/core/mode.ts`); senza, ogni progetto è un sito cliente. Nella libreria va impostata in `.env`, nelle variabili del repository GitHub e nel progetto Vercel.
- Il catalogo si sposta da `src/pages/catalogo` a `src/library/catalogo` e si registra con l’integrazione `src/core/integrations/library.ts`, solo in modalità libreria.
- `blocks.lock.json` registra la versione della libreria e copre anche i file gestiti (`managedFiles` del manifest). Lo scrivono solo `npm run site:init` e `npm run blocks:sync`: `npm run lock:write` non c’è più.
- Nei siti cliente un `blocks.lock.json` mancante è un errore del check `lock`.
- Sono gestiti anche `.github/workflows/` (tutta la cartella: un workflow aggiunto nel sito è una modifica vietata), `CLAUDE.md` e `.github/CODEOWNERS`. `CLAUDE.md` non è più un link ad `AGENTS.md`: importa `AGENTS.md` e `docs/sito.md`, dove vanno le note del sito.
- CI: i push partono solo su `main`; gli altri branch girano come pull request (una volta sola per commit) o a mano (`workflow_dispatch`).
- Icone: `scala` diventa `scale` (scale di casa, vano scala; Lucide non ha una scala a pioli), `scudo` diventa `garanzia`, `secchio-vernice` non c’è più. Nelle ricette va cambiato l’alias, altrimenti la build si ferma.

### Novità

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

### Correzioni

- `check:blocks` raccoglie tutti i problemi: un file mancante in un blocco non interrompe più il controllo degli altri.
- `check:recipes` segnala tutti i recapiti scritti in uno stesso testo, non solo il primo.
- Le fixture del footer usano recapiti palesemente finti (`055 000 0000`, `info@esempio.it`).
- CLS dei font: ogni coppia di `src/themes/fonts/` ha ripieghi con le misure dei font veri (`"<font> ripiego"`, generati da `scripts/font-fallbacks.ts`). Prima, dove mancano Georgia e i font di sistema di macOS (Linux, Android, il runner della CI), lo scambio dei font spostava i titoli: CLS 0,074 su `/privacy/` in CI, oltre il limite di 0,05 di Lighthouse.
