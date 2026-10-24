---
name: composizione
description: Usala per comporre o rifare le pagine di un sito cliente con Simone, cioè layout, menu e ricette JSON con i blocchi e le varianti del catalogo, dopo aver scelto il tema.
---

# Composizione delle pagine

Per l'agente che costruisce un sito cliente con Simone. Il sito si completa, non si inventa: blocchi e varianti del catalogo, preset del tema, fatti del brief. L'ordine del lavoro: tema (skill `direzione-visiva`), composizione, testi (skill `testi-sito`), revisione (skill `revisione-visiva`).

## Prima di comporre

- **Brief:** `docs/brief.md` approvato da Simone. Se manca, compilalo con lui partendo da `docs/modelli/brief.md`: senza attività, servizi, azione principale e pagine (sezioni 1-3) non si compone. Un dato che manca va in «Da chiedere», mai inventato.
- **Note del sito:** `docs/sito.md`.
- **Inventario del materiale**, prima di scegliere i blocchi: il materiale decide le varianti, non il contrario.
  - `npm run images` (include sottocartelle, esclude fixture): cosa mostra ognuna (lavoro finito, prima e dopo, sede, persone, prodotti), orientamento e qualità;
  - recensioni e numeri del brief, ognuno con la fonte;
  - dati di `src/content/settings/site.json` (telefono, WhatsApp, email, indirizzo, orari): decidono link speciali e blocchi dei contatti.
- **Catalogo:** `npm run catalog:query -- --regole` per le regole; `npm run catalog:query` per l’indice breve. Consulta una scheda completa e i suoi screenshot solo per i blocchi candidati. Non caricare tutto `catalogo.json`.
- **Tema** già scelto con la skill `direzione-visiva`.

## Passi

1. **Pagine.** Una ricetta per ogni pagina del brief, né una in più né una in meno: `src/content/pages/<slug>.json`, con `index.json` per la home e slug brevi in italiano (`servizi`, `chi-siamo`, `lavori`, `contatti`). Privacy e cookie restano le ricette del template, con `"kind": "legale"`. Per ogni pagina parti dalla struttura del suo tipo e del suo settore in `.agents/skills/composizione/strutture.md`, o da una ricetta tipo di `docs/catalogo/ricette-tipo/` se somiglia.

2. **Varianti dal materiale:**

   Consulta solo le righe pertinenti di `.agents/skills/composizione/materiali.md`. Se mancano foto vere applica [la regola dei placeholder](../nuovo-sito/immagini-placeholder.md) e scegli le varianti anche su quel materiale; senza prove non aggiungere numeri o recensioni; senza invio configurato usa CTA di contatto. Per ogni blocco scelto verifica `whenToUse`, `avoidWhen`, campi e regole con `npm run catalog:query -- <tipo>`; non leggere tutte le schede.

3. **Struttura e ritmo della pagina.**
   - La struttura tipo è una partenza, non uno stampo. Conferma la composizione scelta nella direzione visiva; non ricondurla automaticamente a hero centrata, tre card e banner. Registra gerarchia dell’apertura, presentazione dei servizi e tipo di chiusura nella nota di design.
   - Se la direzione è intenzionalmente senza immagini: scegli `centered` per un messaggio raccolto, `editoriale` per titolo e spiegazione distinti, `manifesto` per un titolo breve dominante. Servizi `elenco` per confrontare righe compatte, `editoriale` per una lettura verticale con introduzione laterale, `cards-icone` se i servizi sono brevi e paralleli. Non aggiungere interazioni per il solo scopo di variare l’aspetto.
   - **Toni:** alterna `default` e `muted`; `primary` una o due volte per pagina, di solito sull'invito finale.
   - **Effetti di sfondo** (`background`): al massimo 3, mai in sezioni vicine, dove servono a far notare qualcosa: l'apertura (hero con `alone`, `aurora`, `sfumato` o `decoro`), un punto chiave (chi siamo, recensioni, punti di forza) e l'invito finale (cta con `aurora`). Sotto una hero `full` l'effetto non si vede: usalo altrove. `decoro` solo se il tema ha un `pattern`, in una o due sezioni per pagina, sugli stessi tipi di sezione in tutto il sito.
   - **Bordi** (`edge`): al massimo 2 per pagina, mai sulla prima sezione, solo tra toni diversi. Un solo tipo di bordo per sito: `onda` per siti morbidi (benessere, mare, natura, bambini), `diagonale` per siti decisi (officine, edilizia, sport), `curva`, la più neutra, per far risaltare l'invito finale.
   - **Varietà:** la differenza deve servire i contenuti, non mostrare tutte le varianti. Alterna sezioni dense (griglie di card) e leggere (un testo, una recensione, un invito); mai tre griglie di card di fila. Come ordine di grandezza, home di 6-9 sezioni e interne di 4-6; una pagina con poco materiale resta più breve. Non aggiungere sezioni per raggiungere questi numeri, mai più di 12.
   - **Chiusura:** ogni pagina non legale ha una `cta`, di norma in fondo (con `--strict` la mancanza è un errore); al massimo due cta per pagina, una sola `banner`.

