/**
 * Esegue i controlli, stampa l'esito e scrive reports/qa.json e reports/qa.md.
 * Esce con 1 se almeno un check ha trovato errori.
 *
 * Uso: npm run check                      suite check (statici + build)
 *      npm run qa                         suite qa (check + link, accessibilità, interattivi, Lighthouse)
 *      npm run check -- --strict          regole di pubblicazione: recipes come errori, release attivo
 *      node scripts/checks/run.ts tokens  solo i check indicati
 */
import type { ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { a11y } from './a11y.ts';
import { blocks } from './blocks.ts';
import { buttons } from './buttons.ts';
import { astroCheck, build } from './commands.ts';
import { contrast } from './contrast.ts';
import { decap } from './decap.ts';
import { interactive } from './interactive.ts';
import { lighthouse } from './lighthouse.ts';
import { links } from './links.ts';
import { useItalianErrors } from '../../src/core/content-validation.ts';
import { isLibraryMode } from '../../src/core/mode.ts';
import { lock } from './lock.ts';
import { freePort, startPreview, stopPreview } from './lib/preview.ts';
import { DIST, ROOT } from './lib/project.ts';
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

/** La build di questa esecuzione non c'è: fallita o saltata. Senza build nella selezione vale la dist/ che c'è. */
const buildMissing = (results: CheckResult[]) => results.some((result) => result.name === 'build' && (result.status === 'failed' || result.status === 'skipped'));

/** recipes ha trovato dati che non passano lo schema: astro check e build fallirebbero con lo stesso errore. */
const contentInvalid = (_context: CheckContext, results: CheckResult[]) =>
	results.some((result) => result.findings.some((finding) => finding.breaksBuild))
		? 'ricette o impostazioni non valide: correggi prima gli errori di recipes'
		: undefined;

const CHECKS: Record<string, CheckDefinition> = {
	// Per primo: schema e immagini di ricette e impostazioni, con file, sezione e campo, prima che
	// astro check e la build si fermino sullo stesso errore.
	recipes: { run: recipes },
	'astro-check': { run: astroCheck, skip: contentInvalid },
	// Prima della build: il prebuild rigenera config.yml e il confronto non avrebbe più senso.
	decap: { run: decap },
	tokens: { run: tokens },
	contrast: { run: contrast },
	blocks: {
		run: blocks,
		skip: ({ isLibrary: library }) => (library ? undefined : 'solo nella libreria, con SITE_STARTER_LIBRARY=1'),
	},
	// Nei siti cliente un blocks.lock.json mancante è un errore: il sito non è stato inizializzato.
	lock: {
		run: lock,
		skip: ({ isLibrary: library }) => (library ? 'solo nei siti cliente' : undefined),
	},
	build: { run: build, skip: contentInvalid },
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
	buttons: { run: buttons, needsBuild: true, needsServer: true },
	lighthouse: { run: lighthouse, needsBuild: true, needsServer: true },
};

const SUITES: Record<string, string[]> = {
	check: ['recipes', 'astro-check', 'decap', 'tokens', 'contrast', 'blocks', 'lock', 'build', 'release'],
};
SUITES.qa = [...SUITES.check, 'links', 'a11y', 'interactive', 'buttons', 'lighthouse'];

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

// ---------------------------------------------------------------------------- esecuzione

// Anche i messaggi di Zod dei check (fixture dei blocchi, ricette tipo) in italiano.
useItalianErrors();

const needsServer = selected.some((name) => CHECKS[name].needsServer);
const port = needsServer ? await freePort() : undefined;
const context: CheckContext = {
	root: ROOT,
	strict,
	// Prima di avviare build e anteprima: legge anche .env, così i processi figli ereditano la modalità.
	isLibrary: isLibraryMode(),
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
		if (!reason && definition.needsBuild && (buildMissing(results) || !existsSync(DIST))) reason = 'build non riuscita o mancante';
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
