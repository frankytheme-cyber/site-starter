# Decap CMS

Il cliente modifica i contenuti del proprio sito da `https://<sito>/admin/`, entrando con il suo account GitHub. Ogni modifica diventa una pull request sul repository del sito; quando il cliente la pubblica, la pull request viene unita a `main` e Vercel ricostruisce il sito.

## Come è fatto

| File                                   | Cosa fa                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| `public/admin/config.yml`              | Configurazione di Decap. **Generata**: non si modifica a mano.                             |
| `scripts/gen-decap-config.ts`          | La genera dagli schemi Zod (`npm run gen:decap`, eseguito anche prima di ogni build).      |
| `public/admin/index.html`              | Pagina `/admin/`, esclusa dai motori di ricerca.                                           |
| `src/core/integrations/decap-bundle.ts` | Serve Decap da `/admin/decap/`, copiato da `node_modules/decap-cms` (niente CDN).          |
| `src/site.config.ts`                   | Indirizzo del servizio OAuth (`cms.oauthBaseUrl`) e ramo di pubblicazione (`cms.branch`). |

I campi del CMS sono quelli degli schemi dei blocchi di pagina (`src/blocks/*/schema.ts` con `scope: 'page'`), delle pagine (`src/core/page-schema.ts`) e delle impostazioni (`src/core/settings.ts`, `src/core/navigation.ts`). Header e footer (blocchi di layout) e `layout.json` non sono nel CMS. Le scelte da un elenco chiuso mostrano un'etichetta leggibile se l'enum ha `.meta({ optionLabels })` (es. forma giuridica, giorni degli orari); una lista di valori da un enum diventa una select a scelta multipla. Etichetta e aiuto di ogni campo vengono da `.describe("Etichetta|Aiuto")`: un campo senza descrizione, o di un tipo che Decap non sa rappresentare, ferma `gen:decap` con il blocco e il campo da sistemare.

Dopo aver cambiato uno schema: `npm run gen:decap` e commit di `config.yml`. `npm run check:decap` (compreso in `npm run check` e quindi in CI) fallisce se il file non è aggiornato.

Il repository GitHub nella configurazione si ricava, in quest'ordine, da `--repo=org/nome`, dalla variabile `DECAP_REPO`, da `VERCEL_GIT_REPO_OWNER`/`VERCEL_GIT_REPO_SLUG` (su Vercel) e dal remote `origin`.

## Servizio OAuth condiviso

Decap accede a GitHub a nome del cliente: serve un piccolo servizio che faccia lo scambio OAuth tenendo segreto il client secret. Se ne usa **uno per tutta l'agenzia**, condiviso da tutti i siti cliente.

### 1. GitHub OAuth App

Nell'organizzazione GitHub dell'agenzia: **Settings → Developer settings → OAuth Apps → New OAuth App**.

- **Application name**: es. «Gestione contenuti».
- **Homepage URL**: l'indirizzo del worker, es. `https://decap-oauth.<agenzia>.workers.dev`.
- **Authorization callback URL**: lo stesso indirizzo seguito da `/callback`.

Annota il **Client ID** e genera un **Client secret**.

### 2. Worker

Un Cloudflare Worker (o una funzione serverless equivalente) con due indirizzi:

- `/auth`: manda a GitHub a chiedere l'autorizzazione (scope `repo`, necessario anche per i repository privati);
- `/callback`: riceve il codice da GitHub, lo scambia con un token e lo passa alla finestra di Decap.

Si può usare un progetto open source già pronto e compatibile con Decap, ad esempio `sveltia-cms-auth`: si pubblica con `wrangler deploy` e si configurano i segreti:

- `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` dalla OAuth App;
- l'elenco dei domini dei siti cliente autorizzati a usarlo (es. `ALLOWED_DOMAINS`), da aggiornare a ogni nuovo cliente.

### 3. Collegamento ai siti

In `src/site.config.ts` metti l'indirizzo del worker in `cms.oauthBaseUrl` (Decap chiama `<oauthBaseUrl>/auth`). Nel template va impostato una volta: i siti cliente lo ereditano.

## Per ogni sito cliente

1. Il repository del sito è su GitHub e collegato a Vercel.
2. Il dominio del sito è nell'elenco dei domini autorizzati del worker.
3. `npm run gen:decap` (o la build) genera `config.yml` con il repository giusto; commit del file.
4. Protezione del ramo `main` (consigliata): richiedi che la build di Vercel passi prima di unire, senza revisioni obbligatorie. Con le revisioni obbligatorie il cliente non riesce a pubblicare dal CMS.

### Invitare il cliente

