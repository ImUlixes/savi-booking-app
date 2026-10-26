import React, { useState, useEffect } from 'react';
import { supabaseService } from '../lib/supabase';
import { X, Database, Save, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: ''
  });

  useEffect(() => {
    if (isOpen) {
      const creds = supabaseService.getCredentials();
      setUrl(creds.url);
      setKey(creds.key);
      setStatusMsg({
        type: creds.isConnected ? 'success' : 'idle',
        text: creds.isConnected 
          ? 'Connesso al database cloud Supabase.'
          : 'Modalità Demo Locale (LocalStorage) attiva. Inserisci le tue credenziali Supabase per sincronizzare nel cloud.'
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ type: 'loading', text: 'Verifica connessione con Supabase in corso...' });
    
    const res = await supabaseService.setCredentials(url, key);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(onClose, 1200);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleReset = async () => {
    await supabaseService.setCredentials('', '');
    setUrl('');
    setKey('');
    setStatusMsg({ type: 'idle', text: 'Ripristinata modalità demo locale.' });
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-[#14141e] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-white" />
            <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">
              Database Supabase
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : statusMsg.type === 'error'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            : 'bg-white/5 text-slate-300 border-white/10'
        }`}>
          {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {statusMsg.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Supabase Project URL
            </label>
            <input 
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Supabase Public Anon Key
            </label>
            <input 
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-all"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={statusMsg.type === 'loading'}
              className="flex-1 bg-white text-black font-heading font-bold text-sm uppercase tracking-wider py-3 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/20"
            >
              <Save className="w-4 h-4" />
              <span>Salva & Connetti</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 bg-white/5 border border-white/10 text-slate-300 font-heading font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Demo</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
