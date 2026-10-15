/**
 * In CI, quando un job fallisce: il motivo dal report (reports/qa.json, gli stessi dati di
 * reports/qa.md) nel log e come annotazioni ::error, che GitHub mostra nella pagina della pull
 * request e dell'esecuzione senza scaricare gli artifact.
 *
 * Un'annotazione per ogni errore che non è un segnaposto; i segnaposto, un'annotazione per tipo
 * («57 segnaposto DA-COMPILARE in 6 file»). Con --placeholders-expected (job template-as-site) i
 * segnaposto sono attesi: restano nel log ma non diventano annotazioni.
 *
 * Uso: node scripts/checks/ci-summary.ts reports/qa.json [--placeholders-expected]
 */
import { existsSync, readFileSync } from 'node:fs';
import { type Finding, formatFinding, orderFindings, placeholderSummary } from './lib/report.ts';

const args = process.argv.slice(2);
const reportPath = args.find((arg) => !arg.startsWith('--')) ?? 'reports/qa.json';
const placeholdersExpected = args.includes('--placeholders-expected');

/** Testo di un comando di workflow: %, a capo; nelle proprietà anche : e ,. */
const escapeData = (text: string) => text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escapeProperty = (text: string) => escapeData(text).replace(/:/g, '%3A').replace(/,/g, '%2C');

function annotate(title: string, message: string, file?: string) {
	const properties = [file && `file=${escapeProperty(file)}`, `title=${escapeProperty(title)}`].filter(Boolean).join(',');
	console.log(`::error ${properties}::${escapeData(message)}`);
}

if (!existsSync(reportPath)) {
	annotate('Nessun report', `${reportPath} non c’è: il job si è fermato prima dei controlli, il motivo è nel log del passo fallito`);
	process.exit(0);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8')) as { findings: Finding[]; summary: { errors: number; warnings: number } };
const { errors, placeholders } = orderFindings(report.findings);
const placeholderErrors = placeholders.filter((finding) => finding.level === 'error');

console.log(`──────── Motivo del fallimento (${reportPath}: ${report.summary.errors} errori, ${report.summary.warnings} avvisi)`);
if (errors.length === 0 && placeholderErrors.length === 0) {
	console.log('Nessun errore nel report: il motivo è nel log del passo fallito.');
	annotate('Fallito senza errori nel report', 'il motivo è nel log del passo fallito');
	process.exit(0);
}

for (const finding of errors) {
	console.log(formatFinding(finding));
	const where = [finding.file, finding.where].filter(Boolean).join(' → ');
	const hint = finding.hint ? ` → ${finding.hint}` : '';
	annotate(`${finding.check}${where ? `: ${where}` : ''}`, `${finding.message}${hint}`, finding.file);
}
for (const line of placeholderSummary(placeholderErrors)) {
	console.log(placeholdersExpected ? `${line} (attesi)` : line);
	if (!placeholdersExpected) annotate('Segnaposto', line.trim().replace(/^✗ /, ''));
}
