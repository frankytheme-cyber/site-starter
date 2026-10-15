# Primitive UI

Componenti senza contenuto proprio, solo struttura e classi semantiche, con cui sono fatti i blocchi. Si vedono in tutti gli stati in `/catalogo/ui`.

- `Section`: radice di ogni blocco (tono, spaziatura, Container, slot `background`; `as="header"`/`as="footer"`, `flush` e `sticky` per intestazione e piede del sito; attributi `data-*` e `aria-*`).
- `Container`: larghezza massima e margini laterali.
- `button/`: il modulo dei pulsanti, in ogni variante, stato, misura e tono su `/catalogo/bottoni`.
  - `Button.astro`: varianti `primary`, `secondary`, `ghost`, `link`; misure `sm`, `md`, `lg`; `icon` con `iconPosition`; `<a>` con `href`, altrimenti `<button>`; `disabled` (sui link `aria-disabled`, senza `href`). `href` accetta `@telefono`, `@whatsapp`, `@email`, `@mappa` (risolti da site.json, `core/links.ts`; se il dato manca la build si ferma). Link esterni in nuova scheda con `rel="noopener"`. `tone` per i pulsanti su fondo primary fuori da una Section primary.
  - `button.css` (importato da `src/themes/base.css`): `.btn` con `data-variant` e `data-size`. Hover: primary → `primary-hover`; secondary → bordo pieno e fondo tenue; ghost → fondo tenue; link → colore `primary-hover` e sottolineatura più spessa. primary, secondary e ghost mai sottolineati, con una regola fuori dai layer che batte anche un `a:hover` globale. Focus da tastiera con anello e stacco (nessun anello al click), active 1px più in basso, disabled opaco senza hover, transizioni di 150ms solo senza movimento ridotto. Su tone muted e primary il fondo tenue cambia per restare AA. `data-state="hover|focus|active|disabled"` forza uno stato: solo nel catalogo.
  - `CtaButton.astro`: un valore dello schema `cta` come Button.
  - `cta.ts`: schema `cta` delle props dei blocchi e del menu, stili ammessi (`BUTTON_STYLES`) e link speciali (`SPECIAL_HREFS`).
- `Icon`: SVG inline dagli alias di `core/icons.ts`, `sm`/`md`/`lg`, `label` per le icone non decorative.
- `Img`: wrapper di `<Image>`, alt obbligatorio.
- `Accordion` + `AccordionItem`, `Tabs`, `Carousel` + `CarouselSlide`: interattivi, regole e tastiera in `docs/blocchi-interattivi.md`.
