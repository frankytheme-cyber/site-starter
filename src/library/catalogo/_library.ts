/** Nome e descrizione della libreria: titolo e descrizione delle pagine del catalogo (anche README e docs/catalogo). */
export const LIBRARY_NAME = 'site-starter';
export const LIBRARY_DESCRIPTION = 'site-starter — libreria di blocchi per siti vetrina';

/** Titolo di una pagina del catalogo: «Icone · Catalogo blocchi · site-starter»; senza argomento, la descrizione. */
export const catalogTitle = (page?: string) => (page ? `${page} · Catalogo blocchi · ${LIBRARY_NAME}` : LIBRARY_DESCRIPTION);
