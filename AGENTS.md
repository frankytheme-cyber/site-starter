# site-starter

Libreria di blocchi Astro + Tailwind v4 per siti vetrina di piccole attività, usata anche come template GitHub per i siti cliente.

## Regole

- **Solo classi semantiche nei blocchi.** Usa `bg-primary`, `text-fg-muted`, `font-heading`, `rounded-box`... MAI colori Tailwind fissi (`bg-blue-600`, `text-gray-500`...) né valori arbitrari di colore (`bg-[#1e40af]`, `text-[rgb(...)]`...). La palette di Tailwind è disattivata, quindi i colori fissi non generano CSS; i valori arbitrari invece funzionano ancora e vanno evitati a mano.
- **Cartelle gestite in sola lettura nei siti cliente.** Le cartelle elencate in `library.manifest.json` → `managed` si modificano SOLO nella repo site-starter; nei siti cliente sono in sola lettura.
- **Dati dell'attività in un solo posto.** Nome, indirizzo, telefono, email, P.IVA e orari stanno solo in `src/content/settings/site.json`; mai scritti nei testi delle pagine né negli schemi dei blocchi, che li leggono con `getSiteSettings()` (`@/core/settings`).
- **Si compone con blocchi esistenti.** Il sito si costruisce con i blocchi già presenti: un blocco nuovo nasce solo in site-starter, su task approvato.
- **Build verde prima di chiudere.** Prima di dichiarare finito un lavoro, `npm run build` deve passare.

## Tema

L'aspetto del sito si sceglie in `src/site.config.ts` (`palette`, `fonts`, `shape`) tra i preset di `src/themes/`. Token disponibili:

- **Colori:** `bg`, `fg`, `fg-muted`, `surface`, `surface-fg`, `primary`, `primary-fg`, `accent`, `accent-fg`, `border`, `ring` (+ `white`, `black`, `transparent`, `current`)
- **Font:** `font-heading`, `font-body`
- **Raggi:** `rounded-box` (card, riquadri), `rounded-button` (pulsanti)

## Blocchi

- Il contratto è in `src/blocks/README.md`; i blocchi di riferimento sono `hero/`, `services/`, `cta/` e `header/` (interattivo) in `src/blocks/`.
- Blocchi interattivi (`interactive: true` in `meta.ts`): JS vanilla nel componente, progressive enhancement, tastiera, focus, movimento ridotto, niente autoplay. Regole in `docs/blocchi-interattivi.md`.
- Menu del sito: solo in `src/content/settings/navigation.json`, letto con `getNavigation()` (`@/core/navigation`).
- Anteprima: `/catalogo` (tutti i blocchi con le loro fixture, selettori di palette, font e forma) e `/catalogo/<type>`.
- La radice di ogni blocco è `<Section>` (`tone`: `default`, `muted`, `primary`). Dentro usa sempre `text-fg`, `text-fg-muted`, `bg-primary`...: Section ridefinisce i token per il tono, così il contrasto resta quello verificato.
- Immagini: solo file in `src/assets/images`, indicati con il percorso relativo (`"fixtures/foto.jpg"`); `alt` obbligatorio.
- Icone: solo `<Icon name="..." />` (`@/core/ui/Icon.astro`) con gli alias di `src/core/icons.ts`, mai SVG scritti a mano; negli schemi `z.enum(ICON_NAMES)`. Elenco in `/catalogo/icone`; licenze in `docs/THIRD_PARTY_LICENSES.md`.

## Comandi

| Comando                  | Cosa fa                                           |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Server di sviluppo su `localhost:4321`            |
| `npm run build`          | Build di produzione in `dist/`                    |
| `npm run preview`        | Anteprima locale della build                      |
| `npm run check:contrast` | Verifica il contrasto WCAG AA di tutte le palette |

Per gli agenti: avvia il server di sviluppo in background con `npx astro dev --background` e gestiscilo con `astro dev stop`, `astro dev status` e `astro dev logs`.

## Documentazione Astro

Documentazione completa: https://docs.astro.build

Consulta queste guide prima di lavorare sui temi corrispondenti:

- [Pagine, route dinamiche, middleware](https://docs.astro.build/en/guides/routing/)
- [Componenti Astro](https://docs.astro.build/en/basics/astro-components/)
- [Componenti di altri framework](https://docs.astro.build/en/guides/framework-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Stili e Tailwind](https://docs.astro.build/en/guides/styling/)
- [Internazionalizzazione](https://docs.astro.build/en/guides/internationalization/)
