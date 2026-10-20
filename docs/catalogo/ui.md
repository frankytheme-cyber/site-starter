<!-- Generato da scripts/gen-catalog.ts (npm run gen:catalog): non modificare a mano. -->

# Primitive UI

[← Catalogo](README.md) · dal vivo, in tutti gli stati: `/catalogo/ui`

Componenti di `src/core/ui` con cui sono fatti i blocchi: si usano nei componenti dei blocchi, mai nelle ricette. Le regole dei componenti interattivi sono in `docs/blocchi-interattivi.md`. I pulsanti sono un modulo a parte, `src/core/ui/button/` (componenti, `button.css` con stati e toni, schema `cta.ts`): dal vivo in ogni variante, stato, misura e tono in `/catalogo/bottoni`.

## Accordion

`src/core/ui/Accordion.astro`

Elenco di voci apribili (AccordionItem nello slot), fatto con &lt;details>/&lt;summary>: si apre e
chiude da tastiera e funziona senza JS. single: aprendo una voce si chiudono le altre (con JS;
senza, restano apribili tutte). Regole: docs/blocchi-interattivi.md.

```ts
interface Props {
	single?: boolean;
	class?: string;
}
```

## AccordionItem

`src/core/ui/AccordionItem.astro`

Una voce di Accordion: titolo nel &lt;summary>, contenuto nello slot.

```ts
interface Props {
	title: string;
	/** Aperta al caricamento. */
	open?: boolean;
}
```

## Button

`src/core/ui/button/Button.astro`

Pulsante o link d'azione. Con href è un &lt;a>, altrimenti un &lt;button>. Aspetto e stati (hover,
focus, active, disabled) stanno in button.css: .btn con data-variant e data-size.
href accetta anche @telefono, @whatsapp, @email, @mappa (risolti da site.json, core/links.ts);
i link esterni si aprono in una nuova scheda con rel="noopener". Un mailto: (@email) passa da
EmailLink: l'indirizzo non è in chiaro nell'HTML e il pulsante compare solo con JavaScript.
disabled: &lt;button disabled>, o un &lt;a> senza href con aria-disabled (non si apre e non prende il focus).

Tono: dentro una Section i token si adattano già al suo data-tone (base.css), quindi su
tone primary il pulsante pieno diventa chiaro da solo. La prop tone serve a dichiararlo quando il
pulsante sta su un fondo primary fuori da una Section primary.

```ts
interface Props {
	href?: string;
	/** primary: pieno · secondary: bordato · ghost: solo testo, sfondo al passaggio · link: sottolineato. */
	variant?: ButtonStyle;
	size?: 'sm' | 'md' | 'lg';
	icon?: IconName;
	iconPosition?: 'start' | 'end';
	tone?: Tone;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	class?: string;
	/** data-state="hover|focus|active|disabled" forza uno stato: solo nel catalogo (/catalogo/bottoni). */
	[attribute: `data-${string}` | `aria-${string}`]: string | boolean | undefined;
}
```

## Carousel

`src/core/ui/Carousel.astro`

Carosello a scorrimento orizzontale (scroll-snap): si scorre col dito, col trackpad o con la
tastiera sulla traccia. Con JS aggiunge frecce e pallini (aria-label, pallino attivo con
aria-current). Niente scorrimento automatico. Le slide sono CarouselSlide nello slot.
Regole: docs/blocchi-interattivi.md.

```ts
interface Props {
	/** Nome del carosello per gli screen reader. */
	label: string;
	class?: string;
}
```

## CarouselSlide

`src/core/ui/CarouselSlide.astro`

Una slide di Carousel. width: quanto spazio occupa nella traccia.

```ts
interface Props {
	/** full: una alla volta · wide: quasi una, due da md · card: una e un pezzo, due da sm, tre da lg. */
	width?: 'full' | 'wide' | 'card';
	class?: string;
}
```

## Container

`src/core/ui/Container.astro`

larghezza massima e margini laterali.

Nessuna prop.

## CtaButton

`src/core/ui/button/CtaButton.astro`

Un valore dello schema cta (cta.ts) come Button: stile della cta o quello
previsto dal blocco, icona prima del testo (le frecce dopo).

```ts
interface Props {
	cta: Cta;
	/** Stile se la cta non ne indica uno. */
	defaultStyle?: ButtonStyle;
	size?: 'sm' | 'md' | 'lg';
	tone?: Tone;
	class?: string;
}
```

## EmailLink

`src/core/ui/EmailLink.astro`

