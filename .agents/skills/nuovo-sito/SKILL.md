---
name: nuovo-sito
description: Usala per avviare un sito cliente creato dal template site-starter e prepararlo con Simone fino alla composizione, cioè inizializzazione, brief, dati dell'attività e foto.
---

# Nuovo sito

Per l'agente che lavora con Simone, nella repo di un sito cliente, mai nella libreria. Porta il sito dal template appena creato al punto in cui si sceglie il tema (skill `direzione-visiva`). Le decisioni sono di Simone: il brief lo approva lui.

## Passi

1. **Controlla dove sei.**

   ```sh
   git remote get-url origin       # la repo del sito, non frankytheme-cyber/site-starter
   rg '^SITE_STARTER_LIBRARY=' .env   # nessuna riga con 1: un sito cliente non la imposta
   test -e blocks.lock.json && echo "già inizializzato"
   git status --porcelain          # vuoto
   ```

   La repo la crea Simone: dalla libreria con `npm run site:create -- <nome>` (guida `docs/provisioning.md`) o con «Use this template» su GitHub. Se il lock c'è già, il sito è inizializzato: salta al passo 3 e non rifare `site:init`.

2. **Inizializza**, una volta sola:

   ```sh
   npm ci
   npm run site:init -- --yes      # se non trova il repository del CMS: --repo=<owner>/<repo>
   npm install
   npm run check                   # senza errori; gli avvisi DA-COMPILARE sono attesi
   git switch -c lancio
   git add -A && git commit -m "Inizializza il sito"
   git push -u origin lancio
   gh pr create --draft --base main --title "Lancio: <nome del sito>" --body "Sito in preparazione."
   ```

   Fino alla prima messa online si lavora su `lancio`, con una sola PR in bozza; dopo, un branch e una PR per ogni modifica. Il merge lo fa sempre Simone.

Prima dei primi screenshot o della QA: `npx playwright install chromium` se il browser manca (su CI Linux: `npx playwright install --with-deps chromium`). Serve una volta per ambiente/versione di Playwright, non a ogni passaggio.

3. **Brief** in `docs/brief.md`, partendo dal modello: `test -e docs/brief.md || cp docs/modelli/brief.md docs/brief.md`.
   - Compilalo con Simone sezione per sezione, da 1 a 7. Chiedi solo ciò che manca, al massimo tre domande per volta, con una proposta o due-tre opzioni quando puoi. Le risposte si scrivono come le dà lui.
   - Un dato che manca resta `da chiedere`, con una riga in «Da chiedere»: a chi, entro quando, cosa ne dipende. Mai un dato dedotto o inventato.
   - Sezione 6: la voce `- Esiste un sito online?` resta e si risponde `sì, <indirizzo>` oppure `no` (la legge il controllo di rilascio).
   - Sezione 4 (tono e stile): servirà alla direzione visiva e ai testi; se è vuota, chiedi tre aggettivi per l'attività e un sito che a Simone piace.
   - Quando Simone dice che va bene: `Stato: approvato il <gg/mm/aaaa>` (oppure `approvato per sola anteprima il <data>`, con le lacune ammesse in «Lacune autorizzate»).

4. **Dati dell'attività** in `src/content/settings/site.json`, solo dal brief: nome, descrizione, dati legali (forma giuridica, P.IVA; per le società REA, capitale e sede legale), indirizzo, orari, telefono, WhatsApp, email, social, `businessType` e `areaServed`. Lo schema dice i campi (`npm run check:recipes` segnala gli errori con il campo); il CMS li mostra in «Dati attività».

5. **Foto.** Per i materiali reali usa foto ricevute da Simone o da una fonte autorizzata (per esempio «usa le foto del sito attuale»: scrivi in `docs/sito.md` la frase, la data e gli indirizzi originali). Se il brief non contiene immagini adatte, prepara placeholder per l’anteprima seguendo [immagini-placeholder.md](immagini-placeholder.md): dichiarati, coerenti e sostituibili, senza simulare prove reali. Non ridurre automaticamente il progetto a soli testi.

   ```sh
   npm run images -- <file o cartella>   # raddrizza, ridimensiona a 2400 px, toglie i metadati, nomi in kebab-case
   npm run images                        # inventario ricorsivo: dimensioni, orientamento, foto piccole
   ```

   L’importazione di una cartella legge solo i file direttamente al suo interno; passa esplicitamente le sottocartelle necessarie. `--sovrascrivi` permette di preparare anche una foto già nella destinazione senza perderla se la codifica fallisce.

   Rinomina ogni file con quello che mostra (`facciata-condominio-dopo.jpg`). Guardale una per una: tieni da parte quelle storte, sfocate, con persone o targhe riconoscibili senza consenso. Non dedurre da una foto chi ha fatto il lavoro, dove o quando. Immagine per i social: una foto orizzontale vera in `defaultOgImage` di `site.json` (Astro la ritaglia a 1200×630), al posto di `og-DA-COMPILARE.jpg`; il logo, se c'è, in `logo`.

6. **Sito esistente:** se il brief risponde `sì`, prepara la mappa dei redirect con la skill `redirect`.

7. **Note del sito** in `docs/sito.md`: eccezioni e decisioni che valgono per tutto il lavoro («il cliente non usa WhatsApp», fonti delle foto). Le leggono tutti gli agenti, anche Codex.

8. **Controlli e commit:** `npm run check` senza errori (restano gli avvisi dei segnaposto delle pagine), commit su `lancio` e push. Poi il tema con la skill `direzione-visiva`.

## Criterio di fine

Sito inizializzato con `blocks.lock.json`, PR in bozza da `lancio`, brief approvato da Simone, `site.json` compilato dal brief, foto preparate e inventariate, `npm run check` senza errori.

## Non fare

- Mai `site:init` due volte, mai il lock scritto o corretto a mano, mai `SITE_STARTER_LIBRARY=1` in un sito.
- Non togliere segnaposto con dati inventati per far diventare verdi i controlli.
- Non toccare i file gestiti né le impostazioni di GitHub, Vercel o del CMS: le fa Simone.
- Non usare foto di stock per lavori, persone e sede; non usare foto di altri siti senza l'autorizzazione di Simone.
