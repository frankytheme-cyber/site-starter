/**
 * blocks (solo nella libreria): ogni cartella di src/blocks rispetta il contratto di
 * src/blocks/README.md, e docs/catalogo è aggiornato (scripts/checks/catalog.ts). Quattro file, meta completo con source e scope, licenza riportata se il
 * disegno è esterno, fixture valide contro lo schema (e i dati `site` di prova contro lo schema
 * di site.json), almeno una fixture per variante, ogni blocco di layout con la sua chiave in
 * layout.json, ogni icona di src/core/icons.ts presente nel suo pacchetto Iconify (un nome
 * sbagliato o diventato alias darebbe un'icona vuota).
 * Raccoglie tutti i problemi: un blocco con un file mancante o che non si carica non ferma gli
 * altri, e in quel caso il confronto con docs/catalogo si salta (il catalogo non si può generare).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { CATEGORIES } from '../../src/core/block-types.ts';
import { fieldPath } from '../../src/core/content-validation.ts';
import { icons } from '../../src/core/icons.ts';
import { checkCatalog } from './catalog.ts';
import { type CheckContext, collector } from './lib/report.ts';
import { withProjectModules } from './lib/vite.ts';

const pascalCase = (type: string) =>
	type
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

const TEXT_FIELDS = ['name', 'description', 'whenToUse', 'avoidWhen', 'category'] as const;
const SECTION_FIELDS = ['type', 'id', 'tone'];
const SCOPES = ['page', 'layout'];

/** Fuori da Astro un'immagine importata è il suo URL: qui basta che l'import si risolva. */
const fixtureContext = { image: () => z.union([z.string(), z.looseObject({ src: z.string() })]) };

const firstLine = (cause: unknown) => (cause as Error).message.split('\n')[0];

