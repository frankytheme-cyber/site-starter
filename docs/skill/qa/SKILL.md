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

2. **Controlli:** nel sito `npm run qa -- --strict`, nella libreria `npm run qa`. Poi gli errori dal report:

   ```sh
   node -e 'const r = JSON.parse(require("fs").readFileSync("reports/qa.json", "utf8")); for (const f of r.findings.filter((f) => f.level === "error")) console.log([f.check, f.file, f.where, f.message, f.hint].filter(Boolean).join(" | "))'
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

4. **Confronto con `docs/brief.md`**, che i controlli non coprono; ogni differenza è una richiesta, con file e punto:
   - servizi, zone, orari e recapiti uguali al brief (`src/content/settings/site.json` e pagine);
   - nessuna recensione o numero senza una fonte presente nel brief;
   - foto dei lavori reali, stock dichiarato in `docs/nota-design.md`;
   - tono dei testi coerente con il brief;
   - ogni pagina prevista dal brief esiste, nessuna pagina in più.
5. **Controllo a vista** a 375 e 1280 px, sull'anteprima Vercel della PR o in locale (`npm run preview`, `http://localhost:4321`): menu mobile da tastiera, leggibilità, immagini tagliate male.

   ```sh
   npx playwright screenshot --viewport-size="375,812" --full-page "<indirizzo della pagina>" reports/vista-375.png
   npx playwright screenshot --viewport-size="1280,800" --full-page "<indirizzo della pagina>" reports/vista-1280.png
   ```

6. **Lascia la cartella com'era:** se `git status --porcelain` mostra file tracciati cambiati dai comandi, annotali nel rapporto (`git diff --stat`), poi `git restore .`; infine `git switch -`.
7. **Rapporto al PM** nel task:

   ```text
   QA — <PR>
   Esito: verde | rosso
   Controlli: npm run qa [-- --strict] → <n> errori, <n> avvisi
   Richieste aperte: <agente: file, problema> (una per riga)
   Brief: ok | <differenze>
   Vista 375/1280: ok | <note>
   ```

   Verde solo con zero errori e nessuna differenza dal brief. Dopo le correzioni si riparte dal passo 1.

## Criterio di fine

Rapporto al PM inviato, con l'esito e l'elenco delle richieste aperte.

## Non fare

- Non modificare file, non fare commit né push, non correggere «al volo».
- Non chiudere richieste di altri, non abbassare soglie, non saltare né spegnere controlli.
- Non unire più problemi in una richiesta, non dare verde con errori aperti.
- Non fare merge e non togliere la PR dalla bozza.
