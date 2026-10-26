import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabase';
import { Booking, BookingStatus, KPIMetrics, TableArea } from '../../types';
import { 
  Shield, Lock, Unlock, Calendar, Users, Phone, Mail, 
  Check, CheckCheck, X, Plus, Search, MessageSquare, AlertTriangle,
  Sparkles, Clock
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('savi_staff_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('tutti');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [metrics, setMetrics] = useState<KPIMetrics>({ totaleCoperti: 0, prenotazioniAttive: 0, inAttesa: 0, completate: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Modale Walk-in manuale
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualGuests, setManualGuests] = useState(2);
  const [manualTime, setManualTime] = useState('20:30');
  const [manualTable, setManualTable] = useState<TableArea>('interna');
  const [manualNotes, setManualNotes] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1995' || pin === 'savi' || pin === 'savi9526!') {
      setIsAuthenticated(true);
      sessionStorage.setItem('savi_staff_auth', 'true');
      setPin('');
      setPinError('');
    } else {
      setPinError('PIN errato. Suggerimento demo: 1995');
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('savi_staff_auth');
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const all = await supabaseService.getAllBookings(selectedDate, statusFilter);
      setBookings(all);
      const met = await supabaseService.getMetrics(selectedDate);
      setMetrics(met);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, selectedDate, statusFilter]);

  const handleStatusUpdate = async (booking: Booking, newStatus: BookingStatus) => {
    await supabaseService.updateStatus(booking.codice_prenotazione, newStatus);
    setToast(`Prenotazione ${booking.codice_prenotazione} aggiornata a: ${newStatus}`);
    loadData();
    setTimeout(() => setToast(''), 3000);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) return;

    await supabaseService.createBooking({
      data_prenotazione: selectedDate,
      orario_prenotazione: manualTime,
      fascia_servizio: 'cena_primo_turno',
      numero_ospiti: manualGuests,
      preferenza_tavolo: manualTable,
      occasione: 'nessuna',
      nome_completo: manualName.trim(),
      email: `${manualPhone.replace(/\D/g, '')}@walkin.savi.it`,
      telefono: manualPhone.trim(),
      esigenze_alimentari: [],
      note_speciali: manualNotes ? `[Walk-in / Telefono] ${manualNotes}` : '[Inserito da Staff]'
    });

    setIsManualModalOpen(false);
    setManualName('');
    setManualPhone('');
    setManualNotes('');
    setToast('Prenotazione aggiunta con successo!');
    loadData();
    setTimeout(() => setToast(''), 3000);
  };

  // Se non sbloccato con PIN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-[#14141e]/90 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto text-3xl">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-white">Area Riservata Staff</h2>
            <p className="text-xs text-slate-400 mt-1">
              Inserisci il PIN per visualizzare la gestione tavoli e coperti di Savì.
            </p>
          </div>

          {pinError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
              {pinError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Inserisci PIN (demo: 1995)"
              autoFocus
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white focus:outline-none focus:border-white transition-all"
            />

            <button
              type="submit"
              className="w-full bg-white text-black font-heading font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl hover:bg-slate-200 active:scale-95 transition-all shadow-lg shadow-white/20"
            >
              Accedi alla Gestione
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtro ricerca testuale
  const filteredBookings = bookings.filter((b) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      b.nome_completo.toLowerCase().includes(q) ||
      b.codice_prenotazione.toLowerCase().includes(q) ||
      b.telefono.includes(q)
    );
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-3 px-5 bg-[#1a1a24] border border-white/20 text-white text-xs rounded-2xl shadow-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Staff Controls */}
      <div className="bg-[#14141e]/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
              Dashboard Operativa
            </span>
            <h2 className="font-heading font-bold text-xl text-white">
              Gestione Tavoli & Coperti
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="bg-white text-black font-heading font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-white/20 hover:bg-slate-200 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Walk-in</span>
            </button>
            <button
              type="button"
              onClick={handleLock}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1"
              title="Blocca sessione staff"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 min-w-[150px] bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
          />
          <button
            type="button"
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedDate === new Date().toISOString().split('T')[0]
                ? 'bg-white text-black border-white font-bold'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Oggi
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          >
            Domani
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#14141e]/70 border border-white/10 rounded-2xl p-4 text-center">
          <span className="font-heading font-extrabold text-2xl text-white block">
            {metrics.totaleCoperti}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 block">
            Coperti Data
          </span>
        </div>
        <div className="bg-[#14141e]/70 border border-white/10 rounded-2xl p-4 text-center">
          <span className="font-heading font-extrabold text-2xl text-white block">
            {metrics.prenotazioniAttive}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 block">
            Prenotazioni Attive
          </span>
        </div>
        <div className="bg-[#14141e]/70 border border-white/10 rounded-2xl p-4 text-center">
          <span className="font-heading font-extrabold text-2xl text-amber-400 block">
            {metrics.inAttesa}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 block">
            In Attesa
          </span>
        </div>
        <div className="bg-[#14141e]/70 border border-white/10 rounded-2xl p-4 text-center">
          <span className="font-heading font-extrabold text-2xl text-emerald-400 block">
            {metrics.completate}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 block">
            Completate
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#14141e]/60 border border-white/10 rounded-2xl p-3.5 space-y-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['tutti', 'confermata', 'in_attesa', 'completata', 'cancellata'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold capitalize whitespace-nowrap border transition-all ${
                statusFilter === st
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {st === 'tutti' ? 'Tutte' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Cerca cliente, telefono o codice..."
            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-white"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl text-slate-400">
            Nessuna prenotazione trovata per i criteri selezionati.
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.codice_prenotazione}
              className="bg-[#14141e]/90 border border-white/10 rounded-2xl p-4 shadow-md space-y-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-lg text-white">
                      {b.codice_prenotazione}
                    </span>
                    <strong className="text-sm text-white">{b.nome_completo}</strong>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    <a href={`tel:${b.telefono}`} className="text-slate-300 underline hover:text-white">
                      {b.telefono}
                    </a>
                    {b.email && <span>• {b.email}</span>}
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  b.stato === 'confermata'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : b.stato === 'in_attesa'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                }`}>
                  {b.stato}
                </span>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-3">
                <span className="font-semibold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Ore {b.orario_prenotazione.slice(0, 5)}
                </span>
                <span>•</span>
                <span className="font-semibold text-white">
                  {b.numero_ospiti} Coperti
                </span>
                <span>•</span>
                <span className="capitalize text-slate-400">
                  {b.preferenza_tavolo}
                </span>
              </div>

              {b.esigenze_alimentari.length > 0 && (
                <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Allergeni: {b.esigenze_alimentari.join(', ')}</span>
                </div>
              )}

              {b.note_speciali && (
                <div className="text-xs text-slate-400 italic bg-black/30 p-2 rounded-lg">
                  "{b.note_speciali}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
                {b.stato !== 'confermata' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(b, 'confermata')}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Conferma</span>
                  </button>
                )}
                {b.stato !== 'completata' && b.stato !== 'cancellata' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(b, 'completata')}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 flex items-center justify-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Completata</span>
                  </button>
                )}
                {b.stato !== 'cancellata' && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(b, 'cancellata')}
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Rifiuta</span>
                  </button>
                )}
                <a
                  href={`https://api.whatsapp.com/send?phone=${b.telefono.replace(/\D/g, '')}&text=${encodeURIComponent(`Gentile ${b.nome_completo}, ti contattiamo da Savì Conversano in merito alla prenotazione ${b.codice_prenotazione}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:text-white flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALE WALK-IN MANUALE */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#14141e] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-heading font-bold text-lg text-white">Nuova Prenotazione Manuale (Staff)</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nome Cliente *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="es. Carlo Donati"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Telefono *</label>
                  <input
                    type="tel"
                    required
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="es. 340 1234567"
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Coperti</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={manualGuests}
                    onChange={(e) => setManualGuests(Number(e.target.value))}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Orario</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tavolo</label>
                  <select
                    value={manualTable}
                    onChange={(e) => setManualTable(e.target.value as TableArea)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-2 py-2 text-white"
                  >
                    <option value="interna">Interna</option>
                    <option value="dehor">Dehor</option>
                    <option value="terrazza">Terrazza</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Note Speciali / Allergeni</label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="es. Prenotazione telefonica, celiaco..."
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-white text-black font-heading font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-slate-200 shadow-lg shadow-white/20"
                >
                  Salva Prenotazione
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
