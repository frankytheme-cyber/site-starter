# Temi

`base.css` definisce i token semantici per Tailwind (`bg-primary`, `text-fg-muted`, `font-heading`, `rounded-box`...) e importa palette e forme.
I valori arrivano dai preset in `palettes/`, `fonts/` e `shapes/`, scelti in `src/content/settings/theme.json` (schema in `presets.ts`) e applicati da `BaseLayout` come `data-*` su `<html>`.

Ogni preset ha accanto al suo CSS una scheda `<nome>.meta.ts` (`PresetMeta` di `presets.ts`: `name`, `mood`, `adattoA`; le palette anche `colors`, i colori da mostrare, uguali a quelli del CSS). `metas.ts` le raccoglie per il catalogo (`docs/catalogo/temi.md`); un preset senza scheda ferma `npm run gen:catalog` e il check `catalog`. Un preset nuovo: CSS, scheda, voce in `presets.ts` (e per palette e forme l'`@import` in `base.css`), poi `npm run catalog`.
