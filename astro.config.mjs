// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { iconInclude } from './src/core/icons.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [icon({ include: iconInclude })],
  vite: {
    plugins: [tailwindcss()]
  }
});