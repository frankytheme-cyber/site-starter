---
name: direzione-visiva
description: Usala per scegliere con Simone l'aspetto di un sito cliente (palette, font, forma, decoro, texture) prima di comporre le pagine, o quando Simone vuole cambiarlo. Propone tre direzioni motivate dal brief e le mostra sul sito vero.
---

# Direzione visiva

Per l'agente che compone un sito cliente con Simone. L'aspetto si sceglie tra i preset di `src/themes/presets.ts`, già verificati WCAG AA: non si creano colori, font o CSS. Si sceglie guardando il sito vero, non le tabelle del catalogo, e decide Simone.

## Quando

- Dopo il brief, prima di comporre tutte le pagine: basta la home, anche solo abbozzata (hero e due o tre sezioni con i testi veri).
- Quando Simone chiede un altro aspetto, o il sito somiglia troppo a un altro.

## Qualità della proposta

Leggi [qualita-grafica.md](qualita-grafica.md) per definire il punto focale, la gerarchia, il ritmo e la critica della proposta. Registra la scelta grafica in una frase nella nota di design: cosa deve guidare la pagina e perché, dai contenuti del brief. Tre strutture diverse sono necessarie per il confronto, ma non dimostrano da sole la qualità del lavoro.

## Passi

1. **Leggi** `docs/brief.md` (settore, clienti, tono, preferenze di colore e di stile, siti che piacciono e no, logo), `docs/sito.md` e `npm run catalog:query -- --temi <settore>` (ricerca testuale per mood e settori; senza filtro se non trovi alternative). Apri gli screenshot dei soli preset candidati, indicati nei risultati. Poi guarda le foto in `src/assets/images/`: colori, luce, materiali. Sono loro a comandare.
   Se il brief non dice nulla su tono e stile, chiedi a Simone tre aggettivi per l'attività e un sito che gli piace, prima di proporre.

2. **Prima la struttura, poi i preset.** Prepara tre composizioni della home dagli stessi fatti del brief. Devono cambiare almeno apertura (gerarchia o disposizione) e presentazione del contenuto principale, non soltanto colore, font, forma o decoro. Non aggiungere sezioni senza materiale per differenziarle. Confrontale prima con gli stessi cinque preset e gli stessi testi: se sembrano ancora la stessa pagina, non sono tre direzioni.

   Senza foto valuta `hero centered`, `editoriale` e `manifesto`; per i servizi `cards-icone`, `elenco` o `editoriale`, secondo lunghezza e lettura. `schede` solo se si deve scegliere tra alternative, non per nascondere i servizi. Usa anche l’invito `split-contatto` dove serve: non chiudere sempre con un banner. Consulta solo i blocchi candidati. `/catalogo/composizioni/` mostra il confronto strutturale; le ricette `bottega-*-home.json` sono esempi di tre sezioni, non home complete da duplicare.

   **Poi caratterizza le direzioni con i preset.** Dai a ciascuna un nome e una ragione legata ai contenuti: quale informazione domina, come si legge e quale materiale la sostiene. Evita di far coincidere sempre A con il colore del settore, B con un’altra palette e C con un font più vistoso: anche quello produce siti ripetitivi.

   Indica i cinque valori (`palette`, `fonts`, `shape`, `pattern`, `texture`) con una motivazione breve. Possono coincidere in parte tra le proposte: non cambiare tutto solo per farle sembrare diverse. Le foto e il logo orientano la palette; leggibilità e tono orientano i font; forma, decoro e texture rifiniscono il progetto, non lo sostituiscono. `pattern` diverso da `nessuno` solo con una o due sezioni `background: "decoro"`; texture ed effetti restano facoltativi. Non aggiungerli per completare una formula.

3. **Guardale sul sito vero, una ricetta per direzione.** Salva le tre ricette provvisorie in `docs/proposte-visive/`, fuori dalla collezione delle pagine. Applica una proposta alla home, acquisisci `npm run design:shots -- --pagine index --sezioni` e registra proposta e cartella del report nella nota di design; ripeti per le altre. Prima confronta le tre strutture con lo stesso tema, poi applica i preset candidati. Conserva i contenuti originari se stai rifacendo un sito e non sovrascrivere modifiche estranee.

   `--tema` e i parametri nell’indirizzo cambiano solo i cinque preset della ricetta correntemente applicata: **non cambiano la composizione**. Tre `--tema` sulla stessa home sono un confronto di finiture, non tre direzioni. Per provare il tema su ciascuna ricetta:

   ```sh
   npm run design:shots -- --pagine index --sezioni --tema salvia,classico,morbido,nessuno,liscia
   ```

   Apri apertura, panoramica e sezioni a 1280 e 375 px. Scarta o correggi gerarchie ripetute, titoli che vanno a capo male, decoro che disturba e foto spente dal tema. Prima della consegna svolgi la critica indicata in qualita-grafica.md e correggi i punti deboli. Alla fine lascia applicata la proposta raccomandata, dichiarandola provvisoria. Le alternative restano nelle ricette salvate e nei rispettivi report; non inventare URL che pretendono di cambiare la struttura.

4. **Proponi a Simone**, in un messaggio:
   - per ogni direzione la composizione (varianti, gerarchia e ritmo), i cinque valori e il motivo; il link live solo per la ricetta applicata, con il server di sviluppo acceso (`npx astro dev --background`): per esempio `http://localhost:4321/?palette=laguna&fonts=fresco&shape=arrotondato&pattern=onde&texture=liscia`. I link interni portano con sé il tema, così si gira tutto il sito;
   - le immagini di apertura delle tre composizioni e i rispettivi report di confronto, identificati per proposta;
   - quale raccomandi e perché.

   Simone può mescolare (la palette di una, i font di un'altra): rifai gli screenshot della combinazione prima di confermarla.

5. **Applica la ricetta scelta alla home e scrivi i preset** in `src/content/settings/theme.json` e in `docs/nota-design.md`, sezione «Tema»: la direzione scelta con il motivo, le altre due come alternative con i loro valori. Poi le pagine si compongono con la skill `composizione`.

6. **Decoro:** se `pattern` non è `nessuno`, scegli già le una o due sezioni con `"background": "decoro"`; altrimenti nessuna sezione lo usa (`check:recipes` lo segnala).

## Criterio di fine

Simone ha visto tre strutture distinguibili anche a tema uguale e ha scelto; ricetta della home applicata e `theme.json` scritto; la nota di design ha scelta, motivo e alternative; `npm run check:recipes` senza errori.

## Non fare

- Non creare colori, font o CSS e non toccare `src/themes` in un sito: sono file gestiti, il check `lock` li ferma.
- Non scegliere senza mostrare: la scelta è di Simone.
- Non proporre tre varianti della stessa idea.
- Non usare skill di design generiche (es. `frontend-design`) per un aspetto fuori dai preset. Se nessun preset va bene, dillo a Simone e proponi un preset nuovo nella libreria.
