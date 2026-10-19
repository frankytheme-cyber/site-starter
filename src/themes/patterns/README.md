# Decori

Un file per decoro con la regola `[data-pattern="nome"] [data-background="decoro"] > [data-tone]::before`: il disegno del motivo (gradienti o maschere SVG) che sfuma verso il centro della sezione. Il decoro si sceglie una volta per sito in `src/content/settings/theme.json` (`pattern`) e compare solo nelle sezioni con `"background": "decoro"`.

I colori non stanno qui: il disegno usa `var(--decor-ink)` (linee e punti) o `var(--decor-fill)` (forme piene), definiti per tono in `../backgrounds.css` e verificati da `check:contrast` con ogni palette. Il `::before` (posizione, `z-index: -20`, sotto le foto di sfondo) è in `../backgrounds.css`. Un decoro nuovo: CSS, scheda `<nome>.meta.ts` (`PresetMeta`), voce in `patterns` di `../presets.ts`, `@import` in `../base.css`, poi `npm run catalog`.
