---
name: seo-prelancio
description: Usala quando devi verificare la SEO di un sito cliente prima della messa online.
---

# Verifica SEO prima del lancio

Per il SEO, su assegnazione, dopo il QA verde. Segnali, non riscrivi. Lighthouse (SEO 100), sitemap, robots e Open Graph li ha già controllati `npm run qa -- --strict`: qui quello che i controlli non giudicano.

## Passi

1. **Mettiti sulla PR e fai la build**, con l'indirizzo vero di `site.json` per canonical e Open Graph:

   ```sh
   git status --porcelain                       # vuoto, altrimenti fermati e avvisa il PM
   git fetch origin && git switch --detach origin/<branch della PR>
   npm ci && npm run build
   ```

2. **Titoli, descrizioni, intestazioni e canonical di ogni pagina:**

   ```sh
   for f in $(find dist -name index.html -not -path "dist/admin/*" | sort); do
     echo "== $f"
     grep -o '<title>[^<]*</title>' "$f"
     grep -o '<meta name="description" content="[^"]*"' "$f"
     echo "intestazioni: $(grep -o '<h[1-6]' "$f" | tr -d '<' | tr '\n' ' ')"
     grep -o '<link rel="canonical" href="[^"]*"' "$f"
     echo "json-ld: $(grep -o '"@type":"[A-Za-z]*"' "$f" | sort -u | tr '\n' ' ')"
   done
   ```

   - title e description unici tra le pagine, con parola chiave e località (es. «Imbiancature a Prato»), entro 60 e 160 caratteri;
   - un solo `h1` per pagina, intestazioni senza salti (h1 → h2 → h3);
   - canonical sul dominio vero.
3. **Dati strutturati:** `LocalBusiness` coerente con `src/content/settings/site.json` (nome, indirizzo, telefono, orari, P.IVA); `FAQPage` in ogni pagina con un accordion `faq`.

   ```sh
   grep -o '<script type="application/ld+json">[^<]*' dist/index.html
   ```

4. **Immagini:** ogni `alt` dice cosa mostra la foto (`grep -rn '"alt"' src/content/pages`); immagine per i social vera, non `og-DA-COMPILARE`.
5. **Sitemap e robots:** nella sitemap tutte le pagine pubblicate e nessuna bozza; robots con `Disallow: /admin/` e `Sitemap:`.

   ```sh
   grep -o '<loc>[^<]*</loc>' dist/sitemap-0.xml
   cat dist/robots.txt
   ```

6. **Sito esistente:** valuta `docs/redirects.md` (skill `redirect`, parte del SEO) e segnala i rischi; la decisione è di Simone.
7. **Rapporto al PM** nel task, poi `git switch -`:

   ```text
   SEO pre-lancio — <PR>
   Bloccanti: <pagina, problema, chi lo corregge> (uno per riga) | nessuno
   Consigli: <…>
   Redirect: <rischi> | non serve
   Nessuna modifica fatta.
   ```

## Criterio di fine

Rapporto al PM con bloccanti e consigli, senza alcuna modifica ai file.

## Non fare

- Non modificare ricette, testi, `site.json` o `vercel.json`; non fare commit né push.
- Non applicare né decidere redirect.
- Non cambiare impostazioni di Vercel, Search Console o GitHub.
- Non fare merge.
