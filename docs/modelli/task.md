# Modello di task

Ogni task del PM ha questa forma (skill `modelli-task`): un task, un agente; chi cambia file lavora, nei siti, sul branch `lancio` con l'unica PR in bozza del sito, aperta all'avvio; nella libreria su un branch con la sua PR in bozza (skill `github-pr`).

```text
TITOLO: <verbo + oggetto>, es. "Pagina Servizi: ricetta e testi"
AGENTE: <Builder | Designer | QA | SEO>
PROJECT: <Libreria blocchi | nome sito>
OBIETTIVO: <una frase>
INPUT: <file, link, brief, richieste; branch: `lancio` nei siti, nella libreria quello di partenza se non è main>
OUTPUT ATTESO: <file e PR>
CRITERI DI FINE:
- npm run qa senza errori (nel sito prima del cancello 3: --strict)
- <criteri specifici>
VINCOLI: <cosa non toccare>
PASSA A: <agente successivo> | CANCELLO: <se serve approvazione>
```

## Task tipici

| Task | Agente · Project | Skill | Output atteso | Criteri specifici | Passa a |
| --- | --- | --- | --- | --- | --- |
| Avvio sito | Builder · sito | `avvio-sito` | `blocks.lock.json`, `docs/sito.md`, `cms.repo` in `src/site.config.ts`, branch `lancio` e PR in bozza verso `main` | lock scritto da `site:init`; `npm run check` senza errori | PM: brief |
| Design del sito | Designer · sito | `ricetta-pagina` | `theme.json`, `layout.json`, `navigation.json`, `src/content/pages/*.json`, `docs/nota-design.md`, PR | una ricetta per ogni pagina del brief; nota completa | PM: cancello 2 |
| Pagina «nome» | Designer · sito | `ricetta-pagina` | `src/content/pages/<slug>.json`, voce di menu, nota aggiornata, PR | solo blocchi del catalogo, testi dal brief | QA |
| Dati e immagini | Builder · sito | — | `site.json`, foto in `src/assets/images/`, `defaultOgImage` vera, favicon dal logo se c'è, PR | solo dati del brief approvato; nessun `DA-COMPILARE` in `site.json`; `alt` descrittivi | PM: cancello 2 |
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
