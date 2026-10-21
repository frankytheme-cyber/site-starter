---
name: testi-sito
description: Usala per scrivere o rivedere i testi di un sito cliente (titoli, sottotitoli, servizi, inviti, domande, titolo e descrizione per Google) partendo dai fatti del brief e nel tono dell'attività.
---

# Testi del sito

Per l'agente che compone un sito cliente con Simone. Due siti con temi diversi sembrano uguali se dicono le stesse cose: i testi si scrivono con i fatti di questa attività, non con frasi che andrebbero bene per tutte.

## Prima di scrivere

1. **Fatti.** Dal brief (sezioni 2-5) e da `docs/sito.md` fai una lista di fatti concreti: i servizi con cosa comprendono, materiali e tecniche, zone, clienti, da quando, come si lavora (sopralluogo, preventivo, tempi), cosa distingue l'attività. Ne servono almeno 8: con meno, chiedi a Simone prima di scrivere, perché da pochi fatti escono testi generici.
2. **Tono** dal brief (sezione 4). Decidi una volta sola tu o voi verso chi visita, e noi o io per l'attività, e tienili in tutto il sito.
3. **Parole del cliente.** I servizi si chiamano come li cerca chi visita («imbiancatura», «sostituzione della caldaia»), non con il gergo del mestiere. Gli stessi nomi nel menu, nei servizi, negli inviti e nei titoli per Google.

## Regole

- **Concreto.** «Rasatura e pittura antimuffa per bagni e cucine» dice più di «Lavori di qualità»: un fatto vale più di tre aggettivi.
- **Solo fatti verificabili.** Niente superlativi («i migliori», «il numero uno»); niente numeri, garanzie, tempi o prezzi che il brief non dà; niente urgenza finta («ultimi posti», «solo oggi»).
- **Il test del concorrente.** Se un titolo andrebbe bene anche per un concorrente, riscrivilo con un fatto, un luogo o un dettaglio di questa attività.
- **Frasi brevi:** un'idea per frase, di solito meno di 20 parole; parole comuni; niente inglese quando c'è la parola italiana.
- **Niente ripetizioni:** una descrizione non ripete il suo titolo, una sezione non ripete quella prima.
- **Forma:** maiuscola solo a inizio frase e nei nomi propri («I nostri lavori», non «I Nostri Lavori»); niente parole in maiuscolo per enfasi né punti esclamativi; accenti giusti (è, perché, più).
- **Recapiti mai nei testi:** telefono, email e indirizzo li mostrano i blocchi da `site.json`; nei pulsanti si usano `@telefono`, `@whatsapp`, `@email`, `@mappa`.
- **Lunghezze.** I limiti delle schede (`docs/catalogo/blocchi/<tipo>.md`, colonna «Limiti») sono il massimo, non l'obiettivo. A 375 px un titolo della hero di 40 caratteri occupa già due o tre righe e un titolo di sezione di 45 ne occupa due: scrivi più corto, poi controlla con gli screenshot.

## Campo per campo

