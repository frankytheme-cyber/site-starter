import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkRedirects } from './redirects.ts';

const redirect = { source: '/vecchia/', destination: '/servizi/', permanent: true };
const approvedMap = 'Stato: approvata il 17/10/2026\n\n| Vecchio URL | Nuovo URL | Decisione | Note |\n| --- | --- | --- | --- |\n| /vecchia/ | /servizi/ | sì | |\n';

function check(files: Record<string, string>) {
	const root = mkdtempSync(join(tmpdir(), 'redirects-test-'));
	try {
		mkdirSync(join(root, 'docs'));
		for (const [name, content] of Object.entries(files)) writeFileSync(join(root, name), content);
		return checkRedirects(root);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
}
const valid = {
	'docs/brief.md': '- Esiste un sito online? sì, https://esempio.it',
	'docs/redirects.md': approvedMap,
	'vercel.json': JSON.stringify({ headers: [], redirects: [redirect] }),
};

test('template senza brief e sito nuovo senza redirect', () => {
	assert.deepEqual(check({}), []);
	assert.deepEqual(check({ 'docs/brief.md': '- Esiste un sito online? no' }), []);
});
test('mappa approvata con redirect corrispondenti', () => assert.deepEqual(check(valid), []));
test('sito esistente senza mappa e brief non compilato', () => {
	assert.ok(check({ 'docs/brief.md': valid['docs/brief.md'] }).some((f) => f.file === 'docs/redirects.md'));
	assert.ok(check({ 'docs/brief.md': '- Esiste un sito online? si/no, indirizzo' }).some((f) => f.file === 'docs/brief.md'));
});
test('redirect senza brief richiede comunque una mappa', () => {
	assert.ok(check({ 'vercel.json': valid['vercel.json'] }).length > 0);
});
test('proposta e data inesistente bloccano il rilascio', () => {
	for (const state of ['proposta', 'approvata il 31/02/2026']) {
		assert.ok(check({ ...valid, 'docs/redirects.md': approvedMap.replace('approvata il 17/10/2026', state) }).length > 0);
	}
});
test('decisione pendente e rifiuto senza motivazione', () => {
	for (const decision of ['proposta', 'no']) {
		assert.ok(check({ ...valid, 'docs/redirects.md': approvedMap.replace('| sì |', `| ${decision} |`) }).length > 0);
	}
});
test('mappa respinta con motivazione, senza redirect', () => {
	const map = approvedMap.replace('approvata', 'respinta').replace('| sì | |', '| no | Nessuna pagina equivalente |');
	assert.deepEqual(check({ ...valid, 'docs/redirects.md': map, 'vercel.json': '{}' }), []);
	assert.ok(check({ ...valid, 'docs/redirects.md': map }).length > 0);
});
test('redirect mancante, diverso, duplicato o condizionale', () => {
	for (const redirects of [[], [{ ...redirect, destination: '/' }], [redirect, redirect], [{ ...redirect, has: [] }], [{ ...redirect, permanent: false }]]) {
		assert.ok(check({ ...valid, 'vercel.json': JSON.stringify({ redirects }) }).length > 0);
	}
});
test('JSON errato e redirects non in elenco sono segnalati', () => {
	for (const content of ['{', 'null', '[]', '{"redirects":{}}']) {
		assert.ok(check({ ...valid, 'vercel.json': content }).length > 0);
	}
});
test('tabella mancante o righe malformate non autorizzano redirect', () => {
	for (const map of [approvedMap.split('\n\n')[0], approvedMap.replace('| sì | |', '| sì |')]) {
		assert.ok(check({ ...valid, 'docs/redirects.md': map }).length > 0);
	}
});
test('tabella vuota non vale come decisione completata', () => {
	const map = approvedMap.replace('| /vecchia/ | /servizi/ | sì | |\n', '');
	assert.ok(check({ ...valid, 'docs/redirects.md': map, 'vercel.json': '{}' }).length > 0);
});
