# Palette

Un file per palette con un blocco `[data-palette="nome"]` che imposta tutti i token colore (`--bg`, `--fg`, `--primary`...).
Ogni coppia testo/sfondo deve superare 4.5:1 (`npm run check:contrast`). Una palette nuova va importata in `base.css` e aggiunta a `presets.ts`, con la sua scheda `<nome>.meta.ts` (`PaletteMeta`: nome, mood, settori a cui si adatta, colori da mostrare).
