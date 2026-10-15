import { z } from 'astro/zod';

/**
 * Icone ammesse: alias italiano → icona Iconify ("set:nome"), raggruppate per categoria.
 * La lista è chiusa: i blocchi accettano solo questi alias (`iconSchema`, cioè `z.enum(ICON_NAMES)`)
 * e astro.config.mjs mette nel build solo queste icone, renderizzate come SVG inline.
 * Simboli da Lucide (lucide.dev), marchi da Simple Icons (simpleicons.org): ogni nome deve esistere
 * nei pacchetti @iconify-json/lucide e @iconify-json/simple-icons (lo verifica check:blocks).
 * Un alias compare una sola volta in tutta la lista. Licenze in docs/THIRD_PARTY_LICENSES.md.
 * Elenco dal vivo, con la ricerca, su /catalogo/icone.
 */
export const iconGroups = {
	casa: {
		label: 'Casa e cantiere',
		icons: {
			casa: 'lucide:house',
			edificio: 'lucide:building',
			fabbrica: 'lucide:factory',
			/** Scale di casa o vano scala. Lucide non ha una scala a pioli. */
			scale: 'lucide:door-stairwell',
			muro: 'lucide:brick-wall',
			porta: 'lucide:door-open',
			chiavi: 'lucide:key-round',
			cantiere: 'lucide:construction',
			pennello: 'lucide:paintbrush',
			rullo: 'lucide:paint-roller',
			bagno: 'lucide:bath',
			pulizie: 'lucide:brush-cleaning',
		},
	},
	attrezzi: {
		label: 'Attrezzi',
		icons: {
			martello: 'lucide:hammer',
			'chiave-inglese': 'lucide:wrench',
			trapano: 'lucide:drill',
			'cassetta-attrezzi': 'lucide:toolbox',
			pala: 'lucide:shovel',
			righello: 'lucide:ruler',
		},
	},
	impianti: {
		label: 'Impianti: acqua, luce, gas, clima',
		icons: {
			/** Acqua, impermeabilizzazione. */
			goccia: 'lucide:droplet',
			rubinetto: 'lucide:faucet',
			lampadina: 'lucide:lightbulb',
			/** Elettricità. */
			fulmine: 'lucide:zap',
			spina: 'lucide:plug',
			/** Gas, caldaie, camini. */
			fiamma: 'lucide:flame',
			stufa: 'lucide:heater',
			'aria-condizionata': 'lucide:air-vent',
			'pannello-solare': 'lucide:solar-panel',
		},
	},
	natura: {
		label: 'Giardino e natura',
		icons: {
			foglia: 'lucide:leaf',
			albero: 'lucide:tree-deciduous',
			fiore: 'lucide:flower-2',
			germoglio: 'lucide:sprout',
			recinto: 'lucide:fence',
			riciclo: 'lucide:recycle',
		},
	},
	cibo: {
		label: 'Cibo e bevande',
		icons: {
			posate: 'lucide:utensils',
			cuoco: 'lucide:chef-hat',
			caffe: 'lucide:coffee',
			vino: 'lucide:wine',
			birra: 'lucide:beer',
			pizza: 'lucide:pizza',
			torta: 'lucide:cake-slice',
			gelato: 'lucide:ice-cream-cone',
			cornetto: 'lucide:croissant',
			grano: 'lucide:wheat',
		},
	},
	salute: {
		label: 'Salute e benessere',
		icons: {
			cuore: 'lucide:heart',
			battito: 'lucide:heart-pulse',
			stetoscopio: 'lucide:stethoscope',
			farmaco: 'lucide:pill',
			dentista: 'lucide:toothbrush',
			occhiali: 'lucide:glasses',
		},
	},
	bellezza: {
		label: 'Bellezza',
		icons: {
			forbici: 'lucide:scissors',
			brillantini: 'lucide:sparkles',
			profumo: 'lucide:perfume-bottle',
			gioiello: 'lucide:gem',
		},
	},
	trasporti: {
		label: 'Auto e trasporti',
		icons: {
			auto: 'lucide:car',
			furgone: 'lucide:van',
			camion: 'lucide:truck',
			moto: 'lucide:motorbike',
			bici: 'lucide:bike',
			parcheggio: 'lucide:square-parking',
			carburante: 'lucide:fuel',
			/** Ricarica dei veicoli elettrici. */
			ricarica: 'lucide:plug-zap',
		},
	},
	negozio: {
		label: 'Negozio e pagamenti',
		icons: {
			negozio: 'lucide:store',
			carrello: 'lucide:shopping-cart',
			borsa: 'lucide:shopping-bag',
			etichetta: 'lucide:tag',
			sconto: 'lucide:badge-percent',
			regalo: 'lucide:gift',
			pacco: 'lucide:package',
			'carta-di-credito': 'lucide:credit-card',
			contanti: 'lucide:banknote',
			euro: 'lucide:euro',
		},
	},
	ufficio: {
		label: 'Ufficio e servizi professionali',
		icons: {
			valigetta: 'lucide:briefcase',
			computer: 'lucide:laptop',
			calcolatrice: 'lucide:calculator',
			grafico: 'lucide:chart-column',
			/** Studi legali, giustizia. */
			bilancia: 'lucide:scale',
			penna: 'lucide:pen-line',
			laurea: 'lucide:graduation-cap',
			'stretta-di-mano': 'lucide:handshake',
			wifi: 'lucide:wifi',
		},
	},
	persone: {
		label: 'Persone e famiglia',
		icons: {
			utente: 'lucide:user',
			utenti: 'lucide:users',
			bambino: 'lucide:baby',
			accessibilita: 'lucide:accessibility',
			sorriso: 'lucide:smile',
		},
	},
	tempo: {
		label: 'Tempo e calendario',
		icons: {
			orologio: 'lucide:clock',
			calendario: 'lucide:calendar',
			prenotazione: 'lucide:calendar-check',
			clessidra: 'lucide:hourglass',
			cronometro: 'lucide:timer',
		},
	},
	contatti: {
		label: 'Contatti e luoghi',
		icons: {
			telefono: 'lucide:phone',
			cellulare: 'lucide:smartphone',
			email: 'lucide:mail',
			'mappa-pin': 'lucide:map-pin',
			mappa: 'lucide:map',
			indicazioni: 'lucide:signpost',
			'sito-web': 'lucide:globe',
		},
	},
	fiducia: {
		label: 'Fiducia e qualità',
		icons: {
			premio: 'lucide:award',
			trofeo: 'lucide:trophy',
			garanzia: 'lucide:shield-check',
			certificato: 'lucide:badge-check',
			pollice: 'lucide:thumbs-up',
			stella: 'lucide:star',
			check: 'lucide:check',
			lucchetto: 'lucide:lock',
		},
	},
	comunicazione: {
		label: 'Comunicazione',
		icons: {
			chat: 'lucide:message-circle',
			messaggi: 'lucide:messages-square',
			invia: 'lucide:send',
			megafono: 'lucide:megaphone',
			campanella: 'lucide:bell',
			citazione: 'lucide:quote',
			cuffie: 'lucide:headset',
		},
	},
	interfaccia: {
		label: 'Frecce e interfaccia',
		icons: {
			'freccia-destra': 'lucide:arrow-right',
			'freccia-sinistra': 'lucide:arrow-left',
			'freccia-su': 'lucide:arrow-up',
			'freccia-giu': 'lucide:arrow-down',
			'chevron-giu': 'lucide:chevron-down',
			'chevron-destra': 'lucide:chevron-right',
			menu: 'lucide:menu',
			chiudi: 'lucide:x',
			cerca: 'lucide:search',
			piu: 'lucide:plus',
			info: 'lucide:info',
			'link-esterno': 'lucide:external-link',
		},
	},
	documenti: {
		label: 'File e documenti',
		icons: {
			preventivo: 'lucide:file-text',
			contratto: 'lucide:file-pen-line',
			cartella: 'lucide:folder',
			'lista-controllo': 'lucide:clipboard-check',
			libro: 'lucide:book-open',
			foto: 'lucide:image',
			fotocamera: 'lucide:camera',
		},
	},
	meteo: {
		label: 'Meteo e stagioni',
		icons: {
			sole: 'lucide:sun',
			nuvola: 'lucide:cloud',
			pioggia: 'lucide:cloud-rain',
			neve: 'lucide:snowflake',
			vento: 'lucide:wind',
			termometro: 'lucide:thermometer',
		},
	},
	animali: {
		label: 'Animali',
		icons: {
			cane: 'lucide:dog',
			gatto: 'lucide:cat',
			zampa: 'lucide:paw-print',
			uccello: 'lucide:bird',
			pesce: 'lucide:fish',
		},
	},
	tempoLibero: {
		label: 'Sport e tempo libero',
		icons: {
			palestra: 'lucide:dumbbell',
			pallone: 'lucide:volleyball',
			nuoto: 'lucide:waves',
			tenda: 'lucide:tent',
			valigia: 'lucide:luggage',
			musica: 'lucide:music',
			biglietto: 'lucide:ticket',
			arte: 'lucide:palette',
		},
	},
	marchi: {
		label: 'Marchi',
		icons: {
			whatsapp: 'simple-icons:whatsapp',
			facebook: 'simple-icons:facebook',
			instagram: 'simple-icons:instagram',
			google: 'simple-icons:google',
			youtube: 'simple-icons:youtube',
			tiktok: 'simple-icons:tiktok',
			tripadvisor: 'simple-icons:tripadvisor',
			linkedin: 'simple-icons:linkedin',
			pinterest: 'simple-icons:pinterest',
			threads: 'simple-icons:threads',
			x: 'simple-icons:x',
			telegram: 'simple-icons:telegram',
			booking: 'simple-icons:bookingdotcom',
			airbnb: 'simple-icons:airbnb',
		},
	},
} as const satisfies Record<string, { label: string; icons: Record<string, `${'lucide' | 'simple-icons'}:${string}`> }>;

