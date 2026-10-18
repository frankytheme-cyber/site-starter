---
name: github-pr
description: Usala ogni volta che un task cambia file in una repo, per branch, commit, push e PR in bozza su GitHub.
---

# Branch, commit e PR in bozza

Per PM, Designer e Builder, nella libreria e nei siti. La PR si apre con `npm run pr`.
Nel runtime Paperclip gestito i token nella shell possono essere vuoti: è previsto,
non dimostra un guasto. Git usa il launcher di Paperclip; lo script PR richiede al
broker la credenziale effimera dell'identità già autorizzata per la run. Non occorre
creare nuove connessioni o configurare PAT. Fuori dal runtime sono supportati
`GH_TOKEN` e `GITHUB_TOKEN`. Non copiare credenziali dal broker in file o comandi.

Se un sito contiene ancora lo script precedente che richiede soltanto GH_TOKEN, usa
`node <cartella-della-skill-attiva>/scripts/pr.ts --dest lancio` con gli stessi argomenti
`--title`, `--base`, `--body-file`. Ricava il percorso dalla skill caricata: nessun percorso
personale fisso e nessuna modifica ai file gestiti del sito. Lo script legge il remote
dal cwd corrente. La soluzione stabile arriva al sito con il normale aggiornamento
della libreria; il comando della skill consente di consegnare nel frattempo.

## Ripresa autonoma

- Riprendi il risultato già approvato senza richiedere la stessa approvazione. Verifica
  branch, commit, file e PR esistenti; riusa `lancio` e la sua PR, senza duplicarli.
- Non bloccare inizializzazione, dati o controlli locali solo perché manca la PR o
  l'anteprima. Completa il lavoro autorizzato e conserva commit e riepilogo; il task
  resta aperto se manca la consegna richiesta.
- Un errore transitorio del broker viene ritentato dallo script, con budget limitato.
  Dopo un rifiuto reale di accesso non cambiare account, permessi o metodo per aggirarlo.
  Segnala al PM una sola diagnosi verificata con comando, esito e prossimo responsabile;
  non ripetere richieste identiche senza cambiamenti.
- L'assenza di un prerequisito interno va risolta dal PM con un task assegnato e una
  dipendenza. Chiedi a Simone solo dati, decisioni o accessi che la squadra non possiede.

## Passi

1. **Cartella, remote, dipendenze.** Di solito Paperclip ti dà una cartella tua per il task: un worktree `<ID>-<titolo>` nella cartella `worktrees` del Project, accanto al clone principale, con un branch locale proprio: nei siti da `origin/main` per Avvio e `origin/lancio` dopo; nella libreria da main per lavori nuovi o dal branch/SHA indicato per revisioni e correzioni. Un task riaperto ritrova la stessa cartella.

   ```sh
   test -f .git && echo "cartella del task" || echo "clone principale del Project"   # in un worktree .git è un file
   git branch --show-current
   git status --porcelain
   git remote get-url origin
   test -d node_modules || npm ci    # una cartella nuova non ha le dipendenze
   ```

   `git status --porcelain` mostra eventuali modifiche: la cartella non ne dimostra la titolarità. Riprendi quelle attribuite al tuo task dalle consegne; preserva le altre. Se impediscono rebase o inizializzazione, chiedi al PM un workspace isolato pulito, lasciando intatto quello precedente. È manutenzione interna al mandato, non una decisione del Board. Non usare reset, clean o stash per liberare file di altri. Il remote è `https://github.com/<owner>/<repo>.git`; se contiene un token o un utente (`…@github.com`), o è SSH (`git@github.com:…`), correggilo:

   ```sh
   git remote set-url origin https://github.com/<owner>/<repo>.git
   ```

2. **Branch di destinazione** (`DEST`): il branch di GitHub dove vanno i tuoi commit. Lavori sempre sul branch della tua cartella e fai push verso `DEST`: mai `git switch` su `lancio` o sul branch di una PR, che possono essere aperti nella cartella di un altro task (git lo vieta).

   **Sito cliente: `DEST=lancio`**, il branch remoto di consegna, con una sola PR aperta
   per volta verso `main`, inizialmente aperta in bozza da «Avvio sito». Allinea il tuo
   branch a `lancio` e verifica la PR aperta. Se la precedente è già unita e il task
   autorizza ulteriori modifiche, confronta `origin/main...origin/lancio` e apri al passo 5
   una nuova PR in bozza per il delta; riusa una PR già aperta. Non tentare di aggiornare
   una PR unita né considerare consegnati su main i commit successivi al merge.

   ```sh
   git fetch origin
   git rebase origin/lancio
   ```

   Senza commit tuoi il branch si porta su `lancio`; in un task riaperto i tuoi commit non pushati si rimettono sopra.

   **Libreria, lavoro nuovo: `DEST` è il branch della tua cartella** (`git branch --show-current`). Se sei su `main`, cioè nella cartella del Project, crea un branch `<agente>/<argomento>` in kebab-case:

   ```sh
   git fetch origin
   git switch --no-track -c builder/blocchi-lotto-1 origin/main
   ```

   **Libreria, correzione su una PR già aperta** (il task indica il branch): `DEST` è il branch della PR; niente PR nuova, salta il passo 5.

   ```sh
   git fetch origin
   git rebase origin/<branch della PR>
   ```

