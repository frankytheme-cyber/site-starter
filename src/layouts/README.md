# Layout

Layout di pagina. `BaseLayout.astro` definisce lo scheletro HTML, importa il tema e scrive i metadati (canonical, Open Graph, JSON-LD `LocalBusiness` con indirizzo e orari da `site.json`).

Disegna anche i blocchi di layout da `src/content/settings/layout.json`: `header` in cima, il contenuto della pagina in `<main>`, `footer` in fondo. Il catalogo li toglie con `siteLayout={false}`: ha la sua barra e il suo `<main>`.
