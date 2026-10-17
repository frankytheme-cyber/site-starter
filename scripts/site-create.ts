/** Comando del titolare: l’anteprima è offline; solo --apply chiama le API e crea risorse. */
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { requireLibraryMode } from '../src/core/mode.ts';
import { createSite, validateOptions, type SiteCreateOptions } from './provisioning/site-create.ts';

const HELP = `Crea repo privata dal template, invita simone-agenti e collega un progetto Vercel Astro.

Uso: npm run site:create -- nome-cliente [--owner owner] [--team team_ID] [--apply]

Senza --apply: anteprima offline, nessuna API o credenziale richiesta.
--owner: owner GitHub; default SITE_CREATE_GITHUB_OWNER o owner della libreria.
--team: Team ID Vercel; default VERCEL_TEAM_ID, altrimenti account personale del token.
--template: owner/repo del template; default library.manifest.json.
--apply: esegue il provisioning; ripetibile con gli stessi parametri dopo un errore.

Credenziali nell’ambiente: SITE_CREATE_GITHUB_TOKEN (titolare) e VERCEL_TOKEN.
Non carica credenziali da .env e non usa GH_TOKEN/GITHUB_TOKEN degli agenti.
Guida: docs/provisioning.md. Non crea il Project Paperclip né esegue site:init.`;

try {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			owner: { type: 'string' }, team: { type: 'string' }, template: { type: 'string' },
			apply: { type: 'boolean', default: false }, help: { type: 'boolean', short: 'h' },
		},
	});
	if (values.help) { console.log(HELP); process.exit(0); }
	requireLibraryMode('npm run site:create');
	const manifest = JSON.parse(readFileSync(new URL('../library.manifest.json', import.meta.url), 'utf8'));
	const template = values.template ?? String(manifest.repository).replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
	if (positionals.length !== 1) throw new Error(`Serve un solo nome del sito.\n${HELP}`);
	const options: SiteCreateOptions = {
		name: positionals[0], template, collaborator: 'simone-agenti',
		owner: values.owner ?? process.env.SITE_CREATE_GITHUB_OWNER ?? template.split('/')[0],
		team: values.team ?? process.env.VERCEL_TEAM_ID,
	};
	validateOptions(options);
	console.log(`Repo privata: ${options.owner}/${options.name}\nTemplate: ${options.template}\nCollaboratore: ${options.collaborator} (Write)\nVercel: ${options.name}, Astro, ${options.team ?? 'account personale del token'}\nModalità Vercel: sito cliente (SITE_STARTER_LIBRARY vuota nei tre ambienti).`);
	if (!values.apply) {
		console.log('\nAnteprima offline: nessuna risorsa creata o verificata. Aggiungi --apply per eseguire.');
	} else {
		if (process.env.PAPERCLIP_AGENT_ID) throw new Error('Provisioning riservato al titolare: esegui il comando fuori dalle run degli agenti Paperclip.');
		await createSite(options, { github: process.env.SITE_CREATE_GITHUB_TOKEN ?? '', vercel: process.env.VERCEL_TOKEN ?? '' });
		console.log('\nPassi successivi: accetta l’eventuale invito con simone-agenti; configura il Project Paperclip e i workspace; assegna Avvio sito al Builder. Il primo build può fallire finché non viene eseguito site:init. OAuth, dominio, DNS e merge restano nella checklist del sito.');
	}
} catch (error) {
	console.error(`✗ ${error instanceof Error ? error.message : 'Provisioning interrotto.'}`);
	process.exitCode = 1;
}
