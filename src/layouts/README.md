# Layout

Layout di pagina. `BaseLayout.astro` definisce lo scheletro HTML, importa il tema e scrive i metadati (canonical, Open Graph, JSON-LD `LocalBusiness` con indirizzo e orari da `site.json`).

Disegna anche i blocchi di layout da `src/content/settings/layout.json`: `header` in cima, il contenuto della pagina in `<main>`, `footer` in fondo. Il catalogo li toglie con `siteLayout={false}`: ha la sua barra e il suo `<main>`. Solo nella libreria (`import.meta.env.LIBRARY_MODE`, da `src/core/integrations/library.ts`) passa all'header la voce «Catalogo» (`CATALOG_NAV_ITEM` di `src/core/navigation.ts`, con Blocchi, Bottoni, Icone e UI) in coda a quelle di `navigation.json`; nei siti cliente la voce non esiste.
