/**
 * decap: public/admin/config.yml deve corrispondere agli schemi. Lo rigenera in memoria e lo
 * confronta col file; segnala anche i campi senza .describe() o non mappabili in Decap.
 */
import { existsSync, readFileSync } from 'node:fs';
import { DECAP_CONFIG, generateDecapConfig } from '../gen-decap-config.ts';
import { collector } from './lib/report.ts';

const FILE = 'public/admin/config.yml';

export async function decap() {
	const { findings, error } = collector('decap');
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
