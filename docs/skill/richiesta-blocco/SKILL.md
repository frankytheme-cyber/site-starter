---
name: richiesta-blocco
description: Usala quando a una pagina serve un blocco o una variante che il catalogo della libreria non ha.
---

# Richiesta di nuovo blocco

Per il Designer, che la scrive, e per il PM, che la porta a Simone. Un blocco nuovo nasce solo nella libreria, su task approvato; il sito lo riceve poi con `blocks:sync`.

## Passi

**Designer**

1. **Verifica che nessun blocco basti:** rileggi `docs/catalogo/README.md` e le schede in `docs/catalogo/blocchi/`, prova le altre varianti e le combinazioni di blocchi esistenti. Se il problema è il contenuto (testo troppo lungo, troppe voci), cambia il contenuto.
2. **Scrivi la richiesta** nel task, per il PM:

   ```text
   RICHIESTA DI NUOVO BLOCCO: <tipo nuovo, o variante di un blocco esistente>
   SITO E PAGINA: <sito> · <slug> · posizione nella pagina
   COSA SERVE: <cosa mostra e cosa fa chi visita, 2-3 righe>
   PERCHÉ NESSUN BLOCCO BASTA: <blocchi e varianti provati, cosa manca a ciascuno>
   CONTENUTO D'ESEMPIO: <testi e dati veri dal brief, foto disponibili>
   VARIANTI: <nome e differenza di ognuna>
   INTERATTIVO: sì | no
   INTANTO: <blocchi esistenti usati come ripiego, o sezione rimandata>
   ```

3. **Intanto** componi la pagina con i blocchi che ci sono, o rimanda la sezione, e scrivilo nelle domande aperte di `docs/nota-design.md`.

**PM**

4. **Controlla** che la richiesta abbia tutti i campi, poi portala a Simone con un'Approval: cosa serve, perché, quanto blocca il sito.
5. **Approvata:** task al Builder nel Project «Libreria blocchi» (modello «Nuovo blocco» di `docs/modelli/task.md`, con la richiesta in INPUT); dopo il rilascio della libreria, task «Aggiornamento libreria» nel sito.
   **Respinta:** riporta al Designer la decisione e il motivo; la pagina resta con i blocchi esistenti.

## Criterio di fine

Richiesta approvata (task creato nella libreria) o respinta (Designer avvisato) da Simone.

## Non fare

- Designer: non scrivere codice, HTML o CSS e non modificare blocchi.
- Non creare blocchi nella repo del sito: lì i file della libreria sono in sola lettura (check `lock`).
- PM: non approvare al posto di Simone, non creare il task del Builder prima dell'approvazione.
