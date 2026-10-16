---
name: avvio-sito
description: Usala quando ricevi il task «Avvio sito» per un sito cliente appena creato dal template site-starter.
---

# Avvio di un sito cliente

Per il Builder, nella repo del sito, mai nella libreria. Prima di te Simone ha creato la repo con «Use this template», invitato `simone-agenti` e configurato il Project (env senza `SITE_STARTER_LIBRARY`).

## Passi

1. **Controlla che sia un sito da inizializzare**; al primo controllo che non torna, fermati e avvisa il PM.

   ```sh
   git remote get-url origin                               # la repo del sito, non frankytheme-cyber/site-starter
   echo "SITE_STARTER_LIBRARY=${SITE_STARTER_LIBRARY:-}"   # vuota
   grep -s SITE_STARTER_LIBRARY .env                       # nessuna riga con 1
   test -e blocks.lock.json && echo "STOP: sito già inizializzato"
   test -d src/library || echo "STOP: manca src/library, non è il template"
   git status --porcelain                                  # vuoto
   git ls-remote --exit-code --heads origin lancio && echo "STOP: lancio esiste già"
   ```

2. **Branch `lancio`** da `main` (skill `github-pr`, passo 1): l'unico branch del sito, su cui lavoreranno tutti i task fino alla messa online.

   ```sh
   git fetch origin
   git switch --no-track -c lancio origin/main
   ```

3. **Dipendenze** senza toccare `package-lock.json` (`site:init` vuole il working tree pulito):

   ```sh
   npm ci
   ```

4. **Inizializza**, senza domande; il repository del CMS arriva dal remote `origin`:

   ```sh
   npm run site:init -- --yes
   ```

   Nell'uscita: «repository del CMS: <owner>/<repo>» e «✓ Sito inizializzato». Se il repository non si trova: `npm run site:init -- --yes --repo=<owner>/<repo>`.

5. **Verifica:**

   ```sh
   npm install
   ls blocks.lock.json docs/sito.md && grep -n "repo:" src/site.config.ts
   npm run check
   ```

   `npm run check` senza errori; gli avvisi `DA-COMPILARE` sono attesi, i dati arrivano dopo il brief.

6. **Commit, push e PR in bozza** verso `main` (skill `github-pr`, passi 3-6), con il titolo «Lancio: <nome della repo>». È l'unica PR del sito: la useranno tutti i task e Simone la unirà al cancello 3.


   ```sh
   git add -A
   git commit -m "Inizializza il sito"
   ```

   La CI della PR verso `main` gira con `--strict` e resta rossa per i soli segnaposto (`DA-COMPILARE`, `og-DA-COMPILARE`) finché il sito non è completo: è atteso. Ogni altro errore va corretto.

7. **`npm run qa`** senza errori, poi nel task: link della PR, versione della libreria (`"version"` in `blocks.lock.json`), esito di `check` e `qa`.

## Criterio di fine

`blocks.lock.json` scritto da `site:init` e committato, `npm run check` e `npm run qa` senza errori, PR in bozza da `lancio` verso `main` con il link nel task.

## Non fare

- Mai nella libreria né con `SITE_STARTER_LIBRARY=1`: `site:init` toglie il catalogo.
- Mai `site:init` due volte, mai il lock scritto o corretto a mano; la libreria si aggiorna con `blocks:sync`, su task del PM.
- Niente dati, testi, pagine o immagini in questo task: arrivano dopo il cancello 1.
- Non toccare i file gestiti (`library.manifest.json`), non cambiare impostazioni di GitHub, Vercel o del servizio OAuth: le fa Simone.
- Non togliere segnaposto con dati inventati per far diventare verde la CI.
