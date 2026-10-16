<!-- Generato da scripts/gen-catalog.ts (npm run gen:catalog): non modificare a mano. -->

# Catalogo dei blocchi

**site-starter — libreria di blocchi per siti vetrina**, versione **v0.0.1** (`library.manifest.json`). Le fixture usano attività di esempio di settori diversi (artigiano, negozio, ristorante, studio professionale) con recapiti finti. Tutto quello che segue è generato da `npm run gen:catalog` a partire da schemi, schede e fixture; gli screenshot da `npm run screenshots`; gli stessi dati per le macchine sono in [`catalogo.json`](catalogo.json). `npm run check` fallisce se questa cartella non corrisponde agli schemi.

Dal vivo: `/catalogo` (tutti i blocchi con i selettori di palette, font e forma e «Copia JSON» per ogni variante), `/catalogo/<tipo>/<variante>/` (una variante da sola), `/catalogo/bottoni`, `/catalogo/ui`, `/catalogo/icone`.

## Regole d’oro delle ricette

1. Un solo hero per pagina, come prima sezione: contiene l’unico h1. *(controllo recipes)*
2. Di norma una cta, verso la fine, dopo i blocchi che convincono (servizi, lavori, domande); non nelle pagine legali ("kind": "legale"). *(controllo recipes)*
3. Due sezioni vicine non hanno lo stesso tone (default, muted, primary). *(controllo recipes)*
4. Al massimo 12 sezioni: oltre, meglio dividere la pagina. *(controllo recipes)*
5. Al massimo un accordion faq per pagina: i dati strutturati FAQPage per Google sono uno solo. *(controllo recipes)*
6. Solo blocchi e varianti del catalogo; header e footer non sono sezioni ma stanno in layout.json. *(build)*
7. Recapiti mai nei testi: nei pulsanti i link speciali (@telefono, @whatsapp, @email, @mappa), nelle cta showContacts. *(controllo recipes)*
8. Link interni solo a pagine e ancore che esistono; ogni id di sezione è in kebab-case e unico nella pagina. *(controllo recipes)*
9. Ogni foto ha un alt che dice cosa mostra, non il nome del file. *(controllo recipes)*
10. Testi entro i limiti dei campi (titoli 70 caratteri, pulsanti 25...): sono nelle schede dei blocchi. *(build)*
11. Niente segnaposto (DA-COMPILARE, lorem, TODO) in una pagina pubblicata. *(controllo release)*

<!-- regole-di-composizione:inizio -->
## Regole di composizione

<!-- Scritta a mano: npm run gen:catalog ricopia questa sezione com'è. Elenco provvisorio: le regole verificate dai controlli sono le «Regole d'oro» qui sopra (src/core/recipe-rules.ts); qui vanno le scelte di composizione, da sostituire con l'elenco definitivo. -->

Oltre alle regole d'oro, che i controlli verificano, le scelte di composizione:

1. **Varianti con foto solo se le foto ci sono.** hero `split`/`full`, servizi `cards-immagine`/`alternato`, schede `testo-immagine` e carosello vogliono foto vere dell'attività; senza, si usa la variante senza foto (hero `centered`, servizi `cards-icone`, schede `testo`).
2. **Informazioni importanti in vista.** Prezzi, garanzie e ciò che tutti devono leggere non vanno dentro voci chiuse (accordion, schede): meglio un testo aperto.
3. **Il tono più forte con misura.** `primary` una o due volte per pagina, di solito per la cta; se la pagina chiude con una cta, nel footer la fascia di contatto (`ctaBand`) resta spenta.
4. **Un invito alla volta.** Mai più di due cta per pagina, e al massimo una `banner`.
<!-- regole-di-composizione:fine -->

## Blocchi

Sezioni delle ricette di pagina (`scope: "page"`), nell’ordine in cui compaiono di solito in una pagina.

