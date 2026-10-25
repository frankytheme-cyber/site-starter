# Immagini placeholder nelle anteprime

Quando il brief non contiene immagini adatte, prepara immagini placeholder pertinenti per valutare il progetto grafico completo. È il comportamento normale in fase di proposta, salvo un divieto esplicito del brief o una direzione intenzionalmente tipografica. Non chiedere un nuovo permesso per ogni immagine. La mancanza di foto non obbliga a una home solo testuale.

## Scelta e uso

- Scegli prima il ruolo: ambiente per l’apertura, dettaglio del prodotto, illustrazione del servizio. Usa un insieme coerente per luce, materiali e trattamento; varia inquadrature e soggetti. Evita immagini casuali, riquadri grigi e la stessa foto in ogni sezione.
- Usa immagini generate oppure stock con licenza adatta e fonte verificata. Mai prelevare fotografie da altri siti senza autorizzazione, né riusare le fixture del catalogo.
- Sono illustrazioni generiche: non rappresentano lavori eseguiti, risultati, prima/dopo, clienti, titolare, squadra o sede. Non usarle come prove nelle gallery di lavori, nelle recensioni o nella storia dell’attività. In una presentazione generica possono illustrare il settore, senza attribuire il soggetto all’attività.
- Salva i file in `src/assets/images/` con `DA-COMPILARE` nel nome, per esempio `rinvaso-DA-COMPILARE.webp`. I controlli esistenti li segnalano come avvisi e li bloccano in modalità strict. Non rimuovere il marcatore solo per far passare la QA.
- Dichiara visibilmente nell’anteprima «Immagini dimostrative» vicino al primo utilizzo; nelle pagine interne interessate ripeti l’indicazione. L’alt descrive il soggetto e specifica che è illustrativo. Non affidarti solo al nome del file o all’alt per dichiararlo a chi vede la pagina.
- Registra in `docs/brief.md` e `docs/nota-design.md` i file, il loro uso e cosa devono sostituire. Per stock conserva URL e licenza; per immagini generate, strumento e prompt in una nota collegata. Le decisioni del singolo sito vanno in `docs/sito.md`, mai nei file gestiti.

## Verifica e sostituzione

Guarda i file prima di importarli. Ottimizza peso e dimensioni, poi verifica sul sito ritaglio, punto focale e leggibilità a 375 e 1280 px: un’immagine efficace da sola può fallire nel blocco. Confronta anche apertura e intera pagina, senza usare le immagini per mascherare testi ripetitivi o contenuti mancanti.

Prima della pubblicazione sostituisci i placeholder con materiali definitivi. Un’immagine illustrativa può restare solo se Simone la approva esplicitamente come asset definitivo con fonte e uso documentati; non diventa per questo una foto reale dell’attività. Rimuovi marcatore e dicitura solo dove questa decisione o la sostituzione li rende superati. La normale QA strict resta obbligatoria.
