import { fonts, palettes, type PaletteMeta, patterns, type PresetMeta, shapes, textures } from './presets';

/*
 * Schede dei preset (<nome>.meta.ts accanto al CSS), per nome. Un preset senza scheda, o una
 * scheda senza preset in presets.ts, ferma chi le carica (catalogo e check "blocks").
 */

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.meta\.ts$/, '');

function byName<T>(kind: string, names: readonly string[], modules: Record<string, T>): Record<string, T> {
	const metas = Object.fromEntries(Object.entries(modules).map(([path, meta]) => [nameOf(path), meta]));
	const missing = names.filter((name) => !(name in metas));
	if (missing.length > 0) throw new Error(`src/themes/${kind}: manca la scheda ${missing.map((name) => `${name}.meta.ts`).join(', ')}`);
	const extra = Object.keys(metas).filter((name) => !names.includes(name));
	if (extra.length > 0) throw new Error(`src/themes/${kind}: ${extra.join(', ')} non è in presets.ts`);
	return Object.fromEntries(names.map((name) => [name, metas[name]]));
}

export const presetMetas = {
	palettes: byName('palettes', palettes, import.meta.glob<PaletteMeta>('./palettes/*.meta.ts', { eager: true, import: 'meta' })),
	fonts: byName('fonts', fonts, import.meta.glob<PresetMeta>('./fonts/*.meta.ts', { eager: true, import: 'meta' })),
	shapes: byName('shapes', shapes, import.meta.glob<PresetMeta>('./shapes/*.meta.ts', { eager: true, import: 'meta' })),
	patterns: byName('patterns', patterns, import.meta.glob<PresetMeta>('./patterns/*.meta.ts', { eager: true, import: 'meta' })),
	textures: byName('textures', textures, import.meta.glob<PresetMeta>('./textures/*.meta.ts', { eager: true, import: 'meta' })),
};
