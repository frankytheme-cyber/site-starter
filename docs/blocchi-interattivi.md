# Blocchi interattivi

Regole per i blocchi che hanno un comportamento in JavaScript (menu, caroselli, accordion, form...). Un blocco interattivo dichiara `interactive: true` in `meta.ts` e le rispetta tutte. Riferimenti: `src/blocks/header/` e le primitive `Accordion`, `Tabs`, `Carousel` di `src/core/ui/` (sezione 8): prima di scrivere JS nuovo, usa quelle.

## 1. JavaScript vanilla, nel componente

- Lo script sta in un `<script>` dentro il componente `.astro`: Astro lo raggruppa e lo carica una volta sola, anche se il blocco compare più volte nella pagina.
- Nessuna libreria e nessun framework (niente React, Alpine, jQuery, Swiper...). Si usano le API del browser: `<dialog>`, `IntersectionObserver`, `matchMedia`, `ResizeObserver`.
- Lo script trova le istanze con un attributo (`document.querySelectorAll('[data-header]')`) e lavora dentro ciascuna. Niente variabili globali né id cablati.
- Gli attributi `data-*` usati dallo script hanno il prefisso del blocco (`data-header-menu`, non `data-menu`), così due blocchi non si pestano i piedi.
- Gli id che servono ad ARIA (`aria-controls`) si generano con `nextId(Astro.request, 'header')` di `@/core/ids`: sono unici nella pagina anche con più istanze.
- Niente listener continui su `scroll` o `resize`: per "quando l'utente ha scorso di X" si usa `IntersectionObserver` su un elemento sentinella; per i cambi di layout, `matchMedia(...).addEventListener('change')`.

## 2. Progressive enhancement

La pagina deve funzionare anche senza JavaScript: lo script migliora l'esperienza, non la rende possibile.

- Ogni contenuto e ogni link sono nell'HTML generato in build, mai creati dallo script.
- I controlli che senza JS non fanno nulla (es. il pulsante hamburger) partono con l'attributo `hidden` e un marcatore `data-js-only`; lo script li mostra all'avvio.
- Lo script segna l'istanza come attiva (`data-js`); il CSS di fallback vale solo senza quel segno. Nell'header, senza JS i sottomenu si aprono con hover e `:focus-within`, e su mobile le voci compaiono sotto la barra dentro un `<noscript>`.
- Per provare: carica la pagina in un `<iframe sandbox="allow-same-origin">` (senza `allow-scripts`) o disattiva JavaScript nel browser.

## 3. Tastiera

- Tutto ciò che si fa col mouse si fa anche da tastiera; mai solo hover.
- Per aprire e chiudere si usa un vero `<button type="button">` con `aria-expanded` e `aria-controls`: Invio e Spazio funzionano da soli.
- Esc chiude il pannello aperto (sottomenu, menu, finestra) e riporta il focus su chi l'ha aperto.
- Un pannello si chiude anche quando il focus esce col Tab o si fa click fuori.
- Per i menu di navigazione si usa lo schema "disclosure" (pulsante + elenco di link), non `role="menu"`: quello è per i menu delle applicazioni e cambia il comportamento delle frecce per chi usa uno screen reader.
- I target toccabili misurano almeno 44×44 px (`min-h-11`, `size-11`).

## 4. Focus

