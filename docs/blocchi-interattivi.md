# Blocchi interattivi

Regole per i blocchi che hanno un comportamento in JavaScript (menu, caroselli, accordion, form...). Un blocco interattivo dichiara `interactive: true` in `meta.ts` e le rispetta tutte. Riferimento: `src/blocks/header/`.

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

## Prima di chiudere un blocco interattivo

- [ ] `npm run build` verde.
- [ ] Prova a 375px e a 1280px, senza scroll orizzontale.
- [ ] Ogni funzione si usa da tastiera; Esc chiude e il focus torna al punto di partenza.
- [ ] Senza JavaScript i contenuti e i link restano raggiungibili.
- [ ] Con più istanze nella stessa pagina (il catalogo) ognuna funziona da sola.
- [ ] Animazioni sotto `motion-safe` o `prefers-reduced-motion: no-preference`.