3. **Commit** dei soli file del task, con un messaggio che dice cosa cambia (di solito il titolo del task):

   ```sh
   git status
   git add <file del task>
   git commit -m "Pagina Servizi: ricetta e testi"
   ```

4. **Push verso `DEST`.** Il token lo passa il credential helper: non va mai nel comando né nel remote. Prima riprendi i commit degli altri (su `lancio` lavorano più agenti):

   ```sh
   DEST=lancio   # o il branch del task, o quello della PR in correzione
   git fetch origin
   git ls-remote --exit-code --heads origin "$DEST" >/dev/null && git rebase "origin/$DEST"
   git push -u origin "HEAD:$DEST"
   ```

   Dopo l’allineamento finale confronta il contenuto con quello verificato: se cambia,
   ripeti i controlli richiesti sul risultato e riporta lo SHA effettivamente consegnato.
   Un rebase senza conflitti può comunque cambiare il contenuto.

   Push rifiutato perché nel frattempo qualcuno ha pushato: ripeti il blocco. Se il rebase si ferma per un conflitto su file che non sono del tuo task: `git rebase --abort` e avvisa il PM, senza risolverlo tu.

5. **PR in bozza al primo push**, non a fine lavoro: la CI gira solo sui branch con una PR. `npm run pr` cerca la PR aperta da `DEST` e, se non c'è e gli dai un titolo, la apre in bozza; stampa l'indirizzo della PR o l'errore di GitHub.

   ```sh
   npm run pr -- --dest <branch di destinazione>    # indirizzo della PR, o «nessuna PR aperta»
   ```

   Con «nessuna PR aperta», scrivi il corpo in `reports/pr.md` (la cartella `reports/` non va nei commit) e aprila; `--base` è `main` o il branch di partenza del task:

   ```sh
   cat > reports/pr.md <<'TESTO'
   Task: <titolo e link del task>

   - <cosa cambia, un punto per riga>

   Controlli: <esito di npm run qa>
   TESTO
   npm run pr -- --dest <branch di destinazione> --base main --title "Pagina Servizi: ricetta e testi" --body-file reports/pr.md
   ```

   I push successivi (passo 4) aggiornano la PR da soli.

6. **Link nel task:** l'indirizzo della PR va nel task Paperclip appena la apri; a fine lavoro aggiungi l'esito dei controlli.

Nei siti la CI delle PR verso `main` gira con `--strict`: finché il sito non è completo resta rossa per i segnaposto (`DA-COMPILARE`, `og-DA-COMPILARE`). Per chiudere il task conta `npm run qa` senza errori.

## Criterio di fine

PR in bozza aperta verso la base giusta, tutti i commit del task pushati, link della PR nel task.

## Non fare

- Mai il token nell'URL: né nel remote (`https://x-access-token:…@github.com/…`) né nella richiesta (`?access_token=`). Solo nell'header `Authorization`.
- Mai stampare token o ambiente: niente `echo $GH_TOKEN`, `env`, `printenv`, `set -x`.
- Mai merge, mai push su `main`, mai `git push --force`; non togliere la bozza: lo fa Simone quando unisce.
- Mai `git switch` su `lancio` o sul branch di una PR aperta: si lavora sul branch della propria cartella e si fa push con `HEAD:<DEST>`. Mai cancellare o spostare le cartelle dei task: le gestisce Paperclip.
- Non approvare né chiudere PR, non cambiare impostazioni della repo (protezioni, collaboratori, variabili, segreti) o di Vercel.
- Per commit e push usa Git gestito; per PR usa lo script. Letture dello stato via strumenti GitHub già autorizzati sono ammesse sulla stessa identità e repo. Non installare client né cambiare autenticazione per aggirare un rifiuto.
- Push o API rifiutati (401, 403): non cambiare identità né recuperare token dal portachiavi o dai file del servizio. Riporta il rifiuto al PM; la scadenza dipende dal metodo di autenticazione.
