# Libreria e siti cliente

La stessa base di codice vive in due modi: la **libreria** (la repo site-starter, dove nascono blocchi, temi e catalogo) e i **siti cliente** (una copia del template per ogni attività). La differenza la fa una variabile d'ambiente, non la presenza di una cartella.

## Modalità

`src/core/mode.ts` decide la modalità per script, controlli e build:

| | Libreria | Sito cliente |
| --- | --- | --- |
| Quando | `SITE_STARTER_LIBRARY=1` | sempre, se la variabile non vale `1` (default) |
| `/catalogo` | registrato da `src/core/integrations/library.ts` | non esiste nel build (lo verifica il check `build`) |
| `blocks` (contratto e `docs/catalogo`) | sì | saltato |
| `lock` (`blocks.lock.json`) | saltato | sì: un lock mancante è un errore |
| `--strict`: ricette | errori per le regole strutturali, avvisi per i segnaposto | tutto errore |
| `--strict`: `release` e repo del CMS | saltato / avviso | errori |
| `gen:catalog`, `screenshots`, `release`, `check:template` | sì | si fermano con un messaggio |
| `site:init`, `blocks:sync` | si fermano con un messaggio | sì |

### Dove impostare `SITE_STARTER_LIBRARY=1`

Solo per la libreria, in tre posti:

1. **In locale:** `cp .env.example .env` e metti `SITE_STARTER_LIBRARY=1` (oppure `export SITE_STARTER_LIBRARY=1` nella shell). `mode.ts` legge `.env` se l'ambiente non la imposta, e la passa ai processi che avvia (build, anteprima).
2. **GitHub:** nel repository site-starter, **Settings → Secrets and variables → Actions → Variables → New repository variable**: nome `SITE_STARTER_LIBRARY`, valore `1`. Il workflow la legge come `vars.SITE_STARTER_LIBRARY`; senza, la CI tratta la libreria come un sito e fallisce sul lock.
3. **Vercel:** nel progetto Vercel della libreria (quello che pubblica il catalogo), **Settings → Environment Variables**: `SITE_STARTER_LIBRARY` = `1` per Production e Preview.

Nei siti cliente non va mai impostata: né in `.env`, né su GitHub, né su Vercel.

## Creare un sito

1. Su GitHub: **Use this template** dalla repo site-starter (o una copia equivalente), poi clona il nuovo repository.
2. `npm install`.
3. `npm run site:init`. Una volta sola, con il working tree pulito:
   - toglie quello che serve solo alla libreria (`library.manifest.json` → `libraryOnly`: `src/library` con il catalogo, `docs/README.md`, `CHANGELOG.md`) e i suoi script di `package.json` (`libraryScripts`);
   - prende il repository GitHub del CMS da `--repo=org/nome`, da `DECAP_REPO` o dal remote `origin` (se manca lo chiede), lo scrive in `src/site.config.ts` (`cms.repo`) e rigenera `public/admin/config.yml`;
   - scrive `blocks.lock.json` con la versione della libreria e gli hash dei file gestiti;
   - crea `docs/sito.md`, per le note e le eccezioni di questo sito (lo importa `CLAUDE.md`), e stampa i passi successivi.
4. Commit, poi i passi della checklist: dati in `site.json`, menu, tema, pagine dalle ricette tipo, immagine per i social vera (`defaultOgImage` in `site.json`) al posto di `og-DA-COMPILARE.jpg`, worker OAuth (`docs/decap.md`), progetto Vercel senza `SITE_STARTER_LIBRARY`, protezione di `main` (`docs/controlli.md`).
5. Prima di pubblicare: `npm run qa -- --strict` senza errori.

`site:init` non fa commit; si rifiuta di partire se il sito è già inizializzato, se il remote `origin` è la libreria o se `SITE_STARTER_LIBRARY=1`. Senza domande (es. in CI): `npm run site:init -- --yes --repo=org/nome`.

## Aggiornare la libreria in un sito

```sh
npm run blocks:sync -- v1.2.0
npm install
npm run gen:decap
npm run qa -- --strict
git add -A && git commit -m "Libreria site-starter v1.2.0"
```

