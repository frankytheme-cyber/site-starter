/**
 * Server di Astro su una porta libera: astro preview per la suite qa e gli screenshot del catalogo,
 * astro dev per npm run design:shots (scripts/design-shots.ts).
 */
import { type ChildProcess, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { ROOT } from './project.ts';

export function freePort(): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.unref();
		server.on('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const { port } = server.address() as { port: number };
			server.close(() => resolve(port));
		});
	});
}

/** Chiude il server e tutto quello che astro ha avviato (preview o dev). */
export function stopPreview(child: ChildProcess) {
	try {
		if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM');
		else child.kill();
	} catch {}
}

async function startAstro(command: 'preview' | 'dev', port: number, attempts: number, ready: (response: Response) => boolean) {
	const astro = join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro');
	// --ignore-lock: un server tutto suo, anche se il progetto ne ha già uno aperto.
	// Gruppo di processi a parte, così alla fine si chiude tutto quello che astro ha avviato.
	const child = spawn(astro, [command, '--port', String(port), '--host', '127.0.0.1', '--ignore-lock'], {
		cwd: ROOT,
		stdio: 'ignore',
		detached: process.platform !== 'win32',
	});
	const url = `http://127.0.0.1:${port}/`;
	for (let attempt = 0; attempt < attempts; attempt++) {
		try {
			if (ready(await fetch(url))) return child;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	stopPreview(child);
	throw new Error(`astro ${command} non risponde su ${url}`);
}

export const startPreview = (port: number): Promise<ChildProcess> => startAstro('preview', port, 60, (response) => response.ok);

/**
 * astro dev: pronto appena risponde, anche con un errore (lo riporta chi apre la pagina). La prima
 * pagina si compila alla prima richiesta, quindi l'attesa è più lunga.
 */
export const startDev = (port: number): Promise<ChildProcess> => startAstro('dev', port, 120, () => true);
