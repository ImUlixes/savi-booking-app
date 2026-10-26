import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../lib/supabase';
import { Booking, TableArea, Occasion } from '../../types';
import confetti from 'canvas-confetti';
import { 
  Users, Calendar as CalendarIcon, Clock, Check, ArrowRight, 
  MapPin, Sparkles, Heart, Wine, PartyPopper, Briefcase, 
  Share2, CalendarPlus, RotateCcw, Home, Trees, Minus, Plus
} from 'lucide-react';

const SHIFTS = [
  {
    id: 'aperitivo',
    title: 'Aperitivo & Savì Bites (18:30 - 20:00)',
    slots: ['18:30', '19:00', '19:30']
  },
  {
    id: 'cena_primo_turno',
    title: 'Cena • 1° Turno (20:15 - 22:00)',
    slots: ['20:15', '20:30', '20:45', '21:00', '21:15']
  },
  {
    id: 'cena_secondo_turno',
    title: 'Cena • 2° Turno (22:15 - 00:00)',
    slots: ['22:15', '22:30', '22:45', '23:00']
  }
];

const ALLERGEN_OPTIONS = [
  { id: 'Gluten Free', label: 'Senza Glutine' },
  { id: 'Senza Lattosio', label: 'Senza Lattosio' },
  { id: 'Vegetariano', label: 'Vegetariano' },
  { id: 'Vegano', label: 'Vegano' }
];