| Blocco | Categoria | Varianti | Quando usarlo |
| --- | --- | --- | --- |
| [hero — Hero](blocchi/hero.md) | apertura | `split`, `full`, `centered` | Come primo blocco di una pagina, per dire subito cosa fa l’attività e cosa può fare chi visita (chiedere un preventivo, prenotare, chiamare). |
| [accordion — Accordion](blocchi/accordion.md) | contenuti | `faq`, `contenuti` | Per le domande frequenti (variante faq, che Google può mostrare nei risultati) o per informazioni di dettaglio che solo alcuni cercano: condizioni, tempi, cosa preparare prima di un appuntamento. |
| [carousel — Carosello](blocchi/carousel.md) | contenuti | `immagini`, `immagini-testo` | Per una serie di elementi dello stesso tipo che si sfogliano: foto dei lavori finiti, prima e dopo, progetti, recensioni con foto. |
| [about — Chi siamo](blocchi/about.md) | contenuti | `immagine-testo`, `con-numeri` | Nella pagina «Chi siamo» o come sezione di presentazione in home. Con i numeri solo se il cliente li ha forniti e sa dire da dove vengono. |
| [process — Come lavoriamo](blocchi/process.md) | contenuti | `passi-numerati`, `timeline` | Quando il cliente deve sapere cosa succede dopo averti contattato: preventivo, sopralluogo, lavoro, consegna. |
| [gallery — Galleria](blocchi/gallery.md) | contenuti | `griglia-popup`, `prima-dopo`, `slider` | Per mostrare lavori, locali o prodotti veri, quando le foto parlano da sole. Solo foto reali fornite dal cliente. |
| [features — Punti di forza](blocchi/features.md) | contenuti | `3-colonne`, `lista` | Per dire perché scegliere l’attività: garanzie, modo di lavorare, cosa la distingue. Di solito dopo i servizi o prima della cta. |
| [testimonials — Recensioni](blocchi/testimonials.md) | contenuti | `cards`, `singola`, `slider` | Quando il cliente ha recensioni reali (Google, Facebook, messaggi) e può dire dove sono state scritte. |
| [tabs — Schede](blocchi/tabs.md) | contenuti | `testo`, `testo-immagine` | Quando chi visita sceglie una strada tra poche alternative parallele dello stesso tipo: pranzo o cena, privati o imprese, servizi di base o completi. |
| [services — Servizi](blocchi/services.md) | contenuti | `cards-icone`, `cards-immagine`, `alternato`, `schede` | Per dire cosa fa l’attività, di solito subito dopo l’hero. Nella pagina dei servizi, con la variante alternato, per dare più spazio a ciascuno. |
| [contact — Contatti](blocchi/contact.md) | contatti | `info-mappa`, `info-cta` | Nella pagina contatti, o in fondo a una pagina che deve far trovare l’attività. Telefono, WhatsApp, email, indirizzo e orari non si scrivono nel blocco: arrivano da site.json. |
| [cta — Invito all’azione](blocchi/cta.md) | contatti | `banner`, `split-contatto` | Dopo i blocchi che convincono (servizi, lavori, recensioni) e in fondo alla pagina, prima del footer. Con showContacts mostra telefono e WhatsApp dell’attività presi da site.json. |

## Blocchi di layout

Header e footer sono uguali su tutte le pagine: non stanno nelle ricette ma in `src/content/settings/layout.json`, una chiave per blocco, e li disegna BaseLayout. Le opzioni:

### [header — Header](blocchi/header.md)

| Opzione | Valori | Obbl. | Note |
| --- | --- | --- | --- |
| `variant` | `semplice` · `con-cta` | sì | semplice: logo e menu · con-cta: aggiunge il pulsante in evidenza del «Menu» · con-cta richiede la cta in navigation.json. |
| `sticky` | sì/no | sì | L’intestazione resta visibile mentre si scorre la pagina |
| `logo` | `testo` · `immagine` | no | testo: il nome dell’attività · immagine: il logo caricato in «Dati attività». Vuoto: il logo se c’è, altrimenti il nome · immagine richiede il logo in site.json. |

