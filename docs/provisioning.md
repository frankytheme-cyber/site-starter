# Creare repo e progetto Vercel per un sito

`npm run site:create -- nome-cliente` prepara l'infrastruttura di un sito dalla **libreria**.
È un comando del titolare, eseguito nel suo terminale: gli agenti Paperclip mantengono i
confini delle loro istruzioni e non ricevono credenziali amministrative. Nelle run Paperclip
il comando rifiuta `--apply`; nei siti cliente lo script npm viene tolto da `site:init`.

## Preparazione una volta sola

1. Abilita **Template repository** sulla repo site-starter. La creazione usa il branch
   predefinito remoto: prima fai merge delle modifiche che vuoi nei nuovi siti. Non usa il
   working tree locale né un tag di release.
2. Prepara un token GitHub del **titolare**, con accesso al template, creazione delle repo
   nella destinazione scelta e gestione dei collaboratori. Un token classic richiede `repo`
   per le repo private; per un fine-grained controlla i permessi documentati degli endpoint
   di generazione e invito e la copertura delle nuove repo. Il token di `simone-agenti`
   resta riservato al lavoro sui siti, non viene riusato dal comando.
3. Prepara un **Vercel Access Token** con accesso all'account/team di destinazione.
4. Collega GitHub a Vercel e autorizza la Vercel GitHub App ad accedere alle nuove repo.
   Se l'installazione è limitata a repo selezionate, la nuova repo deve essere autorizzata:
   il token Vercel non concede da solo l'accesso GitHub. Un errore in questo punto lascia
   la repo già creata disponibile per la ripresa.
5. Per un team Vercel annota il **Team ID** (`team_…`, nelle impostazioni del team).
   Senza `--team` o `VERCEL_TEAM_ID` il comando usa l'account personale del token;
   non tenta di indovinare il team dal nome.

Passa le credenziali solo nell'ambiente del processo: `SITE_CREATE_GITHUB_TOKEN` e
`VERCEL_TOKEN`. Non inserirle in argomenti CLI, file della repo o `.env`; non copiarle nelle
variabili dei Project Paperclip. Il comando non legge token dal portachiavi, dal credential
helper o da `GH_TOKEN`/`GITHUB_TOKEN`, non li salva e non stampa body o header delle API.

Esempio nel terminale **zsh di macOS**, con input nascosto (i valori non entrano nella cronologia):

```zsh
read -rs 'SITE_CREATE_GITHUB_TOKEN?Token GitHub del titolare: '
export SITE_CREATE_GITHUB_TOKEN
read -rs 'VERCEL_TOKEN?Token Vercel: '
export VERCEL_TOKEN
```

Per usi ripetuti, un gestore di segreti può fornire queste due variabili al processo.
I valori non vanno committati. `SITE_CREATE_GITHUB_OWNER` e `VERCEL_TEAM_ID` sono default
facoltativi nell'ambiente; le opzioni CLI hanno precedenza.

## Anteprima ed esecuzione

Dalla cartella della libreria, con `SITE_STARTER_LIBRARY=1` in `.env`:

```sh
npm run site:create -- sito-prova --owner frankytheme-cyber --team team_IL_TUO_ID
```

Questa è un'**anteprima offline**: stampa il piano, non richiede credenziali e non verifica
che le risorse esistano o che i permessi siano corretti. Sostituisci il Team ID dell'esempio;
ometti `--team` solo se vuoi l'account personale. Per applicare lo stesso piano:

```sh
npm run site:create -- sito-prova --owner frankytheme-cyber --team team_IL_TUO_ID --apply
```

`--owner` è facoltativo: usa `SITE_CREATE_GITHUB_OWNER` o l'owner del template.
`--template owner/repo` cambia il template; il default viene da `library.manifest.json`.
Il nome deve essere compatibile con Vercel: 1–100 lettere minuscole, cifre e trattini,
inizio/fine alfanumerici e niente tre trattini consecutivi. Gli stessi nomi sono usati su
GitHub e Vercel. `npm run site:create -- --help` mostra le opzioni.

## Cosa viene creato e verificato

- **GitHub:** repo privata dal template, solo branch predefinito; invito di `simone-agenti`
  con permesso Write. Se l'account è già attivo, non viene reinvitato. Se l'invito è
  pendente, il riepilogo lo dice: va accettato con l'account `simone-agenti` prima che gli
  agenti possano clonare la repo privata. Il comando non usa le credenziali dell'invitato.
- **Vercel:** progetto Astro collegato alla nuova repo GitHub. Imposta esplicitamente
  `SITE_STARTER_LIBRARY` **vuota** in Production, Preview e Development, così prevale anche
  su un eventuale valore `1` condiviso dal team. Non copia altre variabili dalla libreria.
- **Verifica finale:** rilegge il progetto e controlla framework, ID della repo collegata
  e variabile di modalità; restituisce i link della repo e del progetto.

Una creazione del progetto non equivale a un deploy riuscito. L'integrazione GitHub potrà
avviare build: il template non inizializzato può fallire sul lock, finché il Builder non
esegue `site:init`. La CI e l'anteprima vanno verificate nel normale flusso del sito.

## Riprendere dopo un errore

Rilancia **lo stesso comando con gli stessi parametri**. La lettura dello stato remoto
permette di riusare la repo e il progetto, senza duplicarli e senza inviare di nuovo un
invito già pendente con Write. Non vengono fatti rollback o cancellazioni automatiche.
Una connessione interrotta durante una scrittura può avere lasciato la risorsa creata:
non cambiare nome per aggirare l'errore.

Una risorsa omonima incompatibile ferma il comando prima delle nuove scritture: la repo
deve essere privata e riportare il template previsto, il progetto deve essere Astro e
collegato all'ID corretto. Il comando non riconfigura risorse estranee. Se il progetto è
corretto ma manca la variabile di modalità vuota nei tre ambienti, correggila su Vercel e
riprova. Per 401/403 controlla token, scadenza, permessi e accesso al team, senza incollare
i token nei log o nei task.

## Passaggio a Paperclip

Restano da completare la protezione di `main`, il clone locale se desiderato e la
configurazione del Project Paperclip (repo, cartella gestita, workspace isolati, variabili
e secret degli agenti). Poi si assegna **Avvio sito** al Builder e il PM raccoglie il brief.
OAuth del CMS, dominio, DNS e merge umano restano nella checklist «Nuovo sito» della specifica.
Il comando non crea task, non avvia agenti e non esegue `site:init` nella libreria.

Verifiche dello strumento: `npm run test:provisioning` usa API simulate, senza risorse o
inviti reali. Prova creazione, seconda esecuzione, ripresa dopo errori parziali, collisioni,
separazione dei token, inviti pendenti e anteprima senza credenziali.

Riferimenti API ufficiali:

- [GitHub: creazione da template](https://docs.github.com/en/rest/repos/repos#create-a-repository-using-a-template)
- [GitHub: collaboratori e inviti](https://docs.github.com/en/rest/collaborators/collaborators#add-a-repository-collaborator)
- [Vercel: creazione progetto](https://vercel.com/docs/rest-api/projects/create-a-new-project)
- [Vercel: lettura progetto](https://vercel.com/docs/rest-api/projects/find-a-project-by-id-or-name)
