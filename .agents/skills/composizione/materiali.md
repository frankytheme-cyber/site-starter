# Varianti dal materiale

Consulta le righe pertinenti quando scegli le sezioni; verifica campi e limiti correnti con `npm run catalog:query -- <blocco>`.

| Se c'è | Usa | Se manca |
| --- | --- | --- |
| una foto forte di un lavoro, del locale o delle persone | hero `split` (`imageShape: "orizzontale"` per una foto larga); `full` solo se la foto regge il testo sopra | hero `centered`, `editoriale` o `manifesto` secondo gerarchia e lunghezza del messaggio |
| una foto per quasi ogni servizio | services `cards-immagine` (ai servizi senza foto basta l'icona), o `alternato` nella pagina dei servizi | services `cards-icone`, `elenco` o `editoriale`: le ultime due non richiedono neppure icone |
| almeno 4 foto vere di lavori | gallery `griglia-popup` (fino a 12 per blocco; `showCaptions` se le didascalie contano) | niente gallery |
| coppie prima e dopo con la stessa inquadratura | gallery `prima-dopo` (fino a 6 coppie) | — |
| da 3 a 8 foto di qualità da guardare in grande | gallery `slider` | — |
| progetti o casi da raccontare, ognuno con foto e testo | carousel `immagini-testo` | — |
| una foto vera del titolare, della squadra o della sede | about `immagine-testo` | about `con-numeri`, o niente about |
| da 2 a 4 numeri con la fonte | about `con-numeri` | niente numeri |
| recensioni reali con autore e fonte | testimonials `cards` (2-6), `slider` (3-10) o `singola` (una forte) | niente recensioni |
| punti di forza dimostrabili | features `3-colonne` (3 o 6 brevi) o `lista` (4-5, o più lunghi) | niente features |
| un percorso dal primo contatto alla fine del lavoro | process `passi-numerati` (3, 4 o 6 passi) o `timeline` (5 passi, o testi lunghi) | — |
| alternative parallele tra cui chi visita sceglie (pranzo o cena, privati o imprese) | tabs `testo`, o `testo-immagine` con una foto per scheda | — |
| domande vere con la risposta nel brief | accordion `faq`, una per pagina | niente faq |
| comuni serviti | areas `elenco-zone`, o `mappa-link` se c'è anche una sede da raggiungere | — |
| una sede da visitare (negozio, studio, locale) | contact `info-mappa` | contact `info-cta` (a domicilio, su appuntamento) |
| invio dei moduli configurato (`docs/form.md`) e informativa privacy approvata | form `contatto` o `preventivo` | cta con `@telefono`, `@whatsapp`, `@email` |

Foto solo da `src/assets/images/`, mai dalle fixture. Se mancano immagini nel brief, usa [placeholder dichiarati](../nuovo-sito/immagini-placeholder.md) per illustrare aperture, servizi e presentazioni generiche: la tabella si legge anche su questi materiali. I ripieghi senza foto sono per direzioni volutamente tipografiche o immagini non pertinenti. Per lavori, persone e sede servono sempre foto vere: i placeholder non le sostituiscono come prove.