### [footer — Footer](blocchi/footer.md)

| Opzione | Valori | Obbl. | Note |
| --- | --- | --- | --- |
| `variant` | `colonne` · `minimale` | sì | colonne: logo, link, contatti, orari e social · minimale: una riga con nome, P.IVA, link legali e social |
| `ctaBand` | sì/no | sì | Sopra il footer, un titolo con i pulsanti per chiamare e scrivere su WhatsApp |
| `ctaBandTitle` | max 70 | no | Al massimo 70 caratteri; vuoto: «Parliamo del tuo progetto» · Usato solo con ctaBand attivo. |

Esempio di `layout.json` (dalle fixture):

```json
{
	"header": {
		"variant": "semplice",
		"sticky": false,
		"logo": "testo"
	},
	"footer": {
		"variant": "colonne",
		"ctaBand": false
	}
}
```

## Link speciali

Nei link dei pulsanti (`href` delle cta e del menu) i recapiti non si scrivono: si usano questi valori, che la build risolve con i dati di `src/content/settings/site.json` (e si ferma se il dato manca).

| Link | Diventa | Dato di site.json |
| --- | --- | --- |
| `@telefono` | `tel:` col numero senza spazi | `phone` |
| `@whatsapp` | chat `https://wa.me/` | `whatsapp` |
| `@email` | `mailto:` | `email` |
| `@mappa` | ricerca dell’indirizzo su Google Maps | `address` |

## Temi

L’aspetto si sceglie in `src/content/settings/theme.json` con tre preset (`palette`, `fonts`, `shape`), ciascuno con la sua scheda `<nome>.meta.ts` accanto al CSS in `src/themes/`. Una variante da sola accetta `?palette=…&fonts=…&shape=…`.

| Chiave | Valori | Note |
| --- | --- | --- |
| `palette` | `terracotta` · `ardesia` | «Palette» I colori del sito: ogni palette ha il contrasto AA verificato (check contrast) |
| `fonts` | `moderno` · `classico` | «Caratteri» La coppia di font per titoli (font-heading) e testo (font-body) |
| `shape` | `squadrato` · `morbido` · `arrotondato` | «Forma» Il raggio degli angoli di card e riquadri (rounded-box) e dei pulsanti (rounded-button) |

### Palette

| Preset | Nome | Mood | Adatta a | Colori |
| --- | --- | --- | --- | --- |
| `terracotta` | Terracotta | caldo, accogliente, artigianale | ristoranti e trattorie, agriturismi, botteghe artigiane, negozi di prodotti tipici, artigiani della casa e delle finiture | bg `#fbf6ef` · surface `#f2e6d7` · fg `#2e1f17` · primary `#a5452a` · accent `#56652b` |
| `ardesia` | Ardesia | sobrio, moderno, professionale | impiantisti ed elettricisti, studi tecnici e professionali, officine e carrozzerie, pulizie e manutenzioni, servizi alle imprese | bg `#f8fafb` · surface `#eaeef1` · fg `#1b2228` · primary `#2d4a5e` · accent `#e5a13a` |

![Hero con la palette Terracotta](img/hero-palette-terracotta-desktop.webp)
![Hero con la palette Ardesia](img/hero-palette-ardesia-desktop.webp)

### Font

| Preset | Nome | Mood | Adatta a | Titoli | Testo |
| --- | --- | --- | --- | --- | --- |
| `moderno` | Moderno | pulito, tecnico, contemporaneo | impiantisti e servizi tecnici, studi professionali, officine, attività giovani | Manrope | Inter |
| `classico` | Classico | caldo, tradizionale, leggibile | artigiani e botteghe, ristorazione, turismo e ospitalità, attività di tradizione | Fraunces | Source Sans 3 |

### Forme

