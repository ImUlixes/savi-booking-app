import React, { useState } from 'react';
import { supabaseService } from '../../lib/supabase';
import { Booking } from '../../types';
import { Search, Calendar, Clock, Users, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export const BookingLookup: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Booking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await supabaseService.findBookings(query);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (booking: Booking) => {
    if (confirm(`Sei sicuro di voler disdire la prenotazione ${booking.codice_prenotazione}?`)) {
      await supabaseService.updateStatus(booking.codice_prenotazione, 'cancellata');
      setToastMsg(`Prenotazione ${booking.codice_prenotazione} cancellata con successo.`);
      // Ricarica ricerca
      const updated = await supabaseService.findBookings(query);
      setResults(updated);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 space-y-6">
      
      {/* Search Header */}
      <div className="bg-[#14141e]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
        <span className="text-[11px] font-bold tracking-widest text-gold-primary uppercase block mb-1">
          Self-Service Cliente
        </span>
        <h2 className="font-heading font-bold text-2xl text-white mb-2">
          Trova la tua Prenotazione
        </h2>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Inserisci il codice di conferma (es. <code className="text-gold-primary font-bold">SAVI-8120</code>) oppure il tuo numero di cellulare per visualizzare i dettagli o disdire.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Codice prenotazione o Cellulare..."
            className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-primary transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-gold-hover to-gold-primary text-black font-heading font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-gold"
          >
            <Search className="w-4 h-4" />
            <span>Cerca</span>
          </button>
        </form>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-300">
          {toastMsg}
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-white/15 rounded-3xl bg-black/20 text-slate-400">
              <span className="text-3xl block mb-2">🔍</span>
              <strong className="block text-white font-medium mb-1">Nessuna prenotazione trovata</strong>
              <span className="text-xs">Verifica il codice o il numero di telefono inserito e riprova.</span>
            </div>
          ) : (
            results.map((b) => (
              <div 
                key={b.codice_prenotazione}
                className="bg-[#14141e]/90 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="font-heading font-extrabold text-xl text-gold-primary">
                      {b.codice_prenotazione}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {b.nome_completo} • {b.telefono}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    b.stato === 'confermata' 
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                      : b.stato === 'in_attesa'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  }`}>
                    {b.stato}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-primary" />
                    <span>{b.data_prenotazione}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-primary" />
                    <span>Ore {b.orario_prenotazione.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold-primary" />
                    <span>{b.numero_ospiti} Coperti</span>
                  </div>
                  <div className="capitalize text-slate-400">
                    Tavolo: {b.preferenza_tavolo}
                  </div>
                </div>

                {b.note_speciali && (
                  <div className="text-xs text-slate-400 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                    "{b.note_speciali}"
                  </div>
                )}

                {b.stato !== 'cancellata' && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleCancel(b)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Disdici Prenotazione</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
