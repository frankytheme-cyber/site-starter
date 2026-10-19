import type { Tone } from '@/core/block-types';
import { blocksByType } from '@/core/registry';
import type { Edge } from '@/themes/edges';

/**
 * Il blocco con cui il catalogo mostra gli effetti di sfondo (/catalogo/sfondi e gli screenshot):
 * la cta banner, con titolo, testo e pulsanti centrati, che si legge bene su ogni effetto e tono.
 */
export function backgroundSample() {
	const block = blocksByType.get('cta');
	const fixture = block?.fixtures.find((item) => item.props.variant === 'banner') ?? block?.fixtures[0];
	if (!block || !fixture) throw new Error('Catalogo, effetti di sfondo: serve il blocco cta con almeno una fixture');
	return { Component: block.Component, fixture };
}

/** Le sezioni con cui il catalogo mostra i bordi: ogni bordo dopo una sezione di tone diverso. */
export const EDGE_SAMPLE: { tone: Tone; edge: Edge }[] = [
	{ tone: 'default', edge: 'dritto' },
	{ tone: 'muted', edge: 'onda' },
	{ tone: 'primary', edge: 'diagonale' },
	{ tone: 'default', edge: 'curva' },
];
