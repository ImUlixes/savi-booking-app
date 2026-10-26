import React, { useState, useEffect } from 'react';
import { supabaseService } from '../lib/supabase';
import { Shield, Sparkles, Search, Database } from 'lucide-react';

interface NavbarProps {
  currentView: 'booking' | 'lookup' | 'staff';
  onViewChange: (view: 'booking' | 'lookup' | 'staff') => void;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, onOpenSupabaseModal }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    supabaseService.onStatusChange((connected) => {
      setIsConnected(connected);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#101015]/85 backdrop-blur-xl border-b border-white/10 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => onViewChange('booking')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-hover via-gold-primary to-gold-dark text-black font-heading font-extrabold text-lg flex items-center justify-center shadow-lg shadow-gold-primary/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg tracking-widest text-white leading-tight uppercase">
              SAVÌ
            </span>
            <span className="text-[10px] tracking-widest text-gold-primary font-semibold uppercase">
              Conversano • 1995
            </span>
          </div>
        </div>

        {/* Database & Staff Switcher */}
        <div className="flex items-center gap-2">
          {/* Cloud Badge */}
          <button 
            type="button"
            onClick={onOpenSupabaseModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 hover:border-gold-primary/40 hover:bg-white/10 transition-all text-slate-300"
            title="Configura Database Supabase"
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`} />
            <span className="hidden sm:inline">{isConnected ? 'Supabase Cloud' : 'Demo Locale'}</span>
          </button>

          {/* Staff Button */}
          <button
            type="button"
            onClick={() => onViewChange(currentView === 'staff' ? 'booking' : 'staff')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
              currentView === 'staff'
                ? 'bg-gold-primary text-black border-gold-primary shadow-gold'
                : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Staff</span>
          </button>
        </div>

      </div>

      {/* Segmented Control Tabs (solo quando non si è nello staff) */}
      {currentView !== 'staff' && (
        <div className="max-w-2xl mx-auto mt-3">
          <nav className="flex bg-[#14141c] p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => onViewChange('booking')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'booking'
                  ? 'bg-[#1e1e28] text-gold-primary border border-gold-border shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prenota Tavolo</span>
            </button>
            <button
              type="button"
              onClick={() => onViewChange('lookup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                currentView === 'lookup'
                  ? 'bg-[#1e1e28] text-gold-primary border border-gold-border shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Le Mie Prenotazioni</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
