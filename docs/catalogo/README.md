<!-- Generato da scripts/gen-catalog.ts (npm run gen:catalog): non modificare a mano. -->

# Catalogo dei blocchi

Libreria **site-starter v0.0.1** (`library.manifest.json`). Tutto quello che segue è generato da `npm run gen:catalog` a partire da schemi, schede e fixture; gli screenshot da `npm run screenshots`; gli stessi dati per le macchine sono in [`catalogo.json`](catalogo.json). `npm run check` fallisce se questa cartella non corrisponde agli schemi.

Dal vivo: `/catalogo` (tutti i blocchi con i selettori di palette, font e forma e «Copia JSON» per ogni variante), `/catalogo/<tipo>/<variante>/` (una variante da sola), `/catalogo/bottoni`, `/catalogo/ui`, `/catalogo/icone`.

## Regole d’oro delle ricette

1. Un solo hero per pagina, come prima sezione: contiene l’unico h1. *(controllo recipes)*
2. Di norma una cta, verso la fine, dopo i blocchi che convincono (servizi, lavori, domande); non nelle pagine legali ("kind": "legale"). *(controllo recipes)*
3. Due sezioni vicine non hanno lo stesso tone (default, muted, primary). *(controllo recipes)*
4. Al massimo 12 sezioni: oltre, meglio dividere la pagina. *(controllo recipes)*
5. Solo blocchi e varianti del catalogo; header e footer non sono sezioni ma stanno in layout.json. *(build)*
6. Recapiti mai nei testi: nei pulsanti i link speciali (@telefono, @whatsapp, @email, @mappa), nelle cta showContacts. *(controllo recipes)*
7. Link interni solo a pagine e ancore che esistono; ogni id di sezione è in kebab-case e unico nella pagina. *(controllo recipes)*
8. Ogni foto ha un alt che dice cosa mostra, non il nome del file. *(controllo recipes)*
9. Testi entro i limiti dei campi (titoli 70 caratteri, pulsanti 25...): sono nelle schede dei blocchi. *(build)*
10. Niente segnaposto (DA-COMPILARE, lorem, TODO) in una pagina pubblicata. *(controllo release)*

<!-- regole-di-composizione:inizio -->
## Regole di composizione

<!-- Scritta a mano: npm run gen:catalog ricopia questa sezione com'è. Elenco provvisorio: le regole verificate dai controlli sono le «Regole d'oro» qui sopra (src/core/recipe-rules.ts); qui vanno le scelte di composizione, da sostituire con l'elenco definitivo. -->

Oltre alle regole d'oro, che i controlli verificano, le scelte di composizione:

1. **Varianti con foto solo se le foto ci sono.** hero `split`/`full`, servizi `cards-immagine`/`alternato`, schede `testo-immagine` e carosello vogliono foto vere dell'attività; senza, si usa la variante senza foto (hero `centered`, servizi `cards-icone`, schede `testo`).
2. **Una sola faq per pagina.** L'accordion `faq` dà a Google i dati strutturati delle domande frequenti; per altre sezioni da aprire si usa `contenuti`.
3. **Informazioni importanti in vista.** Prezzi, garanzie e ciò che tutti devono leggere non vanno dentro voci chiuse (accordion, schede): meglio un testo aperto.
4. **Il tono più forte con misura.** `primary` una o due volte per pagina, di solito per la cta; se la pagina chiude con una cta, nel footer la fascia di contatto (`ctaBand`) resta spenta.
5. **Un invito alla volta.** Mai più di due cta per pagina, e al massimo una `banner`.
<!-- regole-di-composizione:fine -->

## Blocchi

Sezioni delle ricette di pagina (`scope: "page"`), nell’ordine in cui compaiono di solito in una pagina.

