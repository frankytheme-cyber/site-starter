import type { Block } from '@/core/registry';
import { exampleJson, recipeImagePath } from '@/core/catalog';

/*
 * Esempio JSON di una fixture per il catalogo: le immagini importate nelle fixture tornano al
 * loro percorso in src/assets/images (lo stesso oggetto del modulo, quindi si riconoscono per
 * identità) e diventano percorsi relativi alla ricetta.
 */
const images = import.meta.glob<object>('/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,gif}', { eager: true, import: 'default' });
const pathOf = new Map(Object.entries(images).map(([path, image]) => [image, recipeImagePath(path)]));

export const fixtureJson = (block: Block, fixture: Block['fixtures'][number]) =>
	exampleJson(block.meta, { tone: fixture.tone, props: fixture.input }, (value) =>
		value && typeof value === 'object' ? pathOf.get(value) : undefined,
	);
