import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, BookingStatus, KPIMetrics } from '../types';

const DEFAULT_SUPABASE_URL = "https://your-project.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

class SupabaseService {
  private client: SupabaseClient | null = null;
  public isCloudConnected: boolean = false;
  private subscribers: Array<(isConnected: boolean) => void> = [];

  constructor() {
    this.init();
  }

  public onStatusChange(callback: (isConnected: boolean) => void) {
    this.subscribers.push(callback);
    callback(this.isCloudConnected);
  }

  private notify() {
    this.subscribers.forEach(cb => cb(this.isCloudConnected));
  }

  public init() {
    const url = localStorage.getItem("savi_sb_url") || DEFAULT_SUPABASE_URL;
    const key = localStorage.getItem("savi_sb_key") || DEFAULT_SUPABASE_ANON_KEY;

    const isValid = url && url !== DEFAULT_SUPABASE_URL && key && key !== DEFAULT_SUPABASE_ANON_KEY;

    if (isValid) {
      try {
        this.client = createClient(url, key);
        this.isCloudConnected = true;
      } catch (err) {
        console.warn("[Supabase] Failed initialization, fallback to local:", err);
        this.isCloudConnected = false;
      }
    } else {
      this.isCloudConnected = false;
    }
    this.initLocalSeed();
    this.notify();
  }

  public async setCredentials(url: string, key: string): Promise<{ success: boolean; message: string }> {
    url = url.trim();
    key = key.trim();

    if (!url || !key) {
      localStorage.removeItem("savi_sb_url");
      localStorage.removeItem("savi_sb_key");
      this.client = null;
      this.isCloudConnected = false;
      this.notify();
      return { success: true, message: "Modalità locale ripristinata." };
    }

    try {
      const test = createClient(url, key);
      const { error } = await test.from("prenotazioni").select("id").limit(1);
      if (error && error.code !== "PGRST116") throw error;

      localStorage.setItem("savi_sb_url", url);
      localStorage.setItem("savi_sb_key", key);
      this.client = test;
      this.isCloudConnected = true;
      this.notify();
      return { success: true, message: "Connessione a Supabase riuscita!" };
    } catch (err: any) {
      return { success: false, message: `Errore Supabase: ${err.message || 'Verifica credenziali'}` };
    }
  }

  public getCredentials() {
    return {
      url: localStorage.getItem("savi_sb_url") || "",
      key: localStorage.getItem("savi_sb_key") || "",
      isConnected: this.isCloudConnected
    };
  }

  private initLocalSeed() {
    const existing = localStorage.getItem("savi_react_prenotazioni");
    if (!existing) {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const seeds: Booking[] = [
        {
          id: "seed-1",
          codice_prenotazione: "SAVI-8120",
          data_prenotazione: today,
          orario_prenotazione: "20:30:00",
          fascia_servizio: "cena_primo_turno",
          numero_ospiti: 2,
          preferenza_tavolo: "interna",
          occasione: "romantica",
          nome_completo: "Marco Rossi",
          email: "marco.rossi@example.com",
          telefono: "+39 347 1234567",
          esigenze_alimentari: ["Gluten Free"],
          note_speciali: "Tavolo appartato",
          stato: "confermata"
        },
        {
          id: "seed-2",
          codice_prenotazione: "SAVI-3491",
          data_prenotazione: today,
          orario_prenotazione: "21:00:00",
          fascia_servizio: "cena_primo_turno",
          numero_ospiti: 4,
          preferenza_tavolo: "dehor",
          occasione: "compleanno",
          nome_completo: "Giulia Bianchi",
          email: "giulia.b@example.com",
          telefono: "+39 333 9876543",
          esigenze_alimentari: ["Senza Lattosio"],
          note_speciali: "Festa compleanno",
          stato: "confermata"
        },
        {
          id: "seed-3",
          codice_prenotazione: "SAVI-5629",
          data_prenotazione: tomorrow,
          orario_prenotazione: "19:30:00",
          fascia_servizio: "aperitivo",
          numero_ospiti: 3,
          preferenza_tavolo: "terrazza",
          occasione: "amici",
          nome_completo: "Antonio De Luca",
          email: "antonio.dl@example.com",
          telefono: "+39 320 5556677",
          esigenze_alimentari: [],
          note_speciali: "",
          stato: "in_attesa"
        }
      ];
      localStorage.setItem("savi_react_prenotazioni", JSON.stringify(seeds));
    }
  }

