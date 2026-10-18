---
name: qa
description: Usala quando devi verificare una PR di un sito cliente o della libreria e mandare l'esito al PM.
---

# Verifica di una PR

Per il QA. Verifichi, non correggi: ogni problema diventa una richiesta all'agente giusto.

## Passi

1. **Mettiti sulla PR** senza un branch tuo: il QA non fa commit.

   ```sh
   git status --porcelain                       # vuoto, altrimenti fermati e avvisa il PM
   git fetch origin
   git switch --detach origin/<branch della PR>
   npm ci
   ```

2. **Controlli:** nel sito, per il rilascio o senza ambito esplicito, `npm run qa -- --strict`.
   Se il task indica sola anteprima con decisione del Board registrata, `npm run qa`;
   nella libreria `npm run qa`. Non modificare soglie o codice dei controlli. Poi gli errori dal report:

   ```sh
   grep -n -A1 "❌" reports/qa.md    # ogni errore con file, punto e suggerimento (riga sotto, dopo →)
   ```

   Gli avvisi sono in `reports/qa.md` e vanno nel rapporto.
3. **Una richiesta per ogni errore**, all'agente giusto: testi, ricette, tema, layout e menu → Designer; `site.json`, immagini, codice, `vercel.json` e redirect → Builder; un file gestito toccato in un sito → Builder, che lo segnala al PM.

   ```text
   RICHIESTA QA → <Designer | Builder>
   PR: <link>
   CHECK: <check>
   FILE: <file> · PUNTO: <where>
   PROBLEMA: <message>
   SUGGERIMENTO: <hint>
   ```

4. **Nei siti, confronto con `docs/brief.md`**, che i controlli non coprono; ogni differenza è una richiesta, con file e punto:
   - servizi, zone, orari e recapiti uguali al brief (`src/content/settings/site.json` e pagine);
   - nessuna recensione o numero senza una fonte presente nel brief;
   - foto dei lavori reali, stock dichiarato in `docs/nota-design.md`;
   - tono dei testi coerente con il brief;
   - ogni pagina prevista dal brief esiste, nessuna pagina in più;
   - se c'è un sito esistente, in `vercel.json` esattamente le righe approvate in `docs/redirects.md`.
   Nella libreria usa invece il task approvato, `src/blocks/README.md`, schemi, fixture e criteri di accettazione: nessun brief cliente richiesto.
5. **Controllo a vista** a 375 e 1280 px, in locale (`npm run preview`, `http://localhost:4321`) o sull'anteprima Vercel della PR se si apre senza credenziali: menu mobile da tastiera, leggibilità, immagini tagliate male.

   ```sh
   npx playwright screenshot --viewport-size="375,812" --full-page "<indirizzo della pagina>" reports/vista-375.png
   npx playwright screenshot --viewport-size="1280,800" --full-page "<indirizzo della pagina>" reports/vista-1280.png
   ```

6. **Lascia la cartella com'era:** se `git status --porcelain` mostra file tracciati cambiati dai comandi, annotali nel rapporto (`git diff --stat`), ripristina solo i file generati identificati, con `git restore -- <file>`; se non sai da dove provengono, fermati e segnala al PM. Ferma il server avviato da te e infine `git switch -`.
7. **Rapporto al PM** nel task:

   ```text
   VERDETTO: PASS | FAIL
   AMBITO: anteprima | rilascio | libreria
   QA — <PR> · SHA: <git rev-parse HEAD>
   Controlli: npm run qa [-- --strict] → <n> errori, <n> avvisi
   Richieste aperte: <agente: file, problema> (una per riga)
   Requisiti (brief sito / task libreria): ok | <differenze>
   Vista 375/1280: ok | <note>
   Rilascio (se anteprima): non verificato | non pronto; <requisiti ancora aperti>
   ```

   La prima riga è sempre il verdetto: il PM la legge per chiudere o riaprire i task. PASS solo con zero errori e requisiti rispettati; gli avvisi vanno nel rapporto ma non bloccano. Dopo le correzioni si riparte dal passo 1.
   Il PASS riguarda solo l'ambito indicato: per un'anteprima rispetta le lacune ammesse
   dal Board, registra i requisiti di pubblicazione ancora mancanti e conserva il FAIL
   strict storico. Non riaprire richieste identiche per materiali o servizi già rinviati.
   Un esito su alias Vercel non certifica un deployment dello SHA: servono i metadati che
   li collegano. In loro assenza distingue la prova locale sul commit dalla prova HTTP
   dell'alias, senza presentare quest'ultima come verifica della medesima versione.

## Criterio di fine

Rapporto al PM inviato, con `VERDETTO: PASS` o `VERDETTO: FAIL` sulla prima riga e l'elenco delle richieste aperte.

## Non fare

- Non modificare file, non fare commit né push, non correggere «al volo».
- Non chiudere richieste di altri, non abbassare soglie, non saltare né spegnere controlli.
- Non unire più problemi in una richiesta, non dare PASS con errori aperti.
- Non fare merge e non togliere la PR dalla bozza.
