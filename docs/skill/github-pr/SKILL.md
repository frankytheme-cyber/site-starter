---
name: github-pr
description: Usala ogni volta che un task cambia file in una repo, per branch, commit, push e PR in bozza su GitHub.
---

# Branch, commit e PR in bozza

Per PM, Designer e Builder, nella libreria e nei siti. `gh` non c'è: la PR si apre con l'API di GitHub via `curl`. Identità git (`simone-agenti`) e token arrivano dall'env del Project: `GH_TOKEN` e `GITHUB_TOKEN` sono lo stesso token; `git` lo legge da `GITHUB_TOKEN` con il credential helper dell'env, `curl` lo usa da `GH_TOKEN`.

## Passi

1. **Cartella pulita, remote senza credenziali.**

   ```sh
   git status --porcelain
   git remote get-url origin
   ```

   Il primo non stampa nulla: modifiche non tue vogliono dire che qualcun altro lavora nella cartella, fermati e avvisa il PM. Il remote è `https://github.com/<owner>/<repo>.git`; se contiene un token o un utente (`…@github.com`), o è SSH (`git@github.com:…`), correggilo:

   ```sh
   git remote set-url origin https://github.com/<owner>/<repo>.git
   ```

2. **Branch.**

   **Sito cliente: sempre `lancio`**, l'unico branch del sito, con l'unica PR in bozza verso `main`. Lo crea il Builder nel task «Avvio sito» (skill `avvio-sito`); tutti gli altri task, di ogni agente, lavorano lì. Niente branch né PR nuovi: salta il passo 5.

   ```sh
   git fetch origin && git switch lancio && git pull --rebase
   ```

   **Libreria: un branch per task**, `<agente>/<argomento>` in kebab-case (`builder/blocchi-lotto-1`), da `main` o dal branch di partenza indicato nel task:

   ```sh
   git fetch origin
   git switch --no-track -c builder/blocchi-lotto-1 origin/main
   ```

   Correzione su una PR già aperta (il task indica il branch): niente branch né PR nuovi, salta il passo 5.

   ```sh
   git fetch origin && git switch <branch> && git pull --rebase
   ```

3. **Commit** dei soli file del task, con un messaggio che dice cosa cambia (di solito il titolo del task):

   ```sh
   git status
   git add <file del task>
   git commit -m "Pagina Servizi: ricetta e testi"
   ```

4. **Push.** Il token lo passa il credential helper: non va mai nel comando né nel remote. Prima riprendi i commit degli altri (su `lancio` lavorano più agenti):

   ```sh
   git pull --rebase
   git push -u origin HEAD
   ```

   Se il rebase si ferma per un conflitto su file che non sono del tuo task: `git rebase --abort` e avvisa il PM, senza risolverlo tu.

5. **PR in bozza al primo push**, non a fine lavoro: la CI gira solo sui branch con una PR. Prima guarda se c'è già:

   ```sh
   REPO=$(git remote get-url origin | sed -E 's#^https://github\.com/##; s#\.git$##')
   BRANCH=$(git branch --show-current)
   curl -sS -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
     "https://api.github.com/repos/$REPO/pulls?state=open&head=${REPO%%/*}:$BRANCH" \
     | node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{const r=[JSON.parse(s)].flat();console.log(r.map((p)=>p.html_url??p.message).join("\n")||"nessuna PR aperta")})'
   ```

   Con «nessuna PR aperta», aprila (`BASE` è `main` o il branch di partenza del task):

   ```sh
   REPO=$(git remote get-url origin | sed -E 's#^https://github\.com/##; s#\.git$##')
   BRANCH=$(git branch --show-current)
   BASE=main
   TITOLO="Pagina Servizi: ricetta e testi"
   CORPO="Task: <titolo e link del task>

   - <cosa cambia, un punto per riga>

   Controlli: <esito di npm run qa>"
   node -e 'const [title, head, base, body] = process.argv.slice(1); process.stdout.write(JSON.stringify({ title, head, base, body, draft: true }))' \
     "$TITOLO" "$BRANCH" "$BASE" "$CORPO" \
     | curl -sS -X POST -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
       --data-binary @- "https://api.github.com/repos/$REPO/pulls" \
     | node -e 'let s="";process.stdin.on("data",(d)=>(s+=d)).on("end",()=>{const r=JSON.parse(s);console.log(r.html_url??`errore: ${r.message} ${JSON.stringify(r.errors??[])}`)})'
   ```

   Stampa l'indirizzo della PR o l'errore di GitHub. I push successivi (`git push`) la aggiornano da soli.

6. **Link nel task:** l'indirizzo della PR va nel task Paperclip appena la apri; a fine lavoro aggiungi l'esito dei controlli.

Nei siti la CI delle PR verso `main` gira con `--strict`: finché il sito non è completo resta rossa per i segnaposto (`DA-COMPILARE`, `og-DA-COMPILARE`). Per chiudere il task conta `npm run qa` senza errori.

## Criterio di fine

PR in bozza aperta verso la base giusta, tutti i commit del task pushati, link della PR nel task.

## Non fare

- Mai il token nell'URL: né nel remote (`https://x-access-token:…@github.com/…`) né nella richiesta (`?access_token=`). Solo nell'header `Authorization`.
- Mai stampare token o ambiente: niente `echo $GH_TOKEN`, `env`, `printenv`, `set -x`.
- Mai merge, mai push su `main`, mai `git push --force`; non togliere la bozza: lo fa Simone quando unisce.
- Non approvare né chiudere PR, non cambiare impostazioni della repo (protezioni, collaboratori, variabili, segreti) o di Vercel.
- Non installare `gh` o altri client e non usare i Connectors di GitHub.
- Push o API rifiutati (401, 403): non cercare altre strade, avvisa il PM (il token scade ogni 90 giorni).
