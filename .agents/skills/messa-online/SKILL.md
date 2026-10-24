---
name: messa-online
description: Usala quando un sito cliente è composto e Simone vuole metterlo online, per la verifica finale (controlli strict, confronto col brief, SEO, redirect) e il riepilogo di cosa resta da fare a lui.
---

# Messa online

Per l'agente che lavora con Simone, nella repo del sito. Verifichi tutto, correggi quello che è tuo (ricette, testi, dati di `site.json` presi dal brief) e dai a Simone un riepilogo chiaro: la pubblicazione e il merge sono suoi.

## Passi

1. **Controlli di rilascio**, finché non ci sono errori. `qa` comprende già check e build; non eseguire prima un altro check completo:

   ```sh
   npm run qa -- --strict
   rg -n -A1 "❌" reports/qa.md     # ogni errore, con il suggerimento sulla riga sotto
   ```

   Con `--strict` sono errori anche i segnaposto (`DA-COMPILARE`, `og-DA-COMPILARE`), le regole delle ricette, i dati legali e i link a privacy e cookie nel footer, le bozze linkate, l'immagine per i social, i redirect. Non si abbassano soglie e non si spengono controlli. Un errore che dipende da un dato mancante (testi legali, P.IVA) va nel riepilogo per Simone, non si risolve inventando.

2. **Confronto con il brief**, che i controlli non coprono:
   - servizi, zone, orari e recapiti uguali al brief, in `site.json` e nelle pagine;
   - ogni pagina prevista dal brief esiste, nessuna in più; nessuna `"draft": true` rimasta;
   - recensioni e numeri solo con una fonte presente nel brief; foto dei lavori vere, fonti delle immagini dichiarate in `docs/nota-design.md`; placeholder sostituiti o approvati esplicitamente da Simone come immagini illustrative definitive, secondo [la regola](../nuovo-sito/immagini-placeholder.md);
   - testi di privacy e cookie quelli forniti o approvati da Simone.

3. **SEO**, sulla build con l’indirizzo vero di `site.json`. Questa build aggiuntiva serve: quella della QA usa l’URL dell’anteprima per canonical e Open Graph.

   ```sh
   npm run build
   for f in $(find dist -name index.html -not -path "dist/admin/*" | sort); do
     echo "== $f"
     grep -o '<title>[^<]*</title>' "$f"
     grep -o '<meta name="description" content="[^"]*"' "$f"
     echo "intestazioni: $(grep -o '<h[1-6]' "$f" | tr -d '<' | tr '\n' ' ')"
     grep -o '<link rel="canonical" href="[^"]*"' "$f"
   done
   grep -o '<loc>[^<]*</loc>' dist/sitemap-0.xml
   cat dist/robots.txt
   ```

   - title e description unici, con servizio e località, entro 60 e 160 caratteri;
   - un solo `h1` per pagina, intestazioni senza salti;
   - canonical sul dominio vero; in sitemap tutte e sole le pagine pubblicate e indicizzabili; robots con `Disallow: /admin/` e `Sitemap:`;
   - dati strutturati `LocalBusiness` coerenti con `site.json`, `FAQPage` dove c'è un accordion `faq` (`grep -o '<script type="application/ld+json">[^<]*' dist/index.html`).

4. **Sito esistente:** `docs/redirects.md` deciso da Simone e `vercel.json` con esattamente le righe approvate (skill `redirect`).

5. **Un ultimo sguardo** con la skill `revisione-visiva` sulle pagine cambiate dall'ultima revisione.

6. **Riepilogo a Simone**, in un messaggio:

   ```text
   SITO: <nome> · PR: <link> · commit: <git rev-parse --short HEAD>
   Controlli: npm run qa -- --strict → <n> errori, <n> avvisi
   Brief: ok | <differenze>
   SEO: ok | <punti>
   Redirect: non servono | approvati e applicati | <da decidere>
   Da fare a te: <dominio su Vercel, variabili del modulo (docs/form.md), CMS (docs/decap.md), merge della PR>
   Dopo la pubblicazione: Search Console e sitemap, controllo dei redirect sul dominio vero.
   ```

## Criterio di fine

`npm run qa -- --strict` senza errori, nessuna differenza dal brief, SEO senza punti bloccanti, redirect decisi, riepilogo inviato a Simone. Se resta un dato che solo lui può dare, il riepilogo lo dice e il sito non è pronto.

## Non fare

- Non fare merge, non cambiare impostazioni di Vercel, GitHub, CMS o Search Console: le fa Simone.
- Non abbassare soglie né spegnere controlli; non dichiarare pronto un sito con errori.
- Non riempire con dati inventati quello che manca per passare i controlli.
