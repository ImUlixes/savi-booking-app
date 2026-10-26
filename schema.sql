-- ========================================================
-- SCHEMA SUPABASE: APPLICAZIONE PRENOTAZIONI SAVÌ CONVERSANO
-- ========================================================
-- Istruzioni:
-- 1. Accedi alla dashboard del tuo progetto Supabase (https://supabase.com/dashboard)
-- 2. Vai nella sezione "SQL Editor"
-- 3. Incolla questo script ed eseguilo con "Run"
-- ========================================================

-- Estensione per generare UUID se necessaria
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELLA PRINCIPALE DELLE PRENOTAZIONI
CREATE TABLE IF NOT EXISTS public.prenotazioni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codice_prenotazione VARCHAR(12) UNIQUE NOT NULL,
    data_prenotazione DATE NOT NULL,
    orario_prenotazione TIME NOT NULL,
    fascia_servizio VARCHAR(30) NOT NULL DEFAULT 'cena', -- 'aperitivo', 'cena_primo_turno', 'cena_secondo_turno'
    numero_ospiti INTEGER NOT NULL CHECK (numero_ospiti >= 1 AND numero_ospiti <= 20),
    preferenza_tavolo VARCHAR(50) DEFAULT 'nessuna', -- 'interna', 'dehor', 'terrazza', 'nessuna'
    occasione VARCHAR(50) DEFAULT 'nessuna', -- 'compleanno', 'anniversario', 'romantica', 'amici', 'business', 'nessuna'
    
    -- Dati del cliente
    nome_completo VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    
    -- Note ed esigenze alimentari
    esigenze_alimentari TEXT[] DEFAULT ARRAY[]::TEXT[], -- es. ['Gluten Free', 'Senza Lattosio', 'Vegetariano']
    note_speciali TEXT DEFAULT '',
    
    -- Stato della prenotazione
    stato VARCHAR(20) NOT NULL DEFAULT 'confermata' CHECK (stato IN ('in_attesa', 'confermata', 'rifiutata', 'cancellata', 'completata')),
    note_interne_staff TEXT DEFAULT '',
    
    -- Metadati temporali
    creato_il TIMESTAMPTZ DEFAULT NOW(),
    aggiornato_il TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDICI PER PERFORMANCE QUERY RAPIDE
CREATE INDEX IF NOT EXISTS idx_prenotazioni_data ON public.prenotazioni(data_prenotazione);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_codice ON public.prenotazioni(codice_prenotazione);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_telefono ON public.prenotazioni(telefono);
CREATE INDEX IF NOT EXISTS idx_prenotazioni_stato ON public.prenotazioni(stato);

-- 3. TABELLA CONFIGURAZIONE ORARI E CAPIENZA
CREATE TABLE IF NOT EXISTS public.configurazione_booking (
    id SERIAL PRIMARY KEY,
    giorno_settimana INTEGER NOT NULL CHECK (giorno_settimana BETWEEN 0 AND 6), -- 0 = Domenica, 1 = Lunedì, ...
    attivo BOOLEAN DEFAULT TRUE,
    apertura TIME NOT NULL,
    chiusura TIME NOT NULL,
    max_coperti_per_slot INTEGER DEFAULT 24,
    intervallo_slot_minuti INTEGER DEFAULT 30
);

-- 4. FUNZIONE TRIGGER PER AGGIORNARE AUTOMATICAMENTE 'aggiornato_il'
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.aggiornato_il = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.prenotazioni;
CREATE TRIGGER trigger_set_updated_at
BEFORE UPDATE ON public.prenotazioni
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.prenotazioni ENABLE ROW LEVEL SECURITY;

-- Policy 1: Chiunque (anonimo o autenticato) può creare una nuova prenotazione
CREATE POLICY "Inserimento prenotazione pubblico"
ON public.prenotazioni
FOR INSERT
WITH CHECK (true);

-- Policy 2: Lettura consentita per consultare la propria prenotazione tramite codice o per tutti in lettura pubblica dello stato
CREATE POLICY "Lettura prenotazioni pubblica"
ON public.prenotazioni
FOR SELECT
USING (true);

-- Policy 3: Modifica e cancellazione (aperta per demo o protetta da backend / anon key con codice)
CREATE POLICY "Aggiornamento prenotazioni con codice"
ON public.prenotazioni
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy 4: Cancellazione
CREATE POLICY "Cancellazione prenotazioni"
ON public.prenotazioni
FOR DELETE
USING (true);

-- 6. DATI DI ESEMPIO (SEED DEMO)
INSERT INTO public.prenotazioni (
    codice_prenotazione, data_prenotazione, orario_prenotazione, fascia_servizio,
    numero_ospiti, preferenza_tavolo, occasione, nome_completo, email, telefono,
    esigenze_alimentari, note_speciali, stato
) VALUES 
('SAVI-8120', CURRENT_DATE, '20:30:00', 'cena_primo_turno', 2, 'interna', 'romantica', 'Marco Rossi', 'marco.rossi@example.com', '+39 347 1234567', ARRAY['Gluten Free'], 'Tavolo appartato se possibile', 'confermata'),
('SAVI-3491', CURRENT_DATE, '21:00:00', 'cena_primo_turno', 4, 'dehor', 'compleanno', 'Giulia Bianchi', 'giulia.b@example.com', '+39 333 9876543', ARRAY['Senza Lattosio'], 'Portiamo una torta artigianale', 'confermata'),
('SAVI-5629', CURRENT_DATE + INTERVAL '1 day', '19:30:00', 'aperitivo', 3, 'terrazza', 'amici', 'Antonio De Luca', 'antonio.dl@example.com', '+39 320 5556677', ARRAY[]::TEXT[], '', 'in_attesa')
ON CONFLICT (codice_prenotazione) DO NOTHING;
