import React from 'react';
import { ShieldCheck, FileSpreadsheet, Sparkles, SlidersHorizontal, BookOpen, Home, Rotate3d, FileDown } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavigationHeaderProps {
  currentView: 'home' | 'cad' | 'axle' | 'presets';
  onNavigate: (view: 'home' | 'cad' | 'axle' | 'presets') => void;
  onOpenMasterSpecs: () => void;
  onOpenExportModal: () => void;
  onOpen3dPreview: () => void;
  projectNumber: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenMasterSpecs,
  onOpenExportModal,
  onOpen3dPreview,
  projectNumber
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B132B]/95 backdrop-blur-md border-b border-[#D4AF37]/25 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand & Identity */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
            title="Powrót do ekranu głównego Nowa Firma"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1C2541] to-[#0B132B] border border-[#D4AF37]/50 flex items-center justify-center shadow-inner group-hover:border-[#D4AF37] transition-colors">
              <span className="text-[#D4AF37] font-bold text-lg tracking-wider font-mono">NF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-[#D4AF37] transition-colors">
                  KREATOR ZABUDÓW
                </span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                  v1.0
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium tracking-wide">
                Nowa Firma · Specyfikacja MASTER 1–13
              </div>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              currentView === 'home'
                ? 'bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>HOME SCREEN</span>
          </button>

          <button
            onClick={() => onNavigate('cad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              currentView === 'cad'
                ? 'bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>STUDIO CAD 2D/3D</span>
          </button>

          <button
            onClick={onOpen3dPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all bg-[#0B132B] hover:bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/50 hover:border-[#D4AF37] shadow-sm shadow-[#D4AF37]/15"
            title="Otwórz okno obracalnego modelu 3D (Ford Transit, Piaggio Porter NP6, Renault Master)"
          >
            <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
            <span>MODEL 3D (360°)</span>
          </button>

          <button
            onClick={() => onNavigate('axle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              currentView === 'axle'
                ? 'bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>NACISKI OSI & DMC</span>
          </button>

          <button
            onClick={() => onNavigate('presets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
              currentView === 'presets'
                ? 'bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>SZABLONY OEM</span>
          </button>

          <button
            onClick={onOpenMasterSpecs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-[#D4AF37] hover:bg-slate-800/40 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>NORMY MASTER (1–13)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* In-App PWA Install Trigger */}
          <PWAInstallButton variant="header" />

          <div className="hidden xl:flex flex-col items-end text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Numer Projektu</span>
            <span className="text-xs font-mono font-semibold text-[#D4AF37]">{projectNumber}</span>
          </div>

          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#E5B842] rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-[#D4AF37]/25 whitespace-nowrap"
            title="Generuj kompletną dokumentację techniczną w formacie PDF (schemat CAD 2D, wymiary ISO GPS, specyfikacja ALU-S.V., BOM, bilans osi)"
          >
            <FileDown className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>GENERUJ DOKUMENTACJĘ (PDF)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
