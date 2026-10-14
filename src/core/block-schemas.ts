import type { BlockSchema } from './block-types';

/**
 * Schemi di tutti i blocchi (src/blocks/<tipo>/schema.ts), per tipo. Li usano il registry
 * (fixture e catalogo) e page-schema (ricette di pagina): una sola ricerca, stesso elenco.
 * Sta a parte dal registry perché content.config.ts non deve caricare i componenti.
 */
const modules = import.meta.glob<BlockSchema>('/src/blocks/*/schema.ts', { eager: true, import: 'schema' });

export const blockSchemas: Record<string, BlockSchema> = Object.fromEntries(
	Object.entries(modules).map(([path, schema]) => [path.split('/')[3], schema]),
);
