---
name: redirect
description: Usala quando il brief indica un sito esistente e servono i redirect dai vecchi indirizzi alle pagine nuove.
---

# Redirect dal sito esistente

Per il Builder, che prepara la mappa e poi applica le righe approvate, e per il SEO, che ne segnala i rischi. Decide Simone al cancello 2: prima non si applica nulla.

## Passi

**Builder: proposta**

1. **Branch `lancio`** (skill `github-pr`): la PR del sito c'è già.
2. **Raccogli i vecchi URL** dalla sitemap, se c'è (con un indice di sitemap, ripeti per ognuna):

   ```sh
   curl -sSL https://<vecchio-dominio>/robots.txt | grep -i '^sitemap:'
   curl -sSL https://<vecchio-dominio>/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed -E 's#</?loc>##g' | sort -u
   ```

   Altrimenti con una scansione:

   ```sh
   npx linkinator https://<vecchio-dominio> --recurse --format csv > reports/vecchio-sito.csv
   cut -d, -f1 reports/vecchio-sito.csv | grep '^https://<vecchio-dominio>' | sort -u
   ```

   Tieni solo le pagine: niente immagini, CSS, JS, feed o parametri.
3. **Abbina ogni vecchio URL** a una pagina o a un'ancora del nuovo sito (`src/content/pages/<slug>.json` → `/<slug>/`). Senza corrispondenza: nessun redirect, con il motivo nelle note.
4. **Scrivi `docs/redirects.md`:**

   ```markdown
   # Redirect — <nome attività>
   Stato: proposta
   Vecchio sito: https://<vecchio-dominio> · URL da: sitemap | scansione, il <data>

   | Vecchio URL | Nuovo URL | Decisione | Note |
   | --- | --- | --- | --- |
   | /servizi/imbiancatura.html | /servizi/ | proposta | |
   | /news/2019/auguri | — | proposta | nessuna pagina simile |

   ## Dubbi
   - <URL e domanda per Simone>
   ```

5. **Commit e push**, link nel task: il PM porta la mappa al cancello 2.

**SEO: rischi**

6. Segnala al PM, senza toccare la mappa: pagine con traffico o link da altri siti che resterebbero senza redirect, destinazioni non pertinenti o tutte verso la home, catene di redirect, URL scritti male.

**Builder: dopo la decisione** (sempre su `lancio`)

7. **Approvata, tutta o in parte:** in `vercel.json`, accanto a `headers`, solo le righe con decisione sì; in `docs/redirects.md`, `Stato: approvata il <gg/mm/aaaa>` e la decisione di ogni riga.

   ```json
   "redirects": [
     { "source": "/servizi/imbiancatura.html", "destination": "/servizi/", "permanent": true }
   ]
   ```

   ```sh
   node -e 'JSON.parse(require("fs").readFileSync("vercel.json", "utf8")); console.log("vercel.json valido")'
   curl -sI "<anteprima Vercel della PR>/servizi/imbiancatura.html" | grep -iE '^(HTTP|location)'
   ```

   **Respinta:** `Stato: respinta il <gg/mm/aaaa>` e nessun redirect in `vercel.json`.
8. `npm run qa` senza errori, commit e push, esito nel task.

## Criterio di fine

Mappa decisa da Simone, con lo stato in `docs/redirects.md`; se approvata, in `vercel.json` esattamente le righe approvate.

## Non fare

- Non toccare `vercel.json` prima della decisione, mai righe non approvate.
- Non togliere gli `headers` che `vercel.json` ha già.
- Non mandare in blocco i vecchi URL alla home.
- SEO: non modificare la mappa e non decidere; segnali al PM.
