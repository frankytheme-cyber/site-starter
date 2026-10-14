import type { APIRoute } from 'astro';

/** robots.txt: tutto indicizzabile tranne CMS e catalogo dei blocchi, con l'indirizzo della sitemap. */
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL('sitemap-index.xml', site).href;
	return new Response(['User-agent: *', 'Disallow: /admin/', 'Disallow: /catalogo/', '', `Sitemap: ${sitemap}`, ''].join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
