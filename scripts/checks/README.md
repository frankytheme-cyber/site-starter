# Controlli

Script di controllo, da lanciare con npm:

- `contrast.ts` (`npm run check:contrast`): contrasto WCAG AA delle coppie di colori di ogni palette.
- `recipes.ts` (`npm run check:recipes`): ricette di pagina e dati del sito. Errori: segnaposto (`DA-COMPILARE`, lorem, TODO, `[…]`), telefoni/email/P.IVA scritti nelle sezioni, più di un hero, id duplicati, link interni a pagine o ancore inesistenti, `alt` uguale al nome del file. Avvisi: toni uguali consecutivi, più di 12 sezioni, prima sezione non hero, nessuna cta. Solo report; con `-- --strict` gli errori fanno uscire con codice 1.
