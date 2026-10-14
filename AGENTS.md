# site-starter

Libreria di blocchi Astro + Tailwind v4 per siti vetrina di piccole attività, usata anche come template GitHub per i siti cliente.

## Regole

- **Solo classi semantiche nei blocchi.** Usa `bg-primary`, `text-muted`, `font-heading`... MAI colori Tailwind fissi (`bg-blue-600`, `text-gray-500`...) né valori arbitrari di colore (`bg-[#1e40af]`, `text-[rgb(...)]`...).
- **Cartelle gestite in sola lettura nei siti cliente.** Le cartelle elencate in `library.manifest.json` → `managed` si modificano SOLO nella repo site-starter; nei siti cliente sono in sola lettura.
- **Dati dell'attività in un solo posto.** Nome, indirizzo, telefono, email, P.IVA e orari stanno solo in `src/content/settings/site.json`; mai scritti nei testi delle pagine.
- **Si compone con blocchi esistenti.** Il sito si costruisce con i blocchi già presenti: un blocco nuovo nasce solo in site-starter, su task approvato.
- **Build verde prima di chiudere.** Prima di dichiarare finito un lavoro, `npm run build` deve passare.

## Comandi

| Comando           | Cosa fa                                          |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Server di sviluppo su `localhost:4321`           |
| `npm run build`   | Build di produzione in `dist/`                   |
| `npm run preview` | Anteprima locale della build                     |

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
