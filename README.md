# Savì Conversano - Modern Booking Web App (React 19 + Vite + TypeScript + Tailwind + Supabase)

Applicazione contemporanea per le prenotazioni di **Savì - Not Ordinary Crepes** (Conversano, dal 1995), creata con uno stack tecnologico all'avanguardia: **React 19**, **Vite 6**, **TypeScript**, **TailwindCSS** e **Supabase**.

---

## Caratteristiche Principali

- **Stack Moderno & Reattivo**: Sviluppata con React 19 e Vite, con Hot Module Replacement (HMR) istantaneo.
- **Tipizzazione Rigorosa con TypeScript**: Modello dati per prenotazioni, tavoli, fasce di servizio e metriche KPI completamente tipizzato.
- **Design System Luxury & Mobile-First**: Palette dark oro (`#e2bc70`), tipografia editoriale (Jost + Plus Jakarta Sans), micro-animazioni tattili, celebrazione visiva con coriandoli dorati (`canvas-confetti`) e safe-area per smartphone iOS/Android.
- **Architettura Modulare**:
  - `src/features/booking/`: Wizard a 4 step per il cliente con selezione coperti da 1 a 15, scelta area tavolo (*Interna*, *Dehor*, *Terrazza*), slider orizzontale touch per 14 giorni, slot orari per turno e tag rapidi per celiachia/intolleranze.
  - `src/features/lookup/`: Ricerca e cancellazione autonoma della prenotazione per il cliente.
  - `src/features/staff/`: Cruscotto di gestione sala protetto da PIN (demo: `1995`), contatori KPI coperti del giorno, filtri di stato, modale per inserimento rapido walk-in/telefonico e collegamento diretto WhatsApp.
- **Database Supabase con Fallback Ibrido**:
  - Tabella PostgreSQL `public.prenotazioni` con RLS.
  - Funziona subito in modalità demo (LocalStorage) e si collega a Supabase Cloud con un click inserendo URL e Anon Key dalla modale integrata.
- **Compatibilità Totale con XAMPP / Apache / Vercel**:
  - `vite.config.ts` è configurato con `base: './'`, generando risorse a percorso relativo che funzionano in qualsiasi sottocartella o hosting statico.

---

## Comandi Disponibili

Dalla cartella del progetto (`c:\xampp\htdocs\booking-app`):

### 1. Avvio in Sviluppo (Dev Server)
```bash
npm run dev
```
Avvia il server di sviluppo all'indirizzo `http://localhost:5173/`.

### 2. Compilazione di Produzione (Build per XAMPP o Cloud)
```bash
npm run build
```
Genera la cartella compilata `dist/`. I file all'interno di `dist/` possono essere:
- Trascorsi direttamente in qualsiasi cartella di XAMPP / Altervista / Apache.
- Distribuiti su **Vercel**, **Cloudflare Pages** o **Netlify**.

### 3. Anteprima Locale della Build
```bash
npm run preview
```

---

## Configurazione Database Supabase

1. Accedi alla dashboard del tuo progetto su [Supabase](https://supabase.com/dashboard).
2. Apri la sezione **SQL Editor**.
3. Incolla ed esegui lo script presente nel file [`schema.sql`](./schema.sql).
4. Avvia l'applicazione, clicca sul badge in alto a destra **"Demo Locale"**, inserisci l'URL del progetto e la Anon Key e clicca su **Salva & Connetti**.

---

## Struttura della Cartella

```text
booking-app/
├── dist/                      # File compilati pronti per la produzione
├── src/
│   ├── components/            # Navbar, SupabaseModal
│   ├── features/
│   │   ├── booking/           # Wizard prenotazione cliente
│   │   ├── lookup/            # Ricerca prenotazione cliente
│   │   └── staff/             # Dashboard gestione sala e tavoli
│   ├── lib/                   # Client Supabase con fallback locale
│   ├── types/                 # Interfacce TypeScript
│   ├── App.tsx                # Controller viste
│   ├── main.tsx               # Entrypoint React 19
│   └── index.css              # Stili Tailwind e personalizzazioni
├── package.json
├── vite.config.ts             # Configurato con base: './'
├── tailwind.config.js         # Token cromatici e font
├── schema.sql                 # Script SQL per Supabase
└── README.md
```
