import type { BlockMeta, BlockSchema, Scope } from './block-types';

/**
 * Schemi e schede di tutti i blocchi (src/blocks/<tipo>/schema.ts e meta.ts), per tipo.
 * Li usano il registry (fixture e catalogo), page-schema (ricette di pagina) e il
 * generatore della configurazione di Decap. Sta a parte dal registry perché né
 * content.config.ts né gli script devono caricare i componenti .astro.
 */
const typeOf = (path: string) => path.split('/')[3];

const schemaModules = import.meta.glob<BlockSchema>('/src/blocks/*/schema.ts', { eager: true, import: 'schema' });
const metaModules = import.meta.glob<BlockMeta>('/src/blocks/*/meta.ts', { eager: true, import: 'meta' });

export const blockSchemas: Record<string, BlockSchema> = Object.fromEntries(
	Object.entries(schemaModules).map(([path, schema]) => [typeOf(path), schema]),
);

export const blockMetas: Record<string, BlockMeta> = Object.fromEntries(
	Object.entries(metaModules).map(([path, meta]) => [typeOf(path), meta]),
);

/** Tipi dei blocchi con un certo scope: "page" per le sezioni delle ricette, "layout" per layout.json. */
export const blockTypesOf = (scope: Scope): string[] =>
	Object.keys(blockSchemas).filter((type) => blockMetas[type]?.scope === scope);
