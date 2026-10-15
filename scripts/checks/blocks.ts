/**
 * blocks (solo nella libreria): ogni cartella di src/blocks rispetta il contratto di
 * src/blocks/README.md. Quattro file, meta completo con source e scope, licenza riportata se il
 * disegno è esterno, fixture valide contro lo schema (e i dati `site` di prova contro lo schema
 * di site.json), almeno una fixture per variante, ogni blocco di layout con la sua chiave in
 * layout.json.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { CATEGORIES } from '../../src/core/block-types.ts';
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

export async function blocks({ root }: CheckContext) {
	const { findings, error } = collector('blocks');
	const blocksDir = join(root, 'src/blocks');
	const licensesFile = join(root, 'docs/THIRD_PARTY_LICENSES.md');
	const licenses = existsSync(licensesFile) ? readFileSync(licensesFile, 'utf8').toLowerCase() : '';
	const types = readdirSync(blocksDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort();

	await withProjectModules(async (load) => {
		const [{ siteSettingsSchema }, { layoutSchema }] = await Promise.all([load('/src/core/settings.ts'), load('/src/core/layout.ts')]);
		const siteSchema = siteSettingsSchema(fixtureContext);
		for (const type of types) {
			const folder = `src/blocks/${type}`;
			const required = [`${pascalCase(type)}.astro`, 'schema.ts', 'meta.ts', 'fixtures.ts'];
			const missing = required.filter((name) => !existsSync(join(blocksDir, type, name)));
			for (const name of missing) {
				error({ file: `${folder}/${name}`, message: 'file mancante', hint: 'ogni blocco ha componente, schema, meta e fixture: vedi src/blocks/README.md' });
			}
			if (missing.some((name) => name !== `${pascalCase(type)}.astro`)) continue;

			let schemaModule, metaModule, fixturesModule;
			try {
				[schemaModule, metaModule, fixturesModule] = await Promise.all([
					load(`/${folder}/schema.ts`),
					load(`/${folder}/meta.ts`),
					load(`/${folder}/fixtures.ts`),
				]);
			} catch (cause) {
				error({ file: folder, message: `non si carica: ${(cause as Error).message.split('\n')[0]}` });
				continue;
			}

			// meta.ts
			const meta = metaModule.meta;
			const metaFile = `${folder}/meta.ts`;
			if (!meta || typeof meta !== 'object') {
				error({ file: metaFile, message: 'manca export const meta: BlockMeta' });
				continue;
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
			} else if (meta.scope === 'layout' && !(type in layoutSchema.shape)) {
				error({ file: 'src/core/layout.ts', where: `blocco ${type}`, message: 'blocco di layout senza la sua chiave in layoutSchema', hint: `aggiungi ${type}: schema() del blocco a layoutSchema e a src/content/settings/layout.json` });
			}
			const variants = meta.variants && typeof meta.variants === 'object' ? Object.keys(meta.variants) : undefined;
			if (!variants) error({ file: metaFile, where: 'variants', message: 'manca: usa {} se il blocco non ha varianti' });

			// schema.ts
			const schemaFile = `${folder}/schema.ts`;
			if (typeof schemaModule.schema !== 'function') {
				error({ file: schemaFile, message: 'schema deve essere una funzione', hint: 'export const schema = ({ image }: SchemaContext) => z.object(...)' });
				continue;
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
				continue;
			}
			for (const fixture of fixtures) {
				const result = schema.safeParse(fixture.props);
				if (!result.success) {
					for (const issue of result.error.issues) {
						error({ file: fixturesFile, where: `fixture "${fixture.name}" › ${issue.path.join('.') || '(props)'}`, message: issue.message });
					}
				}
				if (fixture.site === undefined) continue;
				const site = siteSchema.safeParse(fixture.site);
				if (!site.success) {
					for (const issue of site.error.issues) {
						error({ file: fixturesFile, where: `fixture "${fixture.name}" › site.${issue.path.join('.')}`, message: issue.message, hint: 'i dati di prova seguono lo schema di site.json (src/core/settings.ts)' });
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
	return findings;
}