| Preset | Nome | Mood | Adatta a | Raggi |
| --- | --- | --- | --- | --- |
| `squadrato` | Squadrato | rigoroso, tecnico, essenziale | studi tecnici e professionali, imprese edili e impiantisti, officine e carrozzerie, negozi di elettronica e ferramenta | card `0` · pulsanti `0` |
| `morbido` | Morbido | equilibrato, cordiale | artigiani e imprese di servizi, negozi e botteghe, la maggior parte delle attività | card `0.75rem` · pulsanti `0.5rem` |
| `arrotondato` | Arrotondato | amichevole, informale, giocoso | bar e pasticcerie, servizi alla persona (parrucchieri, estetica), attività per famiglie e bambini | card `1.5rem` · pulsanti `9999px` |

## Icone

164 alias in 21 categorie, in `src/core/icons.ts`: nei componenti `<Icon name="casa" />`, negli schemi `iconSchema()`. Il colore è quello del testo intorno. Dal vivo, con la ricerca, su `/catalogo/icone`. Licenze in `docs/THIRD_PARTY_LICENSES.md`.

| Categoria | Icone |
| --- | --- |
| Casa e cantiere | 12 |
| Attrezzi | 6 |
| Impianti: acqua, luce, gas, clima | 9 |
| Giardino e natura | 6 |
| Cibo e bevande | 10 |
| Salute e benessere | 6 |
| Bellezza | 4 |
| Auto e trasporti | 8 |
| Negozio e pagamenti | 10 |
| Ufficio e servizi professionali | 9 |
| Persone e famiglia | 5 |
| Tempo e calendario | 5 |
| Contatti e luoghi | 7 |
| Fiducia e qualità | 8 |
| Comunicazione | 7 |
| Frecce e interfaccia | 12 |
| File e documenti | 7 |
| Meteo e stagioni | 6 |
| Animali | 5 |
| Sport e tempo libero | 8 |
| Marchi | 14 |