export const BookingWizard: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [guests, setGuests] = useState<number>(2);
  const [tableArea, setTableArea] = useState<TableArea>('interna');
  const [occasion, setOccasion] = useState<Occasion>('nessuna');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<string>('cena_primo_turno');

  // Dati cliente
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Dotazioni bambini
  const [hasHighChair, setHasHighChair] = useState<boolean>(false);
  const [highChairCount, setHighChairCount] = useState<number>(1);
  const [hasStroller, setHasStroller] = useState<boolean>(false);
  const [strollerCount, setStrollerCount] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [confirmSource, setConfirmSource] = useState<string>('local');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Genera date per prossimi 14 giorni
  const [datesList, setDatesList] = useState<Array<{ dateStr: string; dayName: string; dayNumber: number; monthName: string }>>([]);

  useEffect(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const now = new Date();
    const list = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        dateStr,
        dayName: i === 0 ? 'Oggi' : days[d.getDay()],
        dayNumber: d.getDate(),
        monthName: months[d.getMonth()]
      });
    }

    setDatesList(list);
    if (list.length > 0) {
      setSelectedDate(list[0].dateStr);
    }
  }, []);

  const toggleAllergen = (id: string) => {
    setAllergens(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    setErrorMsg('');
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      if (!selectedTime) {
        setErrorMsg('Seleziona un orario per proseguire');
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 3) {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMsg('Inserisci il tuo nome completo');
        return;
      }
      if (!phone.trim() || phone.trim().length < 6) {
        setErrorMsg('Inserisci un numero di cellulare valido');
        return;
      }

      setIsSubmitting(true);
      try {
        const dietaryNeeds = [...allergens];
        if (hasHighChair && highChairCount > 0) {
          dietaryNeeds.push(`${highChairCount} ${highChairCount === 1 ? 'Seggiolone' : 'Seggioloni'}`);
        }
        if (hasStroller && strollerCount > 0) {
          dietaryNeeds.push(`${strollerCount} ${strollerCount === 1 ? 'Passeggino' : 'Passeggini'}`);
        }

        const res = await supabaseService.createBooking({
          data_prenotazione: selectedDate,
          orario_prenotazione: selectedTime,
          fascia_servizio: selectedShift,
          numero_ospiti: guests,
          preferenza_tavolo: tableArea,
          occasione: occasion,
          nome_completo: name.trim(),
          email: email.trim() || `${phone.replace(/\D/g, '')}@guest.savi.it`,
          telefono: phone.trim(),
          esigenze_alimentari: dietaryNeeds,
          note_speciali: notes.trim(),
          seggioloni: hasHighChair ? highChairCount : 0,
          passeggini: hasStroller ? strollerCount : 0
        });

        if (res.success) {
          setConfirmedBooking(res.booking);
          setConfirmSource(res.source);
          setStep(4);
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Effetto Luxury Confetti
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#ffffff', '#e2e8f0', '#94a3b8']
            });
          } catch (e) {
            // ignore
          }
        }
      } catch (err: any) {
        setErrorMsg('Si è verificato un errore durante la prenotazione.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const downloadIcs = () => {
    if (!confirmedBooking) return;
    const dateRaw = confirmedBooking.data_prenotazione.replace(/-/g, '');
    const timeRaw = confirmedBooking.orario_prenotazione.replace(/:/g, '').slice(0, 4);
    const startIso = `${dateRaw}T${timeRaw}00`;
    const [hh, mm] = confirmedBooking.orario_prenotazione.slice(0, 5).split(':').map(Number);
    const endHour = String((hh + 2) % 24).padStart(2, '0');
    const endIso = `${dateRaw}T${endHour}${String(mm).padStart(2, '0')}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Savi Creperia//Booking App//IT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:Cena da Savì Conversano (${confirmedBooking.numero_ospiti} ospiti)`,
      `DESCRIPTION:Prenotazione Savì Not Ordinary Crepes. Codice: ${confirmedBooking.codice_prenotazione}.`,
      'LOCATION:Savì Creperia, Conversano (BA), Italia',
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Prenotazione-Savi-${confirmedBooking.codice_prenotazione}.ics`;
    link.click();
  };

  const shareWhatsApp = () => {
    if (!confirmedBooking) return;
    const kidsList: string[] = [];
    if (confirmedBooking.seggioloni && confirmedBooking.seggioloni > 0) {
      kidsList.push(`${confirmedBooking.seggioloni} seggiolon${confirmedBooking.seggioloni > 1 ? 'i' : 'e'}`);
    }
    if (confirmedBooking.passeggini && confirmedBooking.passeggini > 0) {
      kidsList.push(`${confirmedBooking.passeggini} passeggin${confirmedBooking.passeggini > 1 ? 'i' : 'o'}`);
    }
    const kidsStr = kidsList.length > 0 ? ` (${kidsList.join(', ')})` : '';

    const text = encodeURIComponent(
      `Ciao! Ti confermo la prenotazione da Savì a Conversano per ${confirmedBooking.numero_ospiti} persone il ${confirmedBooking.data_prenotazione} alle ${confirmedBooking.orario_prenotazione.slice(0, 5)}${kidsStr}. Codice: ${confirmedBooking.codice_prenotazione}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const resetAll = () => {
    setStep(1);
    setConfirmedBooking(null);
    setSelectedTime('');
    setNotes('');
    setHasHighChair(false);
    setHighChairCount(1);
    setHasStroller(false);
    setStrollerCount(1);
  };

  const tableLabels = {
    interna: 'Sala Interna',
    dehor: 'Dehor Riscaldato',
    terrazza: 'Terrazza Panoramica',
    nessuna: 'Miglior Tavolo'
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28">

      {/* Stepper Progress Bar */}
      {step < 4 && (
        <div className="relative flex items-center justify-between mb-8 px-3">
          <div className="absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-white/10 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-[12%] h-[2px] bg-white -translate-y-1/2 z-0 transition-all duration-300" 
            style={{ width: `${(step - 1) * 38}%` }}
          />

          {[1, 2, 3].map((num) => (
            <button
              key={num}
              type="button"
              disabled={num > step}
              onClick={() => num < step && setStep(num)}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs z-10 transition-all border ${
                step === num
                  ? 'bg-[#1a1a24] border-white text-white shadow-lg shadow-white/20 scale-110'
                  : step > num
                  ? 'bg-white border-white text-black'
                  : 'bg-[#101015] border-white/15 text-slate-500'
              }`}
            >
              {step > num ? <Check className="w-4 h-4 stroke-[3]" /> : num}
            </button>
          ))}
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-xs text-rose-300 animate-shake">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: OSPITI & AMBIENTE */}
      {step === 1 && (
        <div className="bg-[#14141e]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Fase 1 di 3</span>
            <h2 className="font-heading font-bold text-2xl text-white">Quanti sarete al tavolo?</h2>
          </div>

          {/* Stepper Tattile Coperti */}
          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-4">
            <button
              type="button"
              disabled={guests <= 1}
              onClick={() => setGuests(prev => Math.max(1, prev - 1))}
              className="w-12 h-12 rounded-full bg-[#1e1e28] border border-white/10 text-white hover:bg-white hover:text-black hover:border-white disabled:opacity-30 disabled:hover:bg-[#1e1e28] disabled:hover:text-white disabled:hover:border-white/10 transition-all flex items-center justify-center active:scale-95 shadow-sm shrink-0"
              aria-label="Diminuisci coperti"
            >
              <Minus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="text-center">
              <span className="font-heading font-extrabold text-4xl text-white block leading-none">
                {guests}
              </span>
              <span className="text-[11px] text-slate-400 uppercase tracking-widest mt-1 block">
                {guests === 1 ? 'Coperto' : 'Coperti Selezionati'}
              </span>
            </div>
            <button
              type="button"
              disabled={guests >= 15}
              onClick={() => setGuests(prev => Math.min(15, prev + 1))}
              className="w-12 h-12 rounded-full bg-[#1e1e28] border border-white/10 text-white hover:bg-white hover:text-black hover:border-white disabled:opacity-30 disabled:hover:bg-[#1e1e28] disabled:hover:text-white disabled:hover:border-white/10 transition-all flex items-center justify-center active:scale-95 shadow-sm shrink-0"
              aria-label="Aumenta coperti"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick chips */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 4, 6].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setGuests(num)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                  guests === num
                    ? 'bg-white text-black border-white shadow-sm font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {num === 2 ? '2 (Coppia)' : `${num} pax`}
              </button>
            ))}
          </div>

          {/* Scelta Atmosfera / Tavolo */}
          <div className="pt-2">
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase block mb-3">
              Ambiente Desiderato
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'interna' as TableArea, title: 'Sala Interna', desc: 'Design intimo e luci soffuse.', icon: Home },
                { id: 'dehor' as TableArea, title: 'Dehor Riscaldato', desc: 'Esterno coperto e confortevole.', icon: Trees },
                { id: 'terrazza' as TableArea, title: 'Terrazza', desc: 'Scorcio panoramico su Conversano.', icon: Sparkles }
              ].map(opt => {
                const IconComponent = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setTableArea(opt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      tableArea === opt.id
                        ? 'bg-white/10 border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block font-heading font-bold text-sm text-white">{opt.title}</strong>
                      <span className="text-[11px] text-slate-400 block mt-1 leading-snug">{opt.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Occasione */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Occasione Speciale (opzionale)
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value as Occasion)}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-all"
            >
              <option value="nessuna">Nessuna occasione particolare</option>
              <option value="romantica">Cena Romantica</option>
              <option value="compleanno">Compleanno</option>
              <option value="anniversario">Anniversario</option>
              <option value="amici">Uscita con Amici</option>
              <option value="business">Lavoro / Business</option>
            </select>
          </div>
        </div>
      )}

      {/* STEP 2: DATA & ORARIO */}
      {step === 2 && (
        <div className="bg-[#14141e]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Fase 2 di 3</span>
            <h2 className="font-heading font-bold text-2xl text-white">Scegli Data e Turno</h2>
          </div>

          {/* Slider Orizzontale Date */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2 scroll-smooth">
            {datesList.map((item) => (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => setSelectedDate(item.dateStr)}
                className={`flex-shrink-0 w-20 py-3.5 px-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  selectedDate === item.dateStr
                    ? 'bg-white text-black border-white shadow-lg shadow-white/20 scale-105 font-bold'
                    : 'bg-black/40 border-white/10 text-slate-300 hover:border-white/25'
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                  {item.dayName}
                </span>
                <span className="font-heading font-bold text-2xl leading-none">
                  {item.dayNumber}
                </span>
                <span className="text-[10px] uppercase font-semibold">
                  {item.monthName}
                </span>
              </button>
            ))}
          </div>

          {/* Griglia Slot Orari */}
          <div className="space-y-5 pt-2">
            {SHIFTS.map((shift) => (
              <div key={shift.id}>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  {shift.title}
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {shift.slots.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setSelectedTime(time);
                          setSelectedShift(shift.id);
                        }}
                        className={`py-2.5 px-2 rounded-xl text-sm font-heading font-bold border transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-white text-black border-white shadow-sm font-bold'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span>{time}</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Disponibile</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: DATI CLIENTE & ALLERGENI */}
      {step === 3 && (
        <div className="bg-[#14141e]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-5">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Fase 3 di 3</span>
            <h2 className="font-heading font-bold text-2xl text-white">I Tuoi Dati per la Conferma</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Nome e Cognome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Marco Rossi"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Numero di Cellulare (per conferma e promemoria) *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="es. +39 347 1234567"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email (opzionale per ricevuta digitale)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="es. marco@email.com"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-all"
            />
          </div>

          {/* Toggle allergeni */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Esigenze Alimentari & Note Allergie
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((item) => {
                const isActive = allergens.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAllergen(item.id)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dotazioni per Bambini (Seggioloni & Passeggini) */}
          <div className="pt-2 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dotazioni per Bambini & Spazio Tavolo
            </label>

            {/* Checkbox Seggioloni */}
            <div className={`border rounded-2xl p-4 transition-all space-y-3 ${
              hasHighChair ? 'border-white/30 bg-white/[0.04]' : 'border-white/10 bg-black/30'
            }`}>
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasHighChair}
                    onChange={(e) => {
                      setHasHighChair(e.target.checked);
                      if (e.target.checked && highChairCount === 0) setHighChairCount(1);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    hasHighChair ? 'bg-white border-white text-black' : 'border-white/30 bg-black/40'
                  }`}>
                    {hasHighChair && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-sm text-white block">
                      Seggiolone per bambini
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Richiedi uno o più seggioloni già pronti al tavolo
                    </span>
                  </div>
                </div>
              </label>

              {hasHighChair && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Quanti seggioloni servono?</span>
                  <div className="flex items-center gap-3 bg-[#1e1e28] border border-white/10 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      disabled={highChairCount <= 1}
                      onClick={() => setHighChairCount(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-all flex items-center justify-center active:scale-95"
                      aria-label="Riduci seggioloni"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="font-heading font-bold text-sm text-white w-4 text-center">
                      {highChairCount}
                    </span>
                    <button
                      type="button"
                      disabled={highChairCount >= 5}
                      onClick={() => setHighChairCount(prev => Math.min(5, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-all flex items-center justify-center active:scale-95"
                      aria-label="Aumenta seggioloni"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox Passeggini */}
            <div className={`border rounded-2xl p-4 transition-all space-y-3 ${
              hasStroller ? 'border-white/30 bg-white/[0.04]' : 'border-white/10 bg-black/30'
            }`}>
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={hasStroller}
                    onChange={(e) => {
                      setHasStroller(e.target.checked);
                      if (e.target.checked && strollerCount === 0) setStrollerCount(1);
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    hasStroller ? 'bg-white border-white text-black' : 'border-white/30 bg-black/40'
                  }`}>
                    {hasStroller && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-heading font-semibold text-sm text-white block">
                      Spazio per passeggino
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Tavolo con spazio e passaggio comodo per passeggino
                    </span>
                  </div>
                </div>
              </label>

              {hasStroller && (
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Quanti passeggini saranno presenti?</span>
                  <div className="flex items-center gap-3 bg-[#1e1e28] border border-white/10 rounded-xl px-2 py-1">
                    <button
                      type="button"
                      disabled={strollerCount <= 1}
                      onClick={() => setStrollerCount(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-all flex items-center justify-center active:scale-95"
                      aria-label="Riduci passeggini"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                    <span className="font-heading font-bold text-sm text-white w-4 text-center">
                      {strollerCount}
                    </span>
                    <button
                      type="button"
                      disabled={strollerCount >= 4}
                      onClick={() => setStrollerCount(prev => Math.min(4, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-all flex items-center justify-center active:scale-95"
                      aria-label="Aumenta passeggini"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Note Particolari o Richieste Speciali
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tavolo appartato, candelina di compleanno, seggiolone..."
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white transition-all"
            />
          </div>
        </div>
      )}

      {/* STEP 4: BIGLIETTO LUXURY BOARDING PASS DI CONFERMA */}
      {step === 4 && confirmedBooking && (
        <div className="bg-gradient-to-b from-[#181824] to-[#0e0e14] border border-white/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6 animate-fade-in-up">
          <div className="flex items-start justify-between border-b border-dashed border-white/15 pb-5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                Codice Prenotazione
              </span>
              <span className="font-heading font-extrabold text-3xl text-white tracking-wider">
                {confirmedBooking.codice_prenotazione}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                Confermata
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${confirmSource === 'supabase' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{confirmSource === 'supabase' ? 'Sincronizzato Supabase' : 'Modalità Locale'}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Ospite</span>
              <span className="font-semibold text-white">{confirmedBooking.nome_completo}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Coperti</span>
              <span className="font-semibold text-white">{confirmedBooking.numero_ospiti} Persone</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Data & Orario</span>
              <span className="font-semibold text-white">
                {confirmedBooking.data_prenotazione} ore {confirmedBooking.orario_prenotazione.slice(0, 5)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Area Tavolo</span>
              <span className="font-semibold text-white">{tableLabels[confirmedBooking.preferenza_tavolo]}</span>
            </div>
          </div>

          {confirmedBooking.esigenze_alimentari.length > 0 && (
            <div className="p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-slate-200">
              <strong>Allergeni e dotazioni:</strong> {confirmedBooking.esigenze_alimentari.join(', ')}
            </div>
          )}

          {((confirmedBooking.seggioloni && confirmedBooking.seggioloni > 0) || (confirmedBooking.passeggini && confirmedBooking.passeggini > 0)) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {confirmedBooking.seggioloni && confirmedBooking.seggioloni > 0 && (
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-medium">
                  {confirmedBooking.seggioloni} {confirmedBooking.seggioloni === 1 ? 'Seggiolone' : 'Seggioloni'}
                </span>
              )}
              {confirmedBooking.passeggini && confirmedBooking.passeggini > 0 && (
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-medium">
                  {confirmedBooking.passeggini} {confirmedBooking.passeggini === 1 ? 'Passeggino' : 'Passeggini'}
                </span>
              )}
            </div>
          )}

          {confirmedBooking.note_speciali && (
            <div className="text-xs text-slate-400 italic">
              "{confirmedBooking.note_speciali}"
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={downloadIcs}
              className="flex-1 bg-white text-black font-heading font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-white/20 hover:bg-slate-200 transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Salva nel Calendario (.ics)</span>
            </button>
            <button
              type="button"
              onClick={shareWhatsApp}
              className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 text-white font-heading font-semibold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Condividi su WhatsApp</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={resetAll}
              className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effettua un'altra prenotazione</span>
            </button>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM ACTION BAR (Pollice Mobile) */}
      {step < 4 && (
        <aside className="fixed bottom-0 left-0 right-0 z-30 bg-[#101015]/90 backdrop-blur-2xl border-t border-white/10 p-4 pb-[calc(1rem+var(--safe-bottom))]">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="font-heading font-bold text-base text-white block leading-tight">
                {guests} {guests === 1 ? 'Ospite' : 'Ospiti'}
                {selectedTime && ` • ${selectedTime}`}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block">
                {step === 1 && 'Scegli data e orario →'}
                {step === 2 && (selectedTime ? 'Orario confermato →' : 'Seleziona uno slot')}
                {step === 3 && 'Savì Conversano'}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="bg-white text-black font-heading font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-xl hover:bg-slate-200 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-white/20"
            >
              <span>{step === 1 ? 'Scegli Orario' : step === 2 ? 'Inserisci Dati' : 'Conferma Tavolo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

    </div>
  );
};
