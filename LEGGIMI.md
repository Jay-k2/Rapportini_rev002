# Rapportini · Trattamento Acque

PWA (app web installabile) per creare rapportini di lavoro per la gestione e la
manutenzione di impianti di trattamento acque industriali. Funziona **offline**,
si installa sulla schermata Home di Android e non richiede alcun server per
funzionare: tutti i dati restano sul dispositivo.

## Cosa include
- **Anagrafica clienti**: elenco clienti con nome, numero **commessa** ed **email**.
  Nel rapportino scegli il cliente da un menu a tendina e commessa ed email si
  compilano da sole.
- Anagrafica impianto / ubicazione
- Dati intervento: data, orari, tecnico, tipo di intervento
- Descrizione lavori
- **Parametri di processo** (pH, conducibilità, cloro, torbidità, portata, pressione,
  redox, ecc.) con possibilità di aggiungere parametri personalizzati
- Materiali e ricambi utilizzati
- **Foto** dell'impianto (dalla fotocamera o dalla galleria, compresse automaticamente)
- **Firma del cliente** con il dito, oppure spunta **"Cliente non presente per la firma"**
  (il PDF riporta "Cliente assente alla firma")
- **PDF professionale** generato dall'app (non serve più la stampa del telefono)
- **Invio del PDF al cliente** con un tocco, all'email presa dall'anagrafica
  (due modalità: vedi *Invio email* più sotto)
- Elenco rapportini con ricerca e filtri (bozze / completati)
- Impostazioni: dati azienda + logo, **clienti**, tecnici del team, tipi di intervento
- **Backup**: esporta/importa tutti i dati in un file `.json`

## Le tre novità in breve
1. **Cliente da elenco** — Impostazioni → *Clienti*: aggiungi i clienti con
   commessa ed email. Nel rapportino li selezioni dal menu e i campi si riempiono soli.
2. **Cliente assente** — nella sezione firma c'è una casella da spuntare quando il
   cliente non c'è: nasconde la firma e lo segnala nel PDF.
3. **Invio automatico PDF** — pulsante *"Invia PDF al cliente"* in fondo al rapportino.

## Provarla subito (sul computer)
Serve un piccolo server locale (il service worker e la fotocamera non funzionano
aprendo il file con doppio clic). Dalla cartella del progetto:

```bash
# con Python (già installato quasi ovunque)
python3 -m http.server 8000
```
Poi apri `http://localhost:8000` nel browser.

## Installarla su Android
Per installarla e usarla offline serve che i file siano pubblicati su un indirizzo
**HTTPS** (è un requisito delle PWA). Opzioni gratuite e semplici:

1. **GitHub Pages** – carica la cartella in un repository, attiva Pages.
2. **Netlify Drop** – vai su app.netlify.com/drop e trascina la cartella: ti dà subito un link HTTPS.
3. **Cloudflare Pages / Vercel** – analoghi, con deploy da cartella o repo.

Una volta online, dal telefono:
1. Apri il link con **Chrome**.
2. Menu (⋮) → **Installa app** / **Aggiungi a schermata Home**.
3. L'app compare come icona e si apre a tutto schermo, anche senza rete.

## Come funziona l'offline
- Il *service worker* (`sw.js`) mette in cache l'app al primo caricamento, così si
  apre anche senza connessione.
- I rapportini sono salvati in **IndexedDB**, il database locale del browser: restano
  sul dispositivo tra una sessione e l'altra.
- Nessun dato viene inviato online: è tutto locale e privato.

## Invio email del rapportino
Il pulsante **"Invia PDF al cliente"** (in fondo al rapportino) funziona in due modalità.
La scegli in *Impostazioni → Invio email*.

### Modalità 1 — Condivisione Android (attiva da subito, nessun setup)
Con l'interruttore *"Invio automatico via server"* **spento** (predefinito):
l'app crea il PDF e apre il **menu di condivisione** di Android. Scegli **Gmail**
(o WhatsApp, ecc.): il PDF è **già allegato**. Se il cliente ha un'email in anagrafica,
l'indirizzo viene copiato negli appunti e mostrato, così lo incolli al volo.
È il modo più semplice e funziona ovunque.

