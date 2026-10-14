/**
 * Icone ammesse: alias italiano → icona Iconify ("set:nome").
 * La lista è chiusa: i blocchi accettano solo questi alias (`z.enum(ICON_NAMES)`) e
 * astro.config.mjs mette nel build solo queste icone, renderizzate come SVG inline.
 * Simboli da Lucide (lucide.dev), marchi da Simple Icons (simpleicons.org).
 * Licenze in docs/THIRD_PARTY_LICENSES.md.
 */
export const icons = {
	pennello: 'lucide:paintbrush',
	rullo: 'lucide:paint-roller',
	'secchio-vernice': 'lucide:paint-bucket',
	casa: 'lucide:house',
	edificio: 'lucide:building',
	/** Vano scala: Lucide non ha una scala a pioli. */
	scala: 'lucide:door-stairwell',
	muro: 'lucide:brick-wall',
	/** Impermeabilizzazione. */
	goccia: 'lucide:droplet',
	/** Garanzia. */
	scudo: 'lucide:shield-check',
	check: 'lucide:check',
	stella: 'lucide:star',
	orologio: 'lucide:clock',
	calendario: 'lucide:calendar',
	telefono: 'lucide:phone',
	email: 'lucide:mail',
	'mappa-pin': 'lucide:map-pin',
	'freccia-destra': 'lucide:arrow-right',
	'freccia-sinistra': 'lucide:arrow-left',
	menu: 'lucide:menu',
	chiudi: 'lucide:x',
	'chevron-giu': 'lucide:chevron-down',
	citazione: 'lucide:quote',
	preventivo: 'lucide:file-text',
	euro: 'lucide:euro',
	utenti: 'lucide:users',
	foto: 'lucide:image',

	whatsapp: 'simple-icons:whatsapp',
	facebook: 'simple-icons:facebook',
	instagram: 'simple-icons:instagram',
	google: 'simple-icons:google',
	youtube: 'simple-icons:youtube',
	tiktok: 'simple-icons:tiktok',
	tripadvisor: 'simple-icons:tripadvisor',
} as const;

export type IconName = keyof typeof icons;

/** Alias ammessi, come tupla per `z.enum(ICON_NAMES)`. */
export const ICON_NAMES = Object.keys(icons) as [IconName, ...IconName[]];

/** Icone da includere nel build, per set: l'opzione `include` di astro-icon. */
export const iconInclude = Object.values(icons).reduce<Record<string, string[]>>((include, id) => {
	const [set, name] = id.split(':');
	(include[set] ??= []).push(name);
	return include;
}, {});
