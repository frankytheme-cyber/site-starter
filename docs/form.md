# Moduli di contatto e preventivo

Il blocco `form` raccoglie richieste scritte. `contatto` mostra nome, email, telefono
facoltativo e messaggio; `preventivo` aggiunge servizio e comune dell’intervento.
Non raccoglie allegati, prenotazioni, pagamenti o consensi marketing.

## Configurazione di un sito su Vercel

1. Su Resend verifica un dominio che puoi usare come mittente e crea una chiave API
   con il permesso di invio per quel dominio.
2. Nel progetto Vercel configura `RESEND_API_KEY` e `RESEND_FROM`, per esempio
   `Moduli del sito <moduli@dominio-verificato.it>`. Sono variabili server: niente
   prefisso `PUBLIC_`, niente chiavi nelle ricette, nel CMS o nel repository.
3. L’email destinataria è **solo** `src/content/settings/site.json` → `email`.
   Il `reply_to` è l’email del visitatore: rispondendo alla richiesta si scrive a lui.
   Il mittente tecnico verificato può essere diverso dall’indirizzo pubblico dell’attività.
4. Mantieni `SITE_STARTER_LIBRARY` vuota nel sito cliente. Con valore `1` la funzione
   rifiuta l’invio, anche con una chiamata diretta all’API.
5. Prepara l’informativa approvata per questo trattamento e per Resend. La pagina
   deve esistere; indica il suo percorso in `privacyHref`. Il modulo richiede una
   presa visione, senza iscrizioni automatiche o consensi marketing.
6. Distribuisci il sito su Vercel e prova una richiesta usando una casella che controlli:
   verifica ricezione e risposta al visitatore. Questo invio reale richiede autorizzazione
   esplicita; i test automatici usano esclusivamente API simulate.

Il sito resta statico. Vercel riconosce `api/contact.ts` come funzione Node con
handler Web Standard; non serve installare un adapter SSR o l’SDK di Resend.
La funzione e la guida sono file gestiti dal manifest e arrivano con `blocks:sync`.

## Ricetta

Inserisci questa sezione dopo l’hero di una pagina. Per `preventivo` aggiungi
`"services": ["Servizio effettivamente offerto", "Altro servizio"]`.

```json
{
  "type": "form",
  "id": "scrivici",
  "tone": "muted",
  "variant": "contatto",
  "title": "Come possiamo aiutarti?",
  "privacyHref": "/privacy/",
  "submitLabel": "Invia la richiesta"
}
```

## Comportamento e limiti

- HTML nativo con POST: senza JavaScript si apre una pagina con l’esito; tornando
  indietro il browser può riproporre i dati. Con JavaScript l’esito viene annunciato
  nel modulo; i dati si cancellano solo dopo un invio confermato, restano dopo un errore.
- Nel catalogo il pulsante prova solo la compilazione: nessuna chiamata all’API e
  nessuna email. Senza JavaScript il pulsante dimostrativo è disabilitato.
- Validazione anche sul server, corpo massimo 64 KiB, soli POST URL-encoded,
  origine esatta del dominio di `site.json.url` o del deployment `VERCEL_URL`.
  Alias Vercel diversi dal dominio del sito e dal deployment non sono ammessi.
- Campo honeypot invisibile; richieste che lo compilano non raggiungono Resend.
  È un filtro di base: per siti esposti a spam configura anche il rate limiting
  del firewall Vercel. Non viene dichiarato un limite per IP basato sulla memoria
  temporanea delle funzioni serverless.
- Retry con gli stessi dati usano la stessa chiave di idempotenza: Resend evita
  una seconda email entro 24 ore. Una richiesta intenzionalmente identica entro
  questo intervallo non produce una nuova email.
- La funzione invia solo testo semplice alla casella dell’attività; non invia
  risposte automatiche ai visitatori e non registra payload o chiavi nei log.
- Un successo indica l’accettazione di Resend, non la consegna garantita alla casella.
  Controlla bounce e stato del dominio dal pannello Resend.

## Verifica locale

`npm run test:forms` verifica invio, dati invalidi, honeypot, origine, limiti,
errori del provider, retry e risposta senza JS, senza rete o chiavi vere.
È incluso in `npm run check` e `npm run qa`; la QA prova anche il comportamento
nel browser. Il catalogo si visita con `npx astro dev --background` su
`/catalogo/form/`.

`astro dev` e `astro preview` servono il sito statico e il catalogo, **non** la
cartella `api/` di Vercel: un invio reale in locale richiede Vercel CLI e le
variabili server. Per provarlo senza servizi esterni usa i test.

Riferimenti: [Vercel Functions Node](https://vercel.com/docs/functions/runtimes/node-js),
[API di invio Resend](https://resend.com/docs/api-reference/emails/send-email).
