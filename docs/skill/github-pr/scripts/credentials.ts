/** Credenziali effimere dell'operazione: mai persistite né stampate. */
export async function githubToken(
	env: NodeJS.ProcessEnv = process.env,
	request: typeof fetch = fetch,
): Promise<string> {
	const managedRun = env.PAPERCLIP_AGENT_ID || env.PAPERCLIP_RUN_ID || env.PAPERCLIP_GITHUB_BROKER_URL;
	if (managedRun && !env.PAPERCLIP_GITHUB_BROKER_TOKEN) {
		throw new Error('Run Paperclip senza capability GitHub: verificare il runtime, nessun ripiego su token ereditati.');
	}
	// Nel runtime gestito la capability prevale sempre sui token ereditati.
	if (env.PAPERCLIP_GITHUB_BROKER_TOKEN) {
		const base = env.PAPERCLIP_GITHUB_BROKER_URL || env.PAPERCLIP_API_URL;
		if (!base) throw new Error('Broker GitHub Paperclip non configurato.');
		const url = new URL(base.replace(/\/+$/, '').replace(/\/api$/, '') + '/runtime-tools/github/credentials');
		if (url.username || url.password || url.search || url.hash ||
			(url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)))) {
			throw new Error('Indirizzo del broker GitHub non sicuro.');
		}
		for (let attempt = 0; attempt < 3; attempt++) {
			let response: Response;
			try {
				response = await request(url, {
					method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
					headers: {
						authorization: `Bearer ${env.PAPERCLIP_GITHUB_BRIDGE_TOKEN || env.PAPERCLIP_API_KEY || env.PAPERCLIP_GITHUB_BROKER_TOKEN}`,
						'x-paperclip-github-capability': env.PAPERCLIP_GITHUB_BROKER_TOKEN,
						'content-type': 'application/json',
					}, body: '{}',
				});
			} catch {
				if (attempt < 2) continue;
				throw new Error('Broker GitHub non raggiungibile dopo tre tentativi.');
			}
			if ((response.status === 409 || response.status >= 500) && attempt < 2) {
				await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
				continue;
			}
			if (!response.ok) throw new Error(`Broker GitHub HTTP ${response.status}: verificare la capability della run; nessun cambio di identità.`);
			let result: { status?: string; env?: Record<string, string> };
			try { result = await response.json(); }
			catch { throw new Error('Risposta del broker GitHub non valida.'); }
			const token = result?.env?.GH_TOKEN || result?.env?.GITHUB_TOKEN;
			if (result?.status !== 'available' || !token) {
				throw new Error('Credenziale gestita GitHub non disponibile per questa run. Verificare accesso e identità in Paperclip.');
			}
			return token;
		}
	}
	const token = env.GH_TOKEN || env.GITHUB_TOKEN;
	if (!token) throw new Error('Nessuna credenziale GitHub: servono il broker della run Paperclip oppure GH_TOKEN/GITHUB_TOKEN fuori dal runtime gestito.');
	return token;
}
