import React, { useState } from 'react';
import { Download, Monitor, Smartphone, CheckCircle2, X, HelpCircle, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // If already running in standalone mode (desktop or mobile PWA)
  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <div 
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono font-medium shadow-sm"
        title="Aplikacja działa w trybie autonomicznym PWA"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>PWA ZAINSTALOWANA</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowInstructionsModal(true);
      }
    } else {
      setShowInstructionsModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-gradient-to-r from-amber-500/20 via-[#D4AF37]/25 to-amber-500/10 hover:from-amber-500/30 hover:to-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all shadow-sm shadow-amber-500/10 active:scale-95"
          title="Zainstaluj Kreator Zabudów na pulpicie (PWA) i korzystaj offline"
        >
          <Download className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-y-0.5 transition-transform" />
          <span className="hidden sm:inline">ZAINSTALUJ PWA</span>
          <span className="sm:hidden">PWA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {variant === 'hero' && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1C2541] hover:bg-[#253258] text-[#D4AF37] border border-[#D4AF37]/60 hover:border-[#D4AF37] shadow-lg shadow-[#0B132B]/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Monitor className="w-4 h-4 text-[#D4AF37]" />
          <span>ZAINSTALUJ NA PULPICIE (TRYB OFFLINE)</span>
          <Download className="w-4 h-4 ml-1 text-slate-300" />
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className="p-1.5 rounded-md text-[#D4AF37] hover:bg-slate-800/60 border border-[#D4AF37]/30 transition"
          title="Zainstaluj aplikację na pulpicie (PWA)"
        >
          <Download className="w-4 h-4" />
        </button>
      )}

      {/* Guided installation modal when browser prompt is handled or manual guide is needed */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0B132B] border border-[#D4AF37]/40 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#1C2541] border border-[#D4AF37]/50 flex items-center justify-center">
                  <Download className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Instalacja Aplikacji PWA</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Nowa Firma · Tryb Offline</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-[#070D1E] p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="p-1 rounded bg-[#D4AF37]/20 text-[#D4AF37] mt-0.5">
                  <Monitor className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-semibold text-white mb-0.5">Komputer / Pulpit (Chrome, Edge, Opera):</div>
                  <div>Kliknij ikonę instalacji <strong className="text-[#D4AF37] font-mono">⊕</strong> w prawym rogu paska adresu przeglądarki lub w menu: <strong className="text-white">„Zainstaluj Kreator Zabudów Nowa Firma”</strong>.</div>
                </div>
              </div>

              {isIOS ? (
                <div className="bg-[#070D1E] p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="p-1 rounded bg-sky-500/20 text-sky-400 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-semibold text-white mb-0.5">Urządzenia Apple (iPhone / iPad / Safari):</div>
                    <div>1. Kliknij przycisk <strong className="text-white">Udostępnij</strong> w Safari.<br />2. Wybierz opcję <strong className="text-[#D4AF37]">„Do ekranu początkowego”</strong>.</div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#070D1E] p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-semibold text-white mb-0.5">Urządzenia Android (Chrome):</div>
                    <div>Otwórz menu (3 kropki) i kliknij <strong className="text-[#D4AF37]">„Zainstaluj aplikację”</strong> lub <strong className="text-white">„Dodaj do ekranu głównego”</strong>.</div>
                  </div>
                </div>
              )}

              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-[11px] text-amber-200/90">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Zalety wersji PWA:</span>
                </div>
                Pełne działanie kalkulatora osi BBG, konfiguratora CAD 2D/3D i generowania specyfikacji bez dostępu do Internetu.
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowInstructionsModal(false);
                  }}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold rounded-lg text-xs hover:brightness-110 transition shadow-md shadow-[#D4AF37]/20"
                >
                  Uruchom Instalację Teraz
                </button>
              )}
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition"
              >
                Rozumiem, zamknij
              </button>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-center text-[10px] font-mono text-[#D4AF37]/90">
              Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