`blocks:sync` (working tree pulito):

- scarica la libreria al tag indicato in una cartella temporanea (dal repository di `library.manifest.json` → `repository`, o da `--from=<indirizzo o percorso>`);
- sostituisce cartelle e file gestiti con quelli del tag: le modifiche locali a quei file si perdono, e il riepilogo le elenca;
- unisce in `package.json` script, dipendenze ed `engines` della libreria, senza toccare `name`, `version` e quello che ha solo il sito;
- aggiorna `blocks.lock.json` (versione e hash) e mostra versione da → a, file cambiati e breaking change di `CHANGELOG.md`.

Verso una versione precedente serve `--force`.

## Cosa è gestito

`library.manifest.json`:

- `managed`: cartelle della libreria (`src/blocks`, `src/core`, `src/themes`, `src/layouts`, `scripts`, `.agents/skills` e `.claude/skills` con le skill per gli agenti, `docs/catalogo`, `docs/skill`, `docs/modelli`, `docs/agenti`, `docs/paperclip-runtime`, `.github/workflows`): anche un file aggiunto lì è una modifica vietata;
- `managedFiles`: file singoli: `AGENTS.md` e `CLAUDE.md` (istruzioni per gli agenti), `.github/CODEOWNERS`, il manifest stesso, `astro.config.mjs`, `src/content.config.ts`, le route `src/pages/[...slug].astro` e `src/pages/robots.txt.ts`, `tsconfig.json`, `.env.example`, `public/admin/index.html` e la documentazione comune di `docs/`;
- `exclude`: dentro le cartelle gestite ma né controllati né copiati (`src/library`);
- `libraryOnly` e `libraryScripts`: solo nella libreria, tolti da `site:init` e mai copiati da `blocks:sync`.

Del sito, e mai toccati da `blocks:sync`: `src/content/**`, `src/assets/images/**`, `src/site.config.ts`, le altre pagine di `src/pages`, `public/` (tranne `admin/index.html`), `docs/sito.md` e gli altri documenti del sito (`docs/brief.md`, compilato dal modello `docs/modelli/brief.md`, `docs/nota-design.md`, `docs/redirects.md`), `README.md`, `name` e `version` di `package.json`.

Nei siti cliente cartelle e file gestiti sono in sola lettura: il check `lock` confronta i loro hash con `blocks.lock.json` (che registra anche la versione della libreria) e ferma ogni modifica locale. Una correzione si fa in site-starter, si rilascia (`npm run release -- vX.Y.Z`) e arriva ai siti con `blocks:sync`.

### Note del sito: `docs/sito.md`

`AGENTS.md` e `CLAUDE.md` sono gestiti, quindi uguali in tutti i siti. Le note e le eccezioni del singolo sito («il cliente non usa WhatsApp», «la pagina offerte è stagionale») vanno in `docs/sito.md`, che crea `site:init` e che il sito modifica liberamente. `CLAUDE.md` lo importa (`@docs/sito.md`) insieme ad `AGENTS.md`, così Claude Code lo legge a ogni sessione; agli altri agenti lo indica `AGENTS.md`.

### Chi può cambiare il lock

Chi riscrive `blocks.lock.json` può far passare qualsiasi modifica ai file gestiti, e chi cambia `scripts/`, `.github/`, `library.manifest.json` o `package.json` può spegnere il controllo. Per questo `.github/CODEOWNERS` (gestito) assegna questi percorsi al proprietario della libreria: con **Require review from Code Owners** nella protezione di `main` (`docs/controlli.md`), una pull request che li tocca si unisce solo con la sua approvazione. Le pull request del CMS toccano solo contenuti e immagini e non ne hanno bisogno.

GitHub non lascia approvare la propria pull request: quando il proprietario stesso aggiorna un sito con `blocks:sync`, la pull request la approva un altro membro dell'agenzia, oppure il proprietario la unisce con il bypass della regola (nella **Bypass list**), dopo aver visto verdi `check` e `qa`.