1. Il cliente crea un account GitHub gratuito (basta un'email) e attiva l'autenticazione a due fattori.
2. Nel repository del sito: **Settings → Collaborators → Add people**, con ruolo **Write**. Il CMS deve poter creare rami e pull request; con un ruolo inferiore non può salvare.
3. Se il repository è di un'organizzazione, il cliente entra come collaboratore esterno, solo su quel repository.
4. Il cliente accetta l'invito dall'email di GitHub, apre `https://<sito>/admin/` e sceglie **Accedi con GitHub**.

Per togliere l'accesso basta rimuoverlo dai collaboratori.

## Flusso editoriale

Il CMS usa `publish_mode: editorial_workflow`: niente va online senza una pubblicazione esplicita.

1. **Bozza.** Al primo **Salva** Decap crea un ramo `cms/<raccolta>/<pagina>` e una pull request. Le foto caricate finiscono nello stesso ramo, in `src/assets/images/`.
2. **In revisione / Pronto.** Lo stato si cambia dal menu in alto o nella scheda **Flusso editoriale**, dove le modifiche in corso sono in colonne. Vercel pubblica un'anteprima di ogni ramo: il link è nella pull request su GitHub.
3. **Pubblica.** Da **Pronto** la modifica si pubblica: la pull request viene unita a `main` e Vercel ricostruisce il sito.

Se la build fallisce (es. una variante a cui manca la foto), il sito resta alla versione precedente e il deploy fallito mostra file, sezione e campo da correggere. Prima di pubblicare un sito nuovo esegui comunque `npm run check -- --strict`; in CI le pull request verso `main` lo fanno da sole (`docs/controlli.md`).

Il campo **Bozza** di una pagina è una cosa diversa: una pagina con `draft: true`, anche pubblicata, compare solo nelle anteprime e non in produzione.

## Cosa può modificare il cliente

**Può:**

- **Pagine:** creare pagine, modificarne titolo, descrizione per Google, immagine per i social e stato di bozza; aggiungere, riordinare (trascinando) ed eliminare sezioni, scegliendo tra i blocchi della libreria; cambiare testi, foto, link, varianti e sfondi delle sezioni.
- **Dati attività:** nome, descrizione, indirizzo del sito, logo, telefono, WhatsApp, email, indirizzo, dati legali (ragione sociale, forma giuridica, partita IVA, REA e capitale sociale), orari (giorni e fasce orarie), profili social.
- **Menu:** voci, sottomenu e pulsante in evidenza dell'intestazione; link del footer e link legali (privacy, cookie).
- **Media:** caricare foto, che vanno in `src/assets/images/` e vengono ottimizzate dalla build.

**Non può:**

- cambiare l'aspetto del sito: palette, font e forma (`theme.json` non è nel CMS), né variante e opzioni di header e footer (`layout.json` non è nel CMS);
- creare blocchi nuovi o cambiarne il disegno: si compone solo con i blocchi esistenti;
- toccare codice, configurazione e cartelle gestite della libreria;
- cambiare l'indirizzo di una pagina dopo averla creata: il nome del file nasce dal titolo alla creazione. Per cambiarlo serve lo sviluppatore.

Non eliminare la pagina **index**: è la home del sito.

## Limiti noti

- **Regole tra campi.** Il CMS non sa che la foto è obbligatoria solo per alcune varianti (hero `split`/`full`, servizi `cards-immagine`/`alternato`), né che l'icona serve per `cards-icone`, che REA e capitale sociale sono obbligatori per le società, né controlla la cifra di controllo della partita IVA o l'ordine delle fasce orarie. Gli aiuti dei campi lo dicono; il controllo vero lo fa la build.
- **Campi «tutto o niente».** Pulsante secondario, link di un servizio, foto: si compilano tutti i campi o nessuno. Un campo lasciato a metà ferma la build. I campi svuotati invece non danno problemi: prima della validazione `""` e `{}` vengono tolti (`src/core/clean-data.ts`).
- **Anteprima nell'editor disattivata.** Il sito si controlla sull'anteprima di Vercel.
- **Foto in sottocartelle.** La libreria media mostra solo `src/assets/images/`: le foto in sottocartelle (es. `fixtures/` del template) restano valide ma nel CMS non hanno l'anteprima.

## Prova in locale

Senza GitHub né worker, contro `decap-server`:

```sh
npm run dev          # in un terminale
npm run cms:local    # in un altro: decap-server su http://localhost:8081
```

Poi apri `http://localhost:4321/admin/` e premi **Accedi**: su localhost Decap usa `decap-server` (`local_backend: true`).

`cms:local` usa la modalità `git`, l'unica con il flusso editoriale: ogni salvataggio è un commit su un ramo `cms/...` del repository locale. Il working tree deve essere pulito, altrimenti `decap-server` non riesce a salvare: per prove che non devono lasciare rami nel tuo repository, lavora su una copia. La modalità `fs` (`MODE=fs npm run cms:local`) scrive i file direttamente ma supporta solo la pubblicazione semplice, non le bozze: con questa configurazione non va usata.
