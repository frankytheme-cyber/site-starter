import { createReadStream, existsSync, readdirSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
import type { AstroIntegration } from 'astro';

/**
 * Serve Decap CMS dal sito stesso, senza CDN: il bundle di node_modules/decap-cms/dist va in
 * /admin/decap/ (copiato in dist/ in build, servito dal server di sviluppo in locale).
 * Il bundle carica i suoi pezzi dalla stessa cartella: si copiano decap-cms.js, i chunk
 * *.decap-cms.js e i .wasm; non le mappe né la copia cms.js.
 */
const URL_PREFIX = '/admin/decap/';

const isBundleFile = (name: string) =>
	name === 'decap-cms.js' || name.endsWith('.decap-cms.js') || name.endsWith('.wasm') || name === 'decap-cms.js.LICENSE.txt';

const CONTENT_TYPES: Record<string, string> = {
	'.js': 'text/javascript; charset=utf-8',
	'.wasm': 'application/wasm',
	'.txt': 'text/plain; charset=utf-8',
};

export default function decapBundle(): AstroIntegration {
	const dist = dirname(createRequire(import.meta.url).resolve('decap-cms/dist/decap-cms.js'));
	const files = readdirSync(dist).filter(isBundleFile);

	return {
		name: 'decap-bundle',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				updateConfig({
					vite: {
						plugins: [
							{
								name: 'decap-bundle-dev',
								configureServer(server) {
									// In produzione l'hosting serve /admin/ con admin/index.html; in sviluppo lo fa questa riga.
									server.middlewares.use((request, _response, next) => {
										if (request.url === '/admin' || request.url === '/admin/') request.url = '/admin/index.html';
										next();
									});
									server.middlewares.use(URL_PREFIX, (request, response, next) => {
										const name = basename(decodeURIComponent((request.url ?? '').split('?')[0]));
										const file = join(dist, name);
										if (!isBundleFile(name) || !existsSync(file)) return next();
										const extension = name.slice(name.lastIndexOf('.'));
										response.setHeader('Content-Type', CONTENT_TYPES[extension] ?? 'application/octet-stream');
										createReadStream(file).pipe(response);
									});
								},
							},
						],
					},
				});
			},
			'astro:build:done': async ({ dir, logger }) => {
				const target = new URL(`.${URL_PREFIX}`, dir);
				await mkdir(target, { recursive: true });
				await Promise.all(files.map((name) => copyFile(join(dist, name), new URL(name, target))));
				logger.info(`Decap CMS copiato in ${URL_PREFIX} (${files.length} file)`);
			},
		},
	};
}
