/**
 * Decap CMS in locale, senza GitHub: avvia decap-server sul repository (http://localhost:8081),
 * a cui /admin/ si collega da solo quando gira su localhost (local_backend in config.yml).
 *
 * Modalità git: l'unica che supporta il flusso editoriale. Ogni salvataggio diventa un commit
 * su un ramo cms/... di questo repository, e la pubblicazione lo unisce al ramo corrente.
 * La modalità fs (MODE=fs) scrive i file direttamente ma non supporta il flusso editoriale.
 *
 * Uso: npm run cms:local   (insieme a npm run dev, poi apri /admin/)
 */
import { execFileSync } from 'node:child_process';

process.env.MODE ??= 'git';

if (process.env.MODE === 'git') {
	const changes = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
	if (changes) {
		console.warn(
			'Attenzione: ci sono modifiche non salvate in git. In modalità git decap-server non riesce a salvare\n' +
				'finché non le metti in un commit (o le accantoni).',
		);
	}
}

// decap-server non ha tipi: lo si carica solo per avviarlo.
const server = 'decap-server';
await import(server);
