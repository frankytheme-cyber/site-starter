import { AstroError } from 'astro/errors';
import { fieldLocation } from './content-validation';
import { SPECIAL_HREF_TARGETS, SPECIAL_HREFS, type SpecialHref } from './ui/button/cta';
import { getSiteSettings, phoneHref, type SiteSettings, whatsappHref } from './settings';

/*
 * Link speciali dei pulsanti: "@telefono", "@whatsapp", "@email", "@mappa" diventano tel:,
 * https://wa.me/, mailto: e un link a Google Maps con i dati di site.json. Se il dato manca
 * la build si ferma: meglio un errore che un pulsante che non porta da nessuna parte.
 */

export const isSpecialHref = (href: string): href is SpecialHref => (SPECIAL_HREFS as readonly string[]).includes(href);

/** Il dato di site.json da cui nasce ogni link speciale, come si chiama nei messaggi. */
const SOURCE_NAMES: Record<SpecialHref, string> = {
	'@telefono': 'il telefono',
	'@whatsapp': 'il numero WhatsApp',
	'@email': 'l’email',
	'@mappa': 'l’indirizzo',
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** site.json ha il dato che serve al link speciale? Per @mappa basta la via. */
function hasSource(href: SpecialHref, site: Record<string, unknown>): boolean {
	const value = site[SPECIAL_HREF_TARGETS[href].from];
	return href === '@mappa' ? isRecord(value) && Boolean(value.street) : Boolean(value);
}

/** Ricerca su Google Maps dell'indirizzo completo. */
export function mapsHref({ street, postalCode, city, province }: SiteSettings['address']): string {
	const query = `${street}, ${postalCode} ${city} (${province})`;
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function resolveSpecialHref(href: SpecialHref, site: SiteSettings): string {
	if (!hasSource(href, site)) {
		throw new Error(
			`Il link "${href}" usa ${SOURCE_NAMES[href]} (${SPECIAL_HREF_TARGETS[href].from}) di src/content/settings/site.json, che manca: aggiungilo in «Dati attività» o cambia il link.`,
		);
	}
	switch (href) {
		case '@telefono':
			return phoneHref(site.phone);
		case '@whatsapp':
			return whatsappHref(site.whatsapp!);
		case '@email':
			return `mailto:${site.email}`;
		case '@mappa':
			return mapsHref(site.address);
	}
}

export interface SpecialHrefProblem {
	/** fieldLocation del campo: «sezione 3 (cta) → primary.href», o «cta.href» nel menu. */
	where: string;
	message: string;
	hint: string;
}

/**
 * I link speciali di una ricetta o di navigation.json che site.json non risolve, con sezione e
 * campo. Li cercano il check recipes, prima della build, e le pagine prima di disegnarsi: il
 * loader dei contenuti non basterebbe, perché Astro non rilegge una ricetta che non è cambiata
 * anche se è cambiato site.json.
 */
export function specialHrefProblems(data: unknown, site: Record<string, unknown>): SpecialHrefProblem[] {
	const problems: SpecialHrefProblem[] = [];
	const visit = (value: unknown, path: (string | number)[]) => {
		if (Array.isArray(value)) value.forEach((item, index) => visit(item, [...path, index]));
		else if (isRecord(value)) {
			for (const [key, item] of Object.entries(value)) {
				if (key === 'href' && typeof item === 'string' && isSpecialHref(item) && !hasSource(item, site)) {
					problems.push({
						where: fieldLocation(data, [...path, key]),
						message: `${item} ma site.json non ha ${SPECIAL_HREF_TARGETS[item].from}`,
						hint: `aggiungi ${SOURCE_NAMES[item]} in «Dati attività» (src/content/settings/site.json) o cambia il link`,
					});
				} else visit(item, [...path, key]);
			}
		}
	};
	visit(data, []);
	return problems;
}

/**
 * Ferma la build con file, sezione e campo dei link speciali senza dato:
 * «pagina index.json → sezione 3 (cta) → primary.href: @whatsapp ma site.json non ha whatsapp».
 */
export function assertSpecialHrefs(name: string, data: unknown, site: SiteSettings) {
	const problems = specialHrefProblems(data, site);
	if (problems.length === 0) return;
	throw new AstroError(
		['Link speciali senza il dato in site.json:', ...problems.map(({ where, message }) => `${name} → ${where}: ${message}`)].join('\n'),
		'aggiungi il dato in «Dati attività» (src/content/settings/site.json) o cambia il link',
	);
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
