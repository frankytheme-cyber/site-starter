---
name: revisione-visiva
description: Usala dopo aver composto o cambiato le pagine di un sito cliente, o un blocco della libreria, per guardarle a 375 e 1280 px e correggerle prima di mostrarle a Simone.
---

# Revisione visiva

Si guarda la pagina disegnata, non il JSON. `npm run qa` trova gli errori (contrasto, link, accessibilità); questa revisione trova le scelte deboli, quelle che Simone noterebbe per prime. Vale nei siti cliente e nella libreria.

## Passi

1. **Screenshot** delle pagine, con un'immagine per sezione:

   ```sh
   npm run design:shots -- --sezioni                         # tutte le pagine
   npm run design:shots -- --pagine index,servizi --sezioni  # solo alcune
   ```

   In `reports/design/<data-ora>/<tema>/`, per ogni pagina a 1280 (`desktop`) e 375 px (`mobile`): `-apertura` (la prima schermata), `-panoramica` (la pagina intera rimpicciolita) e `-NN-<tipo>` (le sezioni, numerate come nella ricetta). Apri le immagini e guardale davvero: prima la panoramica, poi l'apertura, poi ogni sezione. `-intera` è a grandezza vera, per `index.html`.

2. **Prima impressione**, sull'apertura a 375 e 1280 px: in cinque secondi si capisce cosa fa l'attività, dove, e cosa fare (una sola azione principale)? Se ci sono foto vere, la hero mostra il lavoro?

3. **Rispondi per iscritto** a ogni domanda, pagina per pagina; per ogni no, il punto preciso e la correzione.
   - **Materiale.** Uso tutte le foto adatte di `src/assets/images/`? Varianti con foto dove le foto ci sono (hero `split` o `full`, servizi `cards-immagine` o `alternato`, gallery)? Nessuna foto ripetuta senza motivo, nessuna tagliata male?
   - **Gerarchia.** Un solo punto forte per schermata? I titoli dicono qualcosa di questa attività («Imbiancature a Firenze e provincia», non «I nostri servizi» o «Galleria» da soli)?
   - **Ritmo.** Toni alternati con misura (`primary` una o due volte), effetti di sfondo dove servono (apertura, un punto chiave, invito finale), sezioni di lunghezza diversa? Sei blocchi uguali di fila stancano.
   - **Settore.** Accanto a due o tre buoni siti dello stesso settore e della stessa zona, regge? Si distingue? Se puoi navigare, guardane qualcuno; altrimenti chiedi a Simone un riferimento.
   - **Fiducia.** Recapiti, zona servita, foto vere, recensioni con la fonte: si trovano senza cercarli?
   - **Testi.** Titoli al massimo su due righe a 375 px, nessuna parola sola sull'ultima riga, descrizioni che non ripetono il titolo, niente frasi fatte («qualità e professionalità», «a 360 gradi»).
   - **Mobile.** A 375 px la pagina è composta, non un desktop schiacciato: immagini leggibili, pulsanti facili da toccare, nessuna sezione infinita.
   - **Coerenza.** Foto con lo stesso trattamento, icone dello stesso stile, la stessa voce in tutte le pagine.

4. **Correggi** con quello che la ricetta permette: variante, tono, `background`, `edge`, ordine e numero delle sezioni, testi, scelta e ordine delle foto. In un sito non si toccano blocchi né CSS: se il difetto è del blocco, segnalalo a Simone come lavoro per la libreria.

5. **Rifai gli screenshot** e ricomincia dal passo 2. Almeno due passate; ti fermi quando una passata non trova niente oltre il dettaglio.

6. **Mostra a Simone** cosa hai trovato e corretto (prima e dopo per i punti principali), cosa resta e cosa servirebbe: una foto, un dato, una variante nuova.

## Nella libreria

Per un blocco nuovo o cambiato, la sua pagina del catalogo (tutte le varianti e le fixture) su un campione di temi, invece di tutte le combinazioni:

```sh
npm run design:shots -- --sezioni --percorsi /catalogo/<tipo>/ \
  --tema terracotta,classico,morbido --tema cobalto,moderno,squadrato --tema notte,carattere,arrotondato \
  --tema cipria,elegante,arrotondato --tema antracite,robusto,squadrato --tema salvia,amichevole,morbido
```

Il campione copre fondi caldi, freddi e scuri, font con grazie, sottili e stretti, e le tre forme. Confronta con i blocchi di riferimento (`hero`, `services`, `cta`): spazi, gerarchia dei titoli, pulsanti. I toni sono quelli delle fixture: se ne manca uno importante, aggiungi una fixture.

## Criterio di fine

Due passate, l'ultima senza difetti oltre il dettaglio; risposte scritte alle domande del passo 3; `npm run qa` senza errori; Simone ha visto le immagini finali.

## Non fare

- Non dire «nessun difetto» senza aver risposto alle domande del passo 3.
- Non correggere scrivendo CSS, componenti o pagine `.astro` nel sito: si cambia la ricetta, o si porta il caso nella libreria.
- Non inventare dati per riempire una sezione: un dato che manca si chiede a Simone.
