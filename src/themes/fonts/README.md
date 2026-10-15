# Font

Un file per coppia di font: importa i pacchetti `@fontsource-variable` e imposta `--heading-font` e `--body-font` in `[data-fonts="nome"]`.
La pagina carica solo il file scelto in `src/content/settings/theme.json`. Una coppia nuova va aggiunta a `presets.ts`, con la sua scheda `<nome>.meta.ts` (`PresetMeta`: nome, mood con 2-4 aggettivi, settori a cui si adatta).

Ogni font ha un ripiego con le sue misure (`"<font> ripiego"`, subito dopo il font nello stack): Arial o Times New Roman, o i gemelli Liberation, scalati con `size-adjust` e `ascent`/`descent-override`. I font arrivano con `font-display: swap` e senza ripiego misurato lo scambio sposterebbe i titoli (CLS), soprattutto su Linux e Android. I `@font-face` del ripiego non si scrivono a mano: `node scripts/font-fallbacks.ts <pacchetto>:serif|sans ...` (es. `fraunces:serif source-sans-3:sans`) li misura in Chromium e li stampa da incollare nel CSS della coppia.
