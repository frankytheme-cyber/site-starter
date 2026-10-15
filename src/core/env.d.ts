/** Variabili fissate nel build da core/integrations/library.ts (Vite define). */
interface ImportMetaEnv {
	/** true solo nella libreria site-starter (SITE_STARTER_LIBRARY=1, core/mode.ts). */
	readonly LIBRARY_MODE: boolean;
}
