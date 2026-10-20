---
name: direzione-visiva
description: Usala per scegliere con Simone l'aspetto di un sito cliente (palette, font, forma, decoro, texture) prima di comporre le pagine, o quando Simone vuole cambiarlo. Propone tre direzioni motivate dal brief e le mostra sul sito vero.
---

# Direzione visiva

Per l'agente che compone un sito cliente con Simone. L'aspetto si sceglie tra i preset di `src/themes/presets.ts`, già verificati WCAG AA: non si creano colori, font o CSS. Si sceglie guardando il sito vero, non le tabelle del catalogo, e decide Simone.

## Quando

- Dopo il brief, prima di comporre tutte le pagine: basta la home, anche solo abbozzata (hero e due o tre sezioni con i testi veri).
- Quando Simone chiede un altro aspetto, o il sito somiglia troppo a un altro.

## Passi

1. **Leggi** `docs/brief.md` (settore, clienti, tono, preferenze di colore e di stile, siti che piacciono e no, logo), `docs/sito.md` e le tabelle «Temi» di `docs/catalogo/README.md` (mood e settori di ogni preset, screenshot in `docs/catalogo/img/`). Poi guarda le foto in `src/assets/images/`: colori, luce, materiali. Sono loro a comandare.
   Se il brief non dice nulla su tono e stile, chiedi a Simone tre aggettivi per l'attività e un sito che gli piace, prima di proporre.

2. **Tre direzioni diverse davvero**, non tre palette sullo stesso impianto:
   - **A, la più vicina al settore:** mood e settori del catalogo, la scelta che nessuno contesterà.
   - **B, un'alternativa credibile:** un'altra famiglia di colore e un'altra coppia di font, sempre adatte al brief.
   - **C, la più personale che il brief regge:** un font con carattere (`carattere`, `robusto`, `gourmet`, `elegante`...), una forma netta (`squadrato` o `arrotondato`), un decoro e una texture; la palette scura `notte` solo se l'attività la regge (locali serali, barbieri, palestre).

   Ogni direzione ha i cinque valori (`palette`, `fonts`, `shape`, `pattern`, `texture`) e un motivo di una riga legato a un fatto del brief o delle foto, mai «perché è moderna». Per scegliere:
   - le foto non devono litigare con la palette: legno, cotto e luce calda chiedono una palette calda, o un motivo chiaro per il contrario;
   - con un logo, primary e accent gli devono stare bene accanto: vicini al suo colore, o neutri;
   - `pattern` diverso da `nessuno` solo se una o due sezioni useranno `"background": "decoro"`; `texture` `carta` o `grana` per siti materici, artigianali o fotografici;
   - la A può essere ovvia, la B e la C no: non ripartire sempre dagli stessi preset.

3. **Guardale sul sito vero:**

   ```sh
   npm run design:shots -- --pagine index --tema laguna,fresco,arrotondato,onde,liscia --tema ardesia,moderno,squadrato,nessuno,liscia --tema notte,carattere,squadrato,righe,grana
   ```

   Ogni `--tema` elenca i preset in qualsiasi ordine; quelli che mancano restano di `theme.json`. Le immagini sono in `reports/design/<data-ora>/`, una cartella per direzione: apri `-apertura` e `-panoramica` a 1280 (`desktop`) e 375 px (`mobile`). Scarta o correggi una direzione che non regge: foto spente dalla palette, titoli che vanno a capo male con quel font, decoro che disturba il testo, un sito scuro che sembra di un altro settore.

4. **Proponi a Simone**, in un messaggio:
   - per ogni direzione i cinque valori, il motivo e il link da aprire, con il server di sviluppo acceso (`npx astro dev --background`): per esempio `http://localhost:4321/?palette=laguna&fonts=fresco&shape=arrotondato&pattern=onde&texture=liscia`. I link interni portano con sé il tema, così si gira tutto il sito;
   - le immagini di apertura delle tre direzioni, e `reports/design/<data-ora>/index.html` per il confronto completo;
   - quale raccomandi e perché.

   Simone può mescolare (la palette di una, i font di un'altra): rifai gli screenshot della combinazione prima di confermarla.

5. **Scrivi la scelta** in `src/content/settings/theme.json` e in `docs/nota-design.md`, sezione «Tema»: la direzione scelta con il motivo, le altre due come alternative con i loro valori. Poi le pagine si compongono con la skill `composizione`.

6. **Decoro:** se `pattern` non è `nessuno`, scegli già le una o due sezioni con `"background": "decoro"`; altrimenti nessuna sezione lo usa (`check:recipes` lo segnala).

## Criterio di fine

Simone ha scelto; `theme.json` è scritto; la nota di design ha scelta, motivo e alternative; `npm run check:recipes` senza errori.

## Non fare

- Non creare colori, font o CSS e non toccare `src/themes` in un sito: sono file gestiti, il check `lock` li ferma.
- Non scegliere senza mostrare: la scelta è di Simone.
- Non proporre tre varianti della stessa idea.
- Non usare skill di design generiche (es. `frontend-design`) per un aspetto fuori dai preset. Se nessun preset va bene, dillo a Simone e proponi un preset nuovo nella libreria.
