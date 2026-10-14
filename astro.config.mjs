// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { iconInclude } from './src/core/icons.ts';
import decapBundle from './src/core/integrations/decap-bundle.ts';

// L'indirizzo del sito sta in site.json con gli altri dati dell'attività: serve a canonical e Open Graph.
const { url } = JSON.parse(readFileSync(new URL('./src/content/settings/site.json', import.meta.url), 'utf8'));

// https://astro.build/config
export default defineConfig({
  site: url,
  integrations: [icon({ include: iconInclude }), decapBundle()],
  vite: {
    plugins: [tailwindcss()]
  }
});
