import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { navigationSchema } from './core/navigation';
import { siteSettingsSchema } from './core/settings';

/** Dati dell'attività: un solo oggetto in site.json, letto come voce "site". Schema in core/settings.ts. */
const settings = defineCollection({
	loader: file('src/content/settings/site.json', {
		parser: (text) => [{ id: 'site', ...JSON.parse(text) }],
	}),
	schema: siteSettingsSchema,
});

/** Menu del sito: un solo oggetto in navigation.json, letto come voce "navigation". Schema in core/navigation.ts. */
const navigation = defineCollection({
	loader: file('src/content/settings/navigation.json', {
		parser: (text) => [{ id: 'navigation', ...JSON.parse(text) }],
	}),
	schema: navigationSchema,
});

export const collections = { settings, navigation };
