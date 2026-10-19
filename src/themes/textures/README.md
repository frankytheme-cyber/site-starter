# Texture

Un file per texture con la regola `[data-texture="nome"] :is(section, header, footer)[data-tone]::after`: una grana sopra lo sfondo di ogni sezione (e di header e footer), sotto il contenuto e sotto le foto di sfondo (`z-index: -19`), in `mix-blend-mode: soft-light`. Si sceglie una volta per sito in `src/content/settings/theme.json` (`texture`).

Il rumore è un SVG (`feTurbulence`) grigio, con i valori limitati dall'ultimo `feComponentTransfer` (`tableValues='min max'`, intorno a 0.5): `check:contrast` legge questi limiti e l'`opacity` e verifica testi e link anche sui punti schiariti e scuriti dalla grana, con ogni palette, tono ed effetto di sfondo. Una texture nuova: CSS con gli stessi elementi, scheda `<nome>.meta.ts` (`PresetMeta`), voce in `textures` di `../presets.ts`, `@import` in `../base.css`, poi `npm run catalog`.
