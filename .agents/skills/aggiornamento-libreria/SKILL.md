---
name: aggiornamento-libreria
description: Usala per portare un sito cliente a una nuova versione della libreria site-starter con blocks:sync, controllando breaking change e ricette.
---

# Aggiornamento della libreria

Per l'agente che lavora con Simone, nella repo di un sito cliente. Cartelle e file gestiti (blocchi, temi, script, skill, documenti comuni) cambiano solo così: mai a mano.

## Passi

1. **Versioni.** Quella installata è in `blocks.lock.json` (`version`); quelle disponibili sono i tag della libreria (`git ls-remote --tags https://github.com/frankytheme-cyber/site-starter.git`). Leggi nel `CHANGELOG.md` della libreria le sezioni tra le due, soprattutto «Breaking».

2. **Branch e working tree pulito:**

   ```sh
   git status --porcelain            # vuoto
   git switch -c libreria-vX.Y.Z      # prima della messa online lavora su lancio
   ```

3. **Aggiorna:**

   ```sh
   npm run blocks:sync -- vX.Y.Z
   npm install
   npm run gen:decap
   ```

   `blocks:sync` sostituisce cartelle e file gestiti con quelli del tag, unisce script e dipendenze in `package.json`, riscrive il lock e mostra i breaking change. Le modifiche locali a file gestiti (vietate) vengono sovrascritte e il riepilogo le elenca: se ce n'erano, dillo a Simone.

4. **Breaking change:** applica alle ricette e alle impostazioni del sito quello che il CHANGELOG chiede (campi rinominati, valori nuovi, pagine `.astro` scritte a mano da rivedere).

5. **Controlli:** `npm run qa -- --strict`. Gli errori che c'erano già prima (per esempio i segnaposto dei testi legali) restano; quelli nuovi si correggono nelle ricette o si segnalano a Simone se vengono dalla libreria.

6. **Commit e PR:** `git add -A && git commit -m "Libreria site-starter vX.Y.Z"`, push e PR verso `main` con la versione, i breaking change applicati e l'esito dei controlli. Se GitHub rifiuta il push perché cambiano `.github/workflows` (serve lo scope `workflow` del token), fermati e dillo a Simone.

## Criterio di fine

`blocks.lock.json` alla nuova versione, breaking change applicati, `npm run qa -- --strict` senza errori nuovi, PR aperta per Simone.

## Non fare

- Mai `blocks.lock.json` scritto o corretto a mano; mai copiare file dalla libreria a mano.
- Non aggiornare con modifiche non committate nel working tree.
- Non fare merge.
