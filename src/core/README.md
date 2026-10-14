# Core

Motore della libreria:

- `block-types.ts`: contratto dei blocchi (`BlockMeta`, `BlockFixture`).
- `registry.ts`: trova e valida i blocchi di `src/blocks/`; `parseProps` valida le props di un blocco.
- `images.ts`: immagini indicate come percorsi in `src/assets/images` (`imageSchema`, `resolveImage`).
- `settings.ts`: schema dei dati dell'attività (`src/content/settings/site.json`), `getSiteSettings()` e link `tel:`/WhatsApp.
- `navigation.ts`: schema del menu (`src/content/settings/navigation.json`), `getNavigation()` e `isCurrentPage()`.
- `ids.ts`: `nextId()`, id univoci nella pagina per i blocchi usati più volte.
- `icons.ts`: lista chiusa delle icone ammesse, alias italiano → icona Iconify (`ICON_NAMES`, `IconName`).
- `ui/`: primitive condivise dai blocchi.

Da fare: schema delle pagine e renderer delle sezioni.
