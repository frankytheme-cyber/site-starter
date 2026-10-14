import type { SiteSettings } from './settings';

/*
 * Orari di apertura (site.json → openingHours): righe di giorni con le loro fasce orarie.
 * Da qui escono il testo mostrato sul sito ("Da lunedì a venerdì", "8:30–12:30, 14:00–18:00")
 * e openingHoursSpecification di schema.org per il JSON-LD di BaseLayout.
 */

export const DAYS = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'] as const;
export type Day = (typeof DAYS)[number];

/** Nomi dei giorni: etichette del CMS e testo del sito. */
export const DAY_NAMES: Record<Day, string> = {
	lun: 'Lunedì',
	mar: 'Martedì',
	mer: 'Mercoledì',
	gio: 'Giovedì',
	ven: 'Venerdì',
	sab: 'Sabato',
	dom: 'Domenica',
};

const SCHEMA_ORG_DAYS: Record<Day, string> = {
	lun: 'Monday',
	mar: 'Tuesday',
	mer: 'Wednesday',
	gio: 'Thursday',
	ven: 'Friday',
	sab: 'Saturday',
	dom: 'Sunday',
};

export type OpeningHours = SiteSettings['openingHours'];

const list = new Intl.ListFormat('it', { type: 'conjunction' });
const lower = (day: Day) => DAY_NAMES[day].toLowerCase();

/** "Da lunedì a venerdì", "Lunedì, mercoledì e venerdì", "Sabato e domenica": tre o più giorni di fila diventano un intervallo. */
export function formatDays(days: readonly Day[]): string {
	const runs: Day[][] = [];
	for (const day of DAYS.filter((item) => days.includes(item))) {
		const run = runs.at(-1);
		if (run && DAYS.indexOf(run.at(-1)!) === DAYS.indexOf(day) - 1) run.push(day);
		else runs.push([day]);
	}
	const parts = runs.flatMap((run) => (run.length >= 3 ? [`da ${lower(run[0])} a ${lower(run.at(-1)!)}`] : run.map(lower)));
	const text = list.format(parts);
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "08:30" → "8:30" (i segnaposto restano come sono). */
const shortTime = (time: string) => time.replace(/^0(\d:)/, '$1');

/** "8:30–12:30, 14:00–18:00", oppure "Chiuso" se la riga non ha fasce. */
export function formatSlots(slots: OpeningHours[number]['slots']): string {
	if (slots.length === 0) return 'Chiuso';
	return slots.map(({ opens, closes }) => `${shortTime(opens)}–${shortTime(closes)}`).join(', ');
}

/** Orari per schema.org (LocalBusiness.openingHoursSpecification): una voce per fascia; i giorni di chiusura non compaiono. */
export function openingHoursSpecification(hours: OpeningHours) {
	return hours.flatMap(({ days, slots }) =>
		slots.map(({ opens, closes }) => ({
			'@type': 'OpeningHoursSpecification',
			dayOfWeek: DAYS.filter((day) => days.includes(day)).map((day) => SCHEMA_ORG_DAYS[day]),
			opens,
			closes,
		})),
	);
}
