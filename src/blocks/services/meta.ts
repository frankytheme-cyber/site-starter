import type { BlockMeta } from '@/core/block-types';

export const meta: BlockMeta = {
	type: 'services',
	name: 'Servizi',
	description: 'Elenco dei servizi dell’attività, da 2 a 6, ognuno con titolo, descrizione breve e link facoltativo.',
	whenToUse:
		'Per dire cosa fa l’attività, di solito subito dopo l’hero. Nella pagina dei servizi, con la variante alternato, per dare più spazio a ciascuno.',
	avoidWhen:
		'Per un solo servizio (basta un blocco di testo) o per più di 6 (meglio dividerli in più blocchi con un titolo ciascuno). Non per mostrare i lavori svolti: lì servono le foto dei cantieri, non un elenco.',
	category: 'contenuti',
	scope: 'page',
	version: '1.1.0',
	source: { from: 'originale' },
	variants: {
		'cards-icone':
			'Griglia di card con icona, titolo e testo, su 2 o 3 colonne. Compatta e ordinata, non richiede foto.',
		'cards-immagine': 'Griglia di card con una foto in alto. Più concreta, richiede una foto adatta per ogni servizio.',
		alternato:
			'Righe con foto e testo che si alternano a destra e a sinistra. Occupa più spazio: adatta alla pagina dei servizi.',
		schede: 'Un servizio per scheda (su mobile elenco da aprire), con testo, foto facoltativa e link. Per servizi alternativi tra cui scegliere; non per servizi che tutti devono vedere.',
	},
	fieldRules: {
		'items[].icon': 'Obbligatoria per la variante cards-icone; le altre non la mostrano.',
		'items[].image': 'Obbligatoria per le varianti cards-immagine e alternato; facoltativa in schede; cards-icone non la mostra.',
	},
};
