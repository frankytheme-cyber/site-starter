# Core

Motore della libreria:

- `block-types.ts`: contratto dei blocchi (`BlockSchema`, `BlockProps`, `BlockMeta`, `BlockFixture`, `TONES`).
- `block-schemas.ts`: schemi e schede (`meta`) di tutti i blocchi per tipo (li usano registry, ricette e generatore del CMS); `blockTypesOf(scope)` per i blocchi di pagina o di layout.
- `registry.ts`: trova e valida i blocchi di `src/blocks/` (fixture comprese); `blocksByType` per il rendering.
- `catalog.ts`: pezzi comuni al catalogo web e agli script di `docs/catalogo` (varianti con la loro fixture, nomi degli screenshot, esempio JSON di una fixture). Solo import di tipo: gli script lo importano con Node.
- `page-schema.ts`: schema delle ricette di pagina (sezioni = unione discriminata dei blocchi di pagina, per `type`).
- `layout.ts`: schema di `src/content/settings/layout.json` (props di header e footer) e `getLayout()`.
- `RenderSections.astro`: disegna le sezioni di una ricetta col componente del loro blocco.
- `images.ts`: `imageSchema(image)` per le immagini dei blocchi (percorso relativo al JSON, `alt` di almeno 5 caratteri).
- `clean-data.ts`: `withoutEmpty()` toglie i campi vuoti che il CMS lascia (`""`, `{}`) prima della validazione.
- `integrations/decap-bundle.ts`: serve Decap CMS da `/admin/decap/` (copiato da `node_modules` in build).
- `settings.ts`: schema dei dati dell'attività (`src/content/settings/site.json`, dati legali compresi), `getSiteSettings()`, `getTheme()`, `isValidVatNumber()` e link `tel:`/WhatsApp.
- `opening-hours.ts`: giorni della settimana, testo degli orari (`formatDays`, `formatSlots`) e `openingHoursSpecification` per il JSON-LD.
- `navigation.ts`: schema del menu (`src/content/settings/navigation.json`), `getNavigation()` e `isCurrentPage()`.
- `ids.ts`: `nextId()`, id univoci nella pagina per i blocchi usati più volte.
- `icons.ts`: lista chiusa delle icone ammesse, alias italiano → icona Iconify (`ICON_NAMES`, `IconName`).
- `ui/`: primitive condivise dai blocchi.