- Il focus è sempre visibile: si usa lo stile globale `:focus-visible` di `base.css` (o l'anello di `Button`), mai `outline: none` senza un'alternativa.
- Le finestre modali usano `<dialog>` aperto con `showModal()`: il browser intrappola il focus, rende inerte il resto della pagina e chiude con Esc.
- Alla chiusura il focus torna sul controllo che ha aperto il pannello. Nell'header ci pensa l'evento `close` del dialog, che arriva da qualunque chiusura (Esc, pulsante, fondo, voce, passaggio a desktop).
- Mentre una modale è aperta lo scroll della pagina è bloccato (`overflow-hidden` su `<html>`) e si sblocca alla chiusura.
- Lo stato si dice anche ad ARIA: `aria-expanded` sui pulsanti, `aria-current="page"` sulla voce della pagina aperta, `aria-label` sulle icone senza testo (`<Icon label="..." />`).

## 5. Movimento ridotto

- Le animazioni partono solo se chi visita non ha chiesto di ridurle: classi `motion-safe:` di Tailwind, oppure `@media (prefers-reduced-motion: no-preference)` nel CSS.
- Con il movimento ridotto il risultato finale è lo stesso, arriva senza animazione.
- Durata breve (fino a 200–300 ms); niente parallax, rimbalzi o effetti legati allo scroll.

## 6. Niente autoplay

- Niente che parta o si muova da solo: caroselli e slider avanzano solo con un comando di chi visita.
- Video senza autoplay; se servono come sfondo, senza audio, con un pulsante di pausa e fermi con il movimento ridotto.
- Niente popup, banner o finestre che si aprono da soli dopo un tempo o allo scroll.

## 7. Stile e contenuti

- Solo classi semantiche, come negli altri blocchi. Gli stati si esprimono con varianti Tailwind sugli attributi (`group-data-[open]/item:rotate-180`, `aria-[current=page]:text-primary`) o con una classe messa dallo script (`is-compact`).
- Il CSS che non si può scrivere con le classi (fallback senza JS, keyframes) va in `<style is:global>` con selettori sugli attributi `data-*` del blocco.
- Dati dell'attività e menu non stanno nello schema del blocco: si leggono con `getSiteSettings()` e `getNavigation()`.

## 8. Primitive interattive

In `src/core/ui/`, già conformi a queste regole e provate da `npm run qa` (check `interactive`). Si vedono in `/catalogo/ui`.

| Primitiva | Struttura e ARIA | Tastiera | Senza JS | Movimento |
| --- | --- | --- | --- | --- |
| `Accordion` + `AccordionItem` | `<details>`/`<summary>`; `single` chiude le sorelle all'apertura | Invio e Spazio sul titolo (nativi) | Funziona tutto; con `single` restano apribili più voci | Dissolvenza solo quando chi visita apre una voce, non al caricamento; niente con movimento ridotto |
| `Tabs` | Da `md`: `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`, `tabindex` mobile (0 sulla scheda attiva, −1 sulle altre). Sotto `md`: `Accordion` | Frecce sinistra/destra (a giro), Home, End; la scheda si attiva spostandosi | Pannelli uno dopo l'altro, ognuno col suo titolo | — |
| `Carousel` + `CarouselSlide` | `aria-roledescription="carosello"` con nome; slide `role="group"` `aria-roledescription="slide"` «N di M»; frecce con `aria-label`, pallini «Vai alla posizione N di M», attivo con `aria-current` | Traccia focalizzabile: frecce della tastiera per scorrere; frecce e pallini sono pulsanti | Scorrimento con swipe, trackpad o tastiera; frecce e pallini non compaiono | Nessun autoplay; scorrimento morbido solo senza movimento ridotto; slide attiva con `IntersectionObserver` |
| `Button` | `<a>` con `href`, altrimenti `<button>`; link esterni in nuova scheda con `rel="noopener"` e testo «(si apre in una nuova scheda)» per gli screen reader | Nativa | — | — |

Il contenuto di `Tabs` si passa negli slot `panel-0`, `panel-1`... e viene usato due volte (accordion sotto `md`, pannelli da `md`): niente `id` dentro i pannelli.

## Prima di chiudere un blocco interattivo

- [ ] `npm run build` verde.
- [ ] Prova a 375px e a 1280px, senza scroll orizzontale.
- [ ] Ogni funzione si usa da tastiera; Esc chiude e il focus torna al punto di partenza.
- [ ] Senza JavaScript i contenuti e i link restano raggiungibili.
- [ ] Con più istanze nella stessa pagina (il catalogo) ognuna funziona da sola.
- [ ] `npm run qa` verde: il check `interactive` prova header, accordion, tabs e carousel; un componente interattivo nuovo aggiunge il suo test in `scripts/checks/interactive.ts`.
- [ ] Animazioni sotto `motion-safe` o `prefers-reduced-motion: no-preference`.
