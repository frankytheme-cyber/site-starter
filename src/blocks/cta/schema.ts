import { z } from 'astro/zod';
import type { BlockProps } from '@/core/block-types';

const action = z.object({
	label: z.string().min(1).max(25),
	href: z.string().min(1),
});

export const schema = () =>
	z.object({
		variant: z.enum(['banner', 'split-contatto']),
		title: z.string().min(1).max(70),
		text: z.string().min(1).max(200).optional(),
		primary: action,
		secondary: action.optional(),
		/** Mostra telefono e WhatsApp dell'attività, letti da src/content/settings/site.json: qui non si scrivono. */
		showContacts: z.boolean(),
	});

export type CtaProps = BlockProps<typeof schema>;
