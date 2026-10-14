# Impostazioni

Dati dell'attività in `site.json` (nome, indirizzo, telefono, email, P.IVA, orari).
Unica fonte per questi dati: le pagine li leggono da qui, mai scritti nei testi.

Lo schema è in `src/core/settings.ts` (campi, formati ammessi ed esempi); i blocchi leggono i dati con `getSiteSettings()`.
Nel template ogni valore è il segnaposto `DA-COMPILARE`: va sostituito con i dati veri prima di pubblicare un sito cliente. `whatsapp` e `social` sono facoltativi: se l'attività non li ha, togli la chiave.
