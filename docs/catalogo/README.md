<!-- Generato da scripts/gen-catalog.ts (npm run gen:catalog): non modificare a mano. -->

# Catalogo dei blocchi

Documentazione dei blocchi di `src/blocks`, delle primitive, dei temi e delle icone, generata dagli schemi e dalle fixture con `npm run gen:catalog`; gli screenshot li fa `npm run screenshots`, tutti e due `npm run catalog`. `npm run check` fallisce se questi file non corrispondono agli schemi o manca uno screenshot.

Dal vivo: `/catalogo` (tutti i blocchi, con i selettori di palette, font e forma e il JSON di ogni variante da copiare) e `/catalogo/<tipo>/<variante>/` (una variante da sola).

## Blocchi

| Blocco | Tipo | Scope | Categoria | Varianti |
| --- | --- | --- | --- | --- |
| [Hero](blocchi/hero.md) | `hero` | page | apertura | `split`, `full`, `centered` |
| [Invito all’azione](blocchi/cta.md) | `cta` | page | contatti | `banner`, `split-contatto` |
| [Accordion](blocchi/accordion.md) | `accordion` | page | contenuti | `faq`, `contenuti` |
| [Carosello](blocchi/carousel.md) | `carousel` | page | contenuti | `foto`, `card` |
| [Schede](blocchi/tabs.md) | `tabs` | page | contenuti | `testo`, `testo-immagine` |
| [Servizi](blocchi/services.md) | `services` | page | contenuti | `cards-icone`, `cards-immagine`, `alternato`, `schede` |
| [Footer](blocchi/footer.md) | `footer` | layout | navigazione | `colonne`, `minimale` |
| [Header](blocchi/header.md) | `header` | layout | navigazione | `semplice`, `con-cta` |

## Altro

- [Primitive UI](ui.md): i componenti di `src/core/ui`.
- [Temi](temi.md): palette, font e forme, con a cosa si adattano.
- [Icone](icone.md): gli alias ammessi.
- [Ricette tipo](ricette-tipo/README.md): pagine pronte da copiare in `src/content/pages`.

<!-- regole-di-composizione:inizio -->
## Regole di composizione

<!-- Scritta a mano: npm run gen:catalog ricopia questa sezione com'è. Elenco provvisorio, ricavato dalle regole già in AGENTS.md, nel controllo recipes e nelle schede dei blocchi: da sostituire con l'elenco definitivo. -->

Come si mette insieme una pagina con i blocchi del catalogo. Valgono per le ricette scritte a mano, per gli agenti e per chi usa il CMS. Le regole con **(controllo)** le verifica `npm run check` (`recipes`: avvisi, errori con `--strict` nei siti cliente; o la build).

1. **Un solo hero, in apertura.** Ogni pagina si apre con un `hero` e ne ha uno solo: contiene l'unico `h1` della pagina. **(controllo)**
2. **Un invito all'azione, verso la fine.** Di norma una `cta` per pagina, dopo i blocchi che convincono (servizi, lavori, domande); mai più di due, e al massimo una `banner`. Se la pagina chiude con una cta, nel footer lascia spenta la fascia di contatto (`ctaBand`). **(controllo: pagina senza cta)**
3. **Toni alternati.** Due sezioni vicine non hanno lo stesso `tone`; `primary` è il tono più forte: una o due volte per pagina, di solito per la cta. **(controllo)**
4. **Pagine brevi.** Al massimo 12 sezioni; oltre, meglio dividere in più pagine. **(controllo)**
5. **Header e footer non sono sezioni.** Si scelgono una volta per tutto il sito in `src/content/settings/layout.json`. **(controllo: la build li rifiuta nelle ricette)**
6. **Solo blocchi e varianti esistenti.** Si compone con quello che c'è nel catalogo; un blocco nuovo nasce solo in site-starter, su task approvato.
7. **Recapiti mai nei testi.** Telefono, email, indirizzo e P.IVA stanno in `site.json`: nei pulsanti `@telefono`, `@whatsapp`, `@email`, `@mappa`, nelle cta `showContacts`. **(controllo)**
8. **Link che portano da qualche parte.** Solo verso pagine e ancore che esistono; un'ancora è l'`id` di una sezione, in kebab-case e unico nella pagina. **(controllo)**
9. **Varianti con foto solo se le foto ci sono.** hero `split`/`full`, servizi `cards-immagine`/`alternato`, schede `testo-immagine` e carosello vogliono foto vere dell'attività; senza, si usa la variante senza foto (hero `centered`, servizi `cards-icone`, schede `testo`). Ogni foto ha un `alt` che dice cosa mostra, non il nome del file. **(controllo: alt)**
10. **Una sola faq per pagina.** L'accordion `faq` dà a Google i dati strutturati delle domande frequenti: uno per pagina; per altre sezioni da aprire si usa `contenuti`.
11. **Informazioni importanti in vista.** Prezzi, garanzie e ciò che tutti devono leggere non vanno dentro voci chiuse (accordion, schede): meglio un testo aperto.
12. **Testi veri e nei limiti.** Titoli entro 70 caratteri, pulsanti entro 25 (i limiti di ogni campo sono nelle schede dei blocchi); niente segnaposto (`DA-COMPILARE`, lorem) in una pagina pubblicata. **(controllo)**
<!-- regole-di-composizione:fine -->
