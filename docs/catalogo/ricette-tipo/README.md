# Ricette tipo

Pagine già composte con i blocchi della libreria, da copiare in un sito cliente e riempire. Sono ricette di pagina come quelle di `src/content/pages/` (formato in `src/content/pages/README.md`): stesso schema, stessi controlli.

| File | Diventa | Sezioni |
| --- | --- | --- |
| `artigiano-home.json` | `src/content/pages/index.json` → `/` | hero split con l’effetto alone, servizi con icone, carosello dei lavori, domande frequenti, invito al preventivo con l’effetto aurora e il bordo a curva |
| `artigiano-servizi.json` | `src/content/pages/servizi.json` → `/servizi/` | hero centrato, servizi alternati con foto, come lavoriamo (schede), domande frequenti, invito al preventivo |
| `artigiano-chi-siamo.json` | `src/content/pages/chi-siamo.json` → `/chi-siamo/` | hero split, storia in schede con foto, carosello di lavori, invito a contattarsi |
| `artigiano-contatti.json` | `src/content/pages/contatti.json` → `/contatti/` | hero centrato con Chiama e Come arrivare, recapiti, domande sul primo contatto |
| `ristorante-home.json` | `src/content/pages/index.json` → `/` | hero a tutta foto con Prenota, chi siamo con foto, menù in schede (pranzo e cena), galleria del locale con l’effetto alone, recensioni, dove siamo con gli orari, invito a prenotare con l’effetto aurora |
| `negozio-home.json` | `src/content/pages/index.json` → `/` | hero split con Come arrivare, reparti con foto, punti di forza, chi siamo con foto, una recensione, dove siamo con gli orari, invito a passare |
| `studio-home.json` | `src/content/pages/index.json` → `/` | hero split con appuntamento, servizi con icone, come lavora lo studio, chi siamo con i numeri (e la loro fonte), il primo incontro passo per passo, domande frequenti, invito con i recapiti |

L’insieme `artigiano` (quattro pagine) è pensato per un artigiano o un’impresa di servizi a domicilio (falegname, idraulico, elettricista, imbianchino...); `ristorante`, `negozio` e `studio` sono home per un locale, un negozio e uno studio professionale, da completare con le pagine interne (strutture di partenza nella skill `composizione`, `.agents/skills/composizione/strutture.md`). Vanno bene anche per altre piccole attività togliendo o cambiando le sezioni.

## Come usarle

1. Copia i file che servono in `src/content/pages/` col nome della colonna «Diventa» (`artigiano-home.json` sostituisce `index.json`). I link tra le pagine (`/servizi/`, `/contatti/`, `/servizi/#elenco`...) funzionano se copi tutto l'insieme; se ne lasci fuori una pagina, correggi i link che ci portano.
2. Riscrivi ogni testo marcato `DA-COMPILARE`, titolo e descrizione della pagina compresi. I recapiti non si scrivono mai: i pulsanti usano `@telefono`, `@whatsapp`, `@email`, `@mappa` e le cta `showContacts`, che leggono `src/content/settings/site.json`.
3. Sostituisci le foto di prova (`../../assets/images/fixtures/...`) con quelle dell'attività, caricate in `src/assets/images/`, e scrivi un `alt` che descrive ognuna.
4. Aggiungi le voci delle pagine a `src/content/settings/navigation.json` (o dal CMS, «Menu»).
5. `npm run check` per i controlli; prima di pubblicare `npm run check -- --strict`, che segnala ogni `DA-COMPILARE` rimasto.

Si possono togliere, spostare o aggiungere sezioni come in qualsiasi ricetta, seguendo le regole di composizione di [`../README.md`](../README.md#regole-di-composizione). Ogni blocco ha la sua scheda in [`../blocchi/`](../blocchi/), con i campi e un esempio JSON; nel catalogo dal vivo (`/catalogo`) il pulsante «Copia JSON» dà la sezione pronta di ogni variante.

## Controlli

Il check `blocks` (`npm run check`, solo nella libreria) verifica che ogni ricetta tipo sia valida per lo schema delle pagine, che le foto esistano (percorsi relativi a `src/content/pages/`) e che i link interni portino a pagine e ancore dello stesso insieme. Il nome di un file nuovo segue lo schema `<insieme>-<pagina>.json`: `home` è la pagina iniziale, le altre diventano `/<pagina>/`.
