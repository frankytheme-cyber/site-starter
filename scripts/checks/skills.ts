/**
 * skills: le skill per gli agenti (Claude Code e Codex) stanno in .agents/skills/<nome>/SKILL.md, dove
 * le cerca Codex. Claude Code le cerca in .claude/skills/<nome>/SKILL.md: lì ognuna ha un rimando con
 * lo stesso nome e la stessa descrizione (decide quando l'agente la usa), come CLAUDE.md per AGENTS.md.
 * Frontmatter YAML valido, nome uguale alla cartella, rimandi allineati e nessun rimando orfano.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { type CheckContext, collector } from './lib/report.ts';

export const SKILLS_DIR = '.agents/skills';
export const CLAUDE_SKILLS_DIR = '.claude/skills';

interface Skill {
	name?: unknown;
	description?: unknown;
	body: string;
}

/** Frontmatter e testo di uno SKILL.md; un messaggio se il frontmatter manca o non è YAML valido. */
function readSkill(file: string): Skill | string {
	const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(readFileSync(file, 'utf8'));
	if (!match) return 'il file non inizia con il frontmatter (--- name, description ---)';
	try {
		const fields = parse(match[1]) as Record<string, unknown> | null;
		return { name: fields?.name, description: fields?.description, body: match[2] };
	} catch (cause) {
		return `frontmatter YAML non valido: ${(cause as Error).message.split('\n')[0]}`;
	}
}

const subdirs = (root: string, dir: string) =>
	existsSync(join(root, dir))
		? readdirSync(join(root, dir), { withFileTypes: true })
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name)
				.sort()
		: [];

export function skills({ root }: CheckContext) {
	const { findings, error } = collector('skills');
	const yamlHint = 'tra le due righe --- servono name: e description: su una riga ciascuno; una descrizione con «: » va tra virgolette';

	for (const name of subdirs(root, SKILLS_DIR)) {
		const file = `${SKILLS_DIR}/${name}/SKILL.md`;
		if (!existsSync(join(root, file))) {
			error({ file: `${SKILLS_DIR}/${name}`, message: 'cartella senza SKILL.md', hint: 'scrivi la skill in SKILL.md o togli la cartella' });
			continue;
		}
		const skill = readSkill(join(root, file));
		if (typeof skill === 'string') {
			error({ file, message: skill, hint: yamlHint });
			continue;
		}
		if (skill.name !== name) error({ file, message: `name «${String(skill.name)}» diverso dalla cartella «${name}»`, hint: `name: ${name}` });
		if (typeof skill.description !== 'string' || skill.description.trim() === '') {
			error({ file, message: 'manca la descrizione', hint: 'description: quando usarla, in una frase: da lì l’agente sceglie la skill' });
		}

		const pointerFile = `${CLAUDE_SKILLS_DIR}/${name}/SKILL.md`;
		const hint = `stesso name e description di ${file} e, nel testo, il rimando a ${file}`;
		if (!existsSync(join(root, pointerFile))) {
			error({ file: pointerFile, message: 'manca il rimando per Claude Code', hint });
			continue;
		}
		const pointer = readSkill(join(root, pointerFile));
		if (typeof pointer === 'string') {
			error({ file: pointerFile, message: pointer, hint: yamlHint });
			continue;
		}
		if (pointer.name !== skill.name || pointer.description !== skill.description) {
			error({ file: pointerFile, message: `name o description diversi da ${file}`, hint });
		}
		if (!pointer.body.includes(file)) error({ file: pointerFile, message: `il testo non rimanda a ${file}`, hint });
	}

	for (const name of subdirs(root, CLAUDE_SKILLS_DIR)) {
		if (!existsSync(join(root, SKILLS_DIR, name, 'SKILL.md'))) {
			error({
				file: `${CLAUDE_SKILLS_DIR}/${name}`,
				message: `rimando senza la skill ${SKILLS_DIR}/${name}/SKILL.md`,
				hint: `il testo della skill va in ${SKILLS_DIR}/${name}/SKILL.md; in ${CLAUDE_SKILLS_DIR} solo il rimando`,
			});
		}
	}
	return findings;
}
