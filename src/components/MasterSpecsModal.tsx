import React from 'react';
import { MASTER_STANDARDS } from '../data/masterSpecsData';
import { X, ShieldCheck, CheckCircle2, FileText, ChevronRight, Zap } from 'lucide-react';

interface MasterSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDhollandiaManual?: () => void;
}

export const MasterSpecsModal: React.FC<MasterSpecsModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenDhollandiaManual 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0B132B] border border-[#D4AF37]/40 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#1C2541]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0B132B] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                SPECYFIKACJA MASTER 1–13 · Nowa Firma
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                Zintegrowany zbiór norm konstrukcyjnych, tolerancji geometrycznych i homologacyjnych
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - List of 13 Standards */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-300 leading-relaxed font-sans mb-4 bg-[#1C2541]/50 p-3 rounded-lg border border-slate-800">
            Aplikacja <strong className="text-white">KREATOR ZABUDÓW v1.0</strong> działa w oparciu o 13 bezwzględnych standardów inżynieryjnych Nowa Firma. Każda generowana konfiguracja podlega automatycznej weryfikacji geometrycznej ISO GPS, ograniczeniom nośności podwozi OEM BBG oraz kalkulacji rozkładu mas.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {MASTER_STANDARDS.map((std) => (
              <div 
                key={std.id}
                className="bg-[#070D1E] border border-slate-800 hover:border-[#D4AF37]/40 rounded-lg p-3.5 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-950 bg-[#D4AF37] px-1.5 py-0.5 rounded">
                      MASTER {std.id}
                    </span>
                    <span className="text-[11px] font-mono text-[#D4AF37] font-semibold">
                      {std.code}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> ZGODNY
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1 group-hover:text-[#D4AF37] transition-colors">
                  {std.name}
                </h4>
                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  {std.shortDesc}
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-300 bg-[#0B132B] p-2 rounded">
                  <strong className="text-slate-400">Reguła: </strong>
                  {std.complianceRule}
                </div>

                {std.id === 3 && onOpenDhollandiaManual && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDhollandiaManual();
                    }}
                    className="mt-2.5 w-full py-1.5 px-3 rounded bg-[#1C2541] hover:bg-[#253256] text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-mono flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Otwórz Schemat Elektryczny & Instrukcję Montażu</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#1C2541] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex flex-col gap-0.5">
            <span>Nowa Firma · Certyfikacja ISO 9001 / Rozp. UE 2018/858</span>
            <span className="text-[10px] text-[#D4AF37]/90">
              Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#D4AF37] text-slate-950 font-bold rounded hover:brightness-110 transition-all"
          >
            Zamknij Przeglądarkę Norm
          </button>
        </div>

      </div>
    </div>
  );
};
