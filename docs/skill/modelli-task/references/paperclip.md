# Paperclip: consegne, rinvii e recupero

Procedura operativa per il PM e il gestore del runtime. Le regole tecniche del sito e i
controlli di rilascio restano quelli della versione installata. Le istruzioni canoniche
sono in `docs/agenti`, le Capabilities in `docs/agenti/capabilities.json`, le procedure
in `docs/skill`. Aggiornare insieme repo e configurazione attiva, verificando il testo
salvato: una modifica locale non aggiorna da sola Paperclip o il template su GitHub.

## Consegnare una fase utilizzabile

Il PM definisce ambito, risultato corrente e condizioni di fine. Se l'anteprima con
lacune è già autorizzata, non ripropone la stessa approvazione.

| Adesso | Prima della fase che lo richiede | In seguito, se rinviato |
| --- | --- | --- |
| Dati disponibili, contenuti richiesti, gallery autorizzata, contatti diretti, responsive e accessibilità | Testi legali definitivi, OAuth per CMS, dominio/configurazioni e QA strict prima del rilascio previsto | Form/integrazioni aggiuntive, analytics, materiale facoltativo |

In `docs/sito.md` mantenere «Attività rinviate»: punto, motivo, alternativa attuale,
owner, fase/condizione di riapertura, task se presente. I task futuri restano in backlog
nel Project senza dipendenze o parent sotto la consegna corrente. Non creare un task
per ogni domanda; raggruppare per risultato. Le parti richieste e già realizzabili si
completano: il rinvio non giustifica omettere una gallery con immagini disponibili.

QA e SEO ricevono lo stesso ambito e SHA: non strict per anteprima autorizzata, strict
per rilascio. Il rapporto di anteprima elenca ciò che manca al rilascio. Un difetto
attuale genera una correzione; un requisito esterno già rinviato non genera nuovi giri
identici. Il PM consegna link/screenshot e una breve lista dei rinvii.

## Un task done non prova la ripresa del successore

Alla consegna il PM verifica una volta task destinatario, dipendenze e run. Usa gli
strumenti nativi disponibili; nell'API della versione verificata sono consultabili:

- `GET /api/issues/{id}`: stato, `blockedBy`, `executionBlocker` e workspace;
- `GET /api/issues/{id}/live-runs`: esecuzioni effettivamente attive;
- `GET /api/issues/{id}/diagnostics/blockers` e `/diagnostics/wakes`: dipendenze e risvegli;
- `GET /api/issues/{id}/recovery-actions` e `/api/heartbeat-runs/{runId}`: recupero/esiti.

Se è pronto, senza run e senza arresti/decisioni pendenti, una sola ripresa supportata
e verifica dell'esito. Se c'è un `executionBlocker`, cambiare stato o menzionare di
nuovo l'agente non lo risolve. Non duplicare task né azzerare dati per aggirarlo.
Durante lavoro regolare si attendono eventi, senza polling continuo. Se il provider
restituisce `provider_quota`, registra limite e orario di ripresa disponibili: non è un
dato mancante del brief, non richiede nuove autorizzazioni e non si risolve cambiando
identità. Evita avvii manuali ripetuti prima che cambi la disponibilità del provider.

Per `legacy_execution_requires_reconciliation`, il gestore verifica la run interrotta,
processo, diff, commit, PR e gli esiti delle operazioni già tentate. Preserva il lavoro
parziale; registra gli esiti nella procedura nativa di recupero, poi fa riprendere solo
il lavoro residuo. L'API verificata è `POST /api/issues/{id}/recovery-actions/resolve`,
con ID dell'azione/run, esiti e prove; i campi dipendono dalla versione. È riservata al
Board nei casi previsti: un agente senza autorità passa diagnosi e prove al gestore,
non cambia identità e non dichiara falsamente conclusa un'azione. Nessuna risposta del
cliente sui materiali può risolvere questo arresto tecnico.

## PID riutilizzato: difetto osservato in 2026.1012.0

Un vecchio PM terminato risultava ancora attivo perché macOS aveva riutilizzato PID e
PGID per un processo di sistema. Il controllo escludeva correttamente il PID con data
d'avvio diversa, ma continuava ad attribuire il gruppo omonimo alla vecchia run.
Non fermare il processo indicato basandoti soltanto sul numero: verificare identità e
data di avvio. Non scrivere direttamente nel database e non rimuovere i controlli.

`docs/paperclip-runtime/recycled-pgid.patch` corregge quel solo caso: leader verificato come
riutilizzato e PGID uguale al suo PID. Gruppi distinti, identità non verificabile e lease
attivi mantengono il blocco. Patch locale per il gestore, non aggiornamento ufficiale;
non applicarla ad altre versioni senza confronto. Conservare backup, verificare il diff
con `patch --dry-run` e i test; riavviare solo quando non ci sono run attive. Un upgrade
può sostituirla: preferire la correzione ufficiale quando disponibile.

Test sull'installazione, impostando il percorso reale (non contiene credenziali):

```sh
PAPERCLIP_TEST_DIST=/percorso/node_modules/@paperclipai/server/dist \
  node --test docs/paperclip-runtime/recycled-pgid.test.mjs
```

Il test crea soltanto un processo temporaneo proprio, lo ferma alla fine e verifica
leader reale, PID riciclato, gruppi distinti, prove mancanti e lease ancora attivi.

## Propagare le correzioni

1. Modificare qui le fonti canoniche, eliminando le regole contraddittorie; non accumulare
   eccezioni solo nei commenti del cliente. Controllare anche i modelli dei nuovi task.
2. Salvare Instructions, Capabilities e skill attive di Paperclip e confrontarle con
   questi file. Le correzioni operative autorizzate possono essere sincronizzate prima
   del rilascio; non cambiano il contratto dei blocchi installati.
3. Push e merge della modifica nella repo site-starter rendono aggiornato il template
   per i nuovi progetti. Per i siti esistenti aggiornare i file gestiti con il normale
   rilascio e `blocks:sync`, senza alterare a mano il lock.
4. Una PR già unita non impedisce ulteriori correzioni autorizzate: l'esecutore riusa
   quella aperta o ne apre una nuova in bozza da `lancio` verso `main`. Una sola aperta
   per volta. Il merge resta a Simone.
