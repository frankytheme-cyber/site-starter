# Primitive UI

Componenti senza contenuto proprio, solo struttura e classi semantiche, con cui sono fatti i blocchi. Si vedono in tutti gli stati in `/catalogo/ui`.

- `Section`: radice di ogni blocco (tono, spaziatura, Container, slot `background`; `as="header"`/`as="footer"`, `flush` e `sticky` per intestazione e piede del sito; attributi `data-*` e `aria-*`).
- `Container`: larghezza massima e margini laterali.
- `Button`: varianti `primary`, `secondary`, `ghost`, `link`; misure `sm`, `md`, `lg`; `icon` con `iconPosition`; `<a>` con `href`, altrimenti `<button>`. `href` accetta `@telefono`, `@whatsapp`, `@email`, `@mappa` (risolti da site.json, `core/links.ts`; se il dato manca la build si ferma). Link esterni in nuova scheda con `rel="noopener"`. `tone` per i pulsanti su fondo primary fuori da una Section primary.
- `CtaButton`: un valore dello schema `cta` (`core/schemas/cta.ts`) come Button.
- `Icon`: SVG inline dagli alias di `core/icons.ts`, `sm`/`md`/`lg`, `label` per le icone non decorative.
- `Img`: wrapper di `<Image>`, alt obbligatorio.
- `Accordion` + `AccordionItem`, `Tabs`, `Carousel` + `CarouselSlide`: interattivi, regole e tastiera in `docs/blocchi-interattivi.md`.
