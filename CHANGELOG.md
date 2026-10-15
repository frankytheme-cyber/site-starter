# Changelog

Le modifiche della libreria site-starter, una sezione per versione. `npm run release` dà alla sezione «Non rilasciato» il titolo della versione; `npm run blocks:sync` mostra ai siti cliente le voci di «### Breaking» delle versioni che installa.

Formato: `## vX.Y.Z (data)`, poi `### Breaking` (cosa va cambiato nei siti: ricette, impostazioni, comandi), `### Novità`, `### Correzioni`. Solo nella libreria: `site:init` lo toglie dai siti.

## Non rilasciato

### Breaking

- Modalità esplicita: la libreria è tale solo con `SITE_STARTER_LIBRARY=1` (`src/core/mode.ts`); senza, ogni progetto è un sito cliente. Nella libreria va impostata in `.env`, nelle variabili del repository GitHub e nel progetto Vercel.
- Il catalogo si sposta da `src/pages/catalogo` a `src/library/catalogo` e si registra con l’integrazione `src/core/integrations/library.ts`, solo in modalità libreria.
- `blocks.lock.json` registra la versione della libreria e copre anche i file gestiti (`managedFiles` del manifest). Lo scrivono solo `npm run site:init` e `npm run blocks:sync`: `npm run lock:write` non c’è più.
- Nei siti cliente un `blocks.lock.json` mancante è un errore del check `lock`.

### Novità

- `npm run site:init` inizializza un sito copiato dal template; `npm run blocks:sync -- vX.Y.Z` lo aggiorna a una versione della libreria.
- `--strict` nella libreria: errori per le regole strutturali delle ricette, avvisi per i segnaposto. Nei siti cliente tutto errore.
- `gen:decap` senza repository GitHub usa un segnaposto con un avviso; in un sito cliente con `--strict` è un errore. Il repository del sito sta in `src/site.config.ts` (`cms.repo`).
- Immagine per i social segnaposto (`og-DA-COMPILARE.jpg`) nelle pagine del template.
- Job CI `template-as-site` (`npm run check:template`): il template, inizializzato come sito, deve fallire solo per i segnaposto.