### Modalità 2 — Invio automatico vero (un tocco, parte da solo)
Con l'interruttore **acceso**, l'app invia il PDF **direttamente** all'email del
cliente, senza passare dal menu di condivisione. Richiede una piccola configurazione
una tantum, perché per spedire email serve un servizio di invio. Ho già incluso la
funzione pronta (`netlify/functions/send-report.js`), che usa **Resend** (gratis fino
a un buon volume mensile). Passi:

1. Crea un account su **resend.com** e verifica un mittente
   (un tuo indirizzo o, meglio, il tuo dominio aziendale).
2. In Resend crea una **API key** e copiala.
3. Su **Netlify** → il tuo sito → *Site configuration → Environment variables*,
   aggiungi:
   - `RESEND_API_KEY` = la chiave copiata
   - `MAIL_FROM` = il mittente verificato, es. `Rapportini <rapportini@tuodominio.it>`
   - `MAIL_BCC` = *(facoltativo)* un tuo indirizzo per ricevere sempre copia
4. Ripubblica il sito (basta ricaricare la cartella su Netlify: la funzione dentro
   `netlify/functions/` viene attivata automaticamente).
5. Nell'app, in *Impostazioni → Invio email*, accendi l'interruttore.

Se il server non è configurato o sei offline, l'app **torna automaticamente** alla
condivisione Android: non resti mai bloccato.

> Nota: l'invio automatico ha bisogno di connessione. La creazione del PDF, invece,
> funziona anche offline in entrambe le modalità.

## Backup e condivisione tra tecnici (stato attuale)
Oggi la condivisione è **manuale ma robusta**: da *Impostazioni → Backup dei dati*
puoi **Esportare** un file `.json` con tutti i rapportini e le impostazioni, inviarlo
a un collega (email, WhatsApp, Drive…) e lui lo **Importa** sul suo dispositivo.
È il modo più semplice per fare copie di sicurezza e spostare i dati tra telefoni.

### Sync cloud automatica (prossimo passo)
Una sincronizzazione automatica in tempo reale tra più tecnici richiede un piccolo
servizio di backend. L'app è già strutturata per aggiungerlo senza riscritture.
Opzioni consigliate:
- **Supabase** (Postgres + auth + API pronte, piano gratuito): ottimo rapporto
  semplicità/potenza. Si aggiunge una tabella `reports` e due funzioni *push/pull*.
- **Firebase Firestore**: sync realtime immediata, integrazione rapida.

Quando vuoi, posso integrarne una: aggiungiamo login del tecnico, salvataggio su
cloud e allineamento automatico mantenendo il funzionamento offline (offline-first).

## Struttura dei file
```
index.html                        L'app completa (interfaccia + logica)
manifest.webmanifest              Metadati PWA (nome, icone, colori) per l'installazione
sw.js                             Service worker: cache offline
vendor/jspdf.umd.min.js           Libreria per generare il PDF (in locale, offline)
vendor/jspdf.plugin.autotable...  Tabelle nel PDF (parametri, materiali)
netlify/functions/send-report.js  Funzione per l'invio email automatico (Modalità 2)
icons/                            Icone dell'app (192, 512, maskable)
```

## Note tecniche
- Il PDF è generato **nell'app** con jsPDF (incluso in locale in `vendor/`): niente
  dipendenze da internet, funziona **offline**, ed è un vero file allegabile via email.
- Il font PDF standard non include alcuni simboli (µ, ³): nelle unità vengono resi
  in forma sicura (`µS/cm → uS/cm`, `m³/h → m3/h`); il grado `°C` resta corretto.
- L'invio email automatico usa una funzione serverless su Netlify + Resend
  (vedi *Invio email*). Senza configurazione, l'app usa la condivisione di sistema.
- Testato: anagrafica clienti e auto-compilazione commessa/email, flag cliente
  assente, generazione PDF (con foto, tabelle, firma, cliente assente, multipagina),
  ricerca/filtri, salvataggio persistente, backup.

Se vuoi, i prossimi sviluppi naturali sono: sync cloud per il team, numerazione
automatica dei rapportini per anno e un riepilogo mensile degli interventi per cliente.