4. **Ricette.** Ogni file ha `"$schema": "../../../.astro/collections/pages.schema.json"`, `title` (al massimo 60 caratteri) e `description` (al massimo 160), poi le sezioni piatte: `type`, `variant`, `id` (ancora in kebab-case per le sezioni linkate dal menu o dai pulsanti), `tone`, `background`, `edge` e i campi della scheda. L'esempio pronto in fondo a ogni scheda è il punto di partenza di una sezione. Immagini con percorso `../../assets/images/<file>` e un `alt` che dice cosa mostra. Recapiti mai nei testi: nei pulsanti `@telefono`, `@whatsapp`, `@email`, `@mappa`, nelle cta `showContacts`. Una pagina non ancora pronta resta `"draft": true`.

5. **Layout** in `src/content/settings/layout.json`:
   - header `con-cta` quando un'azione principale va spinta da ogni pagina (preventivo, prenotazione; serve la `cta` in `navigation.json`), altrimenti `semplice`; `sticky` per le pagine lunghe; `logo` `immagine` solo se il logo è in `site.json`;
   - footer `colonne` di norma, `minimale` per siti di una o due pagine; `ctaBand` spento se le pagine chiudono già con una cta.

6. **Menu** in `src/content/settings/navigation.json`: al massimo 5 o 6 voci (lo schema ne ammette 7), con le parole che usa il cliente; sottomenu (fino a 6 voci) solo se aiutano davvero; `cta` uguale all'azione principale; `footer.legal` con privacy e cookie, `footer.links` per le pagine secondarie. In un sito di una sola pagina le voci sono ancore della home (`/#servizi`).

7. **Qualità grafica.** Verifica gerarchia, misura dei testi e continuità con [qualita-grafica.md](../direzione-visiva/qualita-grafica.md): cambiare variante o alternare gli sfondi non basta.

8. **Testi** con la skill `testi-sito`.

9. **Controlli**, finché non ci sono errori:

   ```sh
   npm run check:recipes
   ```

   I messaggi dicono file, sezione e campo: `src/content/pages/index.json → sezione 3 (services) → items[2].title`.

10. **Revisione** con la skill `revisione-visiva`, poi `npm run qa` (include `check`; non ripeterlo sugli stessi sorgenti).

11. **Nota di design** in `docs/nota-design.md`, breve: scelte e motivi, non la cronaca del lavoro.

    ```markdown
    # Nota di design — <nome attività>

    ## Tema
    <palette> · <fonts> · <shape> · <pattern> · <texture>: perché. Alternative mostrate a Simone: …

    ## Layout e menu
    Header <variante> (sticky sì o no), footer <variante> (ctaBand sì o no), voci del menu: perché.

    ## Pagine
    ### <slug>
    1. <blocco> `<variante>` (<tone>; <background> e <edge> se non sono quelli di partenza): perché, con quale materiale.

    ## Immagini
    Foto usate e dove, foto scartate e perché, placeholder e materiali da sostituire; stock con fonte e licenza, immagini generate con strumento e prompt (o nota collegata).

    ## Da decidere con Simone
    - …
    ```

12. **Mostra a Simone** il sito acceso (`npx astro dev --background`, poi `http://localhost:4321/`) e le immagini della revisione: cosa hai scelto, perché, cosa manca. Le decisioni sono sue.

## Criterio di fine

Una ricetta per ogni pagina del brief; layout e menu scritti; nota di design completa; `npm run qa` senza errori; Simone ha visto il sito. Prima della messa online servirà `npm run qa -- --strict`.

## Non fare

- Non scrivere CSS, componenti o pagine `.astro` nel sito e non toccare i file gestiti. Se un blocco o una variante non basta, proponi a Simone il lavoro nella libreria (skill `nuovo-blocco`, sezione «Prima»).
- Non forzare un blocco a fare altro: la scheda dice quando evitarlo.
- Mai dati inventati: recapiti, numeri, recensioni, foto di lavori o di persone che non ci sono.
- Mai più di un'apertura per pagina (hero o slider), e sempre come prima sezione. Lo slider solo con 2-5 foto di qualità di servizi o ambienti diversi; con una foto sola, hero `full`.
- Non chiudere in voci da aprire (accordion, tabs) ciò che tutti devono leggere, come prezzi e garanzie.
