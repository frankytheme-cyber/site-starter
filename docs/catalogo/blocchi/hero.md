<!-- Generato da scripts/gen-catalog.ts (npm run gen:catalog): non modificare a mano. -->

# hero — Hero

[← Catalogo](../README.md) · sezione delle ricette (`page`) · v1.4.0 · apertura · interattivo · disegno originale · dal vivo `/catalogo/hero/`

Apertura della pagina: titolo principale, sottotitolo e invito all’azione.

**Quando usarlo:** Come primo blocco di una pagina, per dire subito cosa fa l’attività e cosa può fare chi visita (chiedere un preventivo, prenotare, chiamare).

**Evitare quando:** A metà pagina o più di una volta nella stessa pagina: contiene l’unico h1. Per inviti all’azione intermedi serve un blocco dedicato.

**Varianti:**

- `split` — Testo a sinistra e foto a destra (sotto su mobile). **Quando usarla:** Quasi sempre: equilibrata, va bene per la home di qualsiasi attività che ha una buona foto. Fixture «Split», dal vivo `/catalogo/hero/split/`.

  ![Hero, split, 1280 px](../img/hero-split-desktop.webp)

  <img src="../img/hero-split-mobile.webp" alt="Hero, split, 375 px" width="240">

- `full` — Foto a tutta larghezza con velatura (scura o colorata, campo overlay) e testo chiaro sopra. **Quando usarla:** Quando c’è una foto di grande qualità e si vuole impatto; non con foto piccole o confuse. Fixture «Full», dal vivo `/catalogo/hero/full/`.

  ![Hero, full, 1280 px](../img/hero-full-desktop.webp)

  <img src="../img/hero-full-mobile.webp" alt="Hero, full, 375 px" width="240">

- `slider` — Da 2 a 5 foto con velatura e testo bianco, una alla volta, da sfogliare con frecce, pallini, dito o tastiera; non scorre mai da sola. Il titolo della prima slide è l’h1. **Quando usarla:** Quando l’attività ha più servizi o ambienti da mettere in evidenza subito e foto di qualità per ognuno; con una foto sola usa full. Fixture «Slider», dal vivo `/catalogo/hero/slider/`.

  ![Hero, slider, 1280 px](../img/hero-slider-desktop.webp)

  <img src="../img/hero-slider-mobile.webp" alt="Hero, slider, 375 px" width="240">

- `centered` — Solo testo, centrato, senza foto. **Quando usarla:** Pagine interne (servizi, contatti, note legali) o quando manca una foto adatta. Fixture «Centered», dal vivo `/catalogo/hero/centered/`.

  ![Hero, centered, 1280 px](../img/hero-centered-desktop.webp)

  <img src="../img/hero-centered-mobile.webp" alt="Hero, centered, 375 px" width="240">

**Campi:**

