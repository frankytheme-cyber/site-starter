import type { ImageMetadata } from 'astro';
import type { ImageFunction, SchemaContext } from 'astro:content';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { z } from 'astro/zod';
import { blockMetas, blockSchemas } from './block-schemas';
import type { BlockFixture, BlockMeta, BlockSchema, Tone } from './block-types';

/*
 * Registry dei blocchi: trova da solo ogni cartella in src/blocks/ con
 *   <Nome>.astro  componente, nome della cartella in PascalCase (hero → Hero.astro)
 *   schema.ts     export const schema = ({ image }) => z.object(...)
 *   meta.ts       export const meta: BlockMeta
 *   fixtures.ts   export const fixtures: BlockFixture[]
 * Ogni blocco viene validato al caricamento: un file mancante, meta.type diverso dalla
 * cartella, un campo riservato alla sezione, una fixture non valida o una variante senza
 * fixture fermano la build.
 */

const components = import.meta.glob<AstroComponentFactory>('/src/blocks/*/*.astro', {
	eager: true,
	import: 'default',
});
const fixtureLists = import.meta.glob<BlockFixture[]>('/src/blocks/*/fixtures.ts', {
	eager: true,
	import: 'fixtures',
});

export interface Block {
	type: string;
	meta: BlockMeta;
	schema: BlockSchema;
	Component: AstroComponentFactory;
	/** Fixture già validate: props pronte per il componente. */
	fixtures: { name: string; tone?: Tone; props: Record<string, unknown> }[];
}

/** Campi che la ricetta aggiunge a ogni sezione (core/page-schema.ts): uno schema di blocco non li può usare. */
const SECTION_FIELDS = ['type', 'id', 'tone'];

/** Nelle fixture le immagini sono file importati: si accettano così come sono, senza percorsi da risolvere. */
const importedImage = z.custom<ImageMetadata>(
	(value) => typeof value === 'object' && value !== null && 'src' in value && 'width' in value && 'format' in value,
	'atteso un file importato (import foto from "@/assets/images/...")',
);
const fixtureContext: SchemaContext = {
	image: (() => importedImage) as unknown as ImageFunction,
};

const pascalCase = (type: string) =>
	type
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

function pick<T>(modules: Record<string, T>, path: string): T {
	const module = modules[path];
	if (module === undefined) throw new Error(`Blocco incompleto: manca ${path}`);
	return module;
}

function loadBlock(type: string): Block {
	const dir = `/src/blocks/${type}`;
	const meta = blockMetas[type];
	if (!meta) throw new Error(`Blocco incompleto: manca ${dir}/meta.ts`);
	const schema = blockSchemas[type];
	if (!schema) throw new Error(`Blocco incompleto: manca ${dir}/schema.ts`);
	const Component = pick(components, `${dir}/${pascalCase(type)}.astro`);

	if (meta.type !== type) {
		throw new Error(`${dir}/meta.ts: type "${meta.type}" diverso dal nome della cartella "${type}"`);
	}

	const fixtureSchema = schema(fixtureContext);
	const reserved = SECTION_FIELDS.filter((field) => field in fixtureSchema.shape);
	if (reserved.length > 0) {
		throw new Error(`${dir}/schema.ts: ${reserved.join(', ')} sono campi della sezione, non del blocco`);
	}

	const fixtures = pick(fixtureLists, `${dir}/fixtures.ts`).map((fixture) => {
		const result = fixtureSchema.safeParse(fixture.props);
		if (!result.success) {
			throw new Error(
				`Props non valide per il blocco "${type}" (fixture "${fixture.name}"):\n${z.prettifyError(result.error)}`,
			);
		}
		return { name: fixture.name, tone: fixture.tone, props: result.data as Record<string, unknown> };
	});

	const variants = Object.keys(meta.variants);
	if (variants.length > 0) {
		for (const fixture of fixtures) {
			if (!variants.includes(String(fixture.props.variant))) {
				throw new Error(
					`${dir}: la fixture "${fixture.name}" usa la variante "${fixture.props.variant}", che non è in meta.variants`,
				);
			}
		}
		for (const variant of variants) {
			if (!fixtures.some((fixture) => fixture.props.variant === variant)) {
				throw new Error(`${dir}/fixtures.ts: nessuna fixture per la variante "${variant}"`);
			}
		}
	}

	return { type, meta, schema, Component, fixtures };
}

const types = new Set(
	[components, blockSchemas, blockMetas, fixtureLists].flatMap((modules) =>
		Object.keys(modules).map((key) => (key.startsWith('/') ? key.split('/')[3] : key)),
	),
);

/** Tutti i blocchi, ordinati per categoria e nome. */
export const blocks: Block[] = [...types]
	.map(loadBlock)
	.sort((a, b) => a.meta.category.localeCompare(b.meta.category) || a.meta.name.localeCompare(b.meta.name));

/** Blocchi per tipo: la usa RenderSections per passare da una sezione al suo componente. */
export const blocksByType = new Map(blocks.map((block) => [block.type, block]));
