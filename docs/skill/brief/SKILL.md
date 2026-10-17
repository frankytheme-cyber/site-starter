---
name: brief
description: Usala quando devi raccogliere con Simone il brief di un nuovo sito cliente e portarlo al cancello 1.
---

# Brief del sito

Per il PM. Puoi raccogliere il brief mentre procede Avvio; la versione approvata va poi tracciata su `lancio`, prima dei task che la consumano. Il brief è la base di tutto: il Designer compone dal brief, il Builder ne prende i dati, il QA confronta col brief.

## Passi

1. **Destinazione `lancio`** (skill `github-pr`, `DEST=lancio`): la PR del sito c'è già, l'ha aperta il Builder all'avvio.
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
   - Sito esistente e dominio: conserva la voce `- Esiste un sito online?` e rispondi `sì, <indirizzo>` oppure `no` (la legge il controllo di rilascio). Se c'è un sito, servirà la proposta dei redirect (skill `redirect`, decisione al cancello 2).
4. **Dati mancanti:** nel campo scrivi `da chiedere` e aggiungi una riga in «Da chiedere», con il dato e a chi chiederlo.
5. **Controllo prima del cancello:** esplicita ogni lacuna e il suo impatto. Per il brief completo le sezioni 1, 2 e 3 devono essere complete. Se il Board approva esplicitamente un’anteprima con lacune, registra quali, cosa resta escluso e quali dati serviranno prima della pubblicazione; non richiedere di nuovo la stessa approvazione.

   ```sh
   grep -n -i "da chiedere" docs/brief.md
   ```

6. **Commit e push** del solo `docs/brief.md` (messaggio «Brief: <nome attività>»), link della PR nel task.
7. **Approval in Paperclip (cancello 1)** con il link al file nella PR (`https://github.com/<owner>/<repo>/blob/lancio/docs/brief.md`), un riassunto in 5 righe e i «Da chiedere» rimasti.
   Se esiste già una risposta esplicita di approvazione, registrala con riferimento, data, perimetro e versione del brief; non aprire una richiesta duplicata. Una generica richiesta di continuare non approva automaticamente un contenuto non presentato.

8. **Dopo la risposta di Simone:**
   - approvato: `Stato: approvato il <gg/mm/aaaa>` (oppure `approvato per sola anteprima il <data>` nel relativo perimetro), commit e push, poi Dati e immagini (con proposta redirect se necessaria), quindi Design bloccato dal task Dati (skill `modelli-task`);
   - modifiche richieste: correggi, commit e push, nuova Approval.

## Criterio di fine

Brief tracciato, decisione del Board registrata con versione, data e perimetro (completo oppure sola anteprima con lacune). L’invio della richiesta è un’attesa, non l’approvazione.

## Non fare

- Mai dati inventati. Usa materiali, risposte e ricerche esplicitamente autorizzate; conserva fonte, data e livello di conferma. Per fatti non verificabili o contraddittori chiedi a Simone soltanto ciò che condiziona la fase corrente.
- Non modificare `docs/modelli/brief.md` (gestito dalla libreria): si compila solo `docs/brief.md`.
- Non scrivere testi del sito, ricette o `site.json`.
- Non far partire la fase successiva prima dell'approvazione; non approvare al posto di Simone.
