# Heroes Collector — Guida Completa al Deployment su Twitch

## Indice

1. [Panoramica del progetto](#1-panoramica-del-progetto)
2. [Architettura tecnica](#2-architettura-tecnica)
3. [Prerequisiti](#3-prerequisiti)
4. [Setup del backend (server)](#4-setup-del-backend-server)
5. [Setup del database](#5-setup-del-database)
6. [Registrazione estensione su Twitch](#6-registrazione-estensione-su-twitch)
7. [Configurazione dell'autenticazione](#7-configurazione-dellautenticazione)
8. [Build e deploy del frontend](#8-build-e-deploy-del-frontend)
9. [Deploy del backend](#9-deploy-del-backend)
10. [Configurazione EventSub (webhook Twitch)](#10-configurazione-eventsub-webhook-twitch)
11. [Channel Points Rewards](#11-channel-points-rewards)
12. [Test e attivazione](#12-test-e-attivazione)
13. [Come si presenta e funziona per i viewer](#13-come-si-presenta-e-funziona-per-i-viewer)
14. [Manutenzione e operazioni](#14-manutenzione-e-operazioni)
15. [Risoluzione problemi](#15-risoluzione-problemi)

---

## 1. Panoramica del progetto

Heroes Collector e un'estensione Twitch che trasforma i viewer attivi in eroi collezionabili. Ogni spettatore che partecipa genera un eroe la cui rarita e forza dipendono dalla sua attivita sul canale (messaggi in chat, tempo di visione, sub, follow).

### Meccaniche principali

- **Generazione eroe**: Ogni viewer che si unisce ottiene un eroe con classe, rarita e stats basate sulla sua attivita
- **Cattura eroi**: I viewer possono catturare gli eroi di altri spettatori spendendo energia
- **Party**: Componi un party di massimo 4 eroi
- **Dungeon PVE**: 5 ondate di mostri con difficolta crescente
- **PVP Arena**: Combatti party vs party con sistema ELO
- **Raid Boss**: Boss settimanale che tutta la community affronta insieme
- **Shop**: Acquista pozioni, equipaggiamento e potenziamenti con il gold guadagnato
- **Inventario**: Equipaggia armi, armature e accessori sui tuoi eroi

### Classi eroiche (8)

| Classe | Ruolo | Descrizione |
|--------|-------|-------------|
| Guardiano | Tank | Alta difesa, scudi, provocazione |
| Lama | DPS melee | Alto attacco, fendenti, AoE |
| Arcano | Mago DPS | Magie potenti, AoE, crowd control |
| Custode | Healer | Cure, resurrezione, buff |
| Ombra | Assassino | Critico alto, veleno, evasione |
| Ranger | DPS ranged | Frecce, debuff, mobilita |
| Sciamano | Ibrido | DoT, cure party, maledizioni |
| Crono | Supporto | Controllo velocita, buff tempo |

### Rarita (8 livelli)

Comune < Non Comune < Raro < Molto Raro < Epico < Leggendario < Mitico < Master

La rarita e determinata dall'activity score del viewer:
- Chat (30%): messaggi inviati in chat
- Watch time (25%): minuti di visione
- Sub (25%): mesi di iscrizione
- Follow (20%): giorni di follow

---

## 2. Architettura tecnica

```
[Viewer Browser]
       |
       v
[Twitch Extension Frontend]  <-- React + TypeScript + Vite
       |                          Hostato su Twitch CDN
       | (API REST + JWT)
       v
[Backend Server]              <-- Node.js + Express + TypeScript
       |                          Porta 3001
       | (SQL)
       v
[PostgreSQL Database]         <-- Dati utenti, eroi, battaglie, items
       
       
[Twitch EventSub Webhooks] ---> [Backend /api/twitch/eventsub]
  (chat, sub, follow, stream events, channel points)
```

### Porte e URL

- **Frontend dev**: `http://localhost:3000` (Vite dev server)
- **Backend**: `http://localhost:3001` (Express)
- **Database**: PostgreSQL (default porta 5432)

---

## 3. Prerequisiti

### Software necessario

- **Node.js** v18+ (https://nodejs.org)
- **PostgreSQL** v14+ (https://www.postgresql.org/download/)
- **Git** (https://git-scm.com)
- **Un VPS/cloud** per il backend (es. DigitalOcean, Hetzner, Railway, Render)
- **Account Twitch Developer** (https://dev.twitch.tv)

### Account e credenziali

- Account Twitch con canale attivo
- Registrazione su https://dev.twitch.tv/console
- Client ID e Client Secret dell'estensione (si ottengono al punto 6)
- Extension Secret (per firmare JWT, si ottiene al punto 6)

---

## 4. Setup del backend (server)

### Installazione dipendenze

```bash
cd backend
npm install
```

### Configurazione ambiente

Crea il file `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/heroes_collector

# Server
PORT=3001
NODE_ENV=production

# Twitch Extension
TWITCH_CLIENT_ID=il_tuo_client_id
TWITCH_CLIENT_SECRET=il_tuo_client_secret
TWITCH_EXTENSION_SECRET=il_tuo_extension_secret_base64

# Webhook EventSub
TWITCH_EVENTSUB_SECRET=una_stringa_segreta_a_tua_scelta
BACKEND_URL=https://il-tuo-dominio.com
```

### Avvio in sviluppo

```bash
npm run dev
```

### Build per produzione

```bash
npm run build
npm start
```

---

## 5. Setup del database

### Creazione database

```bash
# Accedi a PostgreSQL
psql -U postgres

# Crea il database
CREATE DATABASE heroes_collector;
\q
```

### Migrazione schema

Il backend esegue automaticamente le migrazioni all'avvio. I file SQL sono in `database/`:

- `001_schema.sql`: Tabelle principali (users, heroes, roster, parties, items, battles, leaderboard)
- `002_raid_shop.sql`: Tabelle raid e shop (raid_boss, raid_contributions, shop_listings, channel_point_redemptions)

```bash
# Avvia il backend — le migrazioni partono in automatico
cd backend
npm run dev
```

Controlla i log: dovrebbe stampare "Migrazione completata" per ogni file .sql.

---

## 6. Registrazione estensione su Twitch

### Passo 1: Crea l'estensione

1. Vai su https://dev.twitch.tv/console
2. Clicca **"Register Your Application"** (oppure "Extensions" > "Create Extension")
3. Compila:
   - **Name**: Heroes Collector (o il nome che preferisci)
   - **Type**: Panel Extension (si mostra sotto il video)
   - **Summary**: Gioco monster-collector dove i viewer diventano eroi
   - **Category**: Game / Entertainment
4. Salva e annota:
   - **Client ID**
   - **Client Secret** (clicca "New Secret")

### Passo 2: Configura l'estensione

Nella pagina dell'estensione:

1. **Asset Hosting**: 
   - Se usi Twitch CDN: carica i file della build frontend (vedi punto 8)
   - Se usi hosting esterno: imposta l'URL del tuo frontend

2. **Extension Capabilities**:
   - Abilita **Panel** (pannello sotto il video)
   - Panel Viewer Path: `panel.html`
   - Altezza pannello: **500px** (consigliata)

3. **Extension Secret**:
   - Vai su "Extension Settings"
   - Genera un **Extension Secret** (base64)
   - Questo serve per verificare i JWT dei viewer

### Passo 3: Configura gli URL

Nella sezione "Extension Settings":

- **Testing Base URI**: `https://localhost:3000` (per sviluppo)
- **Panel Viewer Path**: `panel.html`
- **Backend URL / Allowlisted URLs**: `https://il-tuo-dominio.com`

---

## 7. Configurazione dell'autenticazione

### Come funziona

1. Il viewer apre l'estensione nel pannello sotto il video
2. Twitch inietta un JWT firmato con il tuo Extension Secret
3. Il frontend manda questo JWT in ogni richiesta API al backend
4. Il backend verifica la firma del JWT e identifica il viewer

### Backend: middleware di autenticazione

Il file `backend/src/middleware/twitchAuth.ts` gestisce tutto automaticamente:

- In **produzione**: verifica il JWT Twitch con l'Extension Secret
- In **sviluppo**: accetta token nel formato `dev:userId:role` per testare senza Twitch

### Impostare l'Extension Secret nel backend

L'Extension Secret di Twitch e codificato in base64. Nel `.env`:

```env
TWITCH_EXTENSION_SECRET=abc123def456...  # Il valore base64 dalla console Twitch
```

---

## 8. Build e deploy del frontend

### Build per produzione

```bash
cd frontend
npm install
npm run build
```

Questo genera la cartella `frontend/dist/` con tutti i file statici.

### Struttura file per Twitch

Twitch richiede un file `panel.html` come entry point. Dopo la build:

1. Rinomina `dist/index.html` in `dist/panel.html`
2. Zippa il contenuto della cartella `dist/` (non la cartella stessa)

### Upload su Twitch CDN

1. Vai alla console dell'estensione su dev.twitch.tv
2. Sezione **"Files"** > **"Upload"**
3. Carica il file .zip
4. Twitch hostera i file sul proprio CDN

### Alternativa: hosting esterno

Se preferisci hostare il frontend su un tuo server (es. Netlify, Vercel, Cloudflare Pages):

1. Deploya la cartella `dist/` sul tuo hosting
2. Imposta l'URL nell'estensione Twitch come "Testing Base URI"
3. Assicurati che CORS sia configurato

### Configurazione API URL

Nel frontend, l'URL del backend e configurato in `frontend/src/services/api.ts`. Per produzione:

```typescript
const API_BASE = 'https://il-tuo-dominio.com/api';
```

In sviluppo il Vite proxy gestisce tutto automaticamente (`frontend/vite.config.ts`).

---

## 9. Deploy del backend

### Opzione 1: VPS (DigitalOcean, Hetzner, ecc.)

```bash
# Sul server
git clone <repo-url>
cd Estensione/backend
npm install
npm run build

# Usa PM2 per tenere il processo attivo
npm install -g pm2
pm2 start dist/index.js --name heroes-backend
pm2 save
pm2 startup  # Per riavvio automatico al reboot
```

### Opzione 2: Railway / Render

1. Collega il repository GitHub
2. Imposta le variabili d'ambiente dal `.env`
3. Il deploy e automatico ad ogni push

### HTTPS obbligatorio

Twitch richiede che il backend sia raggiungibile via **HTTPS**. Opzioni:

- **Certbot/Let's Encrypt** (gratuito): `sudo certbot --nginx -d il-tuo-dominio.com`
- **Cloudflare** (proxy HTTPS gratuito)
- **Railway/Render** (HTTPS automatico)

### CORS

Il backend deve accettare richieste dal dominio di Twitch. Nel file `backend/src/index.ts`, il CORS e gia configurato per accettare tutti gli origin in sviluppo. Per produzione, restringere a:

```
https://*.ext-twitch.tv
```

---

## 10. Configurazione EventSub (webhook Twitch)

EventSub permette al backend di ricevere eventi in tempo reale da Twitch (messaggi chat, sub, follow, ecc.) per aggiornare l'activity score dei viewer.

### Eventi necessari

| Evento | Scopo |
|--------|-------|
| `channel.chat.message` | Traccia messaggi in chat (+activity score) |
| `channel.subscribe` | Traccia nuove sub |
| `channel.subscription.gift` | Traccia gift sub |
| `stream.online` | Segna inizio stream |
| `stream.offline` | Segna fine stream |
| `channel.channel_points_custom_reward_redemption.add` | Gestisce reward channel points |

### Registrazione webhook

Il backend ha un endpoint dedicato: `POST /api/twitch/eventsub`

Per registrare le subscription, usa la CLI di Twitch o l'API:

```bash
# Installa Twitch CLI
npm install -g twitch-cli

# Registra gli eventi (sostituisci con i tuoi valori)
twitch api post eventsub/subscriptions \
  -b '{
    "type": "channel.chat.message",
    "version": "1",
    "condition": { "broadcaster_user_id": "IL_TUO_CHANNEL_ID" },
    "transport": {
      "method": "webhook",
      "callback": "https://il-tuo-dominio.com/api/twitch/eventsub",
      "secret": "la_tua_eventsub_secret"
    }
  }'
```

Ripeti per ogni tipo di evento nella tabella sopra.

### Verifica

Twitch inviera una challenge al tuo endpoint. Il backend la gestisce automaticamente. Se tutto e configurato correttamente, lo stato della subscription sara "enabled".

---

## 11. Channel Points Rewards

I viewer possono spendere i Channel Points del canale per ottenere bonus in-game.

### Reward da creare sulla dashboard Twitch

Vai su **Dashboard Twitch** > **Punti canale** > **Gestisci ricompense** e crea:

| Nome Reward | Costo suggerito | Effetto in-game |
|-------------|-----------------|-----------------|
| Boost Energia | 500 | +10 energia |
| Boost EXP | 1000 | +50 EXP a tutti gli eroi del party |
| Boost Gold | 750 | +25 gold |
| Cassa Misteriosa | 2000 | Drop item random (raro+) |
| Reroll Abilita | 1500 | Rigenera le abilita dell'eroe |
| Mega Energia | 3000 | Energia al massimo |

### Collegamento

Quando un viewer riscatta un reward:
1. Twitch invia un evento `channel.channel_points_custom_reward_redemption.add` al webhook
2. Il backend identifica il reward dal titolo
3. Applica l'effetto in-game al viewer

I titoli dei reward devono corrispondere a quelli nel file `backend/src/services/channelPointsService.ts`.

---

## 12. Test e attivazione

### Test in locale

1. Avvia il database PostgreSQL
2. Avvia il backend: `start-backend.bat` (o `cd backend && npm run dev`)
3. Avvia il frontend: `start-frontend.bat` (o `cd frontend && npm run dev`)
4. Apri `http://localhost:3000`
5. Il token dev `dev:test-user:viewer` viene usato automaticamente

### Test sull'estensione Twitch (prima del rilascio)

1. Vai alla console dell'estensione su dev.twitch.tv
2. Sezione **"Status"** > **"Hosted Test"**
3. Installa l'estensione in modalita test sul tuo canale
4. Apri il tuo canale Twitch e verifica il pannello

### Rilascio

1. Compila e testa tutto
2. Dalla console estensione: **"Submit for Review"**
3. Twitch revisionera l'estensione (puo richiedere qualche giorno)
4. Una volta approvata, vai su **"Release"**
5. L'estensione sara disponibile per tutti

### Installazione sul canale

Dopo il rilascio:
1. Vai su https://dashboard.twitch.tv
2. **Estensioni** > Cerca "Heroes Collector"
3. **Installa** > **Attiva** come pannello

---

## 13. Come si presenta e funziona per i viewer

### Prima volta

1. Il viewer vede il pannello "Heroes Collector" sotto il video
2. Clicca il pannello: appare la schermata di benvenuto con il logo
3. Preme **"Unisciti al gioco!"**
4. Viene generato il suo eroe personale con classe e rarita basate sulla sua attivita
5. Appare il tab **Eroe** con lo sprite animato, le stats e le abilita

### Gameplay loop

```
Chatta e guarda lo stream
        |
        v
Activity score aumenta --> Rarita eroe migliora
        |
        v
Guadagna energia nel tempo
        |
        v
Vai al Catalogo --> Cattura eroi di altri viewer
        |
        v
Forma un Party (max 4 eroi)
        |
        v
  +-----------+-----------+-----------+
  |           |           |           |
  v           v           v           v
Dungeon     PVP Arena   Raid Boss   Shop
(5 ondate)  (1v1 ELO)  (community) (gold)
  |           |           |           |
  v           v           v           v
EXP + Gold  ELO + EXP   EXP + Gold  Items
+ Loot                  + Loot rari  + Equip
```

### Interfaccia (10 tab)

**Riga 1 — Collezione:**
- **Eroe**: Il tuo eroe personale con sprite, stats e livello
- **Catalogo**: Tutti gli eroi generati dai viewer del canale, con filtri
- **Roster**: I tuoi eroi catturati
- **Zaino**: Inventario oggetti, equipaggiamento
- **Shop**: Compra consumabili e equipment con gold

**Riga 2 — Combattimento:**
- **Party**: Gestisci fino a 3 party da 4 eroi ciascuno
- **Dungeon**: 5 ondate PVE con arena grafica animata
- **PVP**: Sfida altri viewer, sistema ranking ELO
- **Raid**: Boss settimanale della community
- **Rank**: Classifica PVP globale

### Combattimento visivo

Ogni combattimento (dungeon, PVP, raid) mostra un'arena grafica con:
- Sprite SVG animati per eroi e mostri (16 mostri unici)
- Barre HP in tempo reale
- Numeri danno/cura floating
- Animazioni attacco, difesa, morte
- Log messaggi in basso
- Barra progresso dell'animazione

---

## 14. Manutenzione e operazioni

### Monitoraggio

- Controlla i log del backend per errori
- Monitora l'uso del database (connessioni, dimensione)
- Verifica che le EventSub subscription siano attive

### Raid Boss settimanale

Il raid boss si genera automaticamente ogni settimana. Rotazione tra 4 boss:
1. Idra delle Profondita
2. Titano di Cenere
3. Signore del Vuoto
4. Fenice Oscura

Gli HP scalano in base al numero di giocatori attivi.

### Backup database

```bash
# Backup
pg_dump heroes_collector > backup_$(date +%Y%m%d).sql

# Restore
psql heroes_collector < backup_20260409.sql
```

### Reset stagionale PVP

Per resettare la classifica PVP (soft reset: ELO dimezzato verso 1000):

```sql
UPDATE leaderboard SET
  elo_rating = FLOOR((elo_rating + 1000) / 2),
  wins = 0, losses = 0,
  season = season + 1;
```

### Aggiornamenti

```bash
cd Estensione
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart heroes-backend

# Frontend
cd ../frontend
npm install
npm run build
# Carica il nuovo .zip su Twitch CDN
```

---

## 15. Risoluzione problemi

### Il pannello non si carica

- Verifica che l'estensione sia attiva sul canale (Dashboard > Estensioni)
- Controlla la console del browser per errori JavaScript
- Verifica che il backend sia raggiungibile via HTTPS
- Controlla che CORS sia configurato per `*.ext-twitch.tv`

### "Errore autenticazione"

- Verifica che `TWITCH_EXTENSION_SECRET` nel `.env` sia corretto (base64)
- In sviluppo, assicurati di usare il token `dev:userId:role`
- Controlla che il JWT non sia scaduto

### L'activity score non si aggiorna

- Verifica che le EventSub subscription siano attive: `twitch api get eventsub/subscriptions`
- Controlla che il webhook URL sia raggiungibile
- Verifica i log del backend per errori nel processing degli eventi

### Il raid boss non appare

- Il boss si genera automaticamente alla prima richiesta della settimana
- Controlla che la tabella `raid_boss` nel database abbia una entry per la settimana corrente
- Se necessario: `DELETE FROM raid_boss WHERE week_number = X;` e ricarica la pagina

### Errori database

- Verifica che PostgreSQL sia in esecuzione
- Controlla `DATABASE_URL` nel `.env`
- Riesegui le migrazioni: `cd backend && npm run db:migrate`

### Performance

- Usa `pm2 monit` per monitorare CPU/memoria del backend
- Per molti viewer simultanei, considera:
  - Connection pooling nel database (gia attivo con `pg` pool)
  - Rate limiting sulle API
  - Cache per dati che cambiano poco (lista eroi, shop)

---

## Checklist finale pre-lancio

- [ ] Database PostgreSQL configurato e migrazioni eseguite
- [ ] Backend deployato su HTTPS
- [ ] Frontend buildato e caricato su Twitch CDN
- [ ] Estensione registrata su dev.twitch.tv
- [ ] Extension Secret configurato nel backend
- [ ] CORS configurato per i domini Twitch
- [ ] EventSub webhook registrati per tutti gli eventi
- [ ] Channel Points Rewards creati sulla dashboard
- [ ] Test completo in modalita hosted test
- [ ] Estensione sottomessa per review
- [ ] Estensione approvata e rilasciata
- [ ] Estensione attivata come pannello sul canale

---

*Heroes Collector v1.0 — Creato per il canale Twitch di Alessio*
