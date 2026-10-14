# Impostazioni

Aspetto del sito in `theme.json` (`palette`, `fonts`, `shape` tra i preset di `src/themes/presets.ts`). Dati dell'attività in `site.json` (nome, indirizzo del sito, logo, indirizzo, telefono, email, P.IVA, orari): `url` è anche il `site` di Astro, per canonical e Open Graph; menu del sito in `navigation.json` (voci, sottomenu, pulsante in evidenza; schema in `src/core/navigation.ts`).
Unica fonte per questi dati: le pagine li leggono da qui, mai scritti nei testi.

Lo schema è in `src/core/settings.ts` (campi, formati ammessi ed esempi); i blocchi leggono i dati con `getSiteSettings()`. `site.json` e `navigation.json` si modificano anche dal CMS (`/admin/`, «Dati attività» e «Menu»); `theme.json` no.
Il logo è un percorso relativo a `site.json` (`"../../assets/images/logo.png"`), come le immagini delle ricette. Nel template i valori sono segnaposto (`DA-COMPILARE`, il logo `fixtures/logo-segnaposto.png`, le voci di menu generiche): vanno sostituiti con quelli veri prima di pubblicare un sito cliente. In `site.json` `logo`, `whatsapp` e `social` sono facoltativi: se l'attività non li ha, togli la chiave (senza `logo` l'header va usato con `logo: "testo"`).
