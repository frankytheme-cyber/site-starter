# Blocchi

Una cartella per blocco, in kebab-case (`hero/`), con quattro file. Riferimenti: `hero/` (immagini, campo richiesto da alcune varianti), `services/` (elenco di elementi con icone o immagini), `cta/` (recapiti letti da `site.json`).

- `Hero.astro`: il componente, col nome della cartella in PascalCase. La radice è sempre `<Section>`; le props sono `z.infer` dello schema.
- `schema.ts`: `export const schema` (zod da `astro/zod`). Le varianti stanno nella prop `variant`; le immagini usano `imageSchema` di `@/core/images`, le icone `z.enum(ICON_NAMES)` di `@/core/icons`. I campi richiesti solo da alcune varianti si controllano con `refine` (`hero`) o `superRefine` (`services`, per ogni elemento).
- `meta.ts`: `export const meta: BlockMeta` (`@/core/block-types`), con `type` uguale al nome della cartella e `source` (`{ from: 'originale' }` per i blocchi nati qui).
- `fixtures.ts`: `export const fixtures: BlockFixture<typeof schema>[]`, almeno una per variante; immagini in `src/assets/images/fixtures/`.

I dati dell'attività (telefono, WhatsApp, indirizzo...) non entrano mai nello schema: il componente li legge con `getSiteSettings()` di `@/core/settings`, se serve dietro un booleano come `showContacts` di `cta/`.

Il registry (`src/core/registry.ts`) trova i blocchi da solo e li valida in build; il catalogo `/catalogo` li mostra.
