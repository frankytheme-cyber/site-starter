import { SPECIAL_HREFS, type SpecialHref } from './ui/button/cta';
import { getSiteSettings, phoneHref, type SiteSettings, whatsappHref } from './settings';

/*
 * Link speciali dei pulsanti: "@telefono", "@whatsapp", "@email", "@mappa" diventano tel:,
 * https://wa.me/, mailto: e un link a Google Maps con i dati di site.json. Se il dato manca
 * la build si ferma: meglio un errore che un pulsante che non porta da nessuna parte.
 */

export const isSpecialHref = (href: string): href is SpecialHref => (SPECIAL_HREFS as readonly string[]).includes(href);

/** Ricerca su Google Maps dell'indirizzo completo. */
export function mapsHref({ street, postalCode, city, province }: SiteSettings['address']): string {
	const query = `${street}, ${postalCode} ${city} (${province})`;
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function missing(href: SpecialHref, field: string): never {
	throw new Error(
		`Il link "${href}" usa ${field} di src/content/settings/site.json, che manca: aggiungilo in «Dati attività» o cambia il link.`,
	);
}

export function resolveSpecialHref(href: SpecialHref, site: SiteSettings): string {
	switch (href) {
		case '@telefono':
			return site.phone ? phoneHref(site.phone) : missing(href, 'il telefono (phone)');
		case '@whatsapp':
			return site.whatsapp ? whatsappHref(site.whatsapp) : missing(href, 'il numero WhatsApp (whatsapp)');
		case '@email':
			return site.email ? `mailto:${site.email}` : missing(href, 'l’email (email)');
		case '@mappa':
			return site.address?.street ? mapsHref(site.address) : missing(href, 'l’indirizzo (address)');
	}
}

/** href pronto per il markup: i link speciali risolti, gli altri invariati. */
export async function resolveHref(href: string): Promise<string> {
	return isSpecialHref(href) ? resolveSpecialHref(href, await getSiteSettings()) : href;
}

/** Link esterno: http(s) verso un host diverso da quello del sito. */
export function isExternal(href: string, site: URL | undefined): boolean {
	if (!/^https?:\/\//i.test(href)) return false;
	return !site || new URL(href).host !== site.host;
}
