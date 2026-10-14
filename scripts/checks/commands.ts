/**
 * astro-check e build: due comandi del progetto, con l'esito tradotto in Finding.
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { type CheckContext, collector } from './lib/report.ts';
import { rel } from './lib/project.ts';

const stripAnsi = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, '');

function exec(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}) {
	return new Promise<{ code: number; output: string }>((resolve) => {
		const child = spawn(command, args, { cwd, env: { ...process.env, ...env, FORCE_COLOR: '0' }, shell: process.platform === 'win32' });
		let output = '';
		child.stdout.on('data', (chunk) => (output += chunk));
		child.stderr.on('data', (chunk) => (output += chunk));
		child.on('close', (code) => resolve({ code: code ?? 1, output: stripAnsi(output) }));
	});
}

/** astro check: errori di tipo in .astro e .ts. */
export async function astroCheck({ root }: CheckContext) {
	const { findings, error, warning } = collector('astro-check');
	const { code, output } = await exec('npx', ['astro', 'check'], root);
	for (const [, file, line, column, level, rule, message] of output.matchAll(
		/^(.+?):(\d+):(\d+) - (error|warning) (\S+?): (.+)$/gm,
	)) {
		const report = level === 'error' ? error : warning;
		report({ file, where: `riga ${line}, colonna ${column}`, message: `${message.trim()} (${rule})` });
	}
	if (code !== 0 && findings.length === 0) {
		error({ message: 'astro check non riuscito', hint: output.trim().split('\n').slice(-8).join(' | ') });
	}
	return findings;
}

/**
 * build: npm run build (con il prebuild che rigenera la configurazione di Decap).
 * Nella suite qa SITE_URL punta al server di anteprima: canonical e Open Graph restano sullo stesso host.
 */
export async function build({ root, baseUrl }: CheckContext) {
	const { findings, error } = collector('build');
	const { code, output } = await exec('npm', ['run', 'build'], root, baseUrl ? { SITE_URL: baseUrl } : {});
	if (code === 0) return findings;

	// L'errore è il blocco di righe dopo l'ultima riga di log ("12:00:00 [build] ...", "> npm run ..."),
	// fino allo stack trace.
	const lines = output.split('\n');
	const lastLog = lines.findLastIndex((line) => /^\d{2}:\d{2}:\d{2} |^\s*generating |^> /.test(line));
	const block = lines
		.slice(lastLog + 1)
		.map((line) => line.trim())
		.filter(Boolean);
	const end = block.findIndex((line) => /^Stack trace|^at /.test(line));
	const detail = end >= 0 ? block.slice(0, end) : block.slice(0, 12);
	const location = detail.indexOf('Location:');
	const path = location >= 0 ? detail[location + 1]?.replace(/:\d+:\d+$/, '') : undefined;
	const file = path && !path.includes('node_modules') && resolve(path).startsWith(root) ? rel(resolve(path)) : undefined;
	error({
		file,
		message: detail
			.filter((_line, index) => location < 0 || (index !== location && index !== location + 1))
			.filter((line) => !/^(Hint:|Error reference:|https:\/\/)/.test(line))
			.join(' · '),
		hint: 'correggi l’errore e rilancia npm run build',
	});
	return findings;
}
