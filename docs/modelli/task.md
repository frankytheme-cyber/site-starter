# Modello di task

Ogni task del PM ha questa forma (skill `modelli-task`): un task, un agente; chi cambia file lavora, nei siti, su un branch locale proprio e consegna a `lancio` con una sola PR aperta per volta, in bozza; nella libreria su un branch con la sua PR in bozza (skill `github-pr`).

```text
TITOLO: <verbo + oggetto>, es. "Pagina Servizi: ricetta e testi"
AGENTE: <Builder | Designer | QA | SEO>
PROJECT: <Libreria blocchi | nome sito>
OBIETTIVO: <una frase>
AMBITO: <anteprima | rilascio | libreria; per anteprima: decisione Board e lacune ammesse>
ATTIVITÀ RINVIATE: <punto, motivo, alternativa attuale, responsabile, condizione/fase di ripresa; nessuna dipendenza della consegna corrente>
INPUT: <file, link, brief, richieste; branch: `lancio` nei siti, nella libreria quello di partenza se non è main>
WORKSPACE: <isolato proprio; sito: base origin/main per Avvio, origin/lancio dopo; libreria: main o branch/SHA di INPUT; non ereditare il checkout del padre>
OUTPUT ATTESO: <file e PR>
CRITERI DI FINE:
- controlli del ruolo sullo SHA consegnato; chi modifica sito/blocchi: npm run qa; QA finale: --strict; PM/SEO: evidenze senza duplicare la suite
- <criteri specifici>
VINCOLI: <cosa non toccare>
PASSA A: <agente successivo> | CANCELLO: <se serve approvazione>
```

Per QA e SEO conta il rapporto completo con SHA, ambito e verdetto, anche FAIL; il PM non rilancia la suite degli esecutori. QA di anteprima esplicitamente autorizzata: `npm run qa`; QA di rilascio (e sito senza ambito indicato): `npm run qa -- --strict`. Il PASS di anteprima non annulla un FAIL di rilascio e registra i requisiti ancora aperti.

`PASSA A` serve a chi legge: chi esegue chiude il task `done` e il passaggio lo fa il PM. Il PM verifica una volta che il successore sia partito; un arresto runtime richiede diagnosi, non una nuova domanda sul brief. I task rinviati restano in backlog nel Project, fuori dai sottotask e dalle dipendenze della consegna corrente.

## Task tipici

| Task | Agente · Project | Skill | Output atteso | Criteri specifici | Passa a |
| --- | --- | --- | --- | --- | --- |
| Avvio sito | Builder · sito | `avvio-sito` | `blocks.lock.json`, `docs/sito.md`, `cms.repo` in `src/site.config.ts`, branch `lancio` e PR in bozza verso `main` | lock scritto da `site:init`; `npm run check` senza errori | PM: brief |
| Design del sito | Designer · sito | `ricetta-pagina` | `theme.json`, `layout.json`, `navigation.json`, `src/content/pages/*.json`, `docs/nota-design.md`, PR | una ricetta per ogni pagina del brief; nota completa | PM: cancello 2 |
| Pagina «nome» | Designer · sito | `ricetta-pagina` | `src/content/pages/<slug>.json`, voce di menu, nota aggiornata, PR | solo blocchi del catalogo, testi dal brief | QA |
| Dati e immagini | Builder · sito | — | `site.json`, foto in `src/assets/images/`, `defaultOgImage` vera, favicon dal logo se c'è, PR | solo dati del brief approvato; dati necessari alla fase presenti; lacune ammesse dal brief per l’anteprima registrate, nessun segnaposto prima del rilascio; `alt` descrittivi | Designer: design |
| Proposta redirect | Builder · sito | `redirect` | `docs/redirects.md`, PR | ogni vecchio URL con destinazione o motivo; `vercel.json` non toccato | SEO (rischi), PM: cancello 2 |
| Redirect approvati | Builder · sito | `redirect` | `vercel.json`, stato in `docs/redirects.md` | solo le righe approvate | QA |
| QA | QA · sito o libreria | `qa` | rapporto nel task, richieste | — | PM |
| Correzione | Designer o Builder | quella del lavoro | commit su `lancio` (sito) o sul branch della PR in QA (libreria, in INPUT) | la richiesta QA risolta, nient'altro | QA |
| SEO pre-lancio | SEO · sito | `seo-prelancio` | rapporto nel task | — | PM: cancello 3 |
| Nuovo blocco | Builder · Libreria blocchi | `nuovo-blocco` | `src/blocks/<tipo>/`, `docs/catalogo`, `public/admin/config.yml`, `CHANGELOG.md`, PR | 2-3 blocchi; approvazione di Simone in INPUT | Designer: revisione |
| Revisione visiva | Designer · Libreria blocchi | — | richieste puntuali al Builder, esito nel task | ogni variante con tutti i preset di `/catalogo` | PM: approvazione di Simone |
| Aggiornamento libreria | Builder · sito | — | file gestiti, `package.json` e `blocks.lock.json` aggiornati, PR | `npm run blocks:sync -- vX.Y.Z`, `npm install`, `npm run gen:decap`; breaking change di `CHANGELOG.md` applicati | QA |

## Esempio: lotto 1 del Builder (Project Libreria)

```text
TITOLO: Blocchi lotto 1: contact
AGENTE: Builder
OBIETTIVO: creare il blocco contact secondo il contratto (skill nuovo-blocco).
INPUT: specifica sezione 4 (varianti info-mappa, info-cta), blocchi di riferimento
  hero/cta/footer come modello, docs/blocchi-interattivi.md.
OUTPUT ATTESO: src/blocks/contact/ completo, catalogo e screenshot rigenerati, PR in bozza.
CRITERI DI FINE:
- recapiti letti da site.json, mai nello schema
- mappa solo come link "Apri in Maps" o caricata al clic, nessun iframe al caricamento
- fixture con attivita' di esempio generica e recapiti finti
- npm run qa verde
VINCOLI: nessuna modifica a core, temi o altri blocchi senza chiederlo.
PASSA A: Designer (revisione visiva sul catalogo) -> CANCELLO: approvazione di Simone.
```

Sequenza dei lotti della libreria: 1) contact; 2) features, about, process; 3) gallery, testimonials, carousel; 4) areas. Un lotto parte solo dopo il merge del precedente.
