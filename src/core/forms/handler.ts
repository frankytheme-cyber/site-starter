import { createHash } from 'node:crypto';
import { z } from 'astro/zod';
import { FORM_LIMITS } from './fields.ts';

const oneLine = (max: number) => z.string().trim().max(max).regex(/^[^\r\n\u0000]*$/);
const submission = z.object({
	variant: z.enum(['contatto', 'preventivo']),
	name: oneLine(FORM_LIMITS.name).min(2),
	email: z.email().max(FORM_LIMITS.email),
	phone: z.string().trim().max(FORM_LIMITS.phone).regex(/^(?:[+\d(). /-]{5,30})?$/).default(''),
	message: z.string().trim().min(10).max(FORM_LIMITS.message).regex(/^[^\u0000]*$/),
	service: oneLine(FORM_LIMITS.service).default(''),
	city: oneLine(FORM_LIMITS.city).default(''),
	privacy: z.literal('accepted'),
}).refine((data) => data.variant !== 'preventivo' || Boolean(data.service && data.city));

interface FormSite { email: string; url: string; businessName: string }
interface FormEnvironment { RESEND_API_KEY?: string; RESEND_FROM?: string; SITE_STARTER_LIBRARY?: string; VERCEL_URL?: string }
interface Options {
	site: FormSite;
	env: FormEnvironment;
	/** Iniettato nei test: nessun test deve spedire email vere. */
	fetch?: typeof fetch;
}

const MAX_BODY = 64 * 1024;
const SENT = 'La tua richiesta è stata inviata. Grazie per averci scritto.';
const FAILED = 'Non è stato possibile inviare la richiesta. Torna al modulo per riprovare oppure usa i recapiti dell’attività.';

/** Risposta leggibile anche per il POST HTML nativo, senza JavaScript. Nessun dato inviato è riflesso nell’HTML. */
function reply(request: Request, status: number, message: string, extra: Record<string, string> = {}) {
	const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra };
	if (request.headers.get('accept')?.includes('application/json')) {
		return Response.json({ ok: status === 200, message }, { status, headers });
	}
	return new Response(`<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Esito della richiesta</title><main><h1>${status === 200 ? 'Richiesta inviata' : 'Richiesta non inviata'}</h1><p>${message}</p><p><a href="/">Torna al sito</a></p></main></html>`, {
		status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; base-uri 'none'; frame-ancestors 'none'" },
	});
}

/** Limite effettivo anche senza Content-Length: non si carica un corpo arbitrario in memoria. */
async function readBody(request: Request) {
	if (Number(request.headers.get('content-length')) > MAX_BODY) throw new Error('body-too-large');
	const reader = request.body?.getReader();
	if (!reader) return '';
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_BODY) { await reader.cancel(); throw new Error('body-too-large'); }
			chunks.push(value);
		}
	} finally { reader.releaseLock(); }
	return Buffer.concat(chunks).toString('utf8');
}

/** Usato dalla funzione Vercel in api/contact.ts. Il sito Astro rimane statico. */
export async function handleContact(request: Request, { site, env, fetch: send = fetch }: Options): Promise<Response> {
	if (request.method !== 'POST') return reply(request, 405, 'Questo indirizzo accetta solo l’invio del modulo.', { Allow: 'POST' });
	if (env.SITE_STARTER_LIBRARY === '1') return reply(request, 403, 'Il catalogo è dimostrativo: nessuna email viene inviata.');
	// Origini esatte: dominio configurato e singolo deployment Vercel, mai *.vercel.app o Host del client.
	const origins = new Set([new URL(site.url).origin]);
	if (env.VERCEL_URL) origins.add(`https://${env.VERCEL_URL}`);
	if (!origins.has(request.headers.get('origin') ?? '')) return reply(request, 403, 'Invia la richiesta dal modulo sul sito.');
	if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/x-www-form-urlencoded') {
		return reply(request, 415, 'Formato della richiesta non supportato.');
	}
	let fields: URLSearchParams;
	try { fields = new URLSearchParams(await readBody(request)); }
	catch { return reply(request, 413, 'La richiesta è troppo grande o non leggibile.'); }
	for (const key of fields.keys()) {
		if (fields.getAll(key).length !== 1) return reply(request, 400, 'La richiesta contiene campi ripetuti.');
	}
	// Honeypot: risposta neutra senza contattare Resend.
	if (fields.get('website')) return reply(request, 200, SENT);
	const parsed = submission.safeParse(Object.fromEntries(fields));
	if (!parsed.success) return reply(request, 400, 'Controlla i campi obbligatori, il formato dell’email e la presa visione dell’informativa privacy.');
	if (!env.RESEND_API_KEY || !env.RESEND_FROM || !z.email().safeParse(site.email).success || /[\r\n]/.test(env.RESEND_FROM)) {
		return reply(request, 503, FAILED);
	}
	const data = parsed.data;
	const text = [
		`Nome: ${data.name}`, `Email: ${data.email}`, `Telefono: ${data.phone || 'Non indicato'}`,
		...(data.variant === 'preventivo' ? [`Servizio: ${data.service}`, `Comune: ${data.city}`] : []),
		'', 'Messaggio:', data.message, '', 'Presa visione dell’informativa privacy: confermata.',
	].join('\n');
	// Un retry con gli stessi dati non genera una seconda email nelle 24 ore di Resend.
	const key = createHash('sha256').update(JSON.stringify({ to: site.email, ...data })).digest('hex');
	try {
		const response = await send('https://api.resend.com/emails', {
			method: 'POST',
			headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact/${key}` },
			body: JSON.stringify({
				from: env.RESEND_FROM, to: [site.email], reply_to: data.email,
				subject: data.variant === 'preventivo' ? 'Nuova richiesta di preventivo dal sito' : 'Nuovo messaggio dal sito',
				text,
			}),
			signal: AbortSignal.timeout(10000),
		});
		if (!response.ok) return reply(request, response.status === 429 ? 429 : 502, FAILED);
		const result = await response.json();
		if (typeof result.id !== 'string' || !result.id) return reply(request, 502, FAILED);
		return reply(request, 200, SENT);
	} catch {
		// Nessun payload, indirizzo personale o errore del provider nei log o nelle risposte.
		return reply(request, 502, FAILED);
	}
}
