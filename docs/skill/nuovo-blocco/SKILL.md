---
name: nuovo-blocco
description: Usala quando hai un task approvato per creare uno o più blocchi nuovi nella libreria site-starter.
---

# Nuovo blocco nella libreria

Per il Builder, solo nel Project «Libreria blocchi» e solo su task approvato da Simone, 2-3 blocchi per task. Il contratto completo è in `src/blocks/README.md`.

## Passi

1. **Controlla di essere nella libreria:**

   ```sh
   git remote get-url origin                # https://github.com/frankytheme-cyber/site-starter.git
   grep -x "SITE_STARTER_LIBRARY=1" .env    # la riga c'è
   ```

2. **Branch** `builder/blocchi-<lotto o tipo>` e PR in bozza al primo commit (skill `github-pr`).
3. **Leggi:** il task (varianti dalla specifica, sezione 4, o dalla richiesta approvata), `src/blocks/README.md`, i blocchi di riferimento (`hero/`, `services/`, `cta/`, `header/`, `footer/`, `accordion/`, `tabs/`, `carousel/`), le primitive di `src/core/ui/` (in `/catalogo/ui`) e, se il blocco ha JavaScript, `docs/blocchi-interattivi.md`.
4. **Crea `src/blocks/<tipo>/`** (kebab-case) con quattro file:
   - `schema.ts`: `export const schema = ({ image }: SchemaContext) => z.object({…})`, `variant` come `z.enum`, limiti su ogni campo e `.describe("Etichetta|Aiuto")` in italiano; immagini con `imageSchema(image)`, icone con `iconSchema()`, pulsanti con `ctaSchema`; sopra ogni `refine`/`superRefine` il commento `// rule: <testo>`. Niente dati dell'attività: il componente li legge con `getSiteSettings()`.
   - `meta.ts`: `type` uguale alla cartella, `name`, `description`, `whenToUse`, `avoidWhen`, `category`, `scope: 'page'`, `version: '1.0.0'`, `source`, `interactive: true` se ha JS, `variants` con `description` e `whenToUse`, `rules` con lo stesso testo dei `// rule:`, `fieldRules` se lo schema ha refine.
   - `fixtures.ts`: almeno una per variante, attività di esempio generica, recapiti palesemente finti (`055 000 0000`, `info@esempio.it`), foto importate da `src/assets/images/fixtures/`.
   - `<Nome>.astro`: radice `<Section id={id} tone={tone}>`, solo classi semantiche, primitive del core (`CtaButton`, `Icon`, `Img`…).
5. **Fonte esterna** (HyperUI, Flowbite gratuito, Preline): solo la struttura, `source: { from: 'esterno', name, url, license }` e il testo della licenza in `docs/THIRD_PARTY_LICENSES.md`. Altrimenti `source: { from: 'originale' }`. Icona nuova: una riga in `src/core/icons.ts`, nella sua categoria.
6. **CMS e catalogo:**

   ```sh
   npm run gen:decap
   npm run catalog
   ```

   Nel commit del blocco vanno anche `public/admin/config.yml` e `docs/catalogo`.
7. **Prova a vista** ogni variante, cambiando palette, font e forma:

   ```sh
   npx astro dev --background
   npx playwright screenshot --full-page "http://localhost:4321/catalogo/<tipo>/<variante>/?palette=ardesia&fonts=moderno&shape=squadrato" reports/<tipo>-<variante>.png
   npx astro dev stop
   ```

   Se è interattivo: anche da tastiera, senza JavaScript e con il movimento ridotto.
8. **Changelog:** una riga in `CHANGELOG.md`, «## Non rilasciato» → «### Novità».
9. **Controlli**, senza errori:

   ```sh
   npm run check
   npm run qa
   ```

10. **Commit e push**, poi nel task: link della PR e dell'anteprima Vercel (`/catalogo/<tipo>`), blocchi e varianti fatti. Passa al Designer per la revisione visiva.

## Criterio di fine

`npm run qa` senza errori; ogni variante nel catalogo con scheda, screenshot e tutti i preset; link nel task.

## Non fare

- Niente classi della palette di Tailwind né colori arbitrari (`bg-blue-600`, `bg-[#…]`), niente `!important`, niente SVG scritti a mano.
- Niente librerie JavaScript (nemmeno il JS di Preline), niente autoplay.
- Mai Tailwind Plus; da una fonte esterna mai colori, font o testi.
- Non modificare core, temi o altri blocchi senza chiederlo al PM.
- Non scrivere a mano `docs/catalogo` o `public/admin/config.yml`; non lanciare `npm run release` (lo fa Simone).
- Non fare merge.
