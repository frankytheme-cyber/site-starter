import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { withoutEmpty } from './core/clean-data';
import { checkedLoader, useItalianErrors } from './core/content-validation';
import { layoutSchema } from './core/layout';
import { navigationSchema } from './core/navigation';
import { pageSchema } from './core/page-schema';
import { siteSettingsSchema } from './core/settings';
import { themeSchema } from './themes/presets';

/*
 * Ogni loader valida i dati con i messaggi di src/core/content-validation.ts prima di passarli ad
 * Astro: «pagina index.json → sezione 3 (services) → items[2].title: troppo lungo...», in italiano.
 */
useItalianErrors();

/** Dati dell'attività: un solo oggetto in site.json, letto come voce "site". Schema in core/settings.ts. */
const settings = defineCollection({
	loader: checkedLoader(
		file('src/content/settings/site.json', {
			parser: (text) => [{ id: 'site', ...(withoutEmpty(JSON.parse(text)) as object) }],
		}),
		{ schema: siteSettingsSchema, label: 'impostazioni' },
	),
	schema: siteSettingsSchema,
});

/** Menu del sito: un solo oggetto in navigation.json, letto come voce "navigation". Schema in core/navigation.ts. */
const navigation = defineCollection({
	loader: checkedLoader(
		file('src/content/settings/navigation.json', {
			parser: (text) => [{ id: 'navigation', ...(withoutEmpty(JSON.parse(text)) as object) }],
		}),
		{ schema: navigationSchema, label: 'impostazioni' },
	),
	schema: navigationSchema,
});

/** Aspetto del sito: palette, font e forma tra i preset di src/themes. */
const theme = defineCollection({
	loader: checkedLoader(
		file('src/content/settings/theme.json', {
			parser: (text) => [{ id: 'theme', ...JSON.parse(text) }],
		}),
		{ schema: themeSchema, label: 'impostazioni' },
	),
	schema: themeSchema,
});

/** Header e footer del sito: variante e opzioni dei blocchi di layout. Schema in core/layout.ts. */
const layout = defineCollection({
	loader: checkedLoader(
		file('src/content/settings/layout.json', {
			parser: (text) => [{ id: 'layout', ...JSON.parse(text) }],
		}),
		{ schema: layoutSchema, label: 'impostazioni' },
	),
	schema: layoutSchema,
});

/**
 * Ricette di pagina: un JSON per pagina (index.json è la home). Schema in core/page-schema.ts.
 * Prima della validazione si tolgono i campi vuoti che il CMS lascia ("" e {}): core/clean-data.ts.
 */
const pages = defineCollection({
	loader: checkedLoader(glob({ pattern: '*.json', base: './src/content/pages' }), { schema: pageSchema, label: 'pagina', prepare: withoutEmpty }),
	schema: pageSchema,
});

export const collections = { settings, navigation, theme, layout, pages };
