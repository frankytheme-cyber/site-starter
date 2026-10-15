# site-starter — libreria di blocchi per siti vetrina

Libreria di blocchi Astro + Tailwind v4 per i siti vetrina di piccole attività di ogni settore (artigiani, negozi, ristoranti, studi professionali...), e template GitHub da cui nasce ogni sito cliente. Le pagine sono ricette JSON composte con i blocchi del catalogo; il cliente le modifica con Decap CMS su `/admin/`.

La stessa base di codice funziona in due modi, e la modalità la decide la variabile `SITE_STARTER_LIBRARY` (`src/core/mode.ts`):

- **libreria** (questa repo, con `SITE_STARTER_LIBRARY=1`): dove nascono blocchi, temi e catalogo;
- **sito cliente** (il default, senza la variabile): una copia del template per ogni attività.

Requisiti: Node ≥ 22.18 e npm.

## Libreria (repo site-starter)

```sh
git clone git@github.com:frankytheme-cyber/site-starter.git
cd site-starter
npm install
cp .env.example .env        # poi in .env: SITE_STARTER_LIBRARY=1
npm run dev                 # http://localhost:4321, catalogo dal vivo su /catalogo
```

La variabile va impostata anche nelle variabili del repository GitHub (per la CI) e nel progetto Vercel della libreria: `docs/siti-cliente.md`.

- Un blocco nuovo o cambiato: contratto in `src/blocks/README.md`, poi `npm run catalog` (schede e screenshot in `docs/catalogo`) e commit.
- Prima di ogni commit `npm run check`; per blocchi, layout e pagine anche `npm run qa`.
- Un rilascio: `npm run release -- vX.Y.Z` (versione, `CHANGELOG.md`, catalogo, controlli, commit e tag), poi push del branch e del tag.

## Sito cliente

```sh
# su GitHub: «Use this template» da site-starter, poi
git clone git@github.com:<org>/<sito>.git
cd <sito>
npm install
npm run site:init           # una volta: toglie la parte della libreria, prepara CMS e blocks.lock.json
git add -A && git commit -m "Inizializza il sito"
npm run dev
```

`site:init` stampa i passi successivi: dati dell'attività in `src/content/settings/site.json`, menu, tema, pagine dalle ricette tipo di `docs/catalogo/ricette-tipo`, immagine per i social, CMS e protezione di `main`.

- Le cartelle e i file della libreria (`library.manifest.json`) qui sono in sola lettura: il check `lock` ferma ogni modifica locale. Le note e le eccezioni di questo sito vanno in `docs/sito.md`.
- Aggiornare la libreria: `npm run blocks:sync -- vX.Y.Z`, poi `npm install`, `npm run gen:decap`, `npm run qa -- --strict` e commit.
- Prima di pubblicare: `npm run qa -- --strict` senza errori (niente segnaposto `DA-COMPILARE`, dati legali completi, immagine per i social vera).

## Comandi principali

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Server di sviluppo su `localhost:4321` |
| `npm run build` / `npm run preview` | Build in `dist/` e sua anteprima |
| `npm run check` | Controlli statici e build (`-- --strict`: regole di pubblicazione) |
| `npm run qa` | `check` più link, accessibilità, interattivi e Lighthouse sul sito servito |
| `npm run site:init` | Sito cliente, una volta: inizializza la copia del template |
| `npm run blocks:sync -- vX.Y.Z` | Sito cliente: aggiorna la libreria alla versione indicata |
| `npm run catalog` | Libreria: rigenera `docs/catalogo` e i suoi screenshot |
| `npm run cms:local` | Prova `/admin/` in locale, senza GitHub |

## Documentazione

- `AGENTS.md`: le regole del progetto, per chi scrive codice e per gli agenti (`CLAUDE.md` le importa, insieme a `docs/sito.md`).
- `docs/catalogo/`: i blocchi, le varianti, i campi, i temi e le ricette tipo.
- `docs/siti-cliente.md`: modalità, creazione e aggiornamento dei siti, cosa è gestito.
- `docs/controlli.md`: i controlli, la CI e la protezione di `main`.
- `docs/decap.md`: il CMS, gli inviti al cliente e i limiti.
