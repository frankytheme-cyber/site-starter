# Temi

`base.css` definisce i token semantici per Tailwind (`bg-primary`, `text-fg-muted`, `font-heading`, `rounded-box`...) e importa palette e forme.
I valori arrivano dai preset in `palettes/`, `fonts/` e `shapes/`, scelti in `src/content/settings/theme.json` (schema in `presets.ts`) e applicati da `BaseLayout` come `data-*` su `<html>`.

Ogni preset ha accanto al suo CSS una scheda `<nome>.meta.ts` (`PresetMeta` di `presets.ts`: `name`, `mood` con 2-4 aggettivi, `adattoA` con i settori; le palette anche `colors`, i colori da mostrare, uguali a quelli del CSS). `metas.ts` le raccoglie per il catalogo (sezione «Temi» di `docs/catalogo/README.md`); un preset senza scheda ferma `npm run gen:catalog` e il check `blocks`. Un preset nuovo: CSS, scheda, voce in `presets.ts` (e per palette e forme l'`@import` in `base.css`), poi `npm run catalog`.

`backgrounds.css` (con le schede in `backgrounds.ts`) dipinge gli effetti di sfondo delle sezioni, campo `background` delle ricette: solo token e `color-mix`, una regola per effetto e tono. `check:contrast` legge il file e verifica testi e link nel punto più carico di ogni effetto, con ogni palette; un effetto nuovo va anche in `BACKGROUNDS` e nei `meta.backgrounds` dei blocchi che lo ammettono.
