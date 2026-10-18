import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleContact } from '../src/core/forms/handler.ts';

const site = { url: 'https://www.esempio.it', email: 'info@esempio.it', businessName: 'Attività di prova' };
const env = { RESEND_API_KEY: 'test-key', RESEND_FROM: 'Moduli <moduli@esempio.it>' };
const valid = { variant: 'contatto', name: 'Persona Esempio', email: 'persona@example.net', message: 'Vorrei informazioni sui servizi.', privacy: 'accepted', website: '' };
function request(data: Record<string, string> = valid, headers: Record<string, string> = {}) {
	return new Request(`${site.url}/api/contact`, { method: 'POST', headers: { Origin: site.url, Accept: 'application/json', ...headers }, body: new URLSearchParams(data) });
}
const neverSend: typeof fetch = async () => { throw new Error('Il provider non deve essere chiamato'); };

test('invia a site.email con mittente verificato, reply_to del visitatore e testo semplice', async () => {
	let payload: Record<string, unknown> = {};
	let calls = 0;
	const send: typeof fetch = async (url, options) => {
		calls++;
		assert.equal(url, 'https://api.resend.com/emails');
		assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer test-key');
		payload = JSON.parse(String(options?.body));
		return Response.json({ id: 'email-test' });
	};
	const response = await handleContact(request({ ...valid, to: 'attaccante@example.net', from: 'falso@example.net' }), { site, env, fetch: send });
	assert.equal(response.status, 200);
	assert.equal((await response.json()).ok, true);
	assert.equal(calls, 1);
	assert.deepEqual(payload.to, [site.email]);
	assert.equal(payload.from, env.RESEND_FROM);
	assert.equal(payload.reply_to, valid.email);
	assert.equal(payload.html, undefined);
	assert.match(String(payload.text), /Presa visione/);
});

test('rifiuta campi invalidi, privacy assente e preventivi incompleti senza inviare', async () => {
	for (const data of [
		{ ...valid, email: 'non-email' }, { ...valid, privacy: '' }, { ...valid, name: 'A' },
		{ ...valid, message: 'breve' }, { ...valid, message: 'x'.repeat(4001) },
		{ ...valid, variant: 'preventivo' }, { ...valid, variant: 'preventivo', service: 'Restauro' },
		{ ...valid, phone: 'telefono non valido' }, { ...valid, name: 'Nome\r\nBcc: altro' },
	]) assert.equal((await handleContact(request(data), { site, env, fetch: neverSend })).status, 400);
});

test('preventivo valido include servizio e comune nel messaggio', async () => {
	const send: typeof fetch = async (_url, options) => {
		const body = JSON.parse(String(options?.body));
		assert.match(body.text, /Servizio: Restauro/);
		assert.match(body.text, /Comune: Esempio/);
		return Response.json({ id: 'preventivo-test' });
	};
	assert.equal((await handleContact(request({ ...valid, variant: 'preventivo', service: 'Restauro', city: 'Esempio' }), { site, env, fetch: send })).status, 200);
});

test('metodi, origini esterne, catalogo e formati non supportati non chiamano Resend', async () => {
	assert.equal((await handleContact(new Request(`${site.url}/api/contact`), { site, env, fetch: neverSend })).status, 405);
	for (const origin of ['https://altro.example', 'null', 'https://www.esempio.it.attaccante.example', '']) {
		assert.equal((await handleContact(request(valid, { Origin: origin }), { site, env, fetch: neverSend })).status, 403);
	}
	assert.equal((await handleContact(request(), { site, env: { ...env, SITE_STARTER_LIBRARY: '1' }, fetch: neverSend })).status, 403);
	assert.equal((await handleContact(request(valid, { 'Content-Type': 'application/json' }), { site, env, fetch: neverSend })).status, 415);
});

test('ammette solo l’origine dello specifico deployment Vercel', async () => {
	const send: typeof fetch = async () => Response.json({ id: 'preview-test' });
	const options = { site, env: { ...env, VERCEL_URL: 'sito-123.vercel.app' }, fetch: send };
	assert.equal((await handleContact(request(valid, { Origin: 'https://sito-123.vercel.app' }), options)).status, 200);
	assert.equal((await handleContact(request(valid, { Origin: 'https://altro.vercel.app' }), options)).status, 403);
});

test('honeypot, corpo eccessivo e parametri ripetuti non inviano', async () => {
	assert.equal((await handleContact(request({ ...valid, website: 'spam' }), { site, env, fetch: neverSend })).status, 200);
	assert.equal((await handleContact(request({ ...valid, message: 'x'.repeat(65537) }), { site, env, fetch: neverSend })).status, 413);
	const duplicate = new Request(`${site.url}/api/contact`, { method: 'POST', headers: { Origin: site.url, Accept: 'application/json' }, body: new URLSearchParams([...Object.entries(valid), ['email', 'altro@example.net']]) });
	assert.equal((await handleContact(duplicate, { site, env, fetch: neverSend })).status, 400);
});

test('configurazione incompleta, errore provider, rete e risposta inattesa non diventano successi', async () => {
	for (const config of [{}, { RESEND_API_KEY: 'test-key' }, { ...env, RESEND_FROM: 'from\r\nBcc: qualcuno' }]) {
		assert.equal((await handleContact(request(), { site, env: config, fetch: neverSend })).status, 503);
	}
	for (const status of [400, 401, 429, 500]) {
		const send: typeof fetch = async () => Response.json({ error: 'provider detail' }, { status });
		const response = await handleContact(request(), { site, env, fetch: send });
		assert.equal(response.status, status === 429 ? 429 : 502);
		assert.doesNotMatch(await response.text(), /provider detail|test-key/);
	}
	for (const send of [neverSend, async () => Response.json({})]) {
		assert.equal((await handleContact(request(), { site, env, fetch: send })).status, 502);
	}
});

test('retry identico usa la stessa chiave Resend; messaggi diversi hanno chiavi diverse', async () => {
	const keys: (string | null)[] = [];
	const send: typeof fetch = async (_url, options) => {
		keys.push(new Headers(options?.headers).get('Idempotency-Key'));
		return Response.json({ id: 'idempotent-test' });
	};
	for (const message of [valid.message, valid.message, `${valid.message} Grazie!`]) {
		await handleContact(request({ ...valid, message }), { site, env, fetch: send });
	}
	assert.equal(keys[0], keys[1]);
	assert.notEqual(keys[1], keys[2]);
});

test('POST senza JavaScript restituisce HTML accessibile senza riflettere dati personali', async () => {
	const send: typeof fetch = async () => Response.json({ id: 'native-test' });
	const response = await handleContact(request(valid, { Accept: 'text/html' }), { site, env, fetch: send });
	assert.equal(response.status, 200);
	assert.match(response.headers.get('content-type') ?? '', /text\/html/);
	assert.equal(response.headers.get('cache-control'), 'no-store');
	const html = await response.text();
	assert.match(html, /lang="it"/);
	assert.match(html, /Richiesta inviata/);
	assert.doesNotMatch(html, /persona@example.net|Persona Esempio/);
});
