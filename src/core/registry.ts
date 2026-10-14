import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { z } from 'astro/zod';
import type { BlockFixture, BlockMeta } from './block-types';

/*
 * Registry dei blocchi: trova da solo ogni cartella in src/blocks/ con
 *   <Nome>.astro  componente, nome della cartella in PascalCase (hero → Hero.astro)
 *   schema.ts     export const schema
 *   meta.ts       export const meta: BlockMeta
 *   fixtures.ts   export const fixtures: BlockFixture[]
 * Ogni blocco viene validato al caricamento: un file mancante, meta.type diverso dalla
 * cartella, una fixture non valida o una variante senza fixture fermano la build.
 */

const components = import.meta.glob<AstroComponentFactory>('/src/blocks/*/*.astro', {
	eager: true,
	import: 'default',
});
const schemas = import.meta.glob<z.ZodType>('/src/blocks/*/schema.ts', { eager: true, import: 'schema' });
const metas = import.meta.glob<BlockMeta>('/src/blocks/*/meta.ts', { eager: true, import: 'meta' });
const fixtureLists = import.meta.glob<BlockFixture[]>('/src/blocks/*/fixtures.ts', {
	eager: true,
	import: 'fixtures',
});

export interface Block {
	type: string;
	meta: BlockMeta;
	schema: z.ZodType;
	Component: AstroComponentFactory;
	/** Fixture già validate: props pronte per il componente. */
	fixtures: { name: string; props: Record<string, unknown> }[];
}

/** Valida le props di un blocco; `origin` dice da dove arrivano, per un errore leggibile. */
export function parseProps(
	block: Pick<Block, 'type' | 'schema'>,
	input: unknown,
	origin: string,
): Record<string, unknown> {
	const result = block.schema.safeParse(input);
	if (!result.success) {
		throw new Error(`Props non valide per il blocco "${block.type}" (${origin}):\n${z.prettifyError(result.error)}`);
	}
	return result.data as Record<string, unknown>;
}

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
	const meta = pick(metas, `${dir}/meta.ts`);
	const schema = pick(schemas, `${dir}/schema.ts`);
	const Component = pick(components, `${dir}/${pascalCase(type)}.astro`);

	if (meta.type !== type) {
		throw new Error(`${dir}/meta.ts: type "${meta.type}" diverso dal nome della cartella "${type}"`);
	}

	const fixtures = pick(fixtureLists, `${dir}/fixtures.ts`).map((fixture) => ({
		name: fixture.name,
		props: parseProps({ type, schema }, fixture.props, `fixture "${fixture.name}"`),
	}));

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
	[components, schemas, metas, fixtureLists].flatMap((modules) =>
		Object.keys(modules).map((path) => path.split('/')[3]),
	),
);

/** Tutti i blocchi, ordinati per categoria e nome. */
export const blocks: Block[] = [...types]
	.map(loadBlock)
	.sort((a, b) => a.meta.category.localeCompare(b.meta.category) || a.meta.name.localeCompare(b.meta.name));
