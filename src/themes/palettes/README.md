# Palette

Un file per palette con un blocco `[data-palette="nome"]` che imposta tutti i token colore (`--bg`, `--fg`, `--primary`, `--primary-hover`, `--accent-hover`...). Gli `-hover` sono il passaggio del mouse sui pulsanti: di solito un po' più scuri, e sempre in AA col loro testo.
Ogni coppia testo/sfondo deve superare 4.5:1 (`npm run check:contrast`). Una palette nuova va importata in `base.css` e aggiunta a `presets.ts`, con la sua scheda `<nome>.meta.ts` (`PaletteMeta`: nome, mood con 2-4 aggettivi, settori a cui si adatta, colori da mostrare).
Una palette scura (`notte`) segue le stesse regole: gli `-hover` schiariscono invece di scurire, e va provata a vista con foto e sovrapposizioni (hero, galleria). Tutte le palette a confronto, con anteprima e settori, in `/catalogo/temi`.
