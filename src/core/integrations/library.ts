import { existsSync } from 'node:fs';
import type { AstroIntegration } from 'astro';
import { isLibraryMode, LIBRARY_ENV } from '../mode.ts';

/**
 * Catalogo dei blocchi (/catalogo): le pagine stanno in src/library/catalogo e si registrano con
 * injectRoute solo in modalità libreria (core/mode.ts). In un sito cliente non c'è nessuna route,
 * e site:init toglie anche la cartella: /catalogo non esiste nel build.
 */
const CATALOG = new URL('../../library/catalogo/', import.meta.url);

const ROUTES: [pattern: string, entrypoint: string][] = [
	['/catalogo', 'index.astro'],
	['/catalogo/ui', 'ui.astro'],
	['/catalogo/bottoni', 'bottoni.astro'],
	['/catalogo/icone', 'icone.astro'],
	['/catalogo/[type]', '[type].astro'],
	['/catalogo/[type]/[variant]', '[type]/[variant].astro'],
];

export default function library(): AstroIntegration {
	return {
		name: 'site-starter-libreria',
		hooks: {
			'astro:config:setup': ({ injectRoute, logger }) => {
				if (!isLibraryMode()) return;
				if (!existsSync(CATALOG)) {
					throw new Error(
						`${LIBRARY_ENV}=1 ma src/library/catalogo non c'è: è un sito cliente? Togli la variabile (.env o ambiente).`,
					);
				}
				for (const [pattern, entrypoint] of ROUTES) injectRoute({ pattern, entrypoint: new URL(entrypoint, CATALOG) });
				logger.info('modalità libreria: catalogo su /catalogo');
			},
		},
	};
}
