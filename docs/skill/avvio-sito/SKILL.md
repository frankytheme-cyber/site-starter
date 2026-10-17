---
name: avvio-sito
description: Usala quando ricevi il task «Avvio sito» per un sito cliente appena creato dal template site-starter.
---

# Avvio di un sito cliente

Per il Builder, nella repo del sito, mai nella libreria. Prima di te Simone ha creato la repo con «Use this template», invitato `simone-agenti` e configurato il Project (env senza `SITE_STARTER_LIBRARY`).

## Passi

1. **Controlla che sia un sito da inizializzare**; distingui un errore reale da un avvio già parzialmente completato. Se `lancio`, lock e PR esistono, verifica coerenza con repo e commit e riprendi dal primo passo mancante, senza reinizializzare. Preserva il brief anche se non tracciato; non includerlo nel commit tecnico senza verificarne titolarità e approvazione.

   ```sh
   git remote get-url origin                               # la repo del sito, non frankytheme-cyber/site-starter
   echo "SITE_STARTER_LIBRARY=${SITE_STARTER_LIBRARY:-}"   # vuota
   grep -s SITE_STARTER_LIBRARY .env                       # nessuna riga con 1
   test -e blocks.lock.json && echo "Sito già inizializzato: verificare e riprendere"
   # Dopo site:init src/library viene rimosso: è normale con un lock valido.
   git status --porcelain                                  # vuoto
   git ls-remote --exit-code --heads origin lancio && echo "lancio esiste già: riusarlo"
   ```

   Se il lock esiste, controlla `npm run check:lock`, `docs/sito.md` e CMS e salta site:init.
   Se il lock manca ma src/library esiste, procedi su checkout pulito. Se mancano entrambi,
   confronta la consegna e la cronologia: recupera il checkout corretto tramite PM, senza
   ricreare il lock a mano. Per `git ls-remote --exit-code`, exit 2 indica branch assente;
   errori di trasporto/autenticazione hanno una causa diversa.

2. **Branch.** Resti sul branch della tua cartella, nato da `main` (skill `github-pr`, passo 1; nella cartella del Project, su `main`, crea `builder/avvio-sito`). `lancio`, l'unico branch del sito su cui lavoreranno tutti i task fino alla messa online, nasce su GitHub con il push del passo 6.

3. **Dipendenze** senza toccare `package-lock.json` (`site:init` vuole il working tree pulito):

   ```sh
   npm ci
   ```

4. **Inizializza solo il template non ancora inizializzato**, senza domande; il repository del CMS arriva dal remote `origin`:

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

6. **Commit, push e PR in bozza** verso `main` (skill `github-pr`, passi 3-6) con `DEST=lancio`: il push crea `lancio`. Titolo della PR «Lancio: <nome della repo>». È l'unica PR del sito: la useranno tutti i task e Simone la unirà al cancello 3.


   ```sh
   git add <soli file prodotti da site:init, verificati con git status>
   git commit -m "Inizializza il sito"
   ```

   La CI della PR verso `main` gira con `--strict` e può restare rossa per requisiti di rilascio ancora pendenti e documentati (segnaposto, informative o mappa redirect da decidere). Leggi sempre gli errori: schema, lock, build e altre regressioni vanno corretti subito; tutti i requisiti strict prima del rilascio.

7. **`npm run qa`** senza errori, poi nel task: link della PR, versione della libreria (`"version"` in `blocks.lock.json`), esito di `check` e `qa`.

## Criterio di fine

`blocks.lock.json` scritto da `site:init` e committato, `npm run check` e `npm run qa` senza errori, PR in bozza da `lancio` verso `main` con il link nel task.

## Non fare

- Mai nella libreria né con `SITE_STARTER_LIBRARY=1`: `site:init` toglie il catalogo.
- Mai `site:init` due volte, mai il lock scritto o corretto a mano; la libreria si aggiorna con `blocks:sync`, su task del PM.
- Niente dati, testi, pagine o immagini in questo task: arrivano dopo il cancello 1.
- Non toccare i file gestiti (`library.manifest.json`), non cambiare impostazioni di GitHub, Vercel o del servizio OAuth: le fa Simone.
- Non togliere segnaposto con dati inventati per far diventare verde la CI.
