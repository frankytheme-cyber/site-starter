import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Identifica sorgenti e opzioni, anche con modifiche non committate. Non salva contenuti o segreti. */
export function designFingerprint(root: string, options: unknown): string {
	const hash = createHash('sha256').update(JSON.stringify(options));
	const visit = (file: string) => {
		if (!existsSync(file)) return;
		for (const entry of readdirSync(file, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			const path = join(file, entry.name);
			if (entry.isDirectory()) visit(path);
			else if (entry.isFile()) hash.update(relative(root, path)).update('\0').update(readFileSync(path)).update('\0');
		}
	};
	for (const dir of ['src', 'public', 'scripts']) visit(join(root, dir));
	for (const name of ['astro.config.mjs', 'tsconfig.json', 'package-lock.json', '.env', '.env.local', '.env.development', '.env.development.local']) {
		const file = join(root, name);
		if (existsSync(file)) hash.update(name).update('\0').update(readFileSync(file)).update('\0');
	}
	return hash.digest('hex');
}

/** Solo esecuzioni riuscite, con identiche sorgenti/opzioni e tutti gli artefatti ancora presenti. */
export function reusableDesignReport(reports: string, fingerprint: string): string | undefined {
	if (!existsSync(reports)) return;
	for (const entry of readdirSync(reports, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name))) {
		if (!entry.isDirectory()) continue;
		const dir = join(reports, entry.name);
		try {
			const record = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
			if (record.fingerprint === fingerprint && record.success === true && Array.isArray(record.files)
				&& record.files.length > 0 && record.files.every((file: unknown) => typeof file === 'string' && existsSync(join(dir, file)))) return dir;
		} catch { /* Cartella vecchia, incompleta o senza manifest: si rigenera. */ }
	}
}
