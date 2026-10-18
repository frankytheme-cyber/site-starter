import site from '../src/content/settings/site.json' with { type: 'json' };
import { handleContact } from '../src/core/forms/handler.ts';

/** Vercel Function Web Standard: non richiede un adapter SSR per il sito statico. */
export default {
	fetch(request: Request) {
		return handleContact(request, { site, env: process.env });
	},
};
