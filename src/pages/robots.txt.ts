import type { APIRoute } from 'astro';

/**
 * robots.txt: tutto indicizzabile tranne il CMS, con l'indirizzo della sitemap. Il catalogo dei
 * blocchi non si blocca qui: è escluso con noindex (meta robots e X-Robots-Tag in vercel.json), che
 * i motori leggono solo se possono aprire la pagina.
 */
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL('sitemap-index.xml', site).href;
	return new Response(['User-agent: *', 'Disallow: /admin/', '', `Sitemap: ${sitemap}`, ''].join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
