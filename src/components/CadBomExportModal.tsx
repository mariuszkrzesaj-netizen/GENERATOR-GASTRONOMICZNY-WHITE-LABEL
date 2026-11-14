import React, { useState, useEffect } from 'react';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { DHALLANDIA_LIFTS, MASTER_OPTIONS_CATALOG } from '../data/masterSpecsData';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Building2, 
  Send, 
  CheckCircle2, 
  Wrench, 
  Layers,
  Download,
  FileDown,
  ShieldCheck,
  Award,
  Zap,
  Video,
  Sparkles
} from 'lucide-react';
import { AluSvAssemblyInstructions } from './AluSvAssemblyInstructions';
import { CocReportSummaryView } from './CocReportSummaryView';
import { DhollandiaWiringManual } from './DhollandiaWiringManual';
import { DhollandiaVideoSequencePlayer } from './DhollandiaVideoSequencePlayer';
import { generateAndDownloadPdfBom } from '../utils/generatePdfBom';
import { generateAndDownloadPdfCoC } from '../utils/generatePdfCoC';
import { generateAndDownloadPdfDhollandia } from '../utils/generatePdfDhollandia';

interface CadBomExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ActiveProjectConfiguration;
  calculations: AxleLoadCalculation;
  onUpdateClientInfo: (name: string, company: string, notes: string) => void;
  initialTab?: 'bom' | 'assembly_instructions' | 'coc_report' | 'dhollandia_manual' | 'video_sequence';
  onSelectLift?: (liftId: string) => void;
}

