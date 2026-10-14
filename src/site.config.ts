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
	};
}

const config: SiteConfig = {
	cms: {
		oauthBaseUrl: 'https://decap-oauth.da-compilare.workers.dev',
		branch: 'main',
	},
};

export default config;
