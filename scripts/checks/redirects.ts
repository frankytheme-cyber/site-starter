/** Confronta la decisione scritta in docs/redirects.md con i redirect effettivi di Vercel.
 * Non certifica chi ha approvato: il PM verifica l'Approval di Simone al cancello 2.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { collector } from './lib/report.ts';

export function checkRedirects(root: string) {
	const { findings, error } = collector('release');
	const read = (file: string) => existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : undefined;
	const brief = read('docs/brief.md');
	const map = read('docs/redirects.md');
	const configText = read('vercel.json');
	let redirects: unknown[] = [];
	if (configText !== undefined) {
		try {
			const config = JSON.parse(configText);
			if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('serve un oggetto JSON');
			if (config.redirects !== undefined && !Array.isArray(config.redirects)) throw new Error('redirects deve essere un elenco');
			redirects = config.redirects ?? [];
		} catch (cause) {
			error({ file: 'vercel.json', message: `configurazione non valida: ${(cause as Error).message}` });
			return findings;
		}
	}
	// Il template non ha ancora un brief. Un brief presente deve dare una risposta esplicita.
	const answer = brief?.match(/^\s*-\s*Esiste un sito online\?\s*:?\s*(sì|si|no)(?=\s|[,.;]|$)/im)?.[1].toLowerCase();
	if (brief !== undefined && !answer) {
		error({ file: 'docs/brief.md', where: 'Sito esistente e dominio', message: 'indica «Esiste un sito online? sì, <indirizzo>» oppure «Esiste un sito online? no»' });
	}
	if (map === undefined) {
		if (answer === 'sì' || answer === 'si' || redirects.length > 0) {
			error({ file: 'docs/redirects.md', message: 'manca la mappa dei redirect decisa al cancello 2', hint: 'prepara la mappa con la skill redirect e registra la decisione di Simone prima del rilascio' });
		}
		return findings;
	}
	const state = map.match(/^Stato:\s*(approvata|respinta) il (\d{2})\/(\d{2})\/(\d{4})\s*$/m);
	const date = state && new Date(`${state[4]}-${state[3]}-${state[2]}T00:00:00Z`);
	if (!state || !date || Number.isNaN(date.getTime()) || date.getUTCDate() !== Number(state[2]) || date.getUTCMonth() + 1 !== Number(state[3])) {
		error({ file: 'docs/redirects.md', where: 'Stato', message: 'serve una decisione datata: «Stato: approvata il gg/mm/aaaa» oppure «Stato: respinta il gg/mm/aaaa»' });
		return findings;
	}
	const approved = new Map<string, string>();
	const seen = new Set<string>();
	const lines = map.split(/\r?\n/);
	const header = lines.findIndex((line) => /^\|\s*Vecchio URL\s*\|\s*Nuovo URL\s*\|\s*Decisione\s*\|\s*Note\s*\|\s*$/.test(line.trim()));
	if (header < 0) error({ file: 'docs/redirects.md', message: 'manca la tabella «Vecchio URL | Nuovo URL | Decisione | Note»' });
	else {
		for (let index = header + 1; index < lines.length; index++) {
			const line = lines[index].trim();
			if (!line.startsWith('|')) break;
			const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
			if (cells.length === 4 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
			const where = `riga ${index + 1}`;
			if (!line.endsWith('|') || cells.length !== 4) {
				error({ file: 'docs/redirects.md', where, message: 'servono quattro celle nella tabella dei redirect' });
				continue;
			}
			const [source, destination, decision, notes] = cells;
			if (!/^\/(?!\/)[^\s?#]*$/.test(source) || seen.has(source)) {
				error({ file: 'docs/redirects.md', where, message: `vecchio percorso non valido o duplicato: ${source}` });
			}
			seen.add(source);
			if (!/^(sì|si|no)$/i.test(decision)) error({ file: 'docs/redirects.md', where, message: 'ogni decisione deve essere «sì» o «no», senza proposte ancora aperte' });
			if (/^(sì|si)$/i.test(decision)) {
				if (state[1] === 'respinta') error({ file: 'docs/redirects.md', where, message: 'una mappa respinta non può contenere righe approvate' });
				if (!/^\/(?!\/)\S*$/.test(destination) || destination === source) error({ file: 'docs/redirects.md', where, message: 'il nuovo URL deve essere un percorso del sito diverso dal vecchio URL' });
				approved.set(source, destination);
			} else if (decision.toLowerCase() === 'no' && !notes) error({ file: 'docs/redirects.md', where, message: 'indica nelle note il motivo del mancato redirect' });
		}
	}
	if (header >= 0 && seen.size === 0) error({ file: 'docs/redirects.md', message: 'la tabella non contiene URL decisi: elenca i vecchi percorsi e motiva quelli senza redirect' });
	const actual = new Set<string>();
	for (const [index, value] of redirects.entries()) {
		const row = value as Record<string, unknown> | null;
		if (!row || typeof row !== 'object' || Array.isArray(row) || typeof row.source !== 'string' || typeof row.destination !== 'string' || row.permanent !== true || Object.keys(row).some((key) => !['source', 'destination', 'permanent'].includes(key))) {
			error({ file: 'vercel.json', where: `redirects[${index + 1}]`, message: 'usa solo source, destination e permanent: true, come nella mappa approvata' });
			continue;
		}
		if (actual.has(row.source) || approved.get(row.source) !== row.destination) error({ file: 'vercel.json', where: `redirects[${index + 1}]`, message: `redirect duplicato o diverso dalla mappa approvata: ${row.source} → ${row.destination}` });
		actual.add(row.source);
	}
	for (const [source, destination] of approved) {
		if (!actual.has(source)) error({ file: 'vercel.json', where: 'redirects', message: `manca il redirect approvato: ${source} → ${destination}` });
	}
	return findings;
}
