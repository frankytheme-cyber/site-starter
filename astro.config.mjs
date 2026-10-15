// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { iconInclude } from './src/core/icons.ts';
import decapBundle from './src/core/integrations/decap-bundle.ts';
import library from './src/core/integrations/library.ts';

const readJson = (/** @type {string} */ path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

// L'indirizzo del sito sta in site.json con gli altri dati dell'attività: serve a canonical e Open Graph.
// SITE_URL lo sostituisce solo per i controlli in locale (npm run qa), che girano su localhost.
const site = process.env.SITE_URL ?? readJson('./src/content/settings/site.json').url;

// Fuori dalla sitemap: catalogo, CMS e le ricette con noindex o draft.
const hiddenRoutes = readdirSync(new URL('./src/content/pages/', import.meta.url))
  .filter((file) => file.endsWith('.json'))
  .filter((file) => {
    const page = readJson(`./src/content/pages/${file}`);
    return page.noindex === true || page.draft === true;
  })
  .map((file) => (file === 'index.json' ? '/' : `/${file.replace(/\.json$/, '')}/`));

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    icon({ include: iconInclude }),
    // astro-icon legge l'elenco solo all'avvio: un'icona nuova in icons.ts riavvia il server di sviluppo.
    {
      name: 'icone',
      hooks: {
        'astro:config:setup': ({ addWatchFile }) => addWatchFile(new URL('./src/core/icons.ts', import.meta.url)),
      },
    },
    decapBundle(),
    // Catalogo dei blocchi su /catalogo: solo in modalità libreria (SITE_STARTER_LIBRARY=1, src/core/mode.ts).
    library(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !path.startsWith('/catalogo/') && !path.startsWith('/admin/') && !hiddenRoutes.includes(path);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});