Link email che non scrive l'indirizzo in chiaro nell'HTML: niente «nome@dominio» né «mailto:»
per i bot che raccolgono indirizzi da riempire di spam. L'indirizzo sta in data-email-link,
al contrario e in base64; lo script lo rimette nel testo e nell'href al caricamento.

Senza JavaScript: con showAddress si legge «nome chiocciola dominio» come testo, senza link;
senza showAddress (i pulsanti, dove il testo è lo slot) il link parte hidden con data-js-only e
lo mostra lo script, come gli altri controlli che senza JS non funzionano.
Non è una protezione assoluta: un bot che esegue JavaScript l'indirizzo lo trova.

```ts
interface Props {
	email: string;
	/** Scrive l'indirizzo dopo lo slot (link di testo). false: il testo è solo lo slot (pulsanti). */
	showAddress?: boolean;
	class?: string;
	[attribute: `data-${string}` | `aria-${string}`]: string | boolean | undefined;
}
```

## Icon

`src/core/ui/Icon.astro`

Icona SVG inline dalla lista chiusa di core/icons.ts. Il colore è sempre currentColor:
prende quello del testo intorno (text-primary sul contenitore per colorarla).

```ts
interface Props {
	name: IconName;
	/** sm 16px (nel testo) · md 20px (pulsanti, liste) · lg 24px (card, elenchi di servizi) · xl 48px (al posto di una foto). */
	size?: 'sm' | 'md' | 'lg' | 'xl';
	/**
	 * Senza label l'icona è decorativa e nascosta agli screen reader. Serve quando l'icona
	 * porta un'informazione che non è già nel testo, es. è l'unico contenuto di un link.
	 */
	label?: string;
	class?: string;
}
```

## Img

`src/core/ui/Img.astro`

wrapper di `<Image>`, alt obbligatorio.

```ts
interface Props {
	/** Immagine risolta: image() di una collezione o file importato. */
	src: ImageMetadata;
	/** Obbligatorio. Stringa vuota solo per immagini puramente decorative. */
	alt: string;
	/** constrained: non supera la larghezza originale · full-width: riempie sempre il contenitore. */
	layout?: 'constrained' | 'full-width';
	sizes?: string;
	/** Per l'immagine principale above the fold (es. hero): caricata subito, con priorità alta. */
	priority?: boolean;
	class?: string;
}
```

## Section

`src/core/ui/Section.astro`

Radice di ogni blocco: tono, spaziatura verticale e Container.
Lo slot "background" ospita media a tutta larghezza dietro al contenuto (es. foto con velatura).

```ts
interface Props {
	id?: string;
	/** default: bg · muted: surface · primary: primary (i token del contenuto si adattano, vedi base.css). */
	tone?: 'default' | 'muted' | 'primary';
	/** Elemento radice: section, oppure header e footer per intestazione e piede del sito. */
	as?: 'section' | 'header' | 'footer';
	/** Senza spaziatura verticale: per i blocchi che regolano da sé l'altezza (es. header). */
	flush?: boolean;
	/**
	 * Resta in cima durante lo scroll. Si aggancia sotto --sticky-offset (default 0), che la
	 * pagina può impostare se ha già un'altra barra fissa in alto.
	 */
	sticky?: boolean;
	class?: string;
	/** Attributi data-* per gli script dei blocchi interattivi, aria-* (es. aria-labelledby per una regione). */
	[attribute: `data-${string}` | `aria-${string}`]: string | boolean | undefined;
}
```

## Tabs

`src/core/ui/Tabs.astro`

Schede (pattern ARIA tablist/tab/tabpanel). Il contenuto di ogni scheda è lo slot "panel-&lt;n>",
nell'ordine di tabs:
  &lt;Tabs label="Servizi" tabs={['Interni', 'Esterni']}>
    &lt;Fragment slot="panel-0">...&lt;/Fragment>
    &lt;Fragment slot="panel-1">...&lt;/Fragment>
  &lt;/Tabs>
Da md in su: schede con frecce, Home/End e tabindex mobile (con JS); senza JS i pannelli uno dopo
l'altro, ognuno col suo titolo. Sotto md: Accordion, che funziona anche senza JS.
Regole: docs/blocchi-interattivi.md.

```ts
interface Props {
	/** Nome dell'insieme di schede per gli screen reader (aria-label del tablist). */
	label: string;
	/** Etichette delle schede, nell'ordine degli slot panel-0, panel-1... */
	tabs: string[];
	/** Livello del titolo di ogni pannello quando le schede sono in sequenza (senza JS). */
	headingLevel?: 2 | 3 | 4;
	class?: string;
}
```
