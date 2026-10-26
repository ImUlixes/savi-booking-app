export type BookingStatus = 'in_attesa' | 'confermata' | 'completata' | 'cancellata' | 'rifiutata';
export type TableArea = 'interna' | 'dehor' | 'terrazza' | 'nessuna';
export type Occasion = 'nessuna' | 'romantica' | 'compleanno' | 'anniversario' | 'amici' | 'business';

export interface Booking {
  id?: string;
  codice_prenotazione: string;
  data_prenotazione: string;
  orario_prenotazione: string;
  fascia_servizio: string;
  numero_ospiti: number;
  preferenza_tavolo: TableArea;
  occasione: Occasion;
  nome_completo: string;
  email: string;
  telefono: string;
  esigenze_alimentari: string[];
  note_speciali: string;
  stato: BookingStatus;
  creato_il?: string;
  aggiornato_il?: string;
}

export interface KPIMetrics {
  totaleCoperti: number;
  prenotazioniAttive: number;
  inAttesa: number;
  completate: number;
}
