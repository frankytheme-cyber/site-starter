---
name: redirect
description: Usala quando un sito cliente ne sostituisce uno già online, per proporre a Simone la mappa dei redirect dai vecchi indirizzi alle pagine nuove e poi applicare solo quelli approvati.
---

# Redirect dal sito esistente

Per l'agente che lavora con Simone, nella repo del sito. Prima si propone, poi decide Simone, poi si applica: fino alla decisione `vercel.json` non si tocca.

## Passi

1. **Vecchi indirizzi** dalla sitemap del sito attuale (con un indice di sitemap, ripeti per ognuna):

   ```sh
   curl -sSL https://<vecchio-dominio>/robots.txt | grep -i '^sitemap:'
   curl -sSL https://<vecchio-dominio>/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed -E 's#</?loc>##g' | sort -u
   ```

   Senza sitemap, con una scansione:

   ```sh
   npx linkinator https://<vecchio-dominio> --recurse --format csv > reports/vecchio-sito.csv
   cut -d, -f1 reports/vecchio-sito.csv | grep '^https://<vecchio-dominio>' | sort -u
   ```

   Tieni solo le pagine: niente immagini, CSS, JS, feed o indirizzi con parametri.

2. **Abbina** ogni vecchio indirizzo alla pagina o all'ancora nuova più vicina per contenuto (`src/content/pages/<slug>.json` → `/<slug>/`). Senza una pagina simile, nessun redirect, con il motivo. Mai tutti verso la home.

3. **Scrivi `docs/redirects.md`:**

   ```markdown
   # Redirect — <nome attività>
   Stato: proposta
   Vecchio sito: https://<vecchio-dominio> · indirizzi da: sitemap | scansione, il <data>

   | Vecchio URL | Nuovo URL | Decisione | Note |
   | --- | --- | --- | --- |
   | /servizi/imbiancatura.html | /servizi/ | proposta | |
   | /news/2019/auguri | — | proposta | nessuna pagina simile |

   ## Dubbi
   - <indirizzo e domanda per Simone>
   ```

   Percorsi che iniziano con `/`, senza formattazione Markdown nelle celle degli URL, sempre le quattro colonne.

4. **Mostrala a Simone** con i rischi che vedi: pagine probabilmente visitate o linkate da altri siti che resterebbero senza redirect, destinazioni poco pertinenti, catene di redirect. Decide lui, riga per riga.

5. **Dopo la decisione:**
   - in `docs/redirects.md`, `Stato: approvata il <gg/mm/aaaa>` (o `respinta il <data>`) e per ogni riga `sì` o `no`, con il motivo dei `no`;
   - in `vercel.json`, accanto agli `headers` che ci sono già, solo le righe con `sì`:

   ```json
   "redirects": [
     { "source": "/servizi/imbiancatura.html", "destination": "/servizi/", "permanent": true }
   ]
   ```

   ```sh
   python3 -m json.tool vercel.json > /dev/null && echo "vercel.json valido"
   curl -sI "<anteprima Vercel della PR>/servizi/imbiancatura.html" | grep -iE '^(HTTP|location)'
   ```

6. `npm run qa -- --strict` controlla la risposta «Esiste un sito online?» del brief, lo stato datato della mappa e la corrispondenza esatta con `vercel.json`. Commit e push.

## Criterio di fine

Mappa decisa da Simone in `docs/redirects.md`; in `vercel.json` esattamente le righe approvate (nessuna se respinta).

## Non fare

- Non toccare `vercel.json` prima della decisione, mai righe non approvate, mai togliere gli `headers`.
- Non mandare in blocco i vecchi indirizzi alla home.