| Campo | Come | Esempio |
| --- | --- | --- |
| Titolo della hero (`title`) | Cosa fa e dove, o il risultato per chi visita; entro 40 caratteri | «Imbiancature e finiture a Firenze» |
| Occhiello (`eyebrow`) | Mestiere, zona o clienti in 2-4 parole; non ripete il titolo | «Dal 1998 in Valdarno», se l'anno è nel brief |
| Sottotitolo della hero (`subtitle`) | Per chi, come, cosa la distingue: una o due frasi | «Interni ed esterni per case e negozi, con sopralluogo e preventivo scritto prima di cominciare.» |
| Pulsanti (`label`) | Verbo e oggetto, entro 25 caratteri; il principale è l'azione del brief | «Chiedi un preventivo», «Chiama ora», «Prenota un tavolo», «Guarda i lavori» |
| Titoli di sezione | Il contenuto con le parole del cliente | «Pareti, facciate e infissi» al posto di «I nostri servizi»; «Lavori finiti a Firenze» al posto di «Galleria» |
| Introduzioni (`intro`) | Una frase che aggiunge qualcosa al titolo; se non aggiunge niente, il campo resta vuoto | — |
| Servizi | Titolo: il servizio in 2-4 parole. Testo: cosa comprende e per chi, una o due frasi | «Facciate»: «Lavaggio, ripristino dell'intonaco e pittura ai silossani per condomini e case singole.» |
| Punti di forza | Un fatto per voce, non un aggettivo | «Preventivo scritto dopo il sopralluogo» al posto di «Serietà» |
| Chi siamo | Chi, da quando, dove, come lavora: una storia breve fatta di fatti | — |
| Come lavoriamo | Da 3 a 6 passi dal primo contatto alla fine: cosa succede e cosa fa il cliente; tempi solo se garantiti | «Sopralluogo»: «Veniamo a vedere, prendiamo le misure e ti diciamo cosa serve.» |
| Domande frequenti | Le domande che i clienti fanno davvero (prezzi, tempi, zone, pagamenti, garanzie) con la risposta del brief; senza risposta la domanda non va | — |
| Recensioni | Solo testi reali, con autore e fonte; se una è troppo lunga, scegline un'altra o un estratto fedele con «…» | — |
| Invito finale (cta) | Titolo: una domanda o una proposta concreta. Testo: cosa succede dopo il contatto | «Hai una parete da rinfrescare?»: «Ti richiamiamo per fissare il sopralluogo.» |
| Titolo per Google (`title` della pagina) | Servizio e città, poi il nome; entro 60 caratteri, diverso per ogni pagina | «Imbianchino a Firenze · <nome dell'attività>» |
| Descrizione per Google (`description`) | Cosa, dove, per chi e un invito; entro 160 caratteri, diversa per ogni pagina | — |
| Testo alternativo delle foto (`alt`) | Cosa si vede, con il dettaglio utile; mai il nome del file o parole chiave in fila | «Soggiorno con pareti verde salvia appena tinteggiate» |

## Frasi da evitare

Vanno bene per chiunque, quindi non dicono niente: «qualità e professionalità», «serietà e competenza», «passione e dedizione», «a 360 gradi», «soluzioni su misura» (senza dire quali), «il cliente al centro», «leader del settore», «eccellenza», «da sempre», «personale qualificato» (senza dire quale qualifica), «prezzi competitivi», «non esitare a contattarci», «siamo lieti di», «benvenuti nel nostro sito», «servizi a tutto tondo», «innovativo», «mission», «team» (c'è «squadra»), «customer care». Dove sembra servirne una, al suo posto va un fatto.

## Passi

1. Lista dei fatti, tono e nomi dei servizi, come sopra.
2. Scrivi pagina per pagina nelle ricette, partendo da hero e invito finale: sono i testi più letti.
3. Rileggi tutto il sito di fila, come chi lo visita: ripetizioni tra sezioni e pagine, nomi diversi per la stessa cosa, frasi da evitare. Le più comuni si trovano anche così:

   ```sh
   rg -n -i "qualità e professionalità|a 360 gradi|passione e dedizione|leader|eccellenza|prezzi competitivi|non esitare|siamo lieti|benvenuti" src/content/pages/*.json
   ```

4. `npm run check:recipes`: limiti dei campi, recapiti scritti nei testi, segnaposto.
5. Delega la verifica delle lunghezze alla stessa acquisizione della skill `revisione-visiva`: `npm run design:shots -- --pagine <pagine-cambiate> --sezioni --riusa`. Se le immagini correnti sono già disponibili, guardale senza rifarle. A 375 px i titoli di sezione stanno su due righe, quello della hero su tre al massimo, e nessuna parola resta sola sull'ultima riga.
6. Mostra a Simone hero, titoli di sezione e inviti di ogni pagina: conosce il cliente e il suo modo di parlare.

## Criterio di fine

Ogni testo usa fatti del brief o di Simone; nessuna frase da evitare; stessi nomi e stesso tono in tutto il sito; `npm run check:recipes` senza errori; Simone ha letto i testi principali.

## Non fare

- Non inventare fatti, numeri, recensioni, garanzie o tempi per riempire un campo: un campo facoltativo resta vuoto, per uno obbligatorio chiedi a Simone.
- Non riassumere né riscrivere le recensioni.
- Non scrivere i testi legali (privacy, cookie): li fornisce Simone.
- Non riempire titoli e testi di parole chiave per Google: si scrive per chi legge.
