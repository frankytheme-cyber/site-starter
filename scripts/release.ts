/**
 * Rilascio della libreria: npm run release -- vX.Y.Z
 * 1. controlla la versione (vX.Y.Z, maggiore di quella in library.manifest.json), che il tag non
 *    esista e che il working tree sia pulito: nel commit di rilascio entra solo quello che produce;
 * 2. scrive la versione in library.manifest.json e package.json, e in CHANGELOG.md dà alla sezione
 *    «## Non rilasciato» il titolo «## vX.Y.Z (data)» (blocks:sync ne legge i breaking change);
 * 3. npm run gen:catalog, npm run screenshots (build compresa), npm run check;
 * 4. commit «Rilascio vX.Y.Z» e tag annotato vX.Y.Z.
 * Il push resta a mano (git push --follow-tags). Se un passo fallisce si ferma senza commit: le
 * modifiche restano nel working tree (git restore . per annullarle).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { requireLibraryMode } from '../src/core/mode.ts';
import { ROOT } from './checks/lib/project.ts';

requireLibraryMode('npm run release');

const MANIFEST = join(ROOT, 'library.manifest.json');
const CHANGELOG = join(ROOT, 'CHANGELOG.md');
const UNRELEASED = /^## Non rilasciato\s*$/m;

function fail(message: string): never {
	console.error(`✗ ${message}`);
	process.exit(1);
}

function run(command: string, args: string[], options: { capture?: boolean } = {}) {
	const result = spawnSync(command, args, {
		cwd: ROOT,
		stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
		encoding: 'utf8',
		shell: process.platform === 'win32',
	});
	if (result.status !== 0) fail(`${command} ${args.join(' ')} non riuscito${options.capture ? `: ${result.stderr.trim()}` : ''}`);
	return result.stdout?.trim() ?? '';
}

const parse = (version: string) => version.split('.').map(Number);
const newer = (a: string, b: string) => {
	const [x, y] = [parse(a), parse(b)];
	for (let index = 0; index < 3; index++) if (x[index] !== y[index]) return x[index] > y[index];
	return false;
};

const tag = process.argv[2];
if (!tag || !/^v\d+\.\d+\.\d+$/.test(tag)) fail('uso: npm run release -- vX.Y.Z (es. v1.2.0)');
const version = tag.slice(1);
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const current = String(manifest.version ?? '0.0.0');
if (!newer(version, current)) fail(`${tag} non è maggiore della versione attuale v${current}`);
if (run('git', ['tag', '--list', tag], { capture: true })) fail(`il tag ${tag} esiste già`);
if (run('git', ['status', '--porcelain'], { capture: true })) fail('ci sono modifiche non committate: fai il commit o accantonale prima del rilascio');

console.log(`Rilascio ${tag} (da v${current})\n`);
writeFileSync(MANIFEST, readFileSync(MANIFEST, 'utf8').replace(/"version":\s*"[^"]*"/, `"version": "${version}"`));
run('npm', ['version', version, '--no-git-tag-version', '--allow-same-version']);
if (existsSync(CHANGELOG) && UNRELEASED.test(readFileSync(CHANGELOG, 'utf8'))) {
	const date = new Date().toISOString().slice(0, 10);
	writeFileSync(CHANGELOG, readFileSync(CHANGELOG, 'utf8').replace(UNRELEASED, `## ${tag} (${date})`));
} else {
	console.warn('! CHANGELOG.md senza sezione «## Non rilasciato»: i siti non vedranno note per questa versione.');
}
run('npm', ['run', 'gen:catalog']);
run('npm', ['run', 'screenshots']);
run('npm', ['run', 'check']);

run('git', ['add', '-A']);
run('git', ['commit', '-m', `Rilascio ${tag}`]);
run('git', ['tag', '-a', tag, '-m', `site-starter ${tag}`]);
console.log(`\n✓ ${tag}: commit e tag creati. Per pubblicarli: git push --follow-tags`);
