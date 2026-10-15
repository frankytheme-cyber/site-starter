# Palette

Un file per palette con un blocco `[data-palette="nome"]` che imposta tutti i token colore (`--bg`, `--fg`, `--primary`, `--primary-hover`, `--accent-hover`...). Gli `-hover` sono il passaggio del mouse sui pulsanti: di solito un po' più scuri, e sempre in AA col loro testo.
Ogni coppia testo/sfondo deve superare 4.5:1 (`npm run check:contrast`). Una palette nuova va importata in `base.css` e aggiunta a `presets.ts`, con la sua scheda `<nome>.meta.ts` (`PaletteMeta`: nome, mood, settori a cui si adatta, colori da mostrare).
