---
name: modelli-task
description: Usala ogni volta che devi creare e assegnare un task a un agente della squadra, nella libreria o in un sito cliente.
---

# Task dai modelli

Per il PM. I modelli sono in `docs/modelli/task.md`: la forma comune, la tabella dei task tipici e un esempio completo.

## Passi

1. **Fase giusta.** Guarda nel registro dello stato a che punto è il Project e quali cancelli sono passati. Sito: Avvio → Brief → cancello 1 → Dati, immagini, redirect → Design → cancello 2 → QA → correzioni → SEO pre-lancio → cancello 3. Libreria: un lotto di blocchi parte solo dopo il merge del precedente.
2. **Scegli il modello** nella tabella dei task tipici; se nessuno va bene, usa la forma comune.
3. **Compila tutti i campi:**
   - TITOLO: verbo + oggetto («Pagina Servizi: ricetta e testi»);
   - AGENTE e PROJECT: uno solo per task;
   - OBIETTIVO: una frase;
   - AMBITO: anteprima, rilascio o libreria. Per l'anteprima riporta la decisione del Board
     e le lacune ammesse; QA usa la suite non strict e non certifica la pubblicazione.
     Per il rilascio resta obbligatorio QA strict senza errori;
   - DOMANDE RINVIATE: dato o scelta, responsabile, fase entro cui serve e sola attività
     dipendente. Le risposte non essenziali al risultato attuale non sono blocker del task;
   - INPUT: file, link, brief, richieste e il branch: nel sito sempre `lancio`; nella libreria il branch di partenza se il lavoro dipende da una PR non ancora unita (per le correzioni, il branch della PR in QA);
   - OUTPUT ATTESO: file e PR (per QA e SEO, il rapporto);
   - CRITERI DI FINE: chi modifica sito o blocchi esegue `npm run qa`; QA fa la verifica indipendente, strict prima del rilascio. PM e SEO valutano le evidenze sullo stesso SHA senza duplicare la suite; aggiungi i criteri del modello e le lacune esplicitamente ammesse per l’anteprima;
   - VINCOLI: cosa non toccare;
   - PASSA A, ed eventuale CANCELLO.
   Per QA/SEO il criterio di fine è un rapporto completo con SHA e PASS/FAIL: anche FAIL chiude la verifica e attiva le correzioni del PM. Per PM è la consegna/decisione della fase. Se un modello nel checkout è più vecchio, applica questi criteri di ruolo, workspace e anteprima.

4. **Piccolo e verificabile:** un task, un agente; nel sito tutti i task sulla PR di `lancio`, nella libreria una PR per task e 2-3 blocchi per task. Se un criterio non si può verificare, riscrivilo o dividi il task.
5. **Crea e assegna** nel Project giusto con dipendenze esplicite e workspace isolato proprio, senza copiare l’executionWorkspaceId del padre. Nei siti: base origin/main per Avvio, origin/lancio per le fasi successive; nella libreria: main per un lavoro nuovo, branch/SHA della PR per revisioni e correzioni; worktreeParentDir fuori dal clone. Segui «Workspace e consegne» delle istruzioni PM. Non usare approvazioni finali del padre per i cancelli intermedi.

## Criterio di fine

Task assegnato, con tutti i campi compilati.

## Non fare

- Niente task senza criteri di fine o con dati che non sono nel brief.
- Niente lavoro fuori ruolo: il QA non corregge, il SEO non riscrive, il Designer non scrive codice, il Builder non cambia testi o design.
- Niente task di nuovo blocco senza l'approvazione di Simone (skill `richiesta-blocco`), niente task di una fase prima del suo cancello.
- Non fare tu il lavoro del task (codice, testi, ricette).
