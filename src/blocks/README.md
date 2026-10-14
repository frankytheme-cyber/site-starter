# Blocchi

Una cartella per blocco, in kebab-case (`hero/`), con quattro file. Riferimenti: `hero/` (immagini, campo richiesto da alcune varianti), `services/` (elenco di elementi con icone o immagini), `cta/` (recapiti letti da `site.json`), `header/` (blocco interattivo: menu da `navigation.json`, JS vanilla).

- `Hero.astro`: il componente, col nome della cartella in PascalCase. La radice è sempre `<Section id={id} tone={tone}>`; le props sono `BlockProps<typeof schema>` (`@/core/block-types`): quelle dello schema più `id` e `tone`, che arrivano dalla sezione della ricetta.
- `schema.ts`: `export const schema = ({ image }: SchemaContext) => z.object(...)` (zod da `astro/zod`), una funzione come gli schemi delle collezioni; `type`, `id` e `tone` sono riservati alla sezione. Le varianti stanno nella prop `variant`; le immagini usano `imageSchema(image)` di `@/core/images` (percorso relativo al JSON, `alt` di almeno 5 caratteri), le icone `z.enum(ICON_NAMES)` di `@/core/icons`. I campi richiesti solo da alcune varianti si controllano con `refine` (`hero`) o `superRefine` (`services`, per ogni elemento).
- `meta.ts`: `export const meta: BlockMeta` (`@/core/block-types`), con `type` uguale al nome della cartella e `source` (`{ from: 'originale' }` per i blocchi nati qui). Un blocco con JavaScript dichiara `interactive: true` e segue `docs/blocchi-interattivi.md`.
- `fixtures.ts`: `export const fixtures: BlockFixture<typeof schema>[]`, almeno una per variante; le immagini si importano da `src/assets/images/fixtures/` (`import foto from '@/assets/images/fixtures/foto.jpg'`). `tone` facoltativo: il tono con cui il catalogo la mostra.

I dati dell'attività (telefono, WhatsApp, indirizzo...) e il menu non entrano mai nello schema: il componente li legge con `getSiteSettings()` di `@/core/settings` e `getNavigation()` di `@/core/navigation`, se serve dietro un booleano come `showContacts` di `cta/`.

Il registry (`src/core/registry.ts`) trova i blocchi da solo e li valida in build; il catalogo `/catalogo` li mostra e le ricette di pagina li possono usare subito come `type`.
