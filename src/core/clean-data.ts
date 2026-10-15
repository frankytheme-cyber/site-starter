/**
 * Il CMS salva "" quando un campo facoltativo viene svuotato, e un oggetto facoltativo
 * lasciato vuoto può restare come {}. Prima della validazione questi valori si tolgono,
 * così per lo schema è come se il campo mancasse. Gli elementi delle liste restano.
 */
export function withoutEmpty(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(withoutEmpty);
	if (value === null || typeof value !== 'object') return value;
	const entries = Object.entries(value)
		.map(([key, item]) => [key, withoutEmpty(item)] as const)
		.filter(([, item]) => !isEmpty(item));
	return Object.fromEntries(entries);
}

const isEmpty = (value: unknown) =>
	value === '' ||
	value === null ||
	value === undefined ||
	(typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0);