type Groups = typeof iconGroups;
export type IconGroup = keyof Groups;
export type IconName = { [G in IconGroup]: keyof Groups[G]['icons'] }[IconGroup] & string;

/** Tutti gli alias in un solo oggetto, nell'ordine dei gruppi. */
export const icons = {} as Record<IconName, string>;
/** Gruppo di ogni alias. */
export const iconGroupOf = {} as Record<IconName, IconGroup>;

for (const [group, { icons: groupIcons }] of Object.entries(iconGroups) as unknown as [IconGroup, { icons: Record<IconName, string> }][]) {
	for (const [name, id] of Object.entries(groupIcons) as [IconName, string][]) {
		if (name in icons) throw new Error(`Icona "${name}" ripetuta in src/core/icons.ts (gruppi ${iconGroupOf[name]} e ${group})`);
		icons[name] = id;
		iconGroupOf[name] = group;
	}
}

/** Alias ammessi, come tupla per `z.enum(ICON_NAMES)`. */
export const ICON_NAMES = Object.keys(icons) as [IconName, ...IconName[]];

/** Campo icona degli schemi: nel CMS la select mostra la categoria accanto all'alias. */
export const iconSchema = () =>
	z.enum(ICON_NAMES).meta({
		optionLabels: Object.fromEntries(ICON_NAMES.map((name) => [name, `${name} (${iconGroups[iconGroupOf[name]].label})`])),
	});

/** Icone da includere nel build, per set: l'opzione `include` di astro-icon. */
export const iconInclude = Object.values(icons).reduce<Record<string, string[]>>((include, id) => {
	const [set, name] = id.split(':');
	(include[set] ??= []).push(name);
	return include;
}, {});
