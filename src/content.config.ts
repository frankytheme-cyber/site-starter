import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { siteSettingsSchema } from './core/settings';

/** Dati dell'attività: un solo oggetto in site.json, letto come voce "site". Schema in core/settings.ts. */
const settings = defineCollection({
	loader: file('src/content/settings/site.json', {
		parser: (text) => [{ id: 'site', ...JSON.parse(text) }],
	}),
	schema: siteSettingsSchema,
});

export const collections = { settings };
