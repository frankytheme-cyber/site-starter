/**
 * Formato comune dei controlli: ogni check restituisce Finding[]; run.ts li raccoglie,
 * li stampa e scrive reports/qa.json e reports/qa.md.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export type Level = 'error' | 'warning';

export interface Finding {
	/** Nome del check che l'ha prodotto (es. "tokens"). */
	check: string;
	level: Level;
	/** File del progetto, relativo alla radice. */
	file?: string;
	/** Dove nel file o nel sito: riga, campo, pagina e larghezza... */
	where?: string;
	message: string;
	/** Cosa fare per risolvere. */
	hint?: string;
	/**
	 * Il segnaposto che ha prodotto il finding (DA-COMPILARE, og-DA-COMPILARE...): il job
	 * template-as-site della CI accetta solo errori di segnaposto attesi.
	 */
	placeholder?: string;
}

export interface CheckContext {
	/** Radice del progetto, con lo slash finale. */
	root: string;
	/** --strict: le regole di pubblicazione diventano errori (recipes) o si attivano (release). */
	strict: boolean;
	/** true nella libreria site-starter (SITE_STARTER_LIBRARY=1, src/core/mode.ts), false in un sito cliente. */
	isLibrary: boolean;
	/** Indirizzo del server di anteprima (astro preview), solo per i check della suite qa. */
	baseUrl?: string;
	/** Cartella dei report (reports/). */
	reportsDir: string;
}

export type CheckFn = (context: CheckContext) => Finding[] | Promise<Finding[]>;

/** Raccoglitore per un check: error() e warning() aggiungono un Finding già etichettato. */
export function collector(check: string) {
	const findings: Finding[] = [];
	const add = (level: Level) => (finding: Omit<Finding, 'check' | 'level'>) => {
		findings.push({ check, level, ...finding });
	};
	return { findings, error: add('error'), warning: add('warning') };
}

export interface CheckResult {
	name: string;
	status: 'passed' | 'warnings' | 'failed' | 'skipped';
	/** Perché il check non è stato eseguito. */
	reason?: string;
	durationMs: number;
	findings: Finding[];
}

export interface RunMeta {
	suite: string;
	strict: boolean;
	isLibrary: boolean;
	startedAt: string;
}

export const countLevel = (findings: Finding[], level: Level) => findings.filter((finding) => finding.level === level).length;

export function statusOf(findings: Finding[]): CheckResult['status'] {
	if (countLevel(findings, 'error') > 0) return 'failed';
	return findings.length > 0 ? 'warnings' : 'passed';
}

const ICONS: Record<CheckResult['status'], string> = { passed: '✓', warnings: '!', failed: '✗', skipped: '–' };

const location = (finding: Finding) => [finding.file, finding.where].filter(Boolean).join(' › ');

export function formatFinding(finding: Finding): string {
	const head = `  ${finding.level === 'error' ? '✗' : '!'} ${location(finding) ? `${location(finding)}: ` : ''}${finding.message}`;
	return finding.hint ? `${head}\n      → ${finding.hint}` : head;
}

export function summaryLine(result: CheckResult): string {
	if (result.status === 'skipped') return `${ICONS.skipped} ${result.name}: saltato (${result.reason})`;
	const errors = countLevel(result.findings, 'error');
	const warnings = countLevel(result.findings, 'warning');
	const seconds = (result.durationMs / 1000).toFixed(1);
	return `${ICONS[result.status]} ${result.name}: ${errors} errori, ${warnings} avvisi (${seconds}s)`;
}

const escapeCell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');

function toMarkdown(results: CheckResult[], meta: RunMeta): string {
	const all = results.flatMap((result) => result.findings);
	const lines = [
		'# Controlli di qualità',
		'',
		`Suite \`${meta.suite}\`${meta.strict ? ' con `--strict`' : ''} · ${meta.isLibrary ? 'libreria site-starter' : 'sito cliente'} · ${meta.startedAt}`,
		'',
		`**${countLevel(all, 'error')} errori, ${countLevel(all, 'warning')} avvisi.**`,
		'',
		'| Check | Esito | Errori | Avvisi | Note |',
		'| --- | --- | ---: | ---: | --- |',
		...results.map((result) =>
			[
				'',
				result.name,
				`${ICONS[result.status]} ${result.status}`,
				countLevel(result.findings, 'error'),
				countLevel(result.findings, 'warning'),
				escapeCell(result.reason ?? ''),
				'',
			].join(' | ').trim(),
		),
	];
	for (const result of results.filter((item) => item.findings.length > 0)) {
		lines.push('', `## ${result.name}`, '');
		for (const finding of result.findings) {
			const where = location(finding);
			lines.push(
				`- ${finding.level === 'error' ? '❌' : '⚠️'} ${where ? `\`${escapeCell(where)}\`: ` : ''}${escapeCell(finding.message)}` +
					(finding.hint ? `  \n  → ${escapeCell(finding.hint)}` : ''),
			);
		}
	}
	return `${lines.join('\n')}\n`;
}

export function writeReports(dir: string, results: CheckResult[], meta: RunMeta) {
	mkdirSync(dir, { recursive: true });
	const findings = results.flatMap((result) => result.findings);
	const summary = { errors: countLevel(findings, 'error'), warnings: countLevel(findings, 'warning') };
	const checks = results.map(({ findings: list, ...result }) => ({
		...result,
		errors: countLevel(list, 'error'),
		warnings: countLevel(list, 'warning'),
	}));
	writeFileSync(join(dir, 'qa.json'), `${JSON.stringify({ ...meta, summary, checks, findings }, null, 2)}\n`);
	writeFileSync(join(dir, 'qa.md'), toMarkdown(results, meta));
}
