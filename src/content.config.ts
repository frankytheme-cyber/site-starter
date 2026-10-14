import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { navigationSchema } from './core/navigation';
import { pageSchema } from './core/page-schema';
import { siteSettingsSchema } from './core/settings';
import { themeSchema } from './themes/presets';

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

/** Aspetto del sito: palette, font e forma tra i preset di src/themes. */
const theme = defineCollection({
	loader: file('src/content/settings/theme.json', {
		parser: (text) => [{ id: 'theme', ...JSON.parse(text) }],
	}),
	schema: themeSchema,
});

/** Ricette di pagina: un JSON per pagina (index.json è la home). Schema in core/page-schema.ts. */
const pages = defineCollection({
	loader: glob({ pattern: '*.json', base: './src/content/pages' }),
	schema: pageSchema,
});

export const collections = { settings, navigation, theme, pages };