**Casa e cantiere** (12, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `casa` | `lucide:house` |  |
| `edificio` | `lucide:building` |  |
| `fabbrica` | `lucide:factory` |  |
| `scale` | `lucide:door-stairwell` | Scale di casa o vano scala. Lucide non ha una scala a pioli. |
| `muro` | `lucide:brick-wall` |  |
| `porta` | `lucide:door-open` |  |
| `chiavi` | `lucide:key-round` |  |
| `cantiere` | `lucide:construction` |  |
| `pennello` | `lucide:paintbrush` |  |
| `rullo` | `lucide:paint-roller` |  |
| `bagno` | `lucide:bath` |  |
| `pulizie` | `lucide:brush-cleaning` |  |

**Attrezzi** (6, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `martello` | `lucide:hammer` |  |
| `chiave-inglese` | `lucide:wrench` |  |
| `trapano` | `lucide:drill` |  |
| `cassetta-attrezzi` | `lucide:toolbox` |  |
| `pala` | `lucide:shovel` |  |
| `righello` | `lucide:ruler` |  |

**Impianti: acqua, luce, gas, clima** (9, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `goccia` | `lucide:droplet` | Acqua, impermeabilizzazione. |
| `rubinetto` | `lucide:faucet` |  |
| `lampadina` | `lucide:lightbulb` |  |
| `fulmine` | `lucide:zap` | Elettricità. |
| `spina` | `lucide:plug` |  |
| `fiamma` | `lucide:flame` | Gas, caldaie, camini. |
| `stufa` | `lucide:heater` |  |
| `aria-condizionata` | `lucide:air-vent` |  |
| `pannello-solare` | `lucide:solar-panel` |  |

**Giardino e natura** (6, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `foglia` | `lucide:leaf` |  |
| `albero` | `lucide:tree-deciduous` |  |
| `fiore` | `lucide:flower-2` |  |
| `germoglio` | `lucide:sprout` |  |
| `recinto` | `lucide:fence` |  |
| `riciclo` | `lucide:recycle` |  |

**Cibo e bevande** (10, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `posate` | `lucide:utensils` |  |
| `cuoco` | `lucide:chef-hat` |  |
| `caffe` | `lucide:coffee` |  |
| `vino` | `lucide:wine` |  |
| `birra` | `lucide:beer` |  |
| `pizza` | `lucide:pizza` |  |
| `torta` | `lucide:cake-slice` |  |
| `gelato` | `lucide:ice-cream-cone` |  |
| `cornetto` | `lucide:croissant` |  |
| `grano` | `lucide:wheat` |  |

**Salute e benessere** (6, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `cuore` | `lucide:heart` |  |
| `battito` | `lucide:heart-pulse` |  |
| `stetoscopio` | `lucide:stethoscope` |  |
| `farmaco` | `lucide:pill` |  |
| `dentista` | `lucide:toothbrush` |  |
| `occhiali` | `lucide:glasses` |  |

**Bellezza** (4, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `forbici` | `lucide:scissors` |  |
| `brillantini` | `lucide:sparkles` |  |
| `profumo` | `lucide:perfume-bottle` |  |
| `gioiello` | `lucide:gem` |  |

**Auto e trasporti** (8, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `auto` | `lucide:car` |  |
| `furgone` | `lucide:van` |  |
| `camion` | `lucide:truck` |  |
| `moto` | `lucide:motorbike` |  |
| `bici` | `lucide:bike` |  |
| `parcheggio` | `lucide:square-parking` |  |
| `carburante` | `lucide:fuel` |  |
| `ricarica` | `lucide:plug-zap` | Ricarica dei veicoli elettrici. |

**Negozio e pagamenti** (10, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `negozio` | `lucide:store` |  |
| `carrello` | `lucide:shopping-cart` |  |
| `borsa` | `lucide:shopping-bag` |  |
| `etichetta` | `lucide:tag` |  |
| `sconto` | `lucide:badge-percent` |  |
| `regalo` | `lucide:gift` |  |
| `pacco` | `lucide:package` |  |
| `carta-di-credito` | `lucide:credit-card` |  |
| `contanti` | `lucide:banknote` |  |
| `euro` | `lucide:euro` |  |

**Ufficio e servizi professionali** (9, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `valigetta` | `lucide:briefcase` |  |
| `computer` | `lucide:laptop` |  |
| `calcolatrice` | `lucide:calculator` |  |
| `grafico` | `lucide:chart-column` |  |
| `bilancia` | `lucide:scale` | Studi legali, giustizia. |
| `penna` | `lucide:pen-line` |  |
| `laurea` | `lucide:graduation-cap` |  |
| `stretta-di-mano` | `lucide:handshake` |  |
| `wifi` | `lucide:wifi` |  |

**Persone e famiglia** (5, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `utente` | `lucide:user` |  |
| `utenti` | `lucide:users` |  |
| `bambino` | `lucide:baby` |  |
| `accessibilita` | `lucide:accessibility` |  |
| `sorriso` | `lucide:smile` |  |

**Tempo e calendario** (5, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `orologio` | `lucide:clock` |  |
| `calendario` | `lucide:calendar` |  |
| `prenotazione` | `lucide:calendar-check` |  |
| `clessidra` | `lucide:hourglass` |  |
| `cronometro` | `lucide:timer` |  |

**Contatti e luoghi** (7, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `telefono` | `lucide:phone` |  |
| `cellulare` | `lucide:smartphone` |  |
| `email` | `lucide:mail` |  |
| `mappa-pin` | `lucide:map-pin` |  |
| `mappa` | `lucide:map` |  |
| `indicazioni` | `lucide:signpost` |  |
| `sito-web` | `lucide:globe` |  |

**Fiducia e qualità** (8, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `premio` | `lucide:award` |  |
| `trofeo` | `lucide:trophy` |  |
| `garanzia` | `lucide:shield-check` |  |
| `certificato` | `lucide:badge-check` |  |
| `pollice` | `lucide:thumbs-up` |  |
| `stella` | `lucide:star` |  |
| `check` | `lucide:check` |  |
| `lucchetto` | `lucide:lock` |  |

**Comunicazione** (7, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `chat` | `lucide:message-circle` |  |
| `messaggi` | `lucide:messages-square` |  |
| `invia` | `lucide:send` |  |
| `megafono` | `lucide:megaphone` |  |
| `campanella` | `lucide:bell` |  |
| `citazione` | `lucide:quote` |  |
| `cuffie` | `lucide:headset` |  |

**Frecce e interfaccia** (12, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `freccia-destra` | `lucide:arrow-right` |  |
| `freccia-sinistra` | `lucide:arrow-left` |  |
| `freccia-su` | `lucide:arrow-up` |  |
| `freccia-giu` | `lucide:arrow-down` |  |
| `chevron-giu` | `lucide:chevron-down` |  |
| `chevron-destra` | `lucide:chevron-right` |  |
| `menu` | `lucide:menu` |  |
| `chiudi` | `lucide:x` |  |
| `cerca` | `lucide:search` |  |
| `piu` | `lucide:plus` |  |
| `info` | `lucide:info` |  |
| `link-esterno` | `lucide:external-link` |  |

**File e documenti** (7, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `preventivo` | `lucide:file-text` |  |
| `contratto` | `lucide:file-pen-line` |  |
| `cartella` | `lucide:folder` |  |
| `lista-controllo` | `lucide:clipboard-check` |  |
| `libro` | `lucide:book-open` |  |
| `foto` | `lucide:image` |  |
| `fotocamera` | `lucide:camera` |  |

**Meteo e stagioni** (6, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `sole` | `lucide:sun` |  |
| `nuvola` | `lucide:cloud` |  |
| `pioggia` | `lucide:cloud-rain` |  |
| `neve` | `lucide:snowflake` |  |
| `vento` | `lucide:wind` |  |
| `termometro` | `lucide:thermometer` |  |

**Animali** (5, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `cane` | `lucide:dog` |  |
| `gatto` | `lucide:cat` |  |
| `zampa` | `lucide:paw-print` |  |
| `uccello` | `lucide:bird` |  |
| `pesce` | `lucide:fish` |  |

**Sport e tempo libero** (8, Lucide)

| Alias | Icona | Note |
| --- | --- | --- |
| `palestra` | `lucide:dumbbell` |  |
| `pallone` | `lucide:volleyball` |  |
| `nuoto` | `lucide:waves` |  |
| `tenda` | `lucide:tent` |  |
| `valigia` | `lucide:luggage` |  |
| `musica` | `lucide:music` |  |
| `biglietto` | `lucide:ticket` |  |
| `arte` | `lucide:palette` |  |

**Marchi** (14, Simple Icons): solo per i link ai profili dell’attività, sono marchi registrati dei rispettivi titolari.

| Alias | Icona | Note |
| --- | --- | --- |
| `whatsapp` | `simple-icons:whatsapp` |  |
| `facebook` | `simple-icons:facebook` |  |
| `instagram` | `simple-icons:instagram` |  |
| `google` | `simple-icons:google` |  |
| `youtube` | `simple-icons:youtube` |  |
| `tiktok` | `simple-icons:tiktok` |  |
| `tripadvisor` | `simple-icons:tripadvisor` |  |
| `linkedin` | `simple-icons:linkedin` |  |
| `pinterest` | `simple-icons:pinterest` |  |
| `threads` | `simple-icons:threads` |  |
| `x` | `simple-icons:x` |  |
| `telegram` | `simple-icons:telegram` |  |
| `booking` | `simple-icons:bookingdotcom` |  |
| `airbnb` | `simple-icons:airbnb` |  |

## Altro

- [Primitive UI](ui.md): i componenti di `src/core/ui` con cui sono fatti i blocchi.
- [Ricette tipo](ricette-tipo/README.md): pagine pronte da copiare in `src/content/pages`.
