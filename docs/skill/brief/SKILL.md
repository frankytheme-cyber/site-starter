---
name: brief
description: Usala quando devi raccogliere con Simone il brief di un nuovo sito cliente e portarlo al cancello 1.
---

# Brief del sito

Per il PM, nella repo del sito già avviata (task «Avvio sito» fatto). Il brief è la base di tutto: il Designer compone dal brief, il Builder ne prende i dati, il QA confronta col brief.

## Passi

1. **Branch** `pm/brief` e PR in bozza al primo commit (skill `github-pr`).
2. **Copia il modello**; se `docs/brief.md` c'è già, riprendi da lì:

   ```sh
   test -e docs/brief.md || cp docs/modelli/brief.md docs/brief.md
   ```

   Nel titolo il nome dell'attività, `Stato: bozza`.

3. **Compila con Simone sezione per sezione**, da 1 a 7: domande brevi, raggruppate per sezione, solo sui dati che mancano; le risposte si scrivono come le dà lui.
   - Attività: forma giuridica (ditta individuale, srl, srls, snc, sas, altro), P.IVA di 11 cifre, per le società REA, capitale sociale e sede legale; orari giorno per giorno, con le fasce.
   - Servizi al massimo 6, una riga ciascuno; «cosa la distingue» solo con fatti verificabili.
   - Pagine previste, comprese Privacy e Cookie (o il link alle informative esterne), e chi ne fornisce i testi.
   - Recensioni con testo, autore, fonte e data; numeri con valore e fonte; foto reali e chi le fornisce; stock sì o no.
   - Sito esistente e dominio: se c'è un sito, servirà la proposta dei redirect (skill `redirect`, decisione al cancello 2).
4. **Dati mancanti:** nel campo scrivi `da chiedere` e aggiungi una riga in «Da chiedere», con il dato e a chi chiederlo.
5. **Controllo prima del cancello:** nessun campo vuoto e nessun `da chiedere` nelle sezioni 1, 2 e 3.

   ```sh
   grep -n -i "da chiedere" docs/brief.md
   ```

6. **Commit e push** di `docs/brief.md` (messaggio «Brief: <nome attività>»), link della PR nel task.
7. **Approval in Paperclip (cancello 1)** con il link al file nella PR (`https://github.com/<owner>/<repo>/blob/pm/brief/docs/brief.md`), un riassunto in 5 righe e i «Da chiedere» rimasti.
8. **Dopo la risposta di Simone:**
   - approvato: `Stato: approvato il <gg/mm/aaaa>`, commit e push, poi i task di Design, Dati e immagini ed eventualmente Redirect (skill `modelli-task`);
   - modifiche richieste: correggi, commit e push, nuova Approval.

## Criterio di fine

Nessun campo obbligatorio vuoto e Approval del cancello 1 inviata; dopo l'approvazione, `Stato: approvato il <data>` nel file.

## Non fare

- Mai dati ricavati o inventati: niente ricerche su web, social, registri o vecchio sito per riempire un campo. Se un dato manca, si chiede a Simone.
- Non modificare `docs/modelli/brief.md` (gestito dalla libreria): si compila solo `docs/brief.md`.
- Non scrivere testi del sito, ricette o `site.json`.
- Non far partire la fase successiva prima dell'approvazione; non approvare al posto di Simone.
