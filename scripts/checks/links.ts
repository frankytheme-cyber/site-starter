/**
 * links (suite qa): crawl del sito servito da astro preview con linkinator, ancore comprese.
 * Link interni rotti = errore; esterni rotti = avviso (possono essere fuori servizio di passaggio).
 */
import { LinkChecker } from 'linkinator';
import { type CheckContext, collector } from './lib/report.ts';

export async function links({ baseUrl }: CheckContext) {
	const { findings, error, warning } = collector('links');
	if (!baseUrl) throw new Error('serve il server di anteprima');
	const origin = new URL(baseUrl).origin;
	const checker = new LinkChecker();
	const result = await checker.check({
		path: `${origin}/`,
		recurse: true,
		checkFragments: true,
		timeout: 15_000,
		concurrency: 20,
		retryErrors: true,
		retryErrorsCount: 2,
		// Il CMS è un'app di terzi; tel: e mailto: non si possono verificare.
		linksToSkip: [`^${origin}/admin`, '^mailto:', '^tel:', '^sms:'],
	});
	for (const link of result.links.filter((item) => item.state === 'BROKEN')) {
		const internal = link.url.startsWith(origin);
		const page = link.parent ? new URL(link.parent).pathname : undefined;
		const status = link.status ? `HTTP ${link.status}` : (link.failureDetails?.[0] as Error | undefined)?.message ?? 'non raggiungibile';
		const target = internal ? link.url.slice(origin.length) : link.url;
		(internal ? error : warning)({
			where: page,
			message: `link rotto a ${target} (${status})`,
			hint: internal ? 'correggi il link o crea la pagina/ancora di destinazione' : 'controlla che l’indirizzo esterno sia giusto',
		});
	}
	return findings;
}
