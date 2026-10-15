# Controlli

`run.ts` esegue i controlli e scrive `reports/qa.md` e `reports/qa.json`: `npm run check`, `npm run qa`, oppure `node scripts/checks/run.ts <check...> [--strict]`. Elenco, livelli e cosa fare quando falliscono: `docs/controlli.md`.

Ogni check è un file che esporta una funzione `(context) => Finding[]` (formato in `lib/report.ts`):

- `commands.ts`: `astroCheck` e `build` (comandi del progetto).
- `decap.ts`, `tokens.ts`, `contrast.ts`, `blocks.ts`, `catalog.ts`, `lock.ts`, `recipes.ts`, `release.ts`: statici.
- `links.ts`, `a11y.ts`, `interactive.ts`, `lighthouse.ts`: sul sito servito da `astro preview` (suite qa).

`lib/`: formato dei report, percorsi del progetto, lettura di ricette e link (`content.ts`), caricamento dei moduli con Vite (`vite.ts`), server di anteprima (`preview.ts`, usato anche da `scripts/screenshots.ts`).
`lock.ts` legge il manifest e scrive `blocks.lock.json` (versione della libreria e hash di cartelle e file gestiti) per `scripts/site-init.ts` e `scripts/blocks-sync.ts`: nei siti il lock non si scrive a mano. La modalità (libreria o sito) viene da `src/core/mode.ts`; `scripts/template-as-site.ts` (`npm run check:template`) prova il template come sito cliente.
