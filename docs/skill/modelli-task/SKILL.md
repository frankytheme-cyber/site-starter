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
   - INPUT: file, link, brief, richieste e il branch: nel sito sempre `lancio`; nella libreria il branch di partenza se il lavoro dipende da una PR non ancora unita (per le correzioni, il branch della PR in QA);
   - OUTPUT ATTESO: file e PR (per QA e SEO, il rapporto);
   - CRITERI DI FINE: sempre `npm run qa` senza errori (nel sito, prima del cancello 3, `npm run qa -- --strict`), più quelli del modello;
   - VINCOLI: cosa non toccare;
   - PASSA A, ed eventuale CANCELLO.
4. **Piccolo e verificabile:** un task, un agente; nel sito tutti i task sulla PR di `lancio`, nella libreria una PR per task e 2-3 blocchi per task. Se un criterio non si può verificare, riscrivilo o dividi il task.
5. **Crea e assegna** il task nel Project giusto («Libreria blocchi» o il sito) e aggiorna il registro dello stato.

## Criterio di fine

Task assegnato, con tutti i campi compilati.

## Non fare

- Niente task senza criteri di fine o con dati che non sono nel brief.
- Niente lavoro fuori ruolo: il QA non corregge, il SEO non riscrive, il Designer non scrive codice, il Builder non cambia testi o design.
- Niente task di nuovo blocco senza l'approvazione di Simone (skill `richiesta-blocco`), niente task di una fase prima del suo cancello.
- Non fare tu il lavoro del task (codice, testi, ricette).
