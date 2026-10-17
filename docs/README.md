# Documentazione

Documentazione della libreria: architettura, catalogo blocchi, guida all'uso come template per i siti cliente. Questo indice e `CHANGELOG.md` restano solo nella libreria: `site:init` li toglie dai siti.

- [`specifica.md`](specifica.md): specifica completa del sistema (architettura, blocchi, CMS, controlli, squadra di agenti, cancelli); arriva anche nei siti con `blocks:sync`.
- [`catalogo/`](catalogo/README.md): catalogo dei blocchi generato dagli schemi (regole, schede con screenshot, campi ed esempi JSON, temi, icone, `catalogo.json` per le macchine), primitive e ricette tipo.
- [`skill/`](skill/): skill degli agenti Paperclip, una cartella per skill con `SKILL.md` (quando usarla, passi con i comandi, criterio di fine, cosa non fare); arrivano nei siti con `blocks:sync`.
- [`agenti/capabilities.json`](agenti/capabilities.json): testi esatti del campo Capabilities in Paperclip, da aggiornare insieme alle istruzioni.
- [`agenti/`](agenti/): istruzioni di ruolo degli agenti Paperclip, un file per agente, copiate tali e quali nelle istruzioni dell'agente in Paperclip; arrivano nei siti con `blocks:sync`.
- [`modelli/`](modelli/): modello del brief (`brief.md`, che nel sito si compila in `docs/brief.md`) e dei task del PM (`task.md`).
- [`blocchi-interattivi.md`](blocchi-interattivi.md): regole per i blocchi con JavaScript (JS vanilla, tastiera, focus, movimento ridotto).
- [`siti-cliente.md`](siti-cliente.md): modalità libreria e sito (`SITE_STARTER_LIBRARY`), creazione di un sito (`site:init`), aggiornamento della libreria (`blocks:sync`), cartelle e file gestiti.
- [`provisioning.md`](provisioning.md): comando del titolare `site:create` per repo privata, invito a `simone-agenti` e progetto Vercel, con anteprima e ripresa dopo errori.
- [`controlli.md`](controlli.md): controlli automatici e CI (cosa controllano, cosa fare quando falliscono, protezione di `main`).
- [`decap.md`](decap.md): CMS per i clienti (servizio OAuth, inviti, flusso editoriale, cosa si può modificare).
- [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md): licenze delle risorse di terzi incluse nel sito.
