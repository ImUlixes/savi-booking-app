import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SupabaseModal } from './components/SupabaseModal';
import { BookingWizard } from './features/booking/BookingWizard';
import { BookingLookup } from './features/lookup/BookingLookup';
import { StaffDashboard } from './features/staff/StaffDashboard';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'booking' | 'lookup' | 'staff'>('booking');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar 
          currentView={currentView}
          onViewChange={setCurrentView}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />

        <main className="w-full">
          {currentView === 'booking' && <BookingWizard />}
          {currentView === 'lookup' && <BookingLookup />}
          {currentView === 'staff' && <StaffDashboard />}
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-500 border-t border-white/5 space-y-2">
        <p>Savì Creperia • Conversano • Not Ordinary Crepes dal 1995</p>
        <p>
          {currentView !== 'staff' ? (
            <button
              onClick={() => setCurrentView('staff')}
              className="text-gold-primary/80 hover:text-gold-primary underline transition-colors"
            >
              Area Riservata Staff & Gestione Tavoli →
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('booking')}
              className="text-gold-primary/80 hover:text-gold-primary underline transition-colors"
            >
              ← Torna alle prenotazioni clienti
            </button>
          )}
        </p>
      </footer>

      <SupabaseModal 
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};

export default App;
