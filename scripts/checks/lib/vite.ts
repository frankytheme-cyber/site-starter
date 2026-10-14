/**
 * Carica moduli del progetto (schemi, schede, fixture) con Vite: alias @/, import.meta.glob e
 * import di immagini funzionano come in Astro, senza compilare i componenti .astro.
 * astro:content è sostituito da uno stub: qui servono gli schemi, non i dati.
 */
import { join } from 'node:path';
import { createServer } from 'vite';
import { ROOT } from './project.ts';

export type LoadModule = (path: string) => Promise<Record<string, any>>;

export async function withProjectModules<T>(use: (load: LoadModule) => Promise<T>): Promise<T> {
	const server = await createServer({
		root: ROOT,
		configFile: false,
		logLevel: 'error',
		appType: 'custom',
		server: { middlewareMode: true, hmr: false, ws: false },
		optimizeDeps: { noDiscovery: true, include: [] },
		resolve: { alias: [{ find: /^@\//, replacement: join(ROOT, 'src/') }] },
		plugins: [
			{
				name: 'astro-content-stub',
				resolveId: (id) => (id === 'astro:content' ? '\0astro-content-stub' : undefined),
				load: (id) =>
					id === '\0astro-content-stub'
						? 'export const getEntry = () => { throw new Error("astro:content non disponibile qui"); };'
						: undefined,
			},
		],
	});
	try {
		return await use((path) => server.ssrLoadModule(path));
	} finally {
		await server.close();
	}
}