| Campo | Tipo | Obbl. | Limiti | Note |
| --- | --- | --- | --- | --- |
| `variant` | scelta | sì | `split` · `full` · `centered` · `slider` | «Variante» |
| `eyebrow` | testo | no |  | «Occhiello» |
| `title` | testo | sì | max 70 | «Titolo» |
| `subtitle` | testo | no | max 200 | «Sottotitolo» |
| `primaryCta` | gruppo | sì |  | «Pulsante principale» |
| `primaryCta.label` | testo | sì | max 25 | «Testo del pulsante» |
| `primaryCta.href` | testo | sì | un link (/pagina/, #sezione, https://...) oppure @telefono, @whatsapp, @email, @mappa | «Link» |
| `primaryCta.style` | scelta | no | `primary` · `secondary` · `ghost` · `link` | «Stile» |
| `primaryCta.icon` | icona | no | [lista icone](../README.md#icone) | «Icona» |
| `secondaryCta` | gruppo | no |  | «Pulsante secondario» |
| `secondaryCta.label` | testo | sì, se c’è `secondaryCta` | max 25 | «Testo del pulsante» |
| `secondaryCta.href` | testo | sì, se c’è `secondaryCta` | un link (/pagina/, #sezione, https://...) oppure @telefono, @whatsapp, @email, @mappa | «Link» |
| `secondaryCta.style` | scelta | no | `primary` · `secondary` · `ghost` · `link` | «Stile» |
| `secondaryCta.icon` | icona | no | [lista icone](../README.md#icone) | «Icona» |
| `image` | gruppo | per split, full, slider |  | «Foto» · centered non la mostra; nello slider è la foto della prima slide. |
| `image.src` | immagine | sì, se c’è `image` | foto in src/assets/images | «File» |
| `image.alt` | testo | sì, se c’è `image` | min 5 | «Testo alternativo» |
| `imageShape` | scelta | no (predefinito `"verticale"`) | `verticale` · `orizzontale` | «Formato della foto» · Solo per la variante split; nelle altre non ha effetto. |
| `overlay` | scelta | no (predefinito `"scura"`) | `scura` · `colorata` | «Velatura» · Per le varianti full e slider (tutte le slide); nelle altre non ha effetto. |
| `slides` | elenco | per slider | 1–4 voci | «Altre slide» · Le altre varianti la ignorano. |
| `slides[].eyebrow` | testo | no |  | «Occhiello» |
| `slides[].title` | testo | sì, se c’è `slides` | max 70 | «Titolo» |
| `slides[].subtitle` | testo | no | max 200 | «Sottotitolo» |
| `slides[].cta` | gruppo | no |  | «Pulsante» |
| `slides[].cta.label` | testo | sì, se c’è `slides[].cta` | max 25 | «Testo del pulsante» |
| `slides[].cta.href` | testo | sì, se c’è `slides[].cta` | un link (/pagina/, #sezione, https://...) oppure @telefono, @whatsapp, @email, @mappa | «Link» |
| `slides[].cta.style` | scelta | no | `primary` · `secondary` · `ghost` · `link` | «Stile» |
| `slides[].cta.icon` | icona | no | [lista icone](../README.md#icone) | «Icona» |
| `slides[].image` | gruppo | sì, se c’è `slides` |  | «Foto» |
| `slides[].image.src` | immagine | sì, se c’è `slides` | foto in src/assets/images | «File» |
| `slides[].image.alt` | testo | sì, se c’è `slides` | min 5 | «Testo alternativo» |

Nelle note, tra «», l’etichetta del campo nel CMS. Ogni sezione ha anche `type` (`hero`), `id` (ancora facoltativa, in kebab-case), `tone` (`default`, `muted`, `primary`), `background`, l’effetto dello sfondo (`pieno`, `sfumato`, `alone`, `aurora`, `decoro`; [effetti di sfondo](../README.md#effetti-di-sfondo)), ed `edge`, il bordo in alto ([bordi tra sezioni](../README.md#bordi-tra-sezioni)): vedi `src/content/pages/README.md`.

**Regole:**

- Le varianti split, full e slider richiedono la foto (image).
- La variante slider richiede almeno un’altra slide (slides).

**Esempio pronto** (fixture «Split», una sezione per `sections`; immagini relative a `src/content/pages`):

```json
{
	"type": "hero",
	"variant": "split",
	"eyebrow": "Falegnameria su misura",
	"title": "Mobili fatti a mano, pensati per casa tua",
	"subtitle": "Progettiamo e costruiamo mobili su misura e restauriamo quelli di famiglia. Prendiamo le misure a casa tua e ti seguiamo fino al montaggio.",
	"primaryCta": {
		"label": "Chiedi un preventivo",
		"href": "#preventivo"
	},
	"secondaryCta": {
		"label": "Guarda i lavori",
		"href": "#lavori"
	},
	"image": {
		"src": "../../assets/images/fixtures/artigiano-laboratorio.jpg",
		"alt": "Banco da lavoro in legno con martello, scalpello e sega appesi a un pannello forato"
	}
}
```
