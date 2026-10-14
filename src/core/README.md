# Core

Motore della libreria:

- `block-types.ts`: contratto dei blocchi (`BlockSchema`, `BlockProps`, `BlockMeta`, `BlockFixture`, `TONES`).
- `block-schemas.ts`: schemi di tutti i blocchi per tipo (li usano registry e ricette).
- `registry.ts`: trova e valida i blocchi di `src/blocks/` (fixture comprese); `blocksByType` per il rendering.
- `page-schema.ts`: schema delle ricette di pagina (sezioni = unione discriminata dei blocchi, per `type`).
- `RenderSections.astro`: disegna le sezioni di una ricetta col componente del loro blocco.
- `images.ts`: `imageSchema(image)` per le immagini dei blocchi; `resolveImage()` per i percorsi relativi a `src/assets/images` (logo di site.json).
- `settings.ts`: schema dei dati dell'attività (`src/content/settings/site.json`), `getSiteSettings()`, `getTheme()` e link `tel:`/WhatsApp.
- `navigation.ts`: schema del menu (`src/content/settings/navigation.json`), `getNavigation()` e `isCurrentPage()`.
- `ids.ts`: `nextId()`, id univoci nella pagina per i blocchi usati più volte.
- `icons.ts`: lista chiusa delle icone ammesse, alias italiano → icona Iconify (`ICON_NAMES`, `IconName`).
- `ui/`: primitive condivise dai blocchi.

