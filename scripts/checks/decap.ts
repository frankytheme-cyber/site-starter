/**
 * decap: public/admin/config.yml deve corrispondere agli schemi. Lo rigenera in memoria e lo
 * confronta col file; segnala anche i campi senza .describe() o non mappabili in Decap.
 * Repo GitHub non trovato (REPO_PLACEHOLDER): avviso; errore con --strict in un sito cliente.
 */
import { existsSync, readFileSync } from 'node:fs';
import { DECAP_CONFIG, generateDecapConfig, REPO_HINT, REPO_PLACEHOLDER } from '../gen-decap-config.ts';
import { type CheckContext, collector } from './lib/report.ts';

const FILE = 'public/admin/config.yml';

export async function decap({ strict, isLibrary }: CheckContext) {
	const { findings, error, warning } = collector('decap');
	let generated: Awaited<ReturnType<typeof generateDecapConfig>>;
	try {
		generated = await generateDecapConfig();
	} catch (cause) {
		error({ file: FILE, message: (cause as Error).message });
		return findings;
	}
	for (const problem of generated.problems) {
		const [where, message] = problem.split(/: (.*)/s);
		error({ where, message, hint: 'aggiungi .describe("Etichetta|Aiuto") o usa un tipo che Decap rappresenta (vedi docs/decap.md)' });
	}
	if (generated.problems.length > 0) return findings;

	if (generated.repoPlaceholder) {
		(strict && !isLibrary ? error : warning)({
			file: FILE,
			where: 'backend.repo',
			message: `repo GitHub del CMS non trovato: vale "${REPO_PLACEHOLDER}"`,
			hint: REPO_HINT,
			placeholder: 'DA-COMPILARE',
		});
	}

	const current = existsSync(DECAP_CONFIG) ? readFileSync(DECAP_CONFIG, 'utf8') : '';
	if (current !== generated.output) {
		const before = current.split('\n');
		const after = generated.output.split('\n');
		const line = after.findIndex((text, index) => text !== before[index]);
		error({
			file: FILE,
			where: line >= 0 ? `riga ${line + 1}` : undefined,
			message: current ? 'non corrisponde agli schemi: è stato modificato a mano o non è stato rigenerato' : 'file mancante',
			hint: 'esegui npm run gen:decap e fai il commit di public/admin/config.yml',
		});
	}
	return findings;
}
