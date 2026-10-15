/** Server di anteprima (astro preview) su una porta libera: lo usano la suite qa e gli screenshot del catalogo. */
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

export function stopPreview(child: ChildProcess) {
	try {
		if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM');
		else child.kill();
	} catch {}
}

export async function startPreview(port: number): Promise<ChildProcess> {
	const astro = join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'astro.cmd' : 'astro');
	// --ignore-lock: un'anteprima tutta sua, anche se il progetto ha già un server di preview aperto.
	// Gruppo di processi a parte, così alla fine si chiude tutto quello che astro ha avviato.
	const child = spawn(astro, ['preview', '--port', String(port), '--host', '127.0.0.1', '--ignore-lock'], {
		cwd: ROOT,
		stdio: 'ignore',
		detached: process.platform !== 'win32',
	});
	const url = `http://127.0.0.1:${port}/`;
	for (let attempt = 0; attempt < 60; attempt++) {
		try {
			if ((await fetch(url)).ok) return child;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	stopPreview(child);
	throw new Error(`astro preview non risponde su ${url}`);
}
