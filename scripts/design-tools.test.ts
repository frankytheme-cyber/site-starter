import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import sharp from 'sharp';
import { z } from 'astro/zod';
import { withProjectModules } from './checks/lib/vite.ts';
import { ROOT } from './checks/lib/project.ts';
import { imageInventory, prepareImage } from './lib/images.ts';
import { designFingerprint, reusableDesignReport } from './lib/design-evidence.ts';

test('inventario: include sottocartelle, esclude fixture, directory con estensione e symlink', (t) => {
	const root = mkdtempSync(join(tmpdir(), 'images-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	for (const dir of ['lavori/2026', 'fixtures', 'directory.jpg']) mkdirSync(join(root, dir), { recursive: true });
	for (const file of ['foto.JPG', 'lavori/2026/dettaglio.webp', 'fixtures/finta.jpg', 'note.txt']) writeFileSync(join(root, file), 'fixture');
	symlinkSync(root, join(root, 'ciclo'));
	assert.deepEqual(imageInventory(root), ['foto.JPG', 'lavori/2026/dettaglio.webp'].map((file) => join(root, file)));
});

test('preparazione in posizione: orienta, riduce, rimuove metadati; un errore conserva la destinazione', async (t) => {
	const root = mkdtempSync(join(tmpdir(), 'prepare-image-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const file = join(root, 'foto.jpg');
	await sharp({ create: { width: 3000, height: 1500, channels: 3, background: '#aabbcc' } }).jpeg().withMetadata({ orientation: 6 }).toFile(file);
	await prepareImage(file, file, 'jpeg');
	const meta = await sharp(file).metadata();
	assert.deepEqual([meta.width, meta.height], [1200, 2400]);
	assert.equal(meta.exif, undefined);
	assert.equal(meta.orientation, undefined);
	const valid = readFileSync(file);
	writeFileSync(join(root, 'broken.jpg'), 'non è una foto');
	await assert.rejects(prepareImage(join(root, 'broken.jpg'), file, 'jpeg'));
	assert.deepEqual(readFileSync(file), valid);
	assert.deepEqual(readdirSync(root).sort(), ['broken.jpg', 'foto.jpg']);
});

test('catalogo mirato: regole, campi, ricerche e argomenti errati', () => {
	const query = (...args: string[]) => spawnSync(process.execPath, ['scripts/catalog-query.ts', ...args], { cwd: ROOT, encoding: 'utf8' });
	const hero = query('hero');
	assert.equal(hero.status, 0, hero.stderr);
	const data = JSON.parse(hero.stdout);
	assert.equal(data.result.type, 'hero');
	assert(data.result.fields.some((field: { path: string }) => field.path === 'imageShape'));
	assert(data.result.rules.length > 0);
	assert(JSON.parse(query('--regole').stdout).result.composition.includes('Regole di composizione'));
	assert(JSON.parse(query('--icone', 'telefono').stdout).result.some((icon: { alias: string }) => icon.alias === 'telefono'));
	assert(JSON.parse(query('--temi', 'terracotta').stdout).result.palettes.some((palette: { key: string }) => palette.key === 'terracotta'));
	assert.equal(query('blocco-assente').status, 1);
	assert.equal(query('--icone').status, 1);
});

test('evidenze: riuso esatto, invalidazione per contenuto/opzioni e screenshot mancanti', (t) => {
	const root = mkdtempSync(join(tmpdir(), 'design-evidence-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	mkdirSync(join(root, 'src'), { recursive: true });
	writeFileSync(join(root, 'src/page.json'), '{"title":"prima"}');
	const options = { widths: [375, 1280] };
	const fingerprint = designFingerprint(root, options);
	const dir = join(root, 'reports/2026-10-21');
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, 'page.jpg'), 'image');
	writeFileSync(join(dir, 'manifest.json'), JSON.stringify({ fingerprint, success: true, files: ['page.jpg'] }));
	assert.equal(reusableDesignReport(join(root, 'reports'), fingerprint), dir);
	assert.notEqual(designFingerprint(root, { widths: [375] }), fingerprint);
	writeFileSync(join(root, 'src/page.json'), '{"title":"dopo"}');
	assert.notEqual(designFingerprint(root, options), fingerprint);
	rmSync(join(dir, 'page.jpg'));
	assert.equal(reusableDesignReport(join(root, 'reports'), fingerprint), undefined);
});

test('Chromium mancante: errore utile prima di avviare Astro', (t) => {
	const browsers = mkdtempSync(join(tmpdir(), 'missing-browser-'));
	t.after(() => rmSync(browsers, { recursive: true, force: true }));
	const result = spawnSync(process.execPath, ['scripts/design-shots.ts', '--percorsi', '/'], {
		cwd: ROOT, encoding: 'utf8', timeout: 20_000, env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsers },
	});
	assert.equal(result.status, 1, result.stderr);
	assert.match(result.stderr, /npx playwright install chromium/);
	assert.doesNotMatch(result.stdout, /Server di sviluppo/);
});

// La correzione del caso senza foto non deve indebolire il requisito delle vecchie varianti.
test('aperture testuali senza foto e obbligo foto delle varianti esistenti', async () => {
	await withProjectModules(async (load) => {
		const { schema } = await load('/src/blocks/hero/schema.ts');
		const hero = schema({ image: () => z.string() });
		const content = { title: 'Piante per la casa', primaryCta: { label: 'Scopri i servizi', href: '#servizi' } };
		for (const variant of ['centered', 'editoriale', 'manifesto']) assert(hero.safeParse({ ...content, variant }).success, variant);
		for (const variant of ['split', 'full']) {
			const result = hero.safeParse({ ...content, variant });
			assert(!result.success, `${variant} deve ancora richiedere la foto`);
			assert(result.error.issues.some((issue: { path: string[] }) => issue.path[0] === 'image'));
			assert(hero.safeParse({ ...content, variant, image: { src: 'fixture.jpg', alt: 'Pianta in vaso' } }).success);
		}
	});
});
