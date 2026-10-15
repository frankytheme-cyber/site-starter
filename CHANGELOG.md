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

### Novità

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
- `.github/CODEOWNERS`: con «Require review from Code Owners», le pull request che toccano `blocks.lock.json`, `.github/`, `scripts/`, `library.manifest.json` o `package.json` richiedono l’approvazione del proprietario della libreria.
- CI con `permissions: contents: read` e una sola esecuzione per branch (`concurrency`).
- `check:recipes` avvisa se una pagina ha più di un accordion `faq` (nuova regola d’oro); `accordion` ha le sue `rules`.
- `gen:catalog` (e quindi il check `blocks`) si ferma su un campo senza `.describe()` negli schemi dei blocchi, in `themeSchema` e nelle chiavi di `layoutSchema`; `themeSchema` ha le sue descrizioni e il README del catalogo le chiavi di `theme.json`.
- `site:init` scrive in `docs/sito.md` una traccia per le note del sito.
- `README.md` con le istruzioni per la libreria e per i siti cliente.

### Correzioni

- `check:blocks` raccoglie tutti i problemi: un file mancante in un blocco non interrompe più il controllo degli altri.
- `check:recipes` segnala tutti i recapiti scritti in uno stesso testo, non solo il primo.
- Le fixture del footer usano recapiti palesemente finti (`055 000 0000`, `info@esempio.it`).
