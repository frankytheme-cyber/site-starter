/**
 * Esegue i controlli, stampa l'esito e scrive reports/qa.json e reports/qa.md.
 * Esce con 1 se almeno un check ha trovato errori.
 *
 * Uso: npm run check                      suite check (statici + build)
 *      npm run qa                         suite qa (check + link, accessibilità, interattivi, Lighthouse)
 *      npm run check -- --strict          regole di pubblicazione: recipes come errori, release attivo
 *      node scripts/checks/run.ts tokens  solo i check indicati
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { a11y } from './a11y.ts';
import { blocks } from './blocks.ts';
import { astroCheck, build } from './commands.ts';
import { contrast } from './contrast.ts';
import { decap } from './decap.ts';
import { interactive } from './interactive.ts';
import { lighthouse } from './lighthouse.ts';
import { links } from './links.ts';
import { lock, LOCK_FILE } from './lock.ts';
import { DIST, isLibrary, ROOT } from './lib/project.ts';
import {
	type CheckContext,
	type CheckFn,
	type CheckResult,
	countLevel,
	formatFinding,
	statusOf,
	summaryLine,
	writeReports,
} from './lib/report.ts';
import { recipes } from './recipes.ts';
import { release } from './release.ts';
import { tokens } from './tokens.ts';

interface CheckDefinition {
	run: CheckFn;
	/** Motivo per non eseguirlo in questo contesto, o undefined se va eseguito. */
	skip?: (context: CheckContext, results: CheckResult[]) => string | undefined;
	/** Ha bisogno di dist/ prodotta da una build riuscita. */
	needsBuild?: boolean;
	/** Ha bisogno del server di anteprima. */
	needsServer?: boolean;
}

const MAX_WARNINGS_SHOWN = 10;

const buildFailed = (results: CheckResult[]) => results.some((result) => result.name === 'build' && result.status === 'failed');

const CHECKS: Record<string, CheckDefinition> = {
	'astro-check': { run: astroCheck },
	// Prima della build: il prebuild rigenera config.yml e il confronto non avrebbe più senso.
	decap: { run: decap },
	tokens: { run: tokens },
	contrast: { run: contrast },
	blocks: {
		run: blocks,
		skip: ({ isLibrary: library }) => (library ? undefined : 'solo nella libreria (manca src/pages/catalogo)'),
	},
	lock: {
		run: lock,
		skip: ({ root }) => (existsSync(join(root, LOCK_FILE)) ? undefined : `nessun ${LOCK_FILE}`),
	},
	recipes: { run: recipes },
	build: { run: build },
	release: {
		run: release,
		needsBuild: true,
		skip: ({ strict, isLibrary: library }) => {
			if (!strict) return 'attivo solo con --strict';
			if (library) return 'nella libreria il template contiene segnaposto per scelta';
			return undefined;
		},
	},
	links: { run: links, needsBuild: true, needsServer: true },
	a11y: { run: a11y, needsBuild: true, needsServer: true },
	interactive: { run: interactive, needsBuild: true, needsServer: true },
	lighthouse: { run: lighthouse, needsBuild: true, needsServer: true },
};

const SUITES: Record<string, string[]> = {
	check: ['astro-check', 'decap', 'tokens', 'contrast', 'blocks', 'lock', 'recipes', 'build', 'release'],
};
SUITES.qa = [...SUITES.check, 'links', 'a11y', 'interactive', 'lighthouse'];

// ---------------------------------------------------------------------------- argomenti

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const suiteArg = args.find((arg) => arg.startsWith('--suite='))?.slice('--suite='.length);
const named = args.filter((arg) => !arg.startsWith('--'));
const unknown = [...named, ...(suiteArg && !SUITES[suiteArg] ? [suiteArg] : [])].filter((name) => !CHECKS[name] && !SUITES[name]);
if (unknown.length > 0) {
	console.error(`Check sconosciuti: ${unknown.join(', ')}. Disponibili: ${Object.keys(CHECKS).join(', ')}.`);
	process.exit(2);
}
const suite = suiteArg ?? (named.length > 0 ? 'personalizzata' : 'check');
const selected = named.length > 0 ? named : SUITES[suite];

// ---------------------------------------------------------------------------- server di anteprima

function freePort(): Promise<number> {
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

function stopPreview(child: ChildProcess) {
	try {
		if (child.pid && process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM');
		else child.kill();
	} catch {}
}

async function startPreview(port: number): Promise<ChildProcess> {
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

// ---------------------------------------------------------------------------- esecuzione

const needsServer = selected.some((name) => CHECKS[name].needsServer);
const port = needsServer ? await freePort() : undefined;
const context: CheckContext = {
	root: ROOT,
	strict,
	isLibrary: isLibrary(),
	// Nella suite qa la build usa questo indirizzo come site (SITE_URL), così canonical e og:url restano sull'anteprima.
	baseUrl: port ? `http://127.0.0.1:${port}/` : undefined,
	reportsDir: join(ROOT, 'reports'),
};
const startedAt = new Date().toISOString();
console.log(`Controlli: ${selected.join(', ')}${strict ? ' (--strict)' : ''} · ${context.isLibrary ? 'libreria' : 'sito cliente'}\n`);

const results: CheckResult[] = [];
let preview: ChildProcess | undefined;
try {
	for (const name of selected) {
		const definition = CHECKS[name];
		const started = Date.now();
		let reason = definition.skip?.(context, results);
		if (!reason && definition.needsBuild && (buildFailed(results) || !existsSync(DIST))) reason = 'build non riuscita o mancante';
		if (reason) {
			results.push({ name, status: 'skipped', reason, durationMs: 0, findings: [] });
			console.log(summaryLine(results.at(-1)!));
			continue;
		}
		if (definition.needsServer && !preview) {
			try {
				preview = await startPreview(port!);
			} catch (cause) {
				// Senza server i check che ne hanno bisogno falliscono, ma il report si scrive comunque.
				const message = `server di anteprima non avviato: ${(cause as Error).message}`;
				const findings = [{ check: name, level: 'error' as const, message, hint: 'prova npm run build && npx astro preview' }];
				results.push({ name, status: 'failed', durationMs: Date.now() - started, findings });
				console.log(summaryLine(results.at(-1)!));
				console.log(formatFinding(findings[0]));
				break;
			}
		}

		let findings;
		try {
			findings = await definition.run(context);
		} catch (cause) {
			findings = [{ check: name, level: 'error' as const, message: `il check si è interrotto: ${(cause as Error).message}` }];
		}
		const result: CheckResult = { name, status: statusOf(findings), durationMs: Date.now() - started, findings };
		results.push(result);
		console.log(summaryLine(result));
		// In console tutti gli errori e i primi avvisi; l'elenco completo è nei report.
		const shown = [...findings.filter((finding) => finding.level === 'error'), ...findings.filter((finding) => finding.level === 'warning').slice(0, MAX_WARNINGS_SHOWN)];
		for (const finding of shown) console.log(formatFinding(finding));
		if (shown.length < findings.length) console.log(`  … e altri ${findings.length - shown.length} avvisi in reports/qa.md`);
	}
} finally {
	if (preview) stopPreview(preview);
}

writeReports(context.reportsDir, results, { suite, strict, isLibrary: context.isLibrary, startedAt });
const all = results.flatMap((result) => result.findings);
const errors = countLevel(all, 'error');
console.log(`\n${errors} errori, ${countLevel(all, 'warning')} avvisi. Report: reports/qa.md, reports/qa.json`);
process.exit(errors > 0 ? 1 : 0);