export async function blocks({ root }: CheckContext) {
	const { findings, error, warning } = collector('blocks');
	const blocksDir = join(root, 'src/blocks');
	const licensesFile = join(root, 'docs/THIRD_PARTY_LICENSES.md');
	const licenses = existsSync(licensesFile) ? readFileSync(licensesFile, 'utf8').toLowerCase() : '';
	const types = readdirSync(blocksDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

	/** Blocchi con file mancanti o che non si caricano: senza, il catalogo non si può generare. */
	const broken: string[] = [];

	await withProjectModules(async (load) => {
		// Schema di site.json e di layout.json: se non si caricano, si saltano solo i controlli che li usano.
		let siteSchema: z.ZodType | undefined;
		let layoutShape: Record<string, unknown> | undefined;
		try {
			siteSchema = (await load('/src/core/settings.ts')).siteSettingsSchema(fixtureContext);
		} catch (cause) {
			error({ file: 'src/core/settings.ts', message: `non si carica: ${firstLine(cause)}`, hint: 'senza, i dati site di prova delle fixture non si controllano' });
		}
		try {
			layoutShape = (await load('/src/core/layout.ts')).layoutSchema.shape;
		} catch (cause) {
			error({ file: 'src/core/layout.ts', message: `non si carica: ${firstLine(cause)}`, hint: 'importa lo schema di un blocco di layout che manca o non si carica?' });
		}

		for (const type of types) {
			try {
				await checkBlock(type);
			} catch (cause) {
				broken.push(type);
				error({ file: `src/blocks/${type}`, message: `controllo interrotto: ${firstLine(cause)}` });
			}
		}

		async function checkBlock(type: string) {
			const folder = `src/blocks/${type}`;
			const required = [`${pascalCase(type)}.astro`, 'schema.ts', 'meta.ts', 'fixtures.ts'];
			const missing = required.filter((name) => !existsSync(join(blocksDir, type, name)));
			for (const name of missing) {
				error({ file: `${folder}/${name}`, message: 'file mancante', hint: 'ogni blocco ha componente, schema, meta e fixture: vedi src/blocks/README.md' });
			}
			if (missing.length > 0) broken.push(type);
			if (missing.some((name) => name !== `${pascalCase(type)}.astro`)) return;

			let schemaModule, metaModule, fixturesModule;
			try {
				[schemaModule, metaModule, fixturesModule] = await Promise.all([
					load(`/${folder}/schema.ts`),
					load(`/${folder}/meta.ts`),
					load(`/${folder}/fixtures.ts`),
				]);
			} catch (cause) {
				broken.push(type);
				error({ file: folder, message: `non si carica: ${firstLine(cause)}` });
				return;
			}

			// meta.ts
			const meta = metaModule.meta;
			const metaFile = `${folder}/meta.ts`;
			if (!meta || typeof meta !== 'object') {
				error({ file: metaFile, message: 'manca export const meta: BlockMeta' });
				return;
			}
			if (meta.type !== type) error({ file: metaFile, where: 'type', message: `"${meta.type}" diverso dal nome della cartella "${type}"` });
			for (const field of TEXT_FIELDS) {
				if (typeof meta[field] !== 'string' || !meta[field].trim()) error({ file: metaFile, where: field, message: 'campo mancante o vuoto' });
			}
			if (!/^\d+\.\d+\.\d+$/.test(String(meta.version))) {
				error({ file: metaFile, where: 'version', message: `"${meta.version}" non è una versione semver`, hint: 'es. "1.0.0"; la major sale quando lo schema cambia in modo incompatibile' });
			}
			const source = meta.source;
			if (!source || typeof source.from !== 'string') {
				error({ file: metaFile, where: 'source', message: 'manca la provenienza', hint: "source: { from: 'originale' } per i blocchi nati qui" });
			} else if (source.from !== 'originale') {
				for (const field of ['name', 'url', 'license']) {
					if (typeof source[field] !== 'string' || !source[field].trim()) {
						error({ file: metaFile, where: `source.${field}`, message: 'campo mancante per un disegno esterno' });
					}
				}
				const named = [source.name, source.url].filter((value) => typeof value === 'string' && value.trim());
				if (named.length > 0 && !named.some((value: string) => licenses.includes(value.toLowerCase()))) {
					error({
						file: 'docs/THIRD_PARTY_LICENSES.md',
						where: `blocco ${type}`,
						message: `manca la licenza di «${source.name ?? source.url}» (${source.license ?? 'licenza non indicata'})`,
						hint: 'aggiungi una sezione con progetto, indirizzo, licenza e testo della licenza',
					});
				}
			}
			if (typeof meta.category === 'string' && !(CATEGORIES as readonly string[]).includes(meta.category)) {
				error({ file: metaFile, where: 'category', message: `"${meta.category}" non è una categoria ammessa`, hint: `una di ${CATEGORIES.join(', ')} (src/core/block-types.ts): dice dove sta il blocco nella pagina` });
			}
			if (!SCOPES.includes(meta.scope)) {
				error({ file: metaFile, where: 'scope', message: `"${meta.scope}" non è uno scope ammesso`, hint: "scope: 'page' per le sezioni delle ricette, 'layout' per header e footer (layout.json)" });
			} else if (meta.scope === 'layout' && layoutShape && !(type in layoutShape)) {
				error({ file: 'src/core/layout.ts', where: `blocco ${type}`, message: 'blocco di layout senza la sua chiave in layoutSchema', hint: `aggiungi ${type}: schema() del blocco a layoutSchema e a src/content/settings/layout.json` });
			}
			const variants = meta.variants && typeof meta.variants === 'object' ? Object.keys(meta.variants) : undefined;
			if (!variants) error({ file: metaFile, where: 'variants', message: 'manca: usa {} se il blocco non ha varianti' });

			// schema.ts
			const schemaFile = `${folder}/schema.ts`;
			if (typeof schemaModule.schema !== 'function') {
				error({ file: schemaFile, message: 'schema deve essere una funzione', hint: 'export const schema = ({ image }: SchemaContext) => z.object(...)' });
				return;
			}
			const schema = schemaModule.schema(fixtureContext);
			const reserved = SECTION_FIELDS.filter((field) => field in (schema.shape ?? {}));
			if (reserved.length > 0) {
				error({ file: schemaFile, message: `${reserved.join(', ')} sono campi della sezione, non del blocco`, hint: 'rinominali: la ricetta di pagina li aggiunge a ogni sezione' });
			}

			// fixtures.ts
			const fixturesFile = `${folder}/fixtures.ts`;
			const fixtures = fixturesModule.fixtures;
			if (!Array.isArray(fixtures) || fixtures.length === 0) {
				error({ file: fixturesFile, message: 'nessuna fixture', hint: 'almeno una per variante' });
				return;
			}
			for (const fixture of fixtures) {
				const result = schema.safeParse(fixture.props);
				if (!result.success) {
					for (const issue of result.error.issues) {
						error({ file: fixturesFile, where: `fixture "${fixture.name}" → ${fieldPath(issue.path) || '(props)'}`, message: issue.message });
					}
				}
				if (fixture.site === undefined || !siteSchema) continue;
				const site = siteSchema.safeParse(fixture.site);
				if (!site.success) {
					for (const issue of site.error.issues) {
						error({ file: fixturesFile, where: `fixture "${fixture.name}" → site.${fieldPath(issue.path)}`, message: issue.message, hint: 'i dati di prova seguono lo schema di site.json (src/core/settings.ts)' });
					}
				}
			}
			if (variants && variants.length > 0) {
				for (const fixture of fixtures) {
					if (!variants.includes(String(fixture.props?.variant))) {
						error({ file: fixturesFile, where: `fixture "${fixture.name}"`, message: `variante "${fixture.props?.variant}" non elencata in meta.variants` });
					}
				}
				for (const variant of variants) {
					if (!fixtures.some((fixture: { props?: { variant?: unknown } }) => fixture.props?.variant === variant)) {
						error({ file: fixturesFile, where: `variante ${variant}`, message: 'nessuna fixture', hint: 'il catalogo mostra ogni variante con almeno una fixture' });
					}
				}
			}
		}
	});
	// Icone: il nome deve esistere nel set (non solo come alias, che i pacchetti possono togliere).
	const require = createRequire(join(root, 'package.json'));
	const iconSets: Record<string, { icons: Record<string, unknown> }> = {};
	for (const [alias, id] of Object.entries(icons)) {
		const [set, name] = id.split(':');
		try {
			iconSets[set] ??= require(`@iconify-json/${set}/icons.json`);
		} catch {
			error({ file: 'src/core/icons.ts', where: alias, message: `pacchetto @iconify-json/${set} non installato` });
			continue;
		}
		if (!iconSets[set].icons[name]) {
			error({ file: 'src/core/icons.ts', where: alias, message: `"${id}" non esiste in @iconify-json/${set}`, hint: 'cerca il nome esatto su icones.js.org o nel file icons.json del pacchetto' });
		}
	}

	// docs/catalogo rigenerato in memoria e confrontato coi file (scripts/checks/catalog.ts).
	if (broken.length > 0) {
		warning({
			file: 'docs/catalogo',
			message: `non confrontato: il catalogo non si può generare finché ${[...new Set(broken)].join(', ')} ha file mancanti o che non si caricano`,
			hint: 'sistema gli errori dei blocchi qui sopra e rilancia il check',
		});
		return findings;
	}
	try {
		await checkCatalog(root, { error, warning });
	} catch (cause) {
		error({ file: 'docs/catalogo', message: `confronto interrotto: ${firstLine(cause)}`, hint: 'prova npm run gen:catalog per vedere l’errore completo' });
	}
	return findings;
}
