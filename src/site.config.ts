/**
 * Configurazione tecnica del sito (non dati dell'attività, non aspetto).
 * La legge scripts/gen-decap-config.ts per generare public/admin/config.yml.
 */
export interface SiteConfig {
	cms: {
		/**
		 * Servizio OAuth condiviso per l'accesso a Decap CMS con GitHub (GitHub OAuth App + worker):
		 * vedi docs/decap.md. Lo stesso indirizzo vale per tutti i siti cliente.
		 */
		oauthBaseUrl: string;
		/** Ramo su cui il CMS pubblica le modifiche. */
		branch: string;
		/**
		 * Repository GitHub del sito ("org/nome") in cui il CMS salva le modifiche. Lo scrive
		 * npm run site:init; senza, gen:decap lo ricava da DECAP_REPO, da Vercel o dal remote "origin".
		 */
		repo?: string;
	};
	/** Credito in fondo al footer colonne (es. chi ha realizzato il sito); senza, non compare. */
	credit?: {
		/** Testo del link, es. "Sito realizzato da Studio Esempio". */
		label: string;
		/** Indirizzo completo, es. "https://www.studioesempio.it". */
		href: string;
	};
}

const config: SiteConfig = {
	cms: {
		oauthBaseUrl: 'https://decap-oauth.da-compilare.workers.dev',
		branch: 'main',
	},
	// credit: { label: 'Sito realizzato da …', href: 'https://…' },
};

export default config;
