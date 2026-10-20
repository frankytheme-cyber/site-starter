# Temi

`base.css` definisce i token semantici per Tailwind (`bg-primary`, `text-fg-muted`, `font-heading`, `rounded-box`...) e importa palette, forme, decori, texture ed effetti di sfondo.
I valori arrivano dai preset in `palettes/`, `fonts/`, `shapes/`, `patterns/` e `textures/`, scelti in `src/content/settings/theme.json` (schema in `presets.ts`) e applicati da `BaseLayout` come `data-*` su `<html>`.

Ogni preset ha accanto al suo CSS una scheda `<nome>.meta.ts` (`PresetMeta` di `presets.ts`: `name`, `mood` con 2-4 aggettivi, `adattoA` con i settori; le palette anche `colors`, i colori da mostrare, uguali a quelli del CSS). `metas.ts` le raccoglie per il catalogo (sezione «Temi» di `docs/catalogo/README.md`); un preset senza scheda ferma `npm run gen:catalog` e il check `blocks`. Un preset nuovo: CSS, scheda, voce in `presets.ts` (e per palette, forme, decori e texture l'`@import` in `base.css`), poi `npm run catalog`.

`edges.css` (schede in `edges.ts`) dà la forma al bordo in alto delle sezioni con `edge`, senza colori. `overlays.css` ha le velature delle foto a tutta sezione (hero `full`, `overlay: "colorata"`), verificate da `check:contrast` col testo bianco su una foto bianca.

`backgrounds.css` (con le schede in `backgrounds.ts`) dipinge gli effetti di sfondo delle sezioni, campo `background` delle ricette: solo token e `color-mix`, una regola per effetto e tono. I veli che scuriscono si moltiplicano per l'intensità della palette (`--fx-default`, `--fx-muted`, calcolate da `node scripts/effect-strength.ts`, vedi `palettes/README.md`); le luci vanno verso `--fx-glow`. `check:contrast` legge il file e verifica testi e link nel punto più carico di ogni effetto, con ogni palette; un effetto nuovo va anche in `BACKGROUNDS` e nei `meta.backgrounds` dei blocchi che lo ammettono.
