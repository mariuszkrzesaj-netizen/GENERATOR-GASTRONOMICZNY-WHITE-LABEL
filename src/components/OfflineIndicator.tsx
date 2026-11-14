import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Status połączenia sieciowego"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl bg-[#0B132B]/95 border border-amber-500/60 px-4 py-2.5 text-xs text-slate-100 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
        <WifiOff className="h-4 w-4 animate-pulse" />
      </div>
      <div>
        <div className="font-bold text-amber-300 flex items-center gap-1.5">
          <span>Tryb Offline Aktywny</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">PWA Cache</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Kreator CAD, obliczenia osi i baza danych działają w pełni lokalnie.
        </p>
      </div>
    </aside>
  );
};
