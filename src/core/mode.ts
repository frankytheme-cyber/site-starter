/**
 * Modalità del progetto, unica fonte per script, controlli e integrazioni.
 *
 * - libreria: la repo site-starter. Solo con SITE_STARTER_LIBRARY=1: catalogo su /catalogo,
 *   schede e screenshot, rilasci; con --strict i segnaposto del template restano avvisi.
 * - sito: un sito cliente. È il default, così una copia del template non pubblica il catalogo e
 *   con --strict applica tutte le regole di pubblicazione.
 *
 * La variabile si imposta nell'ambiente: in locale nel file .env (vedi .env.example) o con export,
 * nelle variabili del repository GitHub della libreria (CI) e nel suo progetto Vercel.
 * Dettagli in docs/siti-cliente.md. Solo Node: lo usano gli script e astro.config.mjs, non i componenti.
 */
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

export const LIBRARY_ENV = 'SITE_STARTER_LIBRARY';

/** Radice del progetto (src/core/ → ../../). */
const ROOT = new URL('../../', import.meta.url);

/**
 * Se l'ambiente non la imposta, la variabile si legge dal file .env della radice e si copia in
 * process.env: così la ereditano i processi avviati dagli script (build, anteprima).
 */
function loadFromDotEnv() {
	if (process.env[LIBRARY_ENV] !== undefined) return;
	const file = new URL('.env', ROOT);
	if (!existsSync(file)) return;
	const value = parseEnv(readFileSync(file, 'utf8'))[LIBRARY_ENV];
	if (value !== undefined) process.env[LIBRARY_ENV] = value;
}

/** true solo nella libreria site-starter (SITE_STARTER_LIBRARY=1); altrimenti è un sito cliente. */
export function isLibraryMode(): boolean {
	loadFromDotEnv();
	return process.env[LIBRARY_ENV] === '1';
}

export const modeName = () => (isLibraryMode() ? 'libreria' : 'sito cliente');

/** Ferma un comando che ha senso solo nella libreria (catalogo, screenshot, rilasci). */
export function requireLibraryMode(command: string) {
	if (isLibraryMode()) return;
	console.error(
		`✗ ${command} si usa solo nella libreria site-starter, con ${LIBRARY_ENV}=1 (file .env, vedi .env.example).\n` +
			'  In un sito cliente i blocchi e il catalogo si aggiornano con npm run blocks:sync -- vX.Y.Z.',
	);
	process.exit(1);
}

/** Ferma un comando che ha senso solo in un sito cliente (site:init, blocks:sync). */
export function requireSiteMode(command: string) {
	if (!isLibraryMode()) return;
	console.error(`✗ ${command} si usa in un sito cliente: qui ${LIBRARY_ENV}=1 indica la libreria site-starter.`);
	process.exit(1);
}