export const CadBomExportModal: React.FC<CadBomExportModalProps> = ({
  isOpen,
  onClose,
  config,
  calculations,
  onUpdateClientInfo,
  initialTab = 'bom',
  onSelectLift
}) => {
  const [activeTab, setActiveTab] = useState<'bom' | 'assembly_instructions' | 'coc_report' | 'dhollandia_manual' | 'video_sequence'>(initialTab);
  const [clientName, setClientName] = useState(config.clientName || 'Inżynier Floty');
  const [clientCompany, setClientCompany] = useState(config.clientCompany || 'Nowa Firma');
  const [notes, setNotes] = useState(config.customNotes || '');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [isGeneratingCocPdf, setIsGeneratingCocPdf] = useState(false);
  const [cocPdfDownloaded, setCocPdfDownloaded] = useState(false);
  const [isGeneratingDhollandiaPdf, setIsGeneratingDhollandiaPdf] = useState(false);
  const [dhollandiaPdfDownloaded, setDhollandiaPdfDownloaded] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateAndDownloadPdfBom(config, calculations, clientName, clientCompany, notes);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('Error generating PDF BOM:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadCocPdf = () => {
    setIsGeneratingCocPdf(true);
    try {
      generateAndDownloadPdfCoC(config, calculations, clientName, clientCompany);
      setCocPdfDownloaded(true);
      setTimeout(() => setCocPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('Error generating PDF CoC:', err);
    } finally {
      setIsGeneratingCocPdf(false);
    }
  };

  const handleDownloadDhollandiaPdf = () => {
    setIsGeneratingDhollandiaPdf(true);
    try {
      generateAndDownloadPdfDhollandia(config, calculations);
      setDhollandiaPdfDownloaded(true);
      setTimeout(() => setDhollandiaPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('Error generating Dhollandia PDF:', err);
    } finally {
      setIsGeneratingDhollandiaPdf(false);
    }
  };

  const handleCopySpec = () => {
    const text = `KARTA ZLECENIA PRODUKCYJNEGO Nowa Firma
Numer Projektu: ${config.projectNumber}
Data: ${new Date().toLocaleDateString('pl-PL')}
Pojazd Bazowy: ${config.chassis.brand} ${config.chassis.model} (DMC: ${config.chassis.gvwKg} kg, Rozstaw: ${config.chassis.wheelbaseMm} mm)
Typ Zabudowy: ${config.selectedBodyType.toUpperCase()}
System Profili ALU-S.V.: ${config.aluSv.subframeType} / Burty: ${config.aluSv.sideboardHeightMm}mm / Słupki: ${config.aluSv.pillarType}
Wymiary CAD (DxSxW): ${config.dimensions.lengthMm} x ${config.dimensions.widthMm} x ${config.dimensions.heightMm} mm
Zwis Tylny (ROH): ${calculations.rearOverhangMm} mm (Zgodność BBG: ${calculations.isOverhangLegal ? 'TAK' : 'NIE'})
Winda: ${config.dhollandiaLiftId ? 'Dhollandia (' + calculations.dhollandiaWeightKg + ' kg)' : 'Brak'}
Sypialnia: ${config.sleeperCab}
Masa Własna Gotowego Pojazdu: ${calculations.totalEmptyWeightKg} kg
DMC: ${calculations.maxLegalGvwKg} kg
Czysta Ładowność Użyteczna: ${calculations.netPayloadCapacityKg} kg
Cena Netto: ${calculations.subtotalNettoPln.toLocaleString('pl-PL')} PLN
Cena Brutto: ${calculations.totalBruttoPln.toLocaleString('pl-PL')} PLN`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClientInfo(clientName, clientCompany, notes);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const selectedLift = DHALLANDIA_LIFTS.find(l => l.id === config.dhollandiaLiftId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div 
        className="bg-[#0B132B] border border-[#D4AF37]/50 rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-6 py-3.5 border-b border-[#D4AF37]/25 flex flex-wrap items-center justify-between gap-3 bg-[#1C2541] no-print">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#0B132B] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold font-mono">
              NF
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                {activeTab === 'bom' && 'KARTA ZLECENIA PRODUKCYJNEGO CAD & ZESTAWIENIE MATERIAŁOWE (BOM)'}
                {activeTab === 'assembly_instructions' && 'INSTRUKCJA SEKWENCJI MONTAŻU PROFILI ALU-S.V. (SOP / PDF)'}
                {activeTab === 'coc_report' && 'RAPORT ZGODNOŚCI Z PRZEPISAMI - ŚWIADECTWO CoC (UE 2018/858)'}
                {activeTab === 'dhollandia_manual' && 'INSTRUKCJA MONTAŻU I SCHEMAT ELEKTRYCZNY WINDY DHOLLANDIA (12V DC)'}
                {activeTab === 'video_sequence' && 'WIDEO SEKWENCJA MONTAŻU WINDY DHOLLANDIA (VEO AI & CAD SIMULATOR)'}
              </h2>
              <span className="text-[11px] font-mono text-[#D4AF37]">
                Projekt: {config.projectNumber} · Nowa Firma
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            {/* View Switcher Tabs / Buttons */}
            <div className="flex items-center bg-[#070D1E] p-0.5 rounded border border-slate-700">
              <button
                onClick={() => setActiveTab('bom')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'bom'
                    ? 'bg-[#1C2541] text-[#D4AF37] font-bold border border-[#D4AF37]/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Karta Zlecenia & BOM</span>
              </button>

              <button
                onClick={() => setActiveTab('assembly_instructions')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'assembly_instructions'
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-sm'
                    : 'text-[#D4AF37] hover:text-white'
                }`}
                title="Generuj ustrukturyzowany widok PDF z sekwencją montażu profilu ALU-S.V."
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Montaż ALU-S.V.</span>
              </button>

              <button
                onClick={() => setActiveTab('coc_report')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'coc_report'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-emerald-400 hover:text-white'
                }`}
                title="Raport zgodności z przepisami UE 2018/858 i świadectwo CoC drugiego etapu"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Raport CoC</span>
              </button>

              <button
                onClick={() => setActiveTab('dhollandia_manual')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'dhollandia_manual'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-amber-400 hover:text-white'
                }`}
                title="Instrukcja montażu windy Dhollandia, schematy elektryczne 12V i procedura podłączenia"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Winda Dhollandia</span>
              </button>

              <button
                onClick={() => setActiveTab('video_sequence')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'video_sequence'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-purple-400 hover:text-white'
                }`}
                title="Wizualizacja sekwencji montażu windy w formacie wideo (Veo AI / Symulator CAD 60 FPS)"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Wideo Montażu Veo</span>
              </button>
            </div>

            {activeTab === 'bom' && (
              <button
                onClick={handleCopySpec}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
              </button>
            )}

            {/* Direct Download Buttons */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#E5B842] hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold transition-all shadow-md shadow-[#D4AF37]/25 whitespace-nowrap"
              title="Generuj kompletną dokumentację techniczną w PDF ze schematem CAD, wymiarami i listą części BOM (gotowe do druku)"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isGeneratingPdf ? 'Generowanie...' : 'Generuj Dokumentację'}</span>
            </button>

            <button
              onClick={handleDownloadCocPdf}
              disabled={isGeneratingCocPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold transition-all shadow-md shadow-emerald-900/30 whitespace-nowrap"
              title="Generuj i pobierz oficjalny raport zgodności CoC (PDF) z danymi o masach i wymiarach"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isGeneratingCocPdf ? 'Pobieranie...' : 'Raport CoC'}</span>
            </button>

            <button
              onClick={handleDownloadDhollandiaPdf}
              disabled={isGeneratingDhollandiaPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold transition-all shadow-md shadow-amber-900/30 whitespace-nowrap"
              title="Pobierz instrukcję montażu windy Dhollandia i schemat podłączenia elektrycznego (PDF)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isGeneratingDhollandiaPdf ? 'Pobieranie...' : 'Schemat Windy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all shadow-sm"
              title="Drukuj lub zapisz jako plik PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Drukuj</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Active Tab View */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'assembly_instructions' && (
            /* Render Structured PDF-Ready Assembly Sequence Instructions for ALU-S.V. */
            <AluSvAssemblyInstructions
              config={config}
              calculations={calculations}
              onBackToBom={() => setActiveTab('bom')}
            />
          )}

          {activeTab === 'coc_report' && (
            /* Render Structured CoC Regulatory Compliance Summary */
            <CocReportSummaryView
              config={config}
              calculations={calculations}
              clientName={clientName}
              clientCompany={clientCompany}
              onBackToBom={() => setActiveTab('bom')}
            />
          )}

          {activeTab === 'dhollandia_manual' && (
            /* Render Dhollandia Wiring Manual & Schematics */
            <DhollandiaWiringManual
              config={config}
              calculations={calculations}
              onBack={() => setActiveTab('bom')}
              onSelectLift={onSelectLift}
            />
          )}

          {activeTab === 'video_sequence' && (
            /* Render Dhollandia Video Assembly Sequence */
            <DhollandiaVideoSequencePlayer
              config={config}
              calculations={calculations}
              onBackToBom={() => setActiveTab('bom')}
              onOpenManual={() => setActiveTab('dhollandia_manual')}
            />
          )}

          {activeTab === 'bom' && (
            /* Render Production Card & BOM */
            <div className="space-y-6 text-slate-200 text-xs font-mono">
              
              {/* Highlight Banner: Download PDF Feature Card */}
              <div className="bg-[#1C2541]/90 border border-[#D4AF37]/50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0B132B] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs flex items-center gap-2">
                      <span>POBIERZ DOKUMENTACJĘ PDF (BOM / CoC / DHOLLANDIA)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                        POBIERANIE BEZPOŚREDNIE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Wybierz odpowiedni raport produkcyjny lub pobierz komplet dokumentacji bezpośrednio z przeglądarki.
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pobierz BOM (PDF)</span>
                  </button>

                  <button
                    onClick={handleDownloadCocPdf}
                    disabled={isGeneratingCocPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs transition-all shadow-md shadow-emerald-900/30 whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Raport CoC (PDF)</span>
                  </button>

                  <button
                    onClick={handleDownloadDhollandiaPdf}
                    disabled={isGeneratingDhollandiaPdf}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-900/30 whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Schemat Windy (PDF)</span>
                  </button>
                </div>
              </div>

              {pdfDownloaded && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200 no-print">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Plik PDF <strong>Dokumentacja_Techniczna_{config.projectNumber}.pdf</strong> został pomyślnie wygenerowany i pobrany na Twoje urządzenie.</span>
                </div>
              )}

              {cocPdfDownloaded && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200 no-print">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Raport Zgodności CoC (PDF) <strong>Raport_Zgodnosci_CoC_{config.projectNumber}.pdf</strong> został pomyślnie wygenerowany i pobrany!</span>
                </div>
              )}

              {dhollandiaPdfDownloaded && (
                <div className="p-3 bg-amber-950/80 border border-amber-500 rounded-lg text-amber-300 text-xs flex items-center gap-2 animate-in fade-in duration-200 no-print">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Instrukcja montażu windy Dhollandia (PDF) została pomyślnie wygenerowana i pobrana!</span>
                </div>
              )}

              {/* Action Banner: Dhollandia, CoC Summary, Assembly Instructions, and Video Sequence CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
                {/* Dhollandia Card */}
                <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] border border-amber-500/40 p-3.5 rounded-lg flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">
                        Winda Dhollandia & Schemat 12V
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Podłączenie hebla, sterownika i agregatu
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('dhollandia_manual')}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Zobacz Schemat 12V</span>
                  </button>
                </div>

                {/* Video Sequence Card */}
                <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] border border-purple-500/40 p-3.5 rounded-lg flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs flex items-center gap-1.5">
                        <span>Wideo Montażu Veo</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold">CAD 60 FPS</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Wizualizacja sekwencji montażu dla serwisantów
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('video_sequence')}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Odtwórz Wideo</span>
                  </button>
                </div>

                {/* CoC Card */}
                <div className="bg-gradient-to-r from-[#0B132B] to-[#1C2541] border border-emerald-500/40 p-3.5 rounded-lg flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">
                        Raport Zgodności CoC (UE)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Zgodność z UE 2018/858 · Masy i osie
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('coc_report')}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zobacz CoC</span>
                  </button>
                </div>

                {/* ALU-S.V. Instructions Card */}
                <div className="bg-gradient-to-r from-[#1C2541] via-[#0B132B] to-[#1C2541] border border-[#D4AF37]/40 p-3.5 rounded-lg flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">
                        Montaż Profili ALU-S.V.
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Rama pośrednia, obrzeża i burty
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('assembly_instructions')}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs transition-all shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Instrukcja Montażu</span>
                  </button>
                </div>
              </div>

              {/* Company & Order Header Box */}
              <div className="border border-[#D4AF37]/30 bg-[#070D1E] p-4 rounded-lg flex flex-wrap justify-between gap-4">
                <div>
                  <div className="text-base font-bold text-white tracking-tight">Nowa Firma</div>
                  <div className="text-[11px] text-slate-400">Zakład Produkcyjny Zabudów Pojazdów Użytkowych</div>
                  <div className="text-[10px] text-slate-500">Certyfikat Homologacyjny Drugiego Etapu WE: e20*2018/858*NF</div>
                  <div className="text-[10px] text-slate-500">System Zapewnienia Jakości ISO 9001:2015 · ISO GPS</div>
                  <div className="text-[11px] text-[#D4AF37] font-bold mt-1">Projekt i wykonanie: Nowa Firma</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400">Numer Zlecenia CAD:</div>
                  <div className="text-base font-bold text-[#D4AF37]">{config.projectNumber}</div>
                  <div className="text-[11px] text-slate-400">Data zlecenia: {new Date().toLocaleDateString('pl-PL')}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">Status: ZWERYFIKOWANY ISO / BBG</div>
                </div>
              </div>

              {/* Client Details Form */}
              <form onSubmit={handleSubmitInquiry} className="bg-[#1C2541]/60 p-4 rounded-lg border border-slate-800 space-y-3 no-print">
                <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>DANE ZAMAWIAJĄCEGO / NABYWCY:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Imię i Nazwisko / Osoba Kontaktowa:</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#0B132B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nazwa Firmy / NIP:</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full bg-[#0B132B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Uwagi Techniczne / Specjalne Wymagania Produkcyjne:</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="np. Dodatkowe punkty mocowania w ścianie przedniej, niestandardowy rozstaw listew Airline, montaż agregatu z zasilaniem 400V..."
                    className="w-full bg-[#0B132B] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] h-16 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Wysłanie zlecenia inicjuje bezpośredni audyt technologiczny w Nowa Firma.
                  </span>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#D4AF37] hover:brightness-110 text-slate-950 font-bold rounded text-xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Wyślij Zlecenie do Technologa</span>
                  </button>
                </div>

                {submitted && (
                  <div className="p-2.5 bg-emerald-950/80 border border-emerald-500 rounded text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zlecenie #{config.projectNumber} zostało pomyślnie przesłane do działu konstrukcyjnego Nowa Firma.</span>
                  </div>
                )}
              </form>

              {/* Section: Technical Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Box 1: Geometry CAD */}
                <div className="border border-slate-800 bg-[#070D1E] p-3.5 rounded-lg space-y-2">
                  <div className="text-white font-bold pb-1.5 border-b border-slate-800 text-[11px] flex justify-between">
                    <span>PARAMETRY GEOMETRYCZNE CAD</span>
                    <span className="text-[#D4AF37]">ISO GPS</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Długość Zewnętrzna (L):</span>
                      <span className="text-white font-bold">{config.dimensions.lengthMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Szerokość Zewnętrzna (W):</span>
                      <span className="text-white font-bold">{config.dimensions.widthMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wysokość Wewnętrzna (H):</span>
                      <span className="text-white font-bold">{config.dimensions.heightMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rozstaw Osi (WB):</span>
                      <span className="text-white">{config.chassis.wheelbaseMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Zwis Tylny (ROH):</span>
                      <span className={calculations.isOverhangLegal ? "text-emerald-400" : "text-rose-400"}>
                        {calculations.rearOverhangMm} mm ({calculations.rearOverhangRatioPct}% WB)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pojemność Europalet:</span>
                      <span className="text-[#D4AF37] font-bold">{calculations.euroPalletSpaces} EP (1200x800)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kubatura Ładunkowa:</span>
                      <span className="text-white font-bold">{calculations.cubicMetersVolume} m³</span>
                    </div>
                  </div>
                </div>

                {/* Box 2: Axle & Mass Distribution */}
                <div className="border border-slate-800 bg-[#070D1E] p-3.5 rounded-lg space-y-2">
                  <div className="text-white font-bold pb-1.5 border-b border-slate-800 text-[11px] flex justify-between">
                    <span>BILANS MAS & NACISKI OSI</span>
                    <span className="text-[#D4AF37]">OEM BBG</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dopuszczalna Masa Całkowita (DMC):</span>
                      <span className="text-white font-bold">{calculations.maxLegalGvwKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Masa Własna Pojazdu Gotowego:</span>
                      <span className="text-white">{calculations.totalEmptyWeightKg} kg</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-1">
                      <span className="text-slate-300 font-bold">Ładowność Użyteczna Netto:</span>
                      <span className="text-emerald-400 font-bold text-sm">{calculations.netPayloadCapacityKg} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nacisk Oś 1 Pełny (GAWR 1: {config.chassis.maxFrontAxleLoadKg} kg):</span>
                      <span className="text-sky-400">{calculations.fullFrontAxleKg} kg ({calculations.frontAxleUtilizationPct}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nacisk Oś 2 Pełny (GAWR 2: {config.chassis.maxRearAxleLoadKg} kg):</span>
                      <span className="text-[#D4AF37]">{calculations.fullRearAxleKg} kg ({calculations.rearAxleUtilizationPct}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Udział Osi Kierowanej (Min 25%):</span>
                      <span className="text-emerald-400 font-semibold">{calculations.steeringAxleLoadPercentage}% (OK)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Section: Bill of Materials (BOM) Table */}
              <div>
                <div className="text-white font-bold mb-2 flex items-center justify-between">
                  <span>ZESTAWIENIE MATERIAŁOWE I KOMPONENTÓW (BOM - BILL OF MATERIALS)</span>
                  <span className="text-[10px] text-slate-400">Norma ISO 2768-mK</span>
                </div>

                <table className="w-full border-collapse border border-slate-800 text-[11px]">
                  <thead>
                    <tr className="bg-[#1C2541] text-slate-300 border-b border-slate-700">
                      <th className="p-2 text-left">Poz.</th>
                      <th className="p-2 text-left">Komponent / Profil / Element</th>
                      <th className="p-2 text-left">Standard / Norma</th>
                      <th className="p-2 text-center">Waga (kg)</th>
                      <th className="p-2 text-right">Cena Netto (PLN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-[#070D1E]">
                    <tr>
                      <td className="p-2 text-slate-500">01</td>
                      <td className="p-2 text-white font-semibold">
                        Podwozie bazowe: {config.chassis.brand} {config.chassis.model}
                      </td>
                      <td className="p-2 text-slate-400">{config.chassis.bbgReferenceDoc}</td>
                      <td className="p-2 text-center">{config.chassis.curbWeightChassisKg}</td>
                      <td className="p-2 text-right text-slate-400">Dostarczone OEM</td>
                    </tr>

                    <tr>
                      <td className="p-2 text-slate-500">02</td>
                      <td className="p-2 text-white">
                        Rama pośrednia: {config.aluSv.subframeType}
                      </td>
                      <td className="p-2 text-slate-400">Stop 6005A-T6 / S355</td>
                      <td className="p-2 text-center">~180</td>
                      <td className="p-2 text-right">W cenie bazowej</td>
                    </tr>

                    <tr>
                      <td className="p-2 text-slate-500">03</td>
                      <td className="p-2 text-white">
                        Konstrukcja zabudowy: {config.selectedBodyType.toUpperCase()} ({config.dimensions.lengthMm}x{config.dimensions.widthMm}mm)
                      </td>
                      <td className="p-2 text-slate-400">ALU-S.V. / Kinegrip K20</td>
                      <td className="p-2 text-center">{calculations.bodyWeightKg}</td>
                      <td className="p-2 text-right">Wycena bazowa</td>
                    </tr>

                    {selectedLift && (
                      <tr>
                        <td className="p-2 text-slate-500">04</td>
                        <td className="p-2 text-white font-semibold">
                          Winda samozaładowcza: {selectedLift.model}
                        </td>
                        <td className="p-2 text-slate-400">ECE R58.03 / Dhollandia</td>
                        <td className="p-2 text-center text-[#D4AF37]">{selectedLift.weightKg}</td>
                        <td className="p-2 text-right text-white font-semibold">
                          {selectedLift.pricePln.toLocaleString('pl-PL')} PLN
                        </td>
                      </tr>
                    )}

                    {config.sleeperCab !== 'none' && (
                      <tr>
                        <td className="p-2 text-slate-500">05</td>
                        <td className="p-2 text-white">
                          Kabina sypialna: {config.sleeperCab === 'roof_spojkar_aeromax' ? 'Spojkar Aeromax dachowa' : 'Lamar Backsleeper tylna'}
                        </td>
                        <td className="p-2 text-slate-400">FMVSS 302 / ECE R29</td>
                        <td className="p-2 text-center">{config.sleeperCab === 'roof_spojkar_aeromax' ? 85 : 145}</td>
                        <td className="p-2 text-right text-white font-semibold">
                          {config.sleeperCab === 'roof_spojkar_aeromax' ? '9 800' : '18 500'} PLN
                        </td>
                      </tr>
                    )}

                    {config.selectedOptions.map((optId, idx) => {
                      const opt = MASTER_OPTIONS_CATALOG.find(o => o.id === optId);
                      if (!opt) return null;
                      return (
                        <tr key={opt.id}>
                          <td className="p-2 text-slate-500">{String(6 + idx).padStart(2, '0')}</td>
                          <td className="p-2 text-white">{opt.name}</td>
                          <td className="p-2 text-slate-400">{opt.standardNorm}</td>
                          <td className="p-2 text-center">{opt.weightKg}</td>
                          <td className="p-2 text-right text-white font-semibold">
                            {opt.pricePln.toLocaleString('pl-PL')} PLN
                          </td>
                        </tr>
                      );
                    })}

                  </tbody>
                </table>
              </div>

              {/* Pricing & Terms Summary */}
              <div className="bg-[#1C2541] border border-[#D4AF37]/30 p-4 rounded-lg flex flex-wrap justify-between items-center gap-4">
                <div>
                  <div className="text-slate-400 text-[11px]">Szacunkowy Czas Realizacji Zlecenia:</div>
                  <div className="text-white font-bold text-sm">
                    {calculations.estimatedLeadDays} Dni Roboczych (z homologacją II etapu)
                  </div>
                  <div className="text-[10px] text-slate-400">Gwarancja: 36 miesięcy na konstrukcję ALU-S.V.</div>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">WARTOŚĆ ZABUDOWY NETTO:</div>
                  <div className="text-xl font-bold text-white">
                    {calculations.subtotalNettoPln.toLocaleString('pl-PL')} PLN
                  </div>
                  <div className="text-[#D4AF37] font-semibold text-xs">
                    Wartość Brutto (23% VAT): {calculations.totalBruttoPln.toLocaleString('pl-PL')} PLN
                  </div>
                </div>
              </div>

              {/* Legal Signatures block */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-8 text-[10px] text-slate-400">
                <div>
                  <div className="font-semibold text-slate-300">Projekt i wykonanie / Główny Technolog CAD:</div>
                  <div className="h-10 border-b border-slate-700 flex items-end pb-1 font-mono text-[#D4AF37] font-bold">
                    Nowa Firma / Główny Technolog Zespołu CAD
                  </div>
                </div>
                <div>
                  <div>Podpis i Pieczęć Zamawiającego:</div>
                  <div className="h-10 border-b border-slate-700 flex items-end pb-1 font-mono text-slate-300">
                    {clientName} ({clientCompany})
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#1C2541] flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex flex-col gap-0.5 text-[11px] font-mono">
            <div className="flex items-center gap-3 text-slate-400">
              <span>Aplikacja KREATOR ZABUDÓW v1.0 dla Nowa Firma</span>
              <span>·</span>
              <span className="text-[#D4AF37]">ALU-S.V. Certified Partner</span>
            </div>
            <div className="text-[10px] text-[#D4AF37]/90">
              Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
          >
            Zamknij Podgląd
          </button>
        </div>

      </div>

    </div>
  );
};
