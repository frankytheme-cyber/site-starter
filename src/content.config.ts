import { defineCollection } from 'astro:content';
import { file, glob, type Loader } from 'astro/loaders';
import { withoutEmpty } from './core/clean-data';
import { layoutSchema } from './core/layout';
import { navigationSchema } from './core/navigation';
import { pageSchema } from './core/page-schema';
import { siteSettingsSchema } from './core/settings';
import { themeSchema } from './themes/presets';

/** Dati dell'attività: un solo oggetto in site.json, letto come voce "site". Schema in core/settings.ts. */
const settings = defineCollection({
	loader: file('src/content/settings/site.json', {
		parser: (text) => [{ id: 'site', ...(withoutEmpty(JSON.parse(text)) as object) }],
	}),
	schema: siteSettingsSchema,
});

/** Menu del sito: un solo oggetto in navigation.json, letto come voce "navigation". Schema in core/navigation.ts. */
const navigation = defineCollection({
	loader: file('src/content/settings/navigation.json', {
		parser: (text) => [{ id: 'navigation', ...(withoutEmpty(JSON.parse(text)) as object) }],
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

/** Header e footer del sito: variante e opzioni dei blocchi di layout. Schema in core/layout.ts. */
const layout = defineCollection({
	loader: file('src/content/settings/layout.json', {
		parser: (text) => [{ id: 'layout', ...JSON.parse(text) }],
	}),
	schema: layoutSchema,
});

/** Toglie i campi vuoti che il CMS lascia ("" e {}) prima della validazione: vedi core/clean-data.ts. */
function cleaned(loader: Loader): Loader {
	return {
		...loader,
		load: (context) =>
			loader.load({
				...context,
				parseData: (props) => context.parseData({ ...props, data: withoutEmpty(props.data) as typeof props.data }),
			}),
	};
}

/** Ricette di pagina: un JSON per pagina (index.json è la home). Schema in core/page-schema.ts. */
const pages = defineCollection({
	loader: cleaned(glob({ pattern: '*.json', base: './src/content/pages' })),
	schema: pageSchema,
});

export const collections = { settings, navigation, theme, layout, pages };