| Blocco | Categoria | Varianti | Quando usarlo |
| --- | --- | --- | --- |
| [hero — Hero](blocchi/hero.md) | apertura | `split`, `full`, `centered` | Come primo blocco di una pagina, per dire subito cosa fa l’attività e cosa può fare chi visita (chiedere un preventivo, prenotare, chiamare). |
| [accordion — Accordion](blocchi/accordion.md) | contenuti | `faq`, `contenuti` | Per le domande frequenti (variante faq, che Google può mostrare nei risultati) o per informazioni di dettaglio che solo alcuni cercano: condizioni, tempi, preparazione del cantiere. |
| [carousel — Carosello](blocchi/carousel.md) | contenuti | `foto`, `card` | Per una serie di elementi dello stesso tipo che si sfogliano: foto dei lavori finiti, prima e dopo, progetti, recensioni con foto. |
| [tabs — Schede](blocchi/tabs.md) | contenuti | `testo`, `testo-immagine` | Quando chi visita sceglie una strada tra poche alternative parallele dello stesso tipo: interni o esterni, privati o condomini, tipi di finitura. |
| [services — Servizi](blocchi/services.md) | contenuti | `cards-icone`, `cards-immagine`, `alternato`, `schede` | Per dire cosa fa l’attività, di solito subito dopo l’hero. Nella pagina dei servizi, con la variante alternato, per dare più spazio a ciascuno. |
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

### Palette

| Preset | Nome | Mood | Adatta a | Colori |
| --- | --- | --- | --- | --- |
| `terracotta` | Terracotta | caldo, accogliente, artigianale | imbianchini e decoratori, edilizia e finiture, ristoranti e trattorie, agriturismi, botteghe artigiane | bg `#fbf6ef` · surface `#f2e6d7` · fg `#2e1f17` · primary `#a5452a` · accent `#56652b` |
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
| `squadrato` | Squadrato | rigoroso, tecnico, essenziale | studi tecnici e professionali, edilizia e impianti, officine e carrozzerie | card `0` · pulsanti `0` |
| `morbido` | Morbido | equilibrato, cordiale | artigiani e imprese di servizi, negozi e botteghe, la maggior parte delle attività | card `0.75rem` · pulsanti `0.5rem` |
| `arrotondato` | Arrotondato | amichevole, informale, giocoso | bar e pasticcerie, servizi alla persona (parrucchieri, estetica), attività per famiglie e bambini | card `1.5rem` · pulsanti `9999px` |

## Icone

33 alias in `src/core/icons.ts`: nei componenti `<Icon name="pennello" />`, negli schemi `z.enum(ICON_NAMES)`. Il colore è quello del testo intorno. Licenze in `docs/THIRD_PARTY_LICENSES.md`.

**Simboli (Lucide)**

| Alias | Icona | Note |
| --- | --- | --- |
| `pennello` | `lucide:paintbrush` |  |
| `rullo` | `lucide:paint-roller` |  |
| `secchio-vernice` | `lucide:paint-bucket` |  |
| `casa` | `lucide:house` |  |
| `edificio` | `lucide:building` |  |
| `scala` | `lucide:door-stairwell` | Vano scala: Lucide non ha una scala a pioli. |
| `muro` | `lucide:brick-wall` |  |
| `goccia` | `lucide:droplet` | Impermeabilizzazione. |
| `scudo` | `lucide:shield-check` | Garanzia. |
| `check` | `lucide:check` |  |
| `stella` | `lucide:star` |  |
| `orologio` | `lucide:clock` |  |
| `calendario` | `lucide:calendar` |  |
| `telefono` | `lucide:phone` |  |
| `email` | `lucide:mail` |  |
| `mappa-pin` | `lucide:map-pin` |  |
| `freccia-destra` | `lucide:arrow-right` |  |
| `freccia-sinistra` | `lucide:arrow-left` |  |
| `menu` | `lucide:menu` |  |
| `chiudi` | `lucide:x` |  |
| `chevron-giu` | `lucide:chevron-down` |  |
| `citazione` | `lucide:quote` |  |
| `preventivo` | `lucide:file-text` |  |
| `euro` | `lucide:euro` |  |
| `utenti` | `lucide:users` |  |
| `foto` | `lucide:image` |  |

**Marchi (Simple Icons)**: solo per i link ai profili dell’attività, sono marchi registrati dei rispettivi titolari.

| Alias | Icona | Note |
| --- | --- | --- |
| `whatsapp` | `simple-icons:whatsapp` |  |
| `facebook` | `simple-icons:facebook` |  |
| `instagram` | `simple-icons:instagram` |  |
| `google` | `simple-icons:google` |  |
| `youtube` | `simple-icons:youtube` |  |
| `tiktok` | `simple-icons:tiktok` |  |
| `tripadvisor` | `simple-icons:tripadvisor` |  |

## Altro

- [Primitive UI](ui.md): i componenti di `src/core/ui` con cui sono fatti i blocchi.
- [Ricette tipo](ricette-tipo/README.md): pagine pronte da copiare in `src/content/pages`.
