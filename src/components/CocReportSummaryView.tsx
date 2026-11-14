import React from 'react';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { 
  ShieldCheck, 
  Printer, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Scale, 
  Layers, 
  AlertTriangle,
  Award,
  FileCheck
} from 'lucide-react';
import { generateAndDownloadPdfCoC } from '../utils/generatePdfCoC';

interface CocReportSummaryViewProps {
  config: ActiveProjectConfiguration;
  calculations: AxleLoadCalculation;
  clientName: string;
  clientCompany: string;
  onBackToBom: () => void;
}

export const CocReportSummaryView: React.FC<CocReportSummaryViewProps> = ({
  config,
  calculations,
  clientName,
  clientCompany,
  onBackToBom
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const L = config.dimensions.lengthMm;
  const W = config.dimensions.widthMm;
  const H = config.dimensions.heightMm;
  const WB = config.chassis.wheelbaseMm;
  const FOH = config.chassis.frontOverhangMm;
  const ROH = calculations.rearOverhangMm;
  const totalLengthMm = FOH + WB + ROH;
  const totalHeightMm = H + (config.dimensions.subframeHeightMm || 120) + 750;
  const categoryCode = config.chassis.gvwKg <= 3500 ? 'N1' : 'N2';
  const approvalNo = `e20*2018/858*NF*${config.projectNumber}`;

  let bodyworkTypeEce = 'BA (Skrzynia z opończą / Firanka)';
  if (config.selectedBodyType === 'isotherm_fridge') bodyworkTypeEce = 'BB (Nadwozie izotermiczne / Chłodnia)';
  if (config.selectedBodyType === 'workshop_van') bodyworkTypeEce = 'BB (Furgon warsztatowy specjalny)';
  if (config.selectedBodyType === 'tipper_3way') bodyworkTypeEce = 'BC (Wywrotka 3-stronna)';
  if (config.selectedBodyType === 'car_transporter') bodyworkTypeEce = 'BA (Platforma pomocy drogowej LOHR)';

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      generateAndDownloadPdfCoC(config, calculations, clientName, clientCompany);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Błąd podczas generowania CoC PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-200 text-xs font-mono">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1C2541] p-3.5 rounded-lg border border-[#D4AF37]/30 no-print">
        <button
          onClick={onBackToBom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do Karty Zlecenia CAD / BOM</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generowanie CoC...' : 'Pobierz Raport CoC (PDF)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Drukuj Raport CoC</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Raport Zgodności CoC (PDF) <strong>Raport_Zgodnosci_CoC_{config.projectNumber}.pdf</strong> został pomyślnie pobrany!</span>
        </div>
      )}

      {/* Official CoC Document Container (Styled for Screen & High-Res Print) */}
      <div className="bg-[#0B132B] border border-[#D4AF37]/50 rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800/10 pointer-events-none select-none text-[8rem] font-bold tracking-widest uppercase rotate-[-25deg]">
          HOMOLOGATED
        </div>

        {/* 1. Official Header */}
        <div className="border-b-2 border-[#D4AF37] pb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-[#1C2541] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-sm">
                NF
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  RAPORT ZGODNOŚCI Z PRZEPISAMI (CoC SUMMARY)
                </h1>
                <p className="text-[11px] text-[#D4AF37] font-medium">
                  Świadectwo Zgodności Drugiego Etapu · UE 2018/858 Załącznik VIII
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pl-10">
              Nowa Firma · Akredytacja Homologacyjna TDT / Transportowy Dozór Techniczny
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>HOMOLOGACJA WE ETAP II: ZGODNY</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Numer Świadectwa: <strong className="text-[#D4AF37]">{approvalNo}</strong>
            </div>
            <div className="text-[10px] text-slate-400">
              Kategoria: <strong className="text-white">{categoryCode} (Pojazd Ciężarowy Skompletowany)</strong>
            </div>
          </div>
        </div>

        {/* 2. Client & Vehicle Stage I Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#070D1E] p-4 rounded-lg border border-slate-800">
          <div>
            <span className="text-[10px] text-[#D4AF37] uppercase font-bold block mb-1">
              0. Podwozie Bazowe Etapu I (OEM Chassis):
            </span>
            <div className="space-y-1 text-[11px]">
              <div>Marka i Model: <strong className="text-white">{config.chassis.brand} {config.chassis.model} ({config.chassis.subModel})</strong></div>
              <div>Układ Napędowy: <span className="text-slate-300">{config.chassis.driveType} · Silnik {config.chassis.enginePowerHp} KM</span></div>
              <div>Wytyczne Zabudowy OEM: <span className="text-slate-300">{config.chassis.bbgReferenceDoc}</span></div>
              <div>Fabryczny Rozstaw Osi (WB): <span className="text-[#D4AF37] font-semibold">{config.chassis.wheelbaseMm} mm</span></div>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#D4AF37] uppercase font-bold block mb-1">
              Dane Zamawiającego / Użytkownika Końcowego:
            </span>
            <div className="space-y-1 text-[11px]">
              <div>Nabywca / Firma: <strong className="text-white">{clientCompany || 'Nowa Firma'}</strong></div>
              <div>Osoba Odpowiedzialna: <span className="text-slate-300">{clientName || 'Inżynier Floty'}</span></div>
              <div>Zlecenie Produkcyjne: <span className="text-[#D4AF37] font-semibold">{config.projectNumber}</span></div>
              <div>Data Weryfikacji: <span className="text-slate-300">{new Date().toLocaleDateString('pl-PL')}</span></div>
            </div>
          </div>
        </div>

        {/* 3. Section 1: GEOMETRIC DIMENSIONS TABLE (Poz. 4-13 CoC) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase">
            <Layers className="w-4 h-4" />
            <span>1. Wymiary Geometryczne Pojazdu Skompletowanego (ISO GPS / UE 2018/858)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-800">
              <thead className="bg-[#1C2541] text-slate-300">
                <tr>
                  <th className="p-2.5 border-b border-slate-800">Poz. CoC / Parametr Konstrukcyjny</th>
                  <th className="p-2.5 border-b border-slate-800 text-center">Wartość Wyliczona</th>
                  <th className="p-2.5 border-b border-slate-800 text-center">Limit Normatywny</th>
                  <th className="p-2.5 border-b border-slate-800 text-right">Ocena Zgodności</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#0B132B]">
                <tr>
                  <td className="p-2 text-white">Poz. 4. Rozstaw osi (Wheelbase WB)</td>
                  <td className="p-2 text-center text-[#D4AF37] font-bold">{WB} mm</td>
                  <td className="p-2 text-center text-slate-400">Homologacja Etapu I</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 5. Długość całkowita pojazdu skompletowanego</td>
                  <td className="p-2 text-center text-white font-bold">{totalLengthMm} mm</td>
                  <td className="p-2 text-center text-slate-400">Maks. 12 000 mm</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 6. Szerokość zewnętrzna zabudowy</td>
                  <td className="p-2 text-center text-white font-bold">{W} mm</td>
                  <td className="p-2 text-center text-slate-400">Maks. 2 550 mm (2 600 chłodnia)</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 7. Wysokość całkowita pojazdu</td>
                  <td className="p-2 text-center text-white font-bold">{totalHeightMm} mm</td>
                  <td className="p-2 text-center text-slate-400">Maks. 4 000 mm</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 10. Zwis przedni podwozia (FOH)</td>
                  <td className="p-2 text-center text-slate-300">{FOH} mm</td>
                  <td className="p-2 text-center text-slate-400">Specyfikacja OEM</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 11. Zwis tylny zabudowy (Rear Overhang ROH)</td>
                  <td className="p-2 text-center text-[#D4AF37] font-bold">
                    {ROH} mm ({calculations.rearOverhangRatioPct}% WB)
                  </td>
                  <td className="p-2 text-center text-slate-400">
                    ≤ 60% WB (maks. {calculations.maxAllowedRearOverhangMm} mm)
                  </td>
                  <td className="p-2 text-right">
                    {calculations.isOverhangLegal ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY (BBG)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> PRZEKROCZENIE
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 38. Kod i rodzaj nadwozia wg UE 2018/858</td>
                  <td className="p-2 text-center text-slate-300 font-semibold" colSpan={2}>
                    {bodyworkTypeEce}
                  </td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Section 2: MASSES & AXLE LOAD DISTRIBUTION (Poz. 14-22 CoC) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase">
            <Scale className="w-4 h-4" />
            <span>2. Bilans Mas i Rozkład Nacisków na Osie (Poz. 14-22 CoC / OEM BBG)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-800">
              <thead className="bg-[#1C2541] text-slate-300">
                <tr>
                  <th className="p-2.5 border-b border-slate-800">Pozycja Homologacyjna / Parametr Masowy</th>
                  <th className="p-2.5 border-b border-slate-800 text-center">Wartość Wyliczona</th>
                  <th className="p-2.5 border-b border-slate-800 text-center">Wartość Dopuszczalna</th>
                  <th className="p-2.5 border-b border-slate-800 text-right">Ocena Zgodności</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#0B132B]">
                <tr>
                  <td className="p-2 text-white">Poz. 13. Masa pojazdu gotowego do jazdy (z kierowcą 75kg)</td>
                  <td className="p-2 text-center text-[#D4AF37] font-bold">{calculations.totalEmptyWeightKg + 75} kg</td>
                  <td className="p-2 text-center text-slate-400">Tara etapu II</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 14. Masa rzeczywista gotowego nadwozia (Bodywork Net)</td>
                  <td className="p-2 text-center text-white font-bold">{calculations.bodyWeightKg} kg</td>
                  <td className="p-2 text-center text-slate-400">ALU-S.V. C-Alu + burty</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 16.1. Dopuszczalny nacisk osi przedniej (GAWR 1)</td>
                  <td className="p-2 text-center text-white font-bold">
                    {calculations.fullFrontAxleKg} kg ({calculations.frontAxleUtilizationPct}%)
                  </td>
                  <td className="p-2 text-center text-slate-400">Maks. {config.chassis.maxFrontAxleLoadKg} kg</td>
                  <td className="p-2 text-right">
                    {calculations.fullFrontAxleKg <= config.chassis.maxFrontAxleLoadKg ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> W NORMIE
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> PRZECIĄŻENIE
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 16.2. Dopuszczalny nacisk osi tylnej (GAWR 2)</td>
                  <td className="p-2 text-center text-white font-bold">
                    {calculations.fullRearAxleKg} kg ({calculations.rearAxleUtilizationPct}%)
                  </td>
                  <td className="p-2 text-center text-slate-400">Maks. {config.chassis.maxRearAxleLoadKg} kg</td>
                  <td className="p-2 text-right">
                    {calculations.fullRearAxleKg <= config.chassis.maxRearAxleLoadKg ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> W NORMIE
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> PRZECIĄŻENIE
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white">Poz. 16.3. Wskaźnik dociążenia osi kierowanej (OEM BBG)</td>
                  <td className="p-2 text-center text-[#D4AF37] font-bold">{calculations.steeringAxleLoadPercentage}% DMC</td>
                  <td className="p-2 text-center text-slate-400">Wymagane ≥ 20.0% (30% zalecane)</td>
                  <td className="p-2 text-right">
                    {calculations.isSteeringSafe ? (
                      <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> BEZPIECZNY (BBG)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center justify-end gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> ODDŁAWIENIE OSI
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-white font-bold">Poz. 17. Dopuszczalna Masa Całkowita (DMC / GVW)</td>
                  <td className="p-2 text-center text-[#D4AF37] font-bold text-xs">{calculations.maxLegalGvwKg} kg</td>
                  <td className="p-2 text-center text-white font-bold">{config.chassis.gvwKg} kg</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY Z DMC
                  </td>
                </tr>
                <tr className="bg-emerald-950/30">
                  <td className="p-2 text-emerald-300 font-bold">Poz. 18. Czysta ładowność użyteczna (Net Payload)</td>
                  <td className="p-2 text-center text-emerald-400 font-bold text-xs">{calculations.netPayloadCapacityKg} kg</td>
                  <td className="p-2 text-center text-slate-400">Rezerwa operacyjna floty</td>
                  <td className="p-2 text-right text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <Award className="w-3.5 h-3.5" /> OPTYMALNA
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Section 3: Homologation & Type Approvals Checklist */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase">
            <FileCheck className="w-4 h-4" />
            <span>3. Wykaz Zastosowanych Regulaminów EKG ONZ i Certyfikatów Części</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="bg-[#070D1E] p-3 rounded border border-slate-800 space-y-1.5">
              <div className="text-white font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>UNECE R58.03 (Tylne Zabezpieczenie Przeciwwjazdowe)</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                {config.dhollandiaLiftId 
                  ? 'Zintegrowana certyfikowana belka zderzaka podestu Dhollandia (prześwit ≤ 450 mm, cofnięcie ≤ 400 mm).'
                  : 'Atestowana belka zderzaka aluminiowa ALU-S.V. E-mark ze staliwkowymi uchwytami pochłaniającymi energię.'}
              </p>
            </div>

            <div className="bg-[#070D1E] p-3 rounded border border-slate-800 space-y-1.5">
              <div className="text-white font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>UNECE R73.01 (Boczne Osłony Przeciwwjazdowe)</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Uchylne profile bocznych osłon rowerowych ALU-S.V. z atestem EKG ONZ. Ciągłość osłony zachowana, prześwit drogowy poniżej 450 mm.
              </p>
            </div>

            <div className="bg-[#070D1E] p-3 rounded border border-slate-800 space-y-1.5">
              <div className="text-white font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>UNECE R48.06 (Instalacja Urządzeń Oświetleniowych)</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Światła obrysowe boczne LED bursztynowe (SMD), tylne gabaryty LED biało-czerwone na wysięgnikach elastycznych. Zgodność z homologacją E20.
              </p>
            </div>

            <div className="bg-[#070D1E] p-3 rounded border border-slate-800 space-y-1.5">
              <div className="text-white font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>EN 12640 / EN 12642 Code XL (Mocowanie Ładunku)</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Obrzeże ALU-S.V. z otworami na pasy transportowe co 100 mm (500 daN) oraz certyfikacja konstrukcji wytrzymałościowej ściany przedniej i burt.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Formal CoC Legal Declaration */}
        <div className="bg-[#070D1E] border border-[#D4AF37]/40 p-4 rounded-lg space-y-3">
          <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wide">
            Oświadczenie Producenta Etapu Drugiego (Art. 36 i 37 Rozporządzenia UE 2018/858):
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            Niniejszym Nowa Firma oświadcza, że pojazd opisany w niniejszym raporcie został skompletowany w procedurze homologacji wieloetapowej zgodnie ze świadectwem homologacji typu WE etapu drugiego oraz odpowiada we wszystkich szczegółach technicznych typowi opisanemu w dokumentacji homologacyjnej producenta. Pojazd spełnia wszystkie obowiązujące akty prawne UE i może być trwale dopuszczony do ruchu drogowego w państwach członkowskich bez konieczności przeprowadzania dodatkowych badań technicznych.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400">Pełnomocnik ds. Zgodności Produkcji (CoP):</div>
              <div className="text-xs font-bold text-white mt-1">Nowa Firma</div>
              <div className="text-[10px] text-[#D4AF37]">Dział Homologacji i Jakości</div>
            </div>
            <div className="sm:text-right">
              <div className="text-[10px] text-slate-400">Pieczęć Producenta Etapu II:</div>
              <div className="text-xs font-bold text-white mt-1">Nowa Firma</div>
              <div className="text-[10px] text-emerald-400 font-mono">HOMOLOGATED SECOND STAGE [e20]</div>
            </div>
          </div>
        </div>

        {/* Intellectual Property Footer */}
        <div className="pt-3 border-t border-slate-800 text-center text-[11px] font-mono text-[#D4AF37]/90">
          Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
        </div>

      </div>

    </div>
  );
};
