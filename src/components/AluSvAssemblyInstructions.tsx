import React from 'react';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { 
  Wrench, 
  CheckSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Printer, 
  ArrowLeft, 
  Layers, 
  CheckCircle2,
  FileText
} from 'lucide-react';

interface AluSvAssemblyInstructionsProps {
  config: ActiveProjectConfiguration;
  calculations: AxleLoadCalculation;
  onBackToBom: () => void;
}

export const AluSvAssemblyInstructions: React.FC<AluSvAssemblyInstructionsProps> = ({
  config,
  calculations,
  onBackToBom
}) => {
  const isAluSubframe = config.aluSv.subframeType.includes('Alu-System');
  const sideboardHeight = config.aluSv.sideboardHeightMm;
  const length = config.dimensions.lengthMm;
  const width = config.dimensions.widthMm;
  const hasLift = Boolean(config.dhollandiaLiftId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-200 text-xs font-mono">
      
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1C2541] p-3.5 rounded-lg border border-[#D4AF37]/30 no-print">
        <button
          onClick={onBackToBom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do Karty Zlecenia CAD / BOM</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#D4AF37] font-semibold">
            DOKUMENT GOTOWY DO WYDRUKU / PDF (A4)
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs transition-all shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Drukuj Instrukcję Montażu ALU-S.V. (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Structured Document Sheet */}
      <div className="bg-[#070D1E] border border-slate-800 p-6 rounded-xl space-y-6 printable-sheet">
        
        {/* Document Header */}
        <div className="border-b border-[#D4AF37]/40 pb-4 flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-white tracking-wider">Nowa Firma</span>
              <span className="px-1.5 py-0.5 text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded font-bold">
                KARTA TECHNOLOGICZNA SOP
              </span>
            </div>
            <h1 className="text-base font-bold text-[#D4AF37] tracking-tight">
              INSTRUKCJA SEKWENCJI MONTAŻU SYSTEMU PROFILI ALU-S.V.
            </h1>
            <div className="text-[11px] text-slate-400">
              Procedura Montażowa: <strong>SOP-ALUSV-2026/REV-4</strong> · ISO 2768-mK · OEM BBG Approved
            </div>
          </div>

          <div className="text-right text-[11px] font-mono">
            <div>Nr Zlecenia: <strong className="text-white">{config.projectNumber}</strong></div>
            <div>Pojazd: <strong className="text-slate-300">{config.chassis.brand} {config.chassis.model}</strong></div>
            <div>Wymiary Zabudowy: <strong className="text-[#D4AF37]">{length} x {width} mm</strong></div>
            <div>Wysokość Burt: <strong className="text-white">{sideboardHeight} mm ALU-S.V.</strong></div>
          </div>
        </div>

        {/* Selected ALU-S.V. Specification Matrix */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>SPECYFIKACJA WYBRANYCH KOMPONENTÓW ALU-S.V. DO MONTAŻU:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
            <div className="bg-[#070D1E] p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Profil Podłużnic Ramy:</span>
              <strong className="text-white">{config.aluSv.subframeType}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Stop EN AW-6005A-T6 / S355</span>
            </div>

            <div className="bg-[#070D1E] p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Profil Obrzeżowy:</span>
              <strong className="text-white">{config.aluSv.edgeProfile}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Otworowanie 500 daN co 100mm</span>
            </div>

            <div className="bg-[#070D1E] p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Słupki Kinegrip:</span>
              <strong className="text-white">{config.aluSv.pillarType}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Rygle mimośrodowe wypinane</span>
            </div>

            <div className="bg-[#070D1E] p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Burty Aluminiowe Anodowane:</span>
              <strong className="text-white">Wysokość {sideboardHeight} mm (Grubość 25 mm)</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Zamki burtowe kasetowe ALU-S.V.</span>
            </div>

            <div className="bg-[#070D1E] p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Poszycie Podłogowe:</span>
              <strong className="text-white">{config.aluSv.flooringMaterial}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Powłoka siatkowa Wiremesh</span>
            </div>

            <div className="bg-[#070D1E] p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Interfejs Windy Załadowczej:</span>
              <strong className={hasLift ? "text-amber-400" : "text-slate-400"}>
                {hasLift ? "Konsola adaptera Dhollandia (R58.03)" : "Zderzak standardowy R58.03"}
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Moment dociążenia ramy: {hasLift ? "Uwzględniony" : "N/D"}</span>
            </div>
          </div>
        </div>

        {/* Torque Specification Table */}
        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-[#1C2541] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#D4AF37]" />
              TABELA WYMAGANYCH MOMENTÓW DOKRĘCANIA (TORQUE VALUES · ISO 898-1):
            </span>
            <span className="text-[10px] text-[#D4AF37]">Klucz dynamometryczny kalibrowany</span>
          </div>

          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#0B132B] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2">Węzeł Konstrukcyjny</th>
                <th className="p-2">Łącznik / Śruba</th>
                <th className="p-2">Klasa Wytrzymałości</th>
                <th className="p-2 text-right">Moment Dokręcania (Nm)</th>
                <th className="p-2 text-center">Kontrola QC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-2 text-white">Konsole elastyczne ramy OEM do podłużnic</td>
                <td className="p-2 text-slate-300">Śruby kołnierzowe M12x1.5</td>
                <td className="p-2 text-slate-400">10.9 Geomet / Dacromet</td>
                <td className="p-2 text-right font-bold text-[#D4AF37]">85 Nm</td>
                <td className="p-2 text-center">[ ] Znakowane lakierem</td>
              </tr>
              <tr>
                <td className="p-2 text-white">Łączniki kątowe poprzeczek ALU-S.V. do podłużnic</td>
                <td className="p-2 text-slate-300">Śruby M10x30 z nakrętkami DIN 985</td>
                <td className="p-2 text-slate-400">8.8 Ocynk płatkowy</td>
                <td className="p-2 text-right font-bold text-[#D4AF37]">45 Nm</td>
                <td className="p-2 text-center">[ ] Znakowane lakierem</td>
              </tr>
              <tr>
                <td className="p-2 text-white">Mocowanie kieszeni słupków Kinegrip K20</td>
                <td className="p-2 text-slate-300">Śruby wpuszczane stożkowe M10</td>
                <td className="p-2 text-slate-400">10.9 Czernione / Ocynk</td>
                <td className="p-2 text-right font-bold text-[#D4AF37]">50 Nm</td>
                <td className="p-2 text-center">[ ] Sprawdzone</td>
              </tr>
              <tr>
                <td className="p-2 text-white">Zawiasy burt aluminiowych ALU-S.V. do obrzeża</td>
                <td className="p-2 text-slate-300">Śruby M8x25 stal nierdzewna</td>
                <td className="p-2 text-slate-400">A2-70 (Inox)</td>
                <td className="p-2 text-right font-bold text-[#D4AF37]">22 Nm</td>
                <td className="p-2 text-center">[ ] Luz roboczy 1.0mm</td>
              </tr>
              {hasLift && (
                <tr>
                  <td className="p-2 text-amber-300 font-semibold">Płyty montażowe windy Dhollandia do ramy</td>
                  <td className="p-2 text-slate-300">Śruby pasowane M16x2.0</td>
                  <td className="p-2 text-slate-400">10.9 HV</td>
                  <td className="p-2 text-right font-bold text-amber-400">210 Nm</td>
                  <td className="p-2 text-center">[ ] Protokół Dhollandia</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 7-Step Step-by-Step Structured Assembly Sequence */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-white flex items-center justify-between pb-1 border-b border-slate-800">
            <span>SEKWENCJA OPERACJI MONTAŻOWYCH (KROK PO KROKU · ISO GPS):</span>
            <span className="text-[10px] text-slate-400">Czas normatywny montażu: 18 rbh</span>
          </div>

          {/* STEP 1 */}
          <div className="bg-[#0B132B] border border-slate-800 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  01
                </span>
                ETAP 1: PRZYGOTOWANIE PODWOZIA & KONSOL MOCOWANIA OEM BBG
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Wytyczne: {config.chassis.bbgReferenceDoc}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
              1.1. Oczyścić pasy ramy podwozia {config.chassis.brand} {config.chassis.model}. Sprawdzić geometrię bazową ramy podwozia (rozstaw {config.chassis.wheelbaseMm} mm).<br />
              1.2. Zamontować konsole elastyczne i oporowe w punktach fabrycznych OEM. <strong>BEZWZGLĘDNY ZAKAZ SPAWANIA ORAZ WIERCENIA W PASACH GÓRNYCH I DOLNYCH RAMY PODWOZIA</strong>.<br />
              1.3. Ułożyć taśmę izolacyjną antykorozyjną (przekładka EPDM 3mm) zapobiegającą korozji galwanicznej między stalą ramy pojazdu a podłużnicą aluminiową ALU-S.V.
            </p>
            <div className="pl-7 pt-1 flex items-center gap-4 text-[10px] text-slate-400">
              <span>[ ] Moment śrub konsoli: 85 Nm</span>
              <span>[ ] Przekładka EPDM ułożona</span>
              <span>Podpis Technologa: _________________</span>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-[#0B132B] border border-slate-800 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  02
                </span>
                ETAP 2: MONTAŻ PODRAMÓWKI {isAluSubframe ? "ALU-SYSTEM 120/140" : "STALOWEJ S355"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tolerancja: ISO 2768-mK</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
              2.1. Ułożyć podłużnice profilowe ALU-S.V. 120/140 o długości {length} mm w osi ramy podwozia. Ustawić nawis tylny na wartość z projektu: <strong>{calculations.rearOverhangMm} mm</strong>.<br />
              2.2. Rozmieścić poprzeczki ALU-S.V. w osiowym rozstawie maksymalnie 380 mm. W strefie tylnego zawieszenia i windy zagęścić rozstaw do 250 mm.<br />
              2.3. Skręcić węzły poprzeczek za pomocą łączników kątowych i śrub M10 (moment 45 Nm). Sprawdzić różnicę przekątnych ramy pośredniej (&Delta;D &le; 1.5 mm).
            </p>
            <div className="pl-7 pt-1 flex items-center gap-4 text-[10px] text-slate-400">
              <span>[ ] Przekątne ramy &Delta;D &le; 1.5 mm</span>
              <span>[ ] Zwis tylny = {calculations.rearOverhangMm} mm (&le;60% WB)</span>
              <span>Podpis Technologa: _________________</span>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="bg-[#0B132B] border border-slate-800 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  03
                </span>
                ETAP 3: MONTAŻ PROFILI OBRZEŻOWYCH ALU-S.V. & GNIAZD KINEGRIP
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Norma: EN 12640 (500 daN)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
              3.1. Przymocować obustronnie profile obrzeżowe ALU-S.V. ze zintegrowanym rowkiem mocowania pasów co 100 mm.<br />
              3.2. W profilach obrzeżowych zainstalować kieszenie słupków narożnych oraz środkowych Kinegrip K20. Skręcić śrubami stożkowymi M10 kl. 10.9 (50 Nm).<br />
              3.3. Zamontować profil przedni i tylną belkę wieńczącą ALU-S.V. Zabezpieczyć naroża odlewami aluminiowymi zderzakowymi.
            </p>
            <div className="pl-7 pt-1 flex items-center gap-4 text-[10px] text-slate-400">
              <span>[ ] Kieszenie Kinegrip osiowane</span>
              <span>[ ] Punkty mocowania pasów sprawdzone</span>
              <span>Podpis Technologa: _________________</span>
            </div>
          </div>

          {/* STEP 4 */}
          <div className="bg-[#0B132B] border border-slate-800 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  04
                </span>
                ETAP 4: UKŁADANIE I USZCZELNIANIE PŁYTY PODŁOGOWEJ
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Materiał: {config.aluSv.flooringMaterial}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
              4.1. Przyciąć arkusze sklejki brzozowej wodoodpornej z tolerancją $\pm 1.0$ mm. Zachować szczelinę dylatacyjną 2.0 mm od wewnętrznych krawędzi obrzeża.<br />
              4.2. Uszczelnić krawędzie styku masą poliuretanową Sikaflex 221 / Sikaflex 252 (ciągła spoina bez pęcherzy powietrznych).<br />
              4.3. Przykręcić sklejkę do poprzeczek wkrętami samowiercącymi z łbem stożkowym M6.3x50 ocynkowanymi co 250 mm.
            </p>
            <div className="pl-7 pt-1 flex items-center gap-4 text-[10px] text-slate-400">
              <span>[ ] Uszczelnienie Sikaflex ciągłe</span>
              <span>[ ] Brak zadziorów i wkrętów wystających</span>
              <span>Podpis Technologa: _________________</span>
            </div>
          </div>

          {/* STEP 5 */}
          <div className="bg-[#0B132B] border border-slate-800 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  05
                </span>
                ETAP 5: MONTAŻ ŚCIANY PRZEDNIEJ & SŁUPKÓW KINEGRIP K20
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Wytrzymałość: DIN EN 12642</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
              5.1. Złożyć ścianę przednią z profili panelowych aluminiowych 25 mm wzmocnionych wewnętrzną sklejką ochronną 9 mm do wysokości kabiny pojazdu.<br />
              5.2. Wpiąć słupki środkowe Kinegrip K20 w kieszenie obrzeża ALU-S.V. Wyregulować mechanizm ryglowania mimośrodowego (siła docisku dźwigni 120-150 N).<br />
              5.3. Sprawdzić pionowość słupków Kinegrip we wszystkich osiach (odchyłka &le; 0.8 mm/m).
            </p>
            <div className="pl-7 pt-1 flex items-center gap-4 text-[10px] text-slate-400">
              <span>[ ] Siła ryglowania Kinegrip: 120-150 N</span>
              <span>[ ] Ściana przednia skręcona i usztywniona</span>
              <span>Podpis Technologa: _________________</span>
            </div>
          </div>

          {/* STEP 6 */}
          <div className="bg-[#0B132B] border border-slate-800 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  06
                </span>
                ETAP 6: DOPASOWANIE I MONTAŻ BURT ANODOWANYCH ALU-S.V. ({sideboardHeight} MM)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tolerancja szczelin: 2.0 mm</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
              6.1. Przygotować sekcje burt aluminiowych anodowanych o wysokości {sideboardHeight} mm z zamontowanymi uszczelkami szczotkowymi/EPDM.<br />
              6.2. Przykręcić dolne zawiasy burtowe ALU-S.V. do obrzeża (śruby A2-70, 22 Nm). Sprawdzić swobodę opuszczania burt do pozycji pionowej w dół (180°).<br />
              6.3. Wyregulować zamki kasetowe burtowe w słupkach Kinegrip K20. Upewnić się, że ryglowanie odbywa się bez użycia nadmiernej siły, a burta przylega szczelnie.
            </p>
            <div className="pl-7 pt-1 flex items-center gap-4 text-[10px] text-slate-400">
              <span>[ ] Płynne otwieranie i zamykanie burt</span>
              <span>[ ] Szczeliny burtowe równe 2.0 mm</span>
              <span>Podpis Technologa: _________________</span>
            </div>
          </div>

          {/* STEP 7 */}
          <div className="bg-[#0B132B] border border-slate-800 p-3.5 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#D4AF37] text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  07
                </span>
                ETAP 7: AKCESORIA PODRAMOWE, WINDA DHOLLANDIA & ODBIÓR KOŃCOWY (QUALITY GATE)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ECE R58.03 / ECE R73</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-7">
              7.1. Zamontować osłony boczne przeciwnajazdowe (rowerowe) ALU-S.V. zgodnie z regulaminem ECE R73.<br />
              7.2. Podwiesić skrzynki narzędziowe Daken i zbiornik na wodę Lokhen z zachowaniem prześwitu drogowego min. 350 mm.<br />
              {hasLift && (
                <span>
                  7.3. <strong>Weryfikacja windy Dhollandia</strong>: Podłączyć układ hydrauliczny, sprawdzić działanie zderzaka R58.03, przeprowadzić próbę ciśnieniową pod nominalnym udźwigiem, wkleić tabliczkę CE.<br />
                </span>
              )}
              7.4. Przeprowadzić końcowy audyt geometryczny i nanieść znaki kontroli jakości (Quality Pass Stamp) Nowa Firma.
            </p>
            <div className="pl-7 pt-1 flex items-center gap-4 text-[10px] text-slate-400">
              <span>[ ] Prześwit osłon bocznych zgodny</span>
              <span>[ ] Próba obciążeniowa pozytywna</span>
              <span>Podpis Głównego Kontrolera: _________________</span>
            </div>
          </div>

        </div>

        {/* Quality Acceptance Gate & Final Sign-Off Sheet */}
        <div className="bg-[#1C2541] border border-[#D4AF37]/30 p-4 rounded-lg">
          <div className="text-white font-bold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
              PROTOKÓŁ ZWOLNIENIA DO RUCHU / QUALITY ACCEPTANCE GATE:
            </span>
            <span className="text-[10px] text-slate-400">Nowa Firma · Dział Zapewnienia Jakości</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] border-t border-slate-700/80 pt-3">
            <div>
              <div className="text-slate-300 mb-1">Potwierdzenie Zgodności z Dokumentacją CAD:</div>
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <div>[X] Zgodność geometrii z rysunkiem technicznym CAD</div>
                <div>[X] Sprawdzenie momentów dokręcenia połączeń gwintowanych</div>
                <div>[X] Zgodność z wytycznymi OEM BBG producenta podwozia</div>
                <div>[X] Zabezpieczenie antykorozyjne spoin i otworów montażowych</div>
              </div>
            </div>

            <div className="border-l border-slate-700/80 pl-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Data zakończenia montażu:</span>
                <span className="text-white font-bold">{new Date().toLocaleDateString('pl-PL')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kierownik Montażu:</span>
                <span className="text-[#D4AF37] font-bold">Nowa Firma</span>
              </div>
              <div className="pt-2 border-t border-slate-700 text-[10px] text-slate-400 flex justify-between items-end">
                <span>Podpis i Pieczęć Odbiorcza:</span>
                <span className="font-mono text-slate-200">NF-QC-PASS #8849</span>
              </div>
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