  public generateCode(): string {
    return `SAVI-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  public async createBooking(booking: Omit<Booking, 'codice_prenotazione' | 'stato'>): Promise<{ success: boolean; booking: Booking; source: string }> {
    const payload: Booking = {
      ...booking,
      codice_prenotazione: this.generateCode(),
      stato: 'confermata',
      orario_prenotazione: booking.orario_prenotazione.length === 5 ? `${booking.orario_prenotazione}:00` : booking.orario_prenotazione,
      creato_il: new Date().toISOString()
    };

    if (this.isCloudConnected && this.client) {
      try {
        const { data, error } = await this.client.from("prenotazioni").insert([payload]).select().single();
        if (error) throw error;
        this.saveToLocal(data || payload);
        return { success: true, booking: data || payload, source: 'supabase' };
      } catch (err) {
        console.warn("Supabase insert error, fallback local:", err);
      }
    }

    payload.id = `local-${Date.now()}`;
    this.saveToLocal(payload);
    return { success: true, booking: payload, source: 'local' };
  }

  private saveToLocal(item: Booking) {
    const raw = localStorage.getItem("savi_react_prenotazioni");
    const list: Booking[] = raw ? JSON.parse(raw) : [];
    list.unshift(item);
    localStorage.setItem("savi_react_prenotazioni", JSON.stringify(list));
  }

  public async findBookings(query: string): Promise<Booking[]> {
    const q = query.trim().toUpperCase();
    if (!q) return [];

    if (this.isCloudConnected && this.client) {
      try {
        let req = this.client.from("prenotazioni").select("*");
        if (q.startsWith("SAVI-") || q.length === 9) {
          req = req.eq("codice_prenotazione", q);
        } else {
          req = req.ilike("telefono", `%${q}%`);
        }
        const { data, error } = await req;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    const raw = localStorage.getItem("savi_react_prenotazioni");
    const list: Booking[] = raw ? JSON.parse(raw) : [];
    return list.filter(b => 
      b.codice_prenotazione.toUpperCase() === q || 
      b.telefono.replace(/\s+/g, '').includes(q.replace(/\s+/g, ''))
    );
  }

  public async getAllBookings(dateFilter?: string, statusFilter?: string): Promise<Booking[]> {
    if (this.isCloudConnected && this.client) {
      try {
        let req = this.client.from("prenotazioni").select("*")
          .order("data_prenotazione", { ascending: true })
          .order("orario_prenotazione", { ascending: true });

        if (dateFilter) req = req.eq("data_prenotazione", dateFilter);
        if (statusFilter && statusFilter !== 'tutti') req = req.eq("stato", statusFilter);

        const { data, error } = await req;
        if (!error && data) return data;
      } catch (e) {
        console.warn(e);
      }
    }

    const raw = localStorage.getItem("savi_react_prenotazioni");
    let list: Booking[] = raw ? JSON.parse(raw) : [];
    if (dateFilter) list = list.filter(b => b.data_prenotazione === dateFilter);
    if (statusFilter && statusFilter !== 'tutti') list = list.filter(b => b.stato === statusFilter);
    return list;
  }

  public async updateStatus(idOrCode: string, newStatus: BookingStatus): Promise<boolean> {
    if (this.isCloudConnected && this.client) {
      try {
        const isUuid = idOrCode.length > 20;
        let q = this.client.from("prenotazioni").update({ stato: newStatus, aggiornato_il: new Date().toISOString() });
        q = isUuid ? q.eq("id", idOrCode) : q.eq("codice_prenotazione", idOrCode);
        await q;
      } catch (e) {
        console.warn(e);
      }
    }

    const raw = localStorage.getItem("savi_react_prenotazioni");
    if (raw) {
      const list: Booking[] = JSON.parse(raw);
      const idx = list.findIndex(b => b.id === idOrCode || b.codice_prenotazione === idOrCode);
      if (idx !== -1) {
        list[idx].stato = newStatus;
        localStorage.setItem("savi_react_prenotazioni", JSON.stringify(list));
      }
    }
    return true;
  }

  public async getMetrics(date: string): Promise<KPIMetrics> {
    const bookings = await this.getAllBookings(date);
    const active = bookings.filter(b => b.stato !== 'cancellata' && b.stato !== 'rifiutata');
    const coperti = active.reduce((sum, b) => sum + (Number(b.numero_ospiti) || 0), 0);
    const inAttesa = bookings.filter(b => b.stato === 'in_attesa').length;
    const completate = bookings.filter(b => b.stato === 'completata').length;

    return {
      totaleCoperti: coperti,
      prenotazioniAttive: active.length,
      inAttesa,
      completate
    };
  }
}

export const supabaseService = new SupabaseService();
