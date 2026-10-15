/**
 * Id univoci nella pagina per i blocchi usati più volte (aria-controls, label...).
 * Il contatore vale per una singola richiesta (Astro.request), così gli id sono stabili
 * da una build all'altra: "header-1", "header-2"...
 */
const counters = new WeakMap<object, Map<string, number>>();

export function nextId(request: object, prefix: string): string {
	const byPrefix = counters.get(request) ?? new Map<string, number>();
	const next = (byPrefix.get(prefix) ?? 0) + 1;
	byPrefix.set(prefix, next);
	counters.set(request, byPrefix);
	return `${prefix}-${next}`;
}
