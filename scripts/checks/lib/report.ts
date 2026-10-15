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
	/**
	 * Dati che non passano lo schema, o link speciali senza il dato in site.json (recipes): la
	 * build fallirebbe con lo stesso errore, quindi run.ts salta astro-check e build.
	 */
	breaksBuild?: boolean;
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

/** "src/content/pages/index.json → sezione 3 (services) → items[2].title". */
const location = (finding: Finding) => [finding.file, finding.where].filter(Boolean).join(' → ');

const levelIcon = (level: Level) => (level === 'error' ? '✗' : '!');

export function formatFinding(finding: Finding): string {
	const head = `  ${levelIcon(finding.level)} ${location(finding) ? `${location(finding)}: ` : ''}${finding.message}`;
	return finding.hint ? `${head}\n      → ${finding.hint}` : head;
}

/**
 * L'ordine di console e qa.md: prima gli errori, poi gli avvisi, poi i segnaposto (DA-COMPILARE...,
 * di qualunque livello), così un avviso di struttura non finisce in mezzo a decine di segnaposto.
 */
export function orderFindings(findings: Finding[]) {
	const others = findings.filter((finding) => !finding.placeholder);
	return {
		errors: others.filter((finding) => finding.level === 'error'),
		warnings: others.filter((finding) => finding.level === 'warning'),
		placeholders: findings.filter((finding) => finding.placeholder).sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1)),
	};
}

/** I segnaposto riassunti, una riga per segnaposto e livello: «! 57 segnaposto DA-COMPILARE in 6 file — dettaglio in reports/qa.md». */
export function placeholderSummary(placeholders: Finding[]): string[] {
	const groups = new Map<string, Finding[]>();
	for (const finding of placeholders) {
		const key = `${finding.level} ${finding.placeholder}`;
		groups.set(key, [...(groups.get(key) ?? []), finding]);
	}
	return [...groups.values()].map((group) => {
		const { level, placeholder } = group[0];
		const files = new Set(group.map((finding) => finding.file)).size;
		return `  ${levelIcon(level)} ${group.length} segnaposto ${placeholder} in ${files} file — dettaglio in reports/qa.md`;
	});
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
	const item = (finding: Finding) => {
		const where = location(finding);
		return (
			`- ${finding.level === 'error' ? '❌' : '⚠️'} ${where ? `\`${escapeCell(where)}\`: ` : ''}${escapeCell(finding.message)}` +
			(finding.hint ? `  \n  → ${escapeCell(finding.hint)}` : '')
		);
	};
	for (const result of results.filter((check) => check.findings.length > 0)) {
		const { errors, warnings, placeholders } = orderFindings(result.findings);
		lines.push('', `## ${result.name}`);
		if (errors.length + warnings.length > 0) lines.push('', ...[...errors, ...warnings].map(item));
		if (placeholders.length > 0) lines.push('', `### Segnaposto (${placeholders.length})`, '', ...placeholders.map(item));
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
