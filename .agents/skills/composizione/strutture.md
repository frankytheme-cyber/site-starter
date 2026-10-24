# Strutture di partenza

Per la skill `composizione` (`.agents/skills/composizione/SKILL.md`): una struttura per tipo di pagina e per settore, da adattare al brief e al materiale. Ogni riga è una sezione: blocco `variante` (tono), con le alternative. I toni sono già alternati; effetti di sfondo e bordi sono indicati dove servono, entro i limiti (3 effetti e 2 bordi per pagina, mai sulla prima sezione). Una sezione senza materiale si toglie e i toni si riallineano: non si riempie.

## Scegliere una struttura senza foto

Prima di applicare le sequenze di settore, confronta impianti distinti con gli stessi testi e lo stesso tema:
- raccolto: hero `centered`, servizi `cards-icone`, chiusura `banner`;
- editoriale: hero `editoriale`, servizi `editoriale`, chiusura `split-contatto`;
- tipografico: hero `manifesto`, servizi `elenco`, chiusura `split-contatto`.

Sono combinazioni iniziali, non tre preset di sito. Materiale e obiettivo decidono quali sezioni aggiungere, togliere o spostare. Il catalogo `/catalogo/composizioni/` le mostra con le ricette `bottega-*-home.json` e gli stessi contenuti. Non usare foto di prova per differenziarle.

## Home

### Lavori a domicilio

Imbianchini, idraulici, elettricisti, falegnami, giardinieri, imprese di pulizie e di traslochi.

1. hero `split` (default, `alone`): la foto di un lavoro finito; senza foto scegli `centered`, `editoriale` o `manifesto` dalla direzione visiva. Pulsanti: l'azione principale (`@telefono` o il preventivo) e «Guarda i lavori».
2. services `cards-icone` o `cards-immagine` (muted, `id: servizi`): da 3 a 6 servizi.
3. process `passi-numerati` (default): dal primo contatto al lavoro finito, se il brief lo racconta.
4. gallery `griglia-popup` o `prima-dopo` (muted, `id: lavori`).
5. testimonials `cards` (default).
6. areas `elenco-zone` (muted, `id: zone`).
7. accordion `faq` (default, `id: domande`).
8. cta `banner` (primary, `aurora`, bordo `curva`, `id: preventivo`).

### Locale da visitare

Ristoranti, bar, pasticcerie, negozi, parrucchieri, centri estetici.

1. hero `full` (default) con una foto del locale o dei prodotti (velatura `scura`, o `colorata` per dare alla foto il colore del sito); `split` se la foto non regge il testo sopra.
2. about `immagine-testo` (muted): chi c'è dietro, da quando, cosa fa di diverso.
3. services `cards-immagine` (default): piatti, prodotti o trattamenti principali; tabs `testo-immagine` per alternative come pranzo e cena.
4. gallery `griglia-popup` o `slider` (muted, `alone`).
5. testimonials `singola` o `cards` (default).
6. contact `info-mappa` (muted, `showHours: true`, `id: dove-siamo`).
7. cta `banner` (primary, `aurora`): prenotare, ordinare, chiamare.

### Studio professionale

Commercialisti, avvocati, studi tecnici, studi medici, consulenti.

1. hero `split` (default, `sfumato`): la foto dello studio o del titolare; `editoriale` o `centered` senza foto, `manifesto` per un messaggio breve dominante.
2. services `cards-icone` (muted, `id: servizi`).
3. features `3-colonne` (default): come lavora lo studio, con fatti verificabili.
4. about `con-numeri` (muted, `alone`) se ci sono numeri con la fonte, altrimenti `immagine-testo`.
5. process `timeline` (default): dal primo appuntamento in poi.
6. accordion `faq` (muted).
7. cta `split-contatto` (primary, `showContacts: true`).

### Ospitalità

B&B, case vacanza, agriturismi.

1. hero `full` (default, velatura `scura`): la casa o il paesaggio.
2. about `immagine-testo` (muted): la struttura e chi accoglie.
3. features `3-colonne` (default): cosa offre (colazione, parcheggio, animali ammessi), solo dal brief.
4. gallery `slider` o `griglia-popup` (muted): camere e spazi comuni.
5. testimonials `slider` (default, `alone`): recensioni con la fonte (Booking, Google, Airbnb).
6. contact `info-mappa` (muted, `id: dove-siamo`): come arrivare.
7. cta `banner` (primary, `aurora`): scrivere su WhatsApp o prenotare dal link della piattaforma.

## Pagine interne

### Servizi

1. hero `centered` (default).
2. services `alternato` (muted, `id: elenco`): da 2 a 4 servizi con foto; con più servizi, due blocchi `cards-immagine` o `cards-icone`, ognuno con il suo titolo.
3. process `passi-numerati` (default).
4. accordion `faq` (muted): domande sui servizi, diverse da quelle della home.
5. cta `banner` (primary).

### Chi siamo

1. hero `split` (default): la foto del titolare, della squadra o della sede; `editoriale` o `centered` senza foto.
2. about `immagine-testo`, o `con-numeri` se ci sono numeri con la fonte (muted): la storia, con fatti.
3. tabs `testo-immagine` (default): storia, metodo e squadra, una foto per scheda; senza foto features `lista`.
4. carousel `immagini-testo` (muted): alcuni lavori o progetti raccontati in breve.
5. cta `banner` (primary).

### Lavori

1. hero `centered` (default).
2. gallery `griglia-popup` (muted): un blocco per categoria di lavori, ognuno con il suo titolo, fino a 12 foto.
3. gallery `prima-dopo` (default), se ci sono coppie con la stessa inquadratura.
4. testimonials `cards` (muted).
5. cta `banner` (primary).

### Contatti

1. hero `centered` (default): pulsanti `@telefono` e `@mappa`, o `@whatsapp`.
2. contact `info-mappa` con una sede da raggiungere, `info-cta` per chi lavora a domicilio (muted, `id: recapiti`).
3. form `contatto` o `preventivo` (default), solo con l'invio configurato (`docs/form.md`) e l'informativa approvata.
4. accordion `faq` (muted): tempi di risposta, sopralluogo, preventivo.
5. cta `split-contatto` (default, `showContacts: true`). In una pagina corta può prendere il posto del blocco contact, come nella ricetta tipo `artigiano-contatti.json`.

### Pagine legali

Privacy e cookie: le ricette del template (`privacy.json`, `cookie.json`), con `"kind": "legale"` e senza cta. I testi sono solo quelli forniti o approvati da Simone; se mancano, restano i segnaposto e lo dici.

### Sito di una pagina

Tutto nella home: la struttura del settore, con contact (e form, se serve) prima dell'invito finale; il menu punta alle ancore (`/#servizi`, `/#lavori`, `/#dove-siamo`).
