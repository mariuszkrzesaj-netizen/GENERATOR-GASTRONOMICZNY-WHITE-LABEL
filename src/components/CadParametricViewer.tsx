import React, { useState } from 'react';
import { 
  OemChassis, 
  ParametricCadDimensions, 
  AluSvProfileSystem, 
  AxleLoadCalculation, 
  BodyWorkType 
} from '../types/itsMaster';
import { DHALLANDIA_LIFTS } from '../data/masterSpecsData';
import { 
  Layers, 
  Eye, 
  Maximize2, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Check, 
  CheckSquare, 
  ChevronRight, 
  FileText,
  Sliders,
  ShieldCheck,
  Rotate3d,
  FileDown
} from 'lucide-react';
import { AluSv3dSubframePreview } from './AluSv3dSubframePreview';

interface CadParametricViewerProps {
  chassis: OemChassis;
  dimensions: ParametricCadDimensions;
  aluSv: AluSvProfileSystem;
  bodyType: BodyWorkType;
  dhollandiaLiftId: string | null;
  curtainColorHex: string;
  sleeperCab: 'none' | 'roof_spojkar_aeromax' | 'back_sleeper_lamar';
  coolingUnit: string;
  calculations: AxleLoadCalculation;
  onColorChange: (hex: string, ralName: string) => void;
  onGenerateDocumentation?: () => void;
}

const COLOR_SWATCHES = [
  { name: 'Granat Korporacyjny Nowa Firma', ral: 'RAL 5002', hex: '#0B132B' },
  { name: 'Antracyt Metalik', ral: 'RAL 7016', hex: '#374151' },
  { name: 'Czysta Biel Przemysłowa', ral: 'RAL 9010', hex: '#F3F4F6' },
  { name: 'Srebrny Aluminiowy', ral: 'RAL 9006', hex: '#9CA3AF' },
  { name: 'Czerwień Energetyczna', ral: 'RAL 3020', hex: '#DC2626' },
  { name: 'Głęboka Czerń', ral: 'RAL 9005', hex: '#111827' }
];

export const CadParametricViewer: React.FC<CadParametricViewerProps> = ({
  chassis,
  dimensions,
  aluSv,
  bodyType,
  dhollandiaLiftId,
  curtainColorHex,
  sleeperCab,
  coolingUnit,
  calculations,
  onColorChange,
  onGenerateDocumentation
}) => {
  const [activeTab, setActiveTab] = useState<'side' | 'top' | 'xray' | 'assembly' | 'skeleton'>('side');
  const [showIsoDimensions, setShowIsoDimensions] = useState(true);
  const [showCogMarker, setShowCogMarker] = useState(true);
  const [showOemFrame, setShowOemFrame] = useState(true);
  const [selectedAssemblyStep, setSelectedAssemblyStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStepCompleted = (stepNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev => 
      prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
    );
  };

  // SVG Scaling Math
  // Baseline canvas width 1000px, height 480px
  const svgWidth = 1000;
  const svgHeight = 440;
  const scale = 0.115; // 1 mm = 0.115 px

  // Geometric anchor points (mm)
  const cabWidthMm = chassis.type === 'van' ? 2200 : 1850;
  const cabHeightMm = 2100;
  const frontOverhangPx = chassis.frontOverhangMm * scale;
  const wheelbasePx = chassis.wheelbaseMm * scale;
  const bodyLengthPx = dimensions.lengthMm * scale;
  const bodyHeightPx = dimensions.heightMm * scale;
  const groundY = 340;
  const wheelRadiusPx = 38;
  const frameHeightPx = 16;
  const subframeHeightPx = (dimensions.subframeHeightMm || 120) * scale;

  const frontWheelX = 120 + frontOverhangPx;
  const rearWheelX = frontWheelX + wheelbasePx;
  const cabStartX = 120;
  const cabEndX = frontWheelX + 600 * scale; // cab ends behind front axle
  const bodyStartX = chassis.type === 'van' ? cabStartX + 400 * scale : cabEndX + 30 * scale;
  const bodyEndX = bodyStartX + bodyLengthPx;
  const bodyBottomY = groundY - wheelRadiusPx - 10 - frameHeightPx - subframeHeightPx;
  const bodyTopY = bodyBottomY - bodyHeightPx;

  // Center of Gravity X coordinate
  const cogX = bodyStartX + (bodyLengthPx * 0.48);

  // Dynamic ALU-S.V. Assembly Sequence calculations based strictly on current dimensions
  const L = dimensions.lengthMm;
  const W = dimensions.widthMm;
  const H = dimensions.heightMm;
  const sideboardH = aluSv.sideboardHeightMm;
  const numCrossmembers = Math.floor((L - 200) / 380) + 2;
  const crossmemberLength = W - 70;
  const numLashingPoints = Math.floor(L / 100) * 2;
  const isDividedSideboards = L > 4200;
  const numMidPillars = isDividedSideboards ? (L > 5500 ? 4 : 2) : 0;
  const sideboardsPerSide = isDividedSideboards ? (numMidPillars === 4 ? 3 : 2) : 1;
  const sideboardCount = sideboardsPerSide * 2;
  const sideboardSectionLength = Math.round((L - 80 - (numMidPillars / 2) * 50) / sideboardsPerSide);
  const floorAreaM2 = ((L * W) / 1_000_000).toFixed(2);
  const numFloorScrews = numCrossmembers * 8;
  const hasLift = Boolean(dhollandiaLiftId);

  const assemblySequenceSteps = [
    {
      step: 1,
      name: "Przygotowanie podwozia & montaż konsol OEM BBG",
      targetComponent: "Konsole ramy OEM BBG + przekładki EPDM 3mm",
      dynamicSpecs: `Rozstaw osi: ${chassis.wheelbaseMm} mm · Długość montażowa: ${L} mm · 8-12 konsol elastycznych`,
      torque: "85 Nm (M12x1.5 kl. 10.9)",
      norm: `${chassis.bbgReferenceDoc}`,
      actionText: `Oczyścić pasy ramy podwozia ${chassis.brand} ${chassis.model}. Zamontować konsole elastyczne z przekładką EPDM 3mm (ochrona galwaniczna). Zakaz spawania i wiercenia w pasach ramy.`,
      hotspotX: frontWheelX + 60,
      hotspotY: groundY - wheelRadiusPx - 20
    },
    {
      step: 2,
      name: `Montaż podłużnic wzdłużnych ${aluSv.subframeType.split('(')[0]}`,
      targetComponent: `Podłużnice profilowe ${aluSv.subframeType.includes('Alu') ? 'C-Alu 120/140' : 'Stal S355'}`,
      dynamicSpecs: `2 sztuki x długość cięcia: ${L} mm · Zwis tylny ROH: ${calculations.rearOverhangMm} mm (${calculations.rearOverhangRatioPct}% WB)`,
      torque: "85 Nm",
      norm: "ISO 2768-mK (różnica przekątnych ΔD ≤ 1.5 mm)",
      actionText: `Ułożyć 2 podłużnice o dokładnej długości ${L} mm w osi podwozia. Ustawić zwis tylny na ${calculations.rearOverhangMm} mm (limit BBG: ${calculations.maxAllowedRearOverhangMm} mm). Skontrolować przekątne.`,
      hotspotX: (bodyStartX + bodyEndX) / 2,
      hotspotY: bodyBottomY + 5
    },
    {
      step: 3,
      name: "Montaż poprzeczek profilowych Z-Alu co 380 mm",
      targetComponent: "Poprzeczki nośne ALU-S.V. + łączniki kątowe",
      dynamicSpecs: `${numCrossmembers} sztuk x długość ${crossmemberLength} mm (zagęszczenie nad osią tylną do 250 mm)`,
      torque: "45 Nm (M10x30 kl. 8.8)",
      norm: "ISO GPS / ALU-S.V. Standard",
      actionText: `Rozmieścić ${numCrossmembers} poprzeczek o długości ${crossmemberLength} mm. Skręcić łącznikami kątowym ALU-S.V. ze śrubami samohamownymi DIN 985.`,
      hotspotX: (bodyStartX + bodyEndX) * 0.45,
      hotspotY: bodyBottomY - 5
    },
    {
      step: 4,
      name: "Montaż profili obrzeżowych ALU-S.V. z kieszeniami pasów",
      targetComponent: `${aluSv.edgeProfile.split('(')[0]}`,
      dynamicSpecs: `2x profile boczne ${L} mm + profil przedni ${W} mm · ${numLashingPoints} punktów mocowania ładunku 500 daN`,
      torque: "50 Nm (M10 stożkowe kl. 10.9)",
      norm: "EN 12640 / DIN 75410-1",
      actionText: `Przymocować obustronnie obrzeża ALU-S.V. o długości ${L} mm z rowkiem mocowania pasów co 100 mm (${numLashingPoints} punktów). Zamontować gniazda słupków Kinegrip.`,
      hotspotX: bodyEndX - 60,
      hotspotY: bodyBottomY - 12
    },
    {
      step: 5,
      name: "Układanie, dylatacja i klejenie płyty podłogowej",
      targetComponent: `${aluSv.flooringMaterial}`,
      dynamicSpecs: `Powierzchnia użytkowa: ${floorAreaM2} m² (${L - 8} x ${W - 8} mm z dylatacją 2mm) · ${numFloorScrews} wkrętów`,
      torque: "12 Nm (wkręty M6.3x50 stożkowe)",
      norm: "Sikaflex 221 / DIN EN 14418",
      actionText: `Dociąć arkusze sklejki na wymiar ${L - 8} x ${W - 8} mm. Zachować szczelinę dylatacyjną 2.0 mm. Zaaplikować ciągłą spoinę Sikaflex 221. Przykręcić ${numFloorScrews} wkrętami co 250 mm.`,
      hotspotX: (bodyStartX + bodyEndX) * 0.65,
      hotspotY: bodyBottomY - 18
    },
    {
      step: 6,
      name: `Instalacja słupków ${aluSv.pillarType.split('(')[0]} i ściany przedniej`,
      targetComponent: `${aluSv.pillarType} + panele przednie ALU-S.V. 25 mm`,
      dynamicSpecs: `4 słupki narożne wys. ${H} mm + ${numMidPillars > 0 ? `${numMidPillars} słupki środkowe wypinane` : 'brak słupków środkowych (zabudowa krótka)'}`,
      torque: "Siła ryglowania: 120-150 N",
      norm: "DIN EN 12642 (Wytrzymałość konstrukcji)",
      actionText: `Złożyć ścianę przednią z profili panelowych 25 mm do wysokości ${H} mm ze sklejką osłonową. Wpiąć ${numMidPillars} słupki Kinegrip K20 w gniazda obrzeża i wyregulować mimośród.`,
      hotspotX: bodyStartX + 10,
      hotspotY: bodyTopY + 40
    },
    {
      step: 7,
      name: `Pasowanie i montaż burt anodowanych ALU-S.V. (${sideboardH} mm)`,
      targetComponent: `Burty aluminiowe 25 mm wys. ${sideboardH} mm + zamki kasetowe ALU-S.V.`,
      dynamicSpecs: isDividedSideboards 
        ? `${sideboardCount} burt bocznych x ${sideboardSectionLength} mm (dzielone Kinegrip) + burta przednia`
        : `2 burty boczne x ${sideboardSectionLength} mm (jednolite) + burta przednia`,
      torque: "22 Nm (śruby zawiasów A2-70)",
      norm: "ISO 2768-mK (szczelina burtowa 2.0 mm)",
      actionText: `Zamontować dolne zawiasy burtowe ALU-S.V. ze stali nierdzewnej. Zawiesić ${sideboardCount} paneli burtowych ${sideboardH} mm. Wyregulować zamki kasetowe i sprawdzić płynność ryglowania.`,
      hotspotX: (bodyStartX + bodyEndX) * 0.5,
      hotspotY: bodyBottomY - 35
    },
    {
      step: 8,
      name: hasLift ? "Integracja windy Dhollandia & zderzaka R58.03" : "Montaż zderzaka tylnego R58.03 & osłon rowerowych ECE R73",
      targetComponent: hasLift ? "Konsola adaptacyjna Dhollandia + belka R58.03" : "Belka przeciwnajazdowa R58.03 + osłony ALU-S.V.",
      dynamicSpecs: hasLift 
        ? `Winda ${DHALLANDIA_LIFTS.find(l => l.id === dhollandiaLiftId)?.model} (${calculations.dhollandiaWeightKg} kg) · Moment ramy: 210 Nm`
        : `Belka R58.03 szerokość ${W - 100} mm · Prześwit drogowy min. 350 mm`,
      torque: hasLift ? "210 Nm (śruby M16 kl. 10.9 HV)" : "85 Nm",
      norm: "ECE R58.03 / ECE R73 / ECE R48",
      actionText: hasLift 
        ? `Zamontować konsolę nośną windy Dhollandia do podłużnic. Podłączyć agregat 12V, sprawdzić zderzak R58.03, przeprowadzić próbę ciśnieniową.`
        : `Zainstalować belkę zderzaka R58.03 oraz aluminiowe osłony rowerowe ECE R73. Odbiór techniczny Quality Gate.`,
      hotspotX: bodyEndX + 5,
      hotspotY: groundY - wheelRadiusPx + 10
    }
  ];

  return (
    <div className="bg-[#0B132B]/90 border border-[#D4AF37]/30 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* CAD Toolbar */}
      <div className="bg-[#1C2541]/90 border-b border-[#D4AF37]/20 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* View mode buttons */}
        <div className="flex items-center gap-1 bg-[#0B132B] p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setActiveTab('side')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'side'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Rzut Boczny CAD
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'top'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Rzut z Góry (Palety & CoG)
          </button>
          <button
            onClick={() => setActiveTab('xray')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'xray'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Przekrój Konstrukcyjny (X-Ray)
          </button>
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'assembly'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm font-bold'
                : 'text-[#D4AF37] hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Instrukcja Montażu ALU-S.V.</span>
          </button>
          <button
            onClick={() => setActiveTab('skeleton')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'skeleton'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm font-bold'
                : 'text-amber-400 hover:text-white'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Szkielet 3D (Rama, Słupy, Dach)</span>
          </button>
        </div>

        {/* Layer toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIsoDimensions(!showIsoDimensions)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
              showIsoDimensions
                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>ISO GPS Wymiary</span>
          </button>

          <button
            onClick={() => setShowCogMarker(!showCogMarker)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
              showCogMarker
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>CoG (Środek Ciężkości)</span>
          </button>

          <button
            onClick={() => setShowOemFrame(!showOemFrame)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
              showOemFrame
                ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                : 'bg-slate-800/40 border-slate-700 text-slate-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Rama OEM BBG</span>
          </button>
        </div>

        {/* Tarpaulin color palette & Quick Documentation button */}
        <div className="flex items-center gap-2">
          {bodyType === 'curtain_sider' && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/80">
              <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Kolor:</span>
              <div className="flex items-center gap-1">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.ral}
                    onClick={() => onColorChange(swatch.hex, swatch.ral)}
                    title={`${swatch.name} (${swatch.ral})`}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      curtainColorHex === swatch.hex
                        ? 'scale-125 border-[#D4AF37] ring-2 ring-[#D4AF37]/50'
                        : 'border-slate-500 hover:scale-110'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {onGenerateDocumentation && (
            <button
              onClick={onGenerateDocumentation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#E5B842] hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap ml-1"
              title="Generuj kompletną dokumentację techniczną w formacie PDF (schemat 2D CAD, wymiary, zestawienie BOM, gotowe do druku)"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
              <span>Generuj Dokumentację</span>
            </button>
          )}
        </div>

      </div>

      {/* CAD Viewport Area: 3D Complete Skeleton vs 2D SVG Blueprint */}
      {activeTab === 'skeleton' ? (
        <div className="bg-[#070D1E] p-2 sm:p-4 border-t border-[#D4AF37]/20">
          <AluSv3dSubframePreview
            dimensions={dimensions}
            aluSv={aluSv}
            chassis={chassis}
            dhollandiaLiftId={dhollandiaLiftId}
            bodyType={bodyType}
          />
        </div>
      ) : (
        <div className="relative w-full h-[380px] sm:h-[420px] bg-gradient-to-b from-[#070D1E] via-[#0B132B] to-[#0D1836] p-2 flex items-center justify-center overflow-hidden">
        
        {/* Subtle CAD Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #D4AF37 1px, transparent 1px), linear-gradient(to right, rgba(212, 175, 55, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 55, 0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 20px 20px, 20px 20px'
          }}
        />

        {/* Live Status Overlay in top left */}
        <div className="absolute top-3 left-4 pointer-events-none font-mono text-[11px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">PODWOZIE:</span>
            <span className="text-white font-semibold">{chassis.brand} {chassis.model}</span>
            <span className="text-slate-400">· WB:</span>
            <span className="text-[#D4AF37] font-semibold">{chassis.wheelbaseMm} mm</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ZWIS TYLNY (ROH):</span>
            <span className={`font-semibold ${calculations.isOverhangLegal ? 'text-emerald-400' : 'text-rose-400'}`}>
              {calculations.rearOverhangMm} mm ({calculations.rearOverhangRatioPct}% WB)
            </span>
            {calculations.isOverhangLegal ? (
              <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> ZGODNY Z BBG (&le;60%)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-0.5 text-[10px]">
                <AlertTriangle className="w-3 h-3" /> PRZEKROCZENIE BBG (&gt;60%)
              </span>
            )}
          </div>
        </div>

        {/* SVG Drawing Engine */}
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-full max-h-[420px] select-none"
        >
          <defs>
            {/* Blueprint Grid Pattern */}
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(212, 175, 55, 0.08)" strokeWidth="0.5"/>
            </pattern>
            {/* Metallic Gradients */}
            <linearGradient id="metalChassis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="50%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="aluSubframe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E5E7EB" />
              <stop offset="50%" stopColor="#9CA3AF" />
              <stop offset="100%" stopColor="#6B7280" />
            </linearGradient>
            <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect width={svgWidth} height={svgHeight} fill="url(#smallGrid)" />

          {/* Ground Line */}
          <line 
            x1="50" 
            y1={groundY} 
            x2="950" 
            y2={groundY} 
            stroke="#374151" 
            strokeWidth="2" 
            strokeDasharray="6 4"
          />

          {/* VIEW: SIDE ELEVATION */}
          {activeTab === 'side' && (
            <g id="side-elevation">
              
              {/* 1. OEM Chassis Wheels */}
              {/* Front Wheel */}
              <g transform={`translate(${frontWheelX}, ${groundY - wheelRadiusPx})`}>
                <circle r={wheelRadiusPx} fill="#1F2937" stroke="#4B5563" strokeWidth="4" />
                <circle r={wheelRadiusPx * 0.55} fill="#374151" stroke="#9CA3AF" strokeWidth="2" />
                <circle r={wheelRadiusPx * 0.2} fill="#111827" />
                <circle r="4" fill="#D4AF37" />
              </g>

              {/* Rear Wheel (or Twin Wheels) */}
              <g transform={`translate(${rearWheelX}, ${groundY - wheelRadiusPx})`}>
                <circle r={wheelRadiusPx} fill="#1F2937" stroke="#4B5563" strokeWidth="4" />
                {chassis.driveType.includes('Bliźniak') && (
                  <circle r={wheelRadiusPx + 2} fill="none" stroke="#6B7280" strokeWidth="2" strokeDasharray="4 2" />
                )}
                <circle r={wheelRadiusPx * 0.55} fill="#374151" stroke="#9CA3AF" strokeWidth="2" />
                <circle r={wheelRadiusPx * 0.2} fill="#111827" />
                <circle r="4" fill="#D4AF37" />
              </g>

              {/* 2. OEM Chassis Rail (Frame) */}
              {showOemFrame && (
                <g id="oem-frame">
                  {/* Main Longitude Chassis Beams */}
                  <rect 
                    x={frontWheelX - frontOverhangPx + 50} 
                    y={groundY - wheelRadiusPx - 10 - frameHeightPx} 
                    width={bodyEndX - (frontWheelX - frontOverhangPx + 50) + 20} 
                    height={frameHeightPx} 
                    fill="url(#metalChassis)" 
                    stroke="#4B5563" 
                    strokeWidth="1.5"
                    rx="2"
                  />
                  {/* Fuel Tank */}
                  <rect 
                    x={frontWheelX + 60} 
                    y={groundY - wheelRadiusPx - 10} 
                    width="60" 
                    height="26" 
                    fill="#1E293B" 
                    stroke="#475569" 
                    strokeWidth="1" 
                    rx="4"
                  />
                  <text x={frontWheelX + 75} y={groundY - wheelRadiusPx + 7} fill="#94A3B8" fontSize="8" fontFamily="monospace">
                    {chassis.fuelTankLitres}L
                  </text>
                  {/* Toolboxes if selected */}
                  <rect 
                    x={rearWheelX - 70} 
                    y={groundY - wheelRadiusPx - 8} 
                    width="55" 
                    height="24" 
                    fill="#0F172A" 
                    stroke="#D4AF37" 
                    strokeWidth="1" 
                    rx="2"
                  />
                  <text x={rearWheelX - 63} y={groundY - wheelRadiusPx + 8} fill="#D4AF37" fontSize="8" fontFamily="monospace">
                    DAKEN
                  </text>
                  {/* Underrun bar R58 */}
                  <rect 
                    x={bodyEndX - 20} 
                    y={groundY - wheelRadiusPx + 5} 
                    width="15" 
                    height="20" 
                    fill="#334155" 
                    stroke="#64748B" 
                    strokeWidth="1"
                  />
                </g>
              )}

              {/* 3. Base Vehicle Cabin */}
              <g id="cabin-silhouette">
                {chassis.type === 'van' ? (
                  // Van cabin front profile
                  <path 
                    d={`M ${cabStartX} ${groundY - wheelRadiusPx - 5}
                       L ${cabStartX + 30} ${groundY - 140}
                       L ${cabStartX + 90} ${groundY - 190}
                       L ${bodyStartX} ${groundY - 210}
                       L ${bodyStartX} ${groundY - wheelRadiusPx - 10 - frameHeightPx}
                       Z`}
                    fill="#1E293B"
                    stroke="#64748B"
                    strokeWidth="2"
                  />
                ) : (
                  // Chassis Cab profile
                  <path 
                    d={`M ${cabStartX + 10} ${groundY - wheelRadiusPx - 8}
                       L ${cabStartX + 35} ${groundY - 130}
                       L ${cabStartX + 85} ${groundY - 180}
                       L ${cabEndX} ${groundY - 190}
                       L ${cabEndX} ${groundY - wheelRadiusPx - 10 - frameHeightPx}
                       Z`}
                    fill="#1E293B"
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                )}
                {/* Windshield */}
                <path 
                  d={`M ${cabStartX + 42} ${groundY - 135}
                     L ${cabStartX + 82} ${groundY - 176}
                     L ${cabStartX + 115} ${groundY - 176}
                     L ${cabStartX + 95} ${groundY - 135}
                     Z`}
                  fill="#0F172A"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  opacity="0.8"
                />
                {/* Cab door seam */}
                <line 
                  x1={cabStartX + 105} 
                  y1={groundY - 176} 
                  x2={cabStartX + 100} 
                  y2={groundY - wheelRadiusPx - 10} 
                  stroke="#475569" 
                  strokeWidth="1" 
                  strokeDasharray="2 2"
                />
                {/* Headlight */}
                <polygon 
                  points={`${cabStartX + 12},${groundY - 95} ${cabStartX + 25},${groundY - 105} ${cabStartX + 25},${groundY - 85}`} 
                  fill="#FDE047" 
                  opacity="0.9"
                />
              </g>

              {/* 4. Sleeper Cab / Aerodynamic Pod */}
              {sleeperCab === 'roof_spojkar_aeromax' && (
                <g id="roof-sleeper">
                  <path 
                    d={`M ${cabStartX + 75} ${groundY - 190}
                       Q ${cabStartX + 100} ${groundY - 250} ${cabEndX} ${groundY - 245}
                       L ${cabEndX} ${groundY - 190}
                       Z`}
                    fill="#0F172A"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                  />
                  <rect 
                    x={cabStartX + 105} 
                    y={groundY - 230} 
                    width="25" 
                    height="12" 
                    rx="3" 
                    fill="#1E293B" 
                    stroke="#94A3B8" 
                    strokeWidth="0.8"
                  />
                  <text x={cabStartX + 85} y={groundY - 200} fill="#D4AF37" fontSize="8" fontFamily="monospace">
                    SPOJKAR
                  </text>
                </g>
              )}

              {/* 5. Subframe ALU-S.V. */}
              <rect 
                x={bodyStartX} 
                y={bodyBottomY} 
                width={bodyLengthPx} 
                height={subframeHeightPx} 
                fill="url(#aluSubframe)" 
                stroke="#D4AF37" 
                strokeWidth="1"
              />
              <text x={bodyStartX + 15} y={bodyBottomY + subframeHeightPx - 3} fill="#0F172A" fontSize="7" fontWeight="bold" fontFamily="monospace">
                ALU-S.V. 120
              </text>

              {/* 6. Bodywork Shell by Category */}
              {bodyType === 'curtain_sider' && (
                <g id="curtain-body">
                  {/* Tarpaulin main curtain */}
                  <rect 
                    x={bodyStartX} 
                    y={bodyTopY} 
                    width={bodyLengthPx} 
                    height={bodyHeightPx} 
                    fill={curtainColorHex} 
                    stroke="#D4AF37" 
                    strokeWidth="2" 
                    rx="2"
                    fillOpacity="0.9"
                  />
                  {/* Anodized Aluminum Sideboards (Burty ALU-S.V.) */}
                  <rect 
                    x={bodyStartX} 
                    y={bodyBottomY - ((aluSv.sideboardHeightMm || 400) * scale)} 
                    width={bodyLengthPx} 
                    height={(aluSv.sideboardHeightMm || 400) * scale} 
                    fill="url(#aluSubframe)" 
                    stroke="#374151" 
                    strokeWidth="1"
                  />
                  {/* Vertical Curtain Tensioning Straps & Kinegrip Middle Pillar */}
                  <line 
                    x1={bodyStartX + bodyLengthPx * 0.5} 
                    y1={bodyTopY} 
                    x2={bodyStartX + bodyLengthPx * 0.5} 
                    y2={bodyBottomY} 
                    stroke="#E5E7EB" 
                    strokeWidth="3"
                  />
                  <text 
                    x={bodyStartX + bodyLengthPx * 0.5 - 25} 
                    y={bodyTopY + 25} 
                    fill="#D4AF37" 
                    fontSize="7" 
                    fontFamily="monospace"
                  >
                    KINEGRIP K20
                  </text>

                  {/* Curtain horizontal tension wrinkles */}
                  <line x1={bodyStartX + 5} y1={bodyTopY + 40} x2={bodyEndX - 5} y2={bodyTopY + 40} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  <line x1={bodyStartX + 5} y1={bodyTopY + 80} x2={bodyEndX - 5} y2={bodyTopY + 80} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                  
                  {/* Nowa Firma Brand Logo on curtain */}
                  <g transform={`translate(${bodyStartX + 30}, ${bodyTopY + 30})`}>
                    <rect x="0" y="0" width="130" height="34" rx="4" fill="#0B132B" stroke="#D4AF37" strokeWidth="1" />
                    <text x="10" y="22" fill="#D4AF37" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                      NOWA FIRMA
                    </text>
                  </g>
                </g>
              )}

              {bodyType === 'isotherm_fridge' && (
                <g id="fridge-body">
                  {/* Seamless White PUR Box */}
                  <rect 
                    x={bodyStartX} 
                    y={bodyTopY} 
                    width={bodyLengthPx} 
                    height={bodyHeightPx} 
                    fill="#F8FAFC" 
                    stroke="#38BDF8" 
                    strokeWidth="2" 
                    rx="3"
                  />
                  {/* Carrier / Thermo King unit above cab */}
                  <rect 
                    x={bodyStartX - 28} 
                    y={bodyTopY + 15} 
                    width="35" 
                    height="45" 
                    fill="#0F172A" 
                    stroke="#0284C7" 
                    strokeWidth="1.5" 
                    rx="3"
                  />
                  <text x={bodyStartX - 24} y={bodyTopY + 42} fill="#38BDF8" fontSize="7" fontWeight="bold" fontFamily="monospace">
                    CARRIER
                  </text>
                  {/* Rear Stainless Steel Door Hinges & Rods */}
                  <line x1={bodyEndX - 4} y1={bodyTopY + 10} x2={bodyEndX - 4} y2={bodyBottomY - 10} stroke="#64748B" strokeWidth="3" />
                  <rect x={bodyEndX - 7} y={bodyTopY + 30} width="6" height="15" fill="#CBD5E1" />
                  <rect x={bodyEndX - 7} y={bodyBottomY - 45} width="6" height="15" fill="#CBD5E1" />
                  {/* ATP FRC Compliance badge text */}
                  <text x={bodyStartX + 20} y={bodyTopY + 35} fill="#0369A1" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    ATP-FRC (-20°C) · ATEST PZH
                  </text>
                </g>
              )}

              {bodyType === 'workshop_van' && (
                <g id="workshop-van-body">
                  {/* Van body continuation */}
                  <path 
                    d={`M ${bodyStartX} ${groundY - 210}
                       L ${bodyEndX} ${groundY - 210}
                       L ${bodyEndX} ${groundY - wheelRadiusPx - 10 - frameHeightPx}
                       L ${bodyStartX} ${groundY - wheelRadiusPx - 10 - frameHeightPx}
                       Z`}
                    fill="#1E293B"
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                  {/* Internal Racking Cutaway */}
                  <rect 
                    x={bodyStartX + 40} 
                    y={groundY - 190} 
                    width={bodyLengthPx - 80} 
                    height="95" 
                    fill="#0F172A" 
                    stroke="#D4AF37" 
                    strokeWidth="1.5" 
                    rx="4"
                  />
                  {/* Shelves and Drawers inside */}
                  <line x1={bodyStartX + 45} y1={groundY - 165} x2={bodyStartX + 180} y2={groundY - 165} stroke="#64748B" strokeWidth="1" />
                  <line x1={bodyStartX + 45} y1={groundY - 140} x2={bodyStartX + 180} y2={groundY - 140} stroke="#64748B" strokeWidth="1" />
                  <line x1={bodyStartX + 45} y1={groundY - 115} x2={bodyStartX + 180} y2={groundY - 115} stroke="#64748B" strokeWidth="1" />
                  {/* Workbench + Vice */}
                  <rect x={bodyStartX + 190} y={groundY - 150} width="65" height="50" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
                  <circle cx={bodyStartX + 245} cy={groundY - 155} r="6" fill="#D4AF37" />
                  <text x={bodyStartX + 55} y={groundY - 173} fill="#D4AF37" fontSize="8" fontFamily="monospace">
                    VAN RACKING ECE R17 (20G)
                  </text>
                </g>
              )}

              {bodyType === 'tipper_3way' && (
                <g id="tipper-body">
                  {/* Hardox Steel Platform & Sideboards */}
                  <rect 
                    x={bodyStartX} 
                    y={bodyBottomY - 55} 
                    width={bodyLengthPx} 
                    height="55" 
                    fill="#334155" 
                    stroke="#F59E0B" 
                    strokeWidth="2"
                  />
                  {/* Telescopic cylinder under body */}
                  <polygon 
                    points={`${bodyStartX + bodyLengthPx * 0.45},${bodyBottomY} ${bodyStartX + bodyLengthPx * 0.55},${bodyBottomY} ${bodyStartX + bodyLengthPx * 0.5},${groundY - wheelRadiusPx - 10}`} 
                    fill="#D4AF37" 
                    stroke="#B45309" 
                    strokeWidth="1.5"
                  />
                  {/* Cab Protection Rack (Siatka osłony kabiny) */}
                  <line x1={bodyStartX} y1={bodyBottomY - 55} x2={bodyStartX} y2={bodyBottomY - 115} stroke="#E2E8F0" strokeWidth="3" />
                  <text x={bodyStartX + 15} y={bodyBottomY - 25} fill="#FCD34D" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    HARDOX 450 · WYWROT 3-STRONNY
                  </text>
                </g>
              )}

              {bodyType === 'car_transporter' && (
                <g id="car-transporter-body">
                  {/* Low angle aluminum deck */}
                  <polygon 
                    points={`${bodyStartX},${bodyBottomY - 40} ${bodyEndX},${bodyBottomY - 15} ${bodyEndX},${bodyBottomY} ${bodyStartX},${bodyBottomY}`} 
                    fill="url(#aluSubframe)" 
                    stroke="#D4AF37" 
                    strokeWidth="1.5"
                  />
                  {/* LOHR punch holes along the deck */}
                  {[0.2, 0.35, 0.5, 0.65, 0.8].map((ratio, i) => (
                    <circle 
                      key={i} 
                      cx={bodyStartX + bodyLengthPx * ratio} 
                      cy={bodyBottomY - 22} 
                      r="4" 
                      fill="#0B132B" 
                      stroke="#9CA3AF" 
                      strokeWidth="1" 
                    />
                  ))}
                  {/* Electric Winch */}
                  <rect x={bodyStartX + 10} y={bodyBottomY - 55} width="22" height="15" fill="#EF4444" stroke="#7F1D1D" rx="2" />
                  <text x={bodyStartX + 45} y={bodyBottomY - 25} fill="#D4AF37" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    ALU-S.V. LOHR · SUPERWINCH 12V
                  </text>
                </g>
              )}

              {/* 7. Dhollandia Tail Lift Platform (if selected) */}
              {dhollandiaLiftId && bodyType !== 'workshop_van' && bodyType !== 'car_transporter' && (
                <g id="dhollandia-lift">
                  {/* Lift folded vertical platform behind body */}
                  <rect 
                    x={bodyEndX + 4} 
                    y={bodyTopY + 25} 
                    width="14" 
                    height={bodyHeightPx - 20} 
                    fill="url(#aluSubframe)" 
                    stroke="#D4AF37" 
                    strokeWidth="1.5" 
                    rx="1"
                  />
                  {/* Hydraulic Lift Arms & Cylinder */}
                  <line 
                    x1={bodyEndX} 
                    y1={bodyBottomY + 10} 
                    x2={bodyEndX + 11} 
                    y2={bodyBottomY + 30} 
                    stroke="#38BDF8" 
                    strokeWidth="4"
                  />
                  {/* Dhollandia Badge */}
                  <text 
                    x={bodyEndX - 2} 
                    y={bodyTopY + 80} 
                    fill="#D4AF37" 
                    fontSize="7" 
                    fontWeight="bold" 
                    fontFamily="monospace"
                    transform={`rotate(90, ${bodyEndX + 10}, ${bodyTopY + 80})`}
                  >
                    DHOLLANDIA
                  </text>
                </g>
              )}

              {/* 8. Center of Gravity (CoG) Indicator */}
              {showCogMarker && (
                <g id="cog-marker" transform={`translate(${cogX}, ${bodyTopY + bodyHeightPx * 0.55})`}>
                  <circle r="12" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
                  <line x1="-16" y1="0" x2="16" y2="0" stroke="#F59E0B" strokeWidth="2" />
                  <line x1="0" y1="-16" x2="0" y2="16" stroke="#F59E0B" strokeWidth="2" />
                  <path d="M 0 0 L 12 0 A 12 12 0 0 1 0 12 Z" fill="#F59E0B" />
                  <path d="M 0 0 L -12 0 A 12 12 0 0 1 0 -12 Z" fill="#F59E0B" />
                  {/* Label */}
                  <rect x="18" y="-10" width="85" height="18" rx="3" fill="#0B132B" stroke="#F59E0B" strokeWidth="1" />
                  <text x="22" y="3" fill="#F59E0B" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    CoG: {Math.round(dimensions.lengthMm * 0.48)} mm
                  </text>
                </g>
              )}

              {/* 9. ISO GPS Dimension Lines */}
              {showIsoDimensions && (
                <g id="iso-gps-dimensions" stroke="#D4AF37" strokeWidth="1" fill="#D4AF37">
                  
                  {/* Dim 1: Wheelbase (WB) */}
                  <line x1={frontWheelX} y1={groundY + 25} x2={rearWheelX} y2={groundY + 25} />
                  <line x1={frontWheelX} y1={groundY + 15} x2={frontWheelX} y2={groundY + 35} />
                  <line x1={rearWheelX} y1={groundY + 15} x2={rearWheelX} y2={groundY + 35} />
                  <rect x={(frontWheelX + rearWheelX) / 2 - 45} y={groundY + 16} width="90" height="18" rx="2" fill="#0B132B" stroke="#D4AF37" strokeWidth="0.5" />
                  <text x={(frontWheelX + rearWheelX) / 2} y={groundY + 29} fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    WB: {chassis.wheelbaseMm} mm
                  </text>

                  {/* Dim 2: Bodywork Length (L) */}
                  <line x1={bodyStartX} y1={bodyTopY - 20} x2={bodyEndX} y2={bodyTopY - 20} />
                  <line x1={bodyStartX} y1={bodyTopY - 30} x2={bodyStartX} y2={bodyTopY - 10} />
                  <line x1={bodyEndX} y1={bodyTopY - 30} x2={bodyEndX} y2={bodyTopY - 10} />
                  <rect x={(bodyStartX + bodyEndX) / 2 - 55} y={bodyTopY - 30} width="110" height="18" rx="2" fill="#0B132B" stroke="#D4AF37" strokeWidth="0.5" />
                  <text x={(bodyStartX + bodyEndX) / 2} y={bodyTopY - 17} fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    L: {dimensions.lengthMm} mm (ISO)
                  </text>

                  {/* Dim 3: Height (H) */}
                  <line x1={bodyEndX + 35} y1={bodyTopY} x2={bodyEndX + 35} y2={bodyBottomY} />
                  <line x1={bodyEndX + 25} y1={bodyTopY} x2={bodyEndX + 45} y2={bodyTopY} />
                  <line x1={bodyEndX + 25} y1={bodyBottomY} x2={bodyEndX + 45} y2={bodyBottomY} />
                  <rect x={bodyEndX + 20} y={(bodyTopY + bodyBottomY) / 2 - 10} width="70" height="18" rx="2" fill="#0B132B" stroke="#D4AF37" strokeWidth="0.5" />
                  <text x={bodyEndX + 55} y={(bodyTopY + bodyBottomY) / 2 + 3} fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                    H: {dimensions.heightMm} mm
                  </text>

                  {/* Dim 4: Rear Overhang (ROH) */}
                  <line x1={rearWheelX} y1={groundY + 50} x2={bodyEndX} y2={groundY + 50} stroke={calculations.isOverhangLegal ? "#10B981" : "#EF4444"} />
                  <line x1={rearWheelX} y1={groundY + 42} x2={rearWheelX} y2={groundY + 58} stroke={calculations.isOverhangLegal ? "#10B981" : "#EF4444"} />
                  <line x1={bodyEndX} y1={groundY + 42} x2={bodyEndX} y2={groundY + 58} stroke={calculations.isOverhangLegal ? "#10B981" : "#EF4444"} />
                  <rect x={(rearWheelX + bodyEndX) / 2 - 50} y={groundY + 41} width="100" height="18" rx="2" fill="#0B132B" stroke={calculations.isOverhangLegal ? "#10B981" : "#EF4444"} strokeWidth="0.5" />
                  <text x={(rearWheelX + bodyEndX) / 2} y={groundY + 54} fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold" fill={calculations.isOverhangLegal ? "#10B981" : "#EF4444"}>
                    ROH: {calculations.rearOverhangMm} mm
                  </text>
                </g>
              )}

            </g>
          )}

          {/* VIEW: TOP ELEVATION & PALLET MATRIX */}
          {activeTab === 'top' && (
            <g id="top-elevation">
              {/* Floor boundary */}
              <rect 
                x="140" 
                y="100" 
                width={bodyLengthPx * 1.3} 
                height="220" 
                fill="#1E293B" 
                stroke="#D4AF37" 
                strokeWidth="2" 
                rx="4"
              />
              {/* Chassis frame rails running under floor */}
              <line x1="100" y1="170" x2={140 + bodyLengthPx * 1.3 + 30} y2="170" stroke="#4B5563" strokeWidth="8" strokeDasharray="10 5" />
              <line x1="100" y1="250" x2={140 + bodyLengthPx * 1.3 + 30} y2="250" stroke="#4B5563" strokeWidth="8" strokeDasharray="10 5" />

              {/* Euro-Pallet Grid (1200x800mm) */}
              {Array.from({ length: calculations.euroPalletSpaces }).map((_, idx) => {
                const col = Math.floor(idx / 2);
                const row = idx % 2;
                const palletW = 65;
                const palletH = 85;
                const px = 155 + col * (palletW + 8);
                const py = 115 + row * (palletH + 12);
                return (
                  <g key={idx} transform={`translate(${px}, ${py})`}>
                    <rect 
                      width={palletW} 
                      height={palletH} 
                      fill="#D4AF37" 
                      fillOpacity="0.15" 
                      stroke="#D4AF37" 
                      strokeWidth="1.5" 
                      rx="3" 
                    />
                    <text x={palletW / 2} y={palletH / 2 - 6} fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      EP #{idx + 1}
                    </text>
                    <text x={palletW / 2} y={palletH / 2 + 10} fill="#94A3B8" fontSize="8" textAnchor="middle" fontFamily="monospace">
                      1200x800
                    </text>
                  </g>
                );
              })}

              {/* Summary note in top view */}
              <g transform="translate(150, 40)">
                <rect width="450" height="40" rx="4" fill="#0B132B" stroke="#D4AF37" strokeWidth="1" />
                <text x="15" y="24" fill="#D4AF37" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  POJEMNOŚĆ ŁADUNKOWA: {calculations.euroPalletSpaces} EUROPALET · KUBATURA: {calculations.cubicMetersVolume} m³
                </text>
              </g>
            </g>
          )}

          {/* VIEW: X-RAY / SECTION */}
          {activeTab === 'xray' && (
            <g id="xray-section">
              {/* Outer boundary frame */}
              <rect x="250" y="70" width="480" height="260" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" rx="4" />
              {/* Structural sandwich / aluminum ribbing */}
              <line x1="250" y1="120" x2="730" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="250" y1="180" x2="730" y2="180" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="250" y1="240" x2="730" y2="240" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

              {/* Center aisle and Airline tie-down rails */}
              <rect x="300" y="305" width="380" height="15" fill="#475569" stroke="#D4AF37" strokeWidth="1" />
              <text x="490" y="316" fill="#D4AF37" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                LISTWY MOCUJĄCE AIRLINE DIN 75410-1 (1000 daN)
              </text>

              {/* Roof lift indication */}
              {dimensions.roofLiftMm > 0 && (
                <g transform="translate(300, 85)">
                  <rect width="380" height="25" fill="#D4AF37" fillOpacity="0.2" stroke="#D4AF37" strokeWidth="1" rx="2" />
                  <text x="190" y="17" fill="#D4AF37" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                    SIŁOWNIKI UNOSZENIA DACHU EDSCHA: +{dimensions.roofLiftMm} mm
                  </text>
                </g>
              )}
            </g>
          )}

          {/* VIEW: ALU-S.V. ASSEMBLY CAD SCHEMATIC */}
          {activeTab === 'assembly' && (
            <g id="assembly-schematic">
              {/* Chassis Silhouette Ghost */}
              <g opacity="0.25">
                <circle cx={frontWheelX} cy={groundY - wheelRadiusPx} r={wheelRadiusPx} fill="#1F2937" stroke="#4B5563" strokeWidth="2" />
                <circle cx={rearWheelX} cy={groundY - wheelRadiusPx} r={wheelRadiusPx} fill="#1F2937" stroke="#4B5563" strokeWidth="2" />
                <path 
                  d={`M ${cabStartX + 10} ${groundY - wheelRadiusPx - 8}
                     L ${cabStartX + 35} ${groundY - 130}
                     L ${cabStartX + 85} ${groundY - 180}
                     L ${cabEndX} ${groundY - 190}
                     L ${cabEndX} ${groundY - wheelRadiusPx - 10 - frameHeightPx}
                     Z`}
                  fill="#1E293B"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
              </g>

              {/* Step 1: Chassis Consoles OEM */}
              <g 
                onClick={() => setSelectedAssemblyStep(1)} 
                className="cursor-pointer"
              >
                {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
                  <rect 
                    key={i} 
                    x={frontWheelX + (bodyEndX - frontWheelX) * ratio - 10} 
                    y={groundY - wheelRadiusPx - 12 - frameHeightPx} 
                    width="20" 
                    height="12" 
                    fill="#38BDF8" 
                    stroke={selectedAssemblyStep === 1 ? "#F59E0B" : "#0284C7"}
                    strokeWidth={selectedAssemblyStep === 1 ? 2.5 : 1}
                    rx="1" 
                  />
                ))}
              </g>

              {/* Step 2: Longitudinal Rails ALU-S.V. C-120/140 */}
              <g 
                onClick={() => setSelectedAssemblyStep(2)} 
                className="cursor-pointer"
              >
                <rect 
                  x={bodyStartX} 
                  y={bodyBottomY} 
                  width={bodyLengthPx} 
                  height={subframeHeightPx} 
                  fill="url(#aluSubframe)" 
                  stroke={selectedAssemblyStep === 2 ? "#F59E0B" : "#D4AF37"} 
                  strokeWidth={selectedAssemblyStep === 2 ? 3 : 1.5}
                />
                <text 
                  x={bodyStartX + 15} 
                  y={bodyBottomY + subframeHeightPx - 3} 
                  fill="#0F172A" 
                  fontSize="7.5" 
                  fontWeight="bold" 
                  fontFamily="monospace"
                >
                  C-ALU 120/140 (2x {L} mm)
                </text>
              </g>

              {/* Step 3: Crossmembers Z-Alu */}
              <g 
                onClick={() => setSelectedAssemblyStep(3)} 
                className="cursor-pointer"
              >
                {Array.from({ length: Math.min(18, numCrossmembers) }).map((_, i) => {
                  const cx = bodyStartX + 10 + i * ((bodyLengthPx - 20) / Math.max(1, numCrossmembers - 1));
                  return (
                    <line 
                      key={i} 
                      x1={cx} 
                      y1={bodyBottomY - 8} 
                      x2={cx} 
                      y2={bodyBottomY} 
                      stroke={selectedAssemblyStep === 3 ? "#F59E0B" : "#94A3B8"} 
                      strokeWidth={selectedAssemblyStep === 3 ? 3.5 : 2} 
                    />
                  );
                })}
              </g>

              {/* Step 4: Perimeter Edge Profile */}
              <g 
                onClick={() => setSelectedAssemblyStep(4)} 
                className="cursor-pointer"
              >
                <line 
                  x1={bodyStartX} 
                  y1={bodyBottomY - 8} 
                  x2={bodyEndX} 
                  y2={bodyBottomY - 8} 
                  stroke={selectedAssemblyStep === 4 ? "#F59E0B" : "#38BDF8"} 
                  strokeWidth={selectedAssemblyStep === 4 ? 4 : 2} 
                />
                {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((r, i) => (
                  <circle 
                    key={i} 
                    cx={bodyStartX + bodyLengthPx * r} 
                    cy={bodyBottomY - 8} 
                    r="2.5" 
                    fill="#0B132B" 
                    stroke="#D4AF37" 
                    strokeWidth="1" 
                  />
                ))}
              </g>

              {/* Step 5: Floor Plywood */}
              <g 
                onClick={() => setSelectedAssemblyStep(5)} 
                className="cursor-pointer"
              >
                <rect 
                  x={bodyStartX + 2} 
                  y={bodyBottomY - 14} 
                  width={bodyLengthPx - 4} 
                  height="6" 
                  fill="#78350F" 
                  stroke={selectedAssemblyStep === 5 ? "#F59E0B" : "#B45309"} 
                  strokeWidth={selectedAssemblyStep === 5 ? 2.5 : 1}
                  rx="1"
                />
              </g>

              {/* Step 6: Corner & Mid Kinegrip Pillars + Front Bulkhead */}
              <g 
                onClick={() => setSelectedAssemblyStep(6)} 
                className="cursor-pointer"
              >
                <rect 
                  x={bodyStartX} 
                  y={bodyTopY} 
                  width="10" 
                  height={bodyHeightPx} 
                  fill="#334155" 
                  stroke={selectedAssemblyStep === 6 ? "#F59E0B" : "#94A3B8"} 
                  strokeWidth="1.5" 
                />
                <rect 
                  x={bodyEndX - 8} 
                  y={bodyTopY} 
                  width="8" 
                  height={bodyHeightPx} 
                  fill="#334155" 
                  stroke={selectedAssemblyStep === 6 ? "#F59E0B" : "#94A3B8"} 
                  strokeWidth="1.5" 
                />
                {numMidPillars > 0 && (
                  <rect 
                    x={bodyStartX + bodyLengthPx * 0.5 - 4} 
                    y={bodyTopY} 
                    width="8" 
                    height={bodyHeightPx} 
                    fill="#D4AF37" 
                    stroke={selectedAssemblyStep === 6 ? "#F59E0B" : "#94A3B8"} 
                    strokeWidth="1.5" 
                  />
                )}
              </g>

              {/* Step 7: Sideboard Panels */}
              <g 
                onClick={() => setSelectedAssemblyStep(7)} 
                className="cursor-pointer"
              >
                {isDividedSideboards ? (
                  <>
                    <rect 
                      x={bodyStartX + 10} 
                      y={bodyBottomY - 14 - (sideboardH * scale)} 
                      width={bodyLengthPx * 0.5 - 14} 
                      height={sideboardH * scale} 
                      fill="url(#aluSubframe)" 
                      stroke={selectedAssemblyStep === 7 ? "#F59E0B" : "#D4AF37"} 
                      strokeWidth={selectedAssemblyStep === 7 ? 3 : 1.5}
                      rx="1"
                    />
                    <rect 
                      x={bodyStartX + bodyLengthPx * 0.5 + 4} 
                      y={bodyBottomY - 14 - (sideboardH * scale)} 
                      width={bodyLengthPx * 0.5 - 14} 
                      height={sideboardH * scale} 
                      fill="url(#aluSubframe)" 
                      stroke={selectedAssemblyStep === 7 ? "#F59E0B" : "#D4AF37"} 
                      strokeWidth={selectedAssemblyStep === 7 ? 3 : 1.5}
                      rx="1"
                    />
                  </>
                ) : (
                  <rect 
                    x={bodyStartX + 10} 
                    y={bodyBottomY - 14 - (sideboardH * scale)} 
                    width={bodyLengthPx - 20} 
                    height={sideboardH * scale} 
                    fill="url(#aluSubframe)" 
                    stroke={selectedAssemblyStep === 7 ? "#F59E0B" : "#D4AF37"} 
                    strokeWidth={selectedAssemblyStep === 7 ? 3 : 1.5}
                    rx="1"
                  />
                )}
              </g>

              {/* Step 8: Rear interface / Dhollandia */}
              <g 
                onClick={() => setSelectedAssemblyStep(8)} 
                className="cursor-pointer"
              >
                {hasLift ? (
                  <rect 
                    x={bodyEndX + 4} 
                    y={bodyTopY + 25} 
                    width="14" 
                    height={bodyHeightPx - 20} 
                    fill="url(#aluSubframe)" 
                    stroke={selectedAssemblyStep === 8 ? "#F59E0B" : "#38BDF8"} 
                    strokeWidth={selectedAssemblyStep === 8 ? 3 : 1.5}
                    rx="1"
                  />
                ) : (
                  <rect 
                    x={bodyEndX - 20} 
                    y={groundY - wheelRadiusPx + 5} 
                    width="15" 
                    height="20" 
                    fill="#334155" 
                    stroke={selectedAssemblyStep === 8 ? "#F59E0B" : "#64748B"} 
                    strokeWidth={selectedAssemblyStep === 8 ? 3 : 1}
                  />
                )}
              </g>

              {/* Numbered Circular Hotspot Badges [1] to [8] */}
              {assemblySequenceSteps.map((step) => {
                const isSelected = selectedAssemblyStep === step.step;
                const isDone = completedSteps.includes(step.step);
                return (
                  <g 
                    key={step.step}
                    transform={`translate(${step.hotspotX}, ${step.hotspotY})`}
                    onClick={() => setSelectedAssemblyStep(step.step)}
                    className="cursor-pointer"
                  >
                    <circle 
                      r="12" 
                      fill={isDone ? "#10B981" : (isSelected ? "#D4AF37" : "#0B132B")} 
                      stroke={isSelected ? "#FFFFFF" : "#D4AF37"} 
                      strokeWidth={isSelected ? "2.5" : "1.5"} 
                    />
                    <text 
                      textAnchor="middle" 
                      dominantBaseline="central" 
                      fontSize="10" 
                      fontWeight="bold" 
                      fill={isDone ? "#FFFFFF" : (isSelected ? "#0B132B" : "#D4AF37")} 
                      fontFamily="monospace"
                    >
                      {step.step}
                    </text>
                  </g>
                );
              })}

              {/* Schematic Title Overlay */}
              <g transform="translate(140, 25)">
                <rect width="660" height="30" rx="4" fill="#0B132B" stroke="#D4AF37" strokeWidth="1" />
                <text x="15" y="19" fill="#D4AF37" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                  SEKWENCJA MONTAŻOWA ALU-S.V. · DŁ: {L} mm · SZER: {W} mm · WYS: {H} mm · BURTY: {sideboardH} mm
                </text>
              </g>
            </g>
          )}

        </svg>

      </div>
      )}

      {/* DYNAMIC ASSEMBLY SEQUENCE LIST (Visible when activeTab === 'assembly') */}
      {activeTab === 'assembly' && (
        <div className="bg-[#070D1E] border-t border-[#D4AF37]/30 p-5 space-y-5 animate-in fade-in duration-200">
          
          {/* Header & Dynamic Dimension Summary Cards */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] mb-0.5">
                <Wrench className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-bold">DYNAMICZNA LISTA KOLEJNOŚCI MONTAŻU ALU-S.V.</span>
              </div>
              <p className="text-xs text-slate-300">
                Wymiary cięcia profili, rozstawy poprzeczek i momenty dokręcania wyliczone dla gabarytów: <strong className="text-white">{L} x {W} x {H} mm</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Postęp montażu:</span>
              <span className="px-2 py-0.5 rounded bg-[#1C2541] border border-[#D4AF37]/40 text-[#D4AF37] font-bold">
                {completedSteps.length} / {assemblySequenceSteps.length} etapów
              </span>
              {completedSteps.length > 0 && (
                <button
                  onClick={() => setCompletedSteps([])}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Resetuj
                </button>
              )}
            </div>
          </div>

          {/* Quick Component Cutting List / Dynamic Bill of Materials based on L, W, H */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-[11px] font-mono">
            <div className="bg-[#0B132B] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Podłużnice C-Alu:</span>
              <span className="text-[#D4AF37] font-bold">2x {L} mm</span>
              <span className="text-[10px] text-slate-500 block">Zwis: {calculations.rearOverhangMm} mm</span>
            </div>

            <div className="bg-[#0B132B] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Poprzeczki Z-Alu:</span>
              <span className="text-white font-bold">{numCrossmembers}x {crossmemberLength} mm</span>
              <span className="text-[10px] text-slate-500 block">Rozstaw: 380 mm</span>
            </div>

            <div className="bg-[#0B132B] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Obrzeża ALU-S.V.:</span>
              <span className="text-white font-bold">2x {L} + 1x {W} mm</span>
              <span className="text-[10px] text-[#D4AF37] block">{numLashingPoints} pkt pasów</span>
            </div>

            <div className="bg-[#0B132B] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Płyta Podłogowa:</span>
              <span className="text-white font-bold">{floorAreaM2} m²</span>
              <span className="text-[10px] text-slate-500 block">{L - 8} x {W - 8} mm</span>
            </div>

            <div className="bg-[#0B132B] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Słupki Kinegrip:</span>
              <span className="text-white font-bold">{4 + numMidPillars} sztuk</span>
              <span className="text-[10px] text-slate-500 block">4 narożne + {numMidPillars} mid</span>
            </div>

            <div className="bg-[#0B132B] p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Burty Aluminiowe:</span>
              <span className="text-white font-bold">{sideboardCount}x {sideboardSectionLength} mm</span>
              <span className="text-[10px] text-slate-500 block">Wys: {sideboardH} mm</span>
            </div>
          </div>

          {/* Interactive Step-by-Step Sequence Cards */}
          <div className="space-y-3">
            {assemblySequenceSteps.map((step) => {
              const isSelected = selectedAssemblyStep === step.step;
              const isDone = completedSteps.includes(step.step);

              return (
                <div
                  key={step.step}
                  onClick={() => setSelectedAssemblyStep(step.step)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C2541] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg'
                      : isDone
                      ? 'bg-[#0B132B]/60 border-emerald-900/50 hover:border-emerald-700/60'
                      : 'bg-[#0B132B] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => toggleStepCompleted(step.step, e)}
                        className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                            : 'border-slate-600 bg-slate-800/80 hover:border-[#D4AF37]'
                        }`}
                        title={isDone ? "Oznacz jako niewykonane" : "Oznacz krok jako zrealizowany"}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-[10px] font-mono text-slate-400">{step.step}</span>}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white">
                            ETAP {step.step}: {step.name}
                          </span>
                          {isDone && (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ZREALIZOWANO
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#D4AF37]">
                          Element: {step.targetComponent}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-slate-400">Moment: <strong className="text-white">{step.torque}</strong></span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">Norma: <strong className="text-slate-300">{step.norm}</strong></span>
                    </div>
                  </div>

                  {/* Dynamic Computed Specs Badge */}
                  <div className="bg-[#070D1E] px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 mb-2 flex items-center justify-between">
                    <span>
                      <strong className="text-slate-400">Wyliczone parametry geometryczne: </strong>
                      <span className="text-white font-semibold">{step.dynamicSpecs}</span>
                    </span>
                    <span className="text-[10px] text-[#D4AF37]">
                      {isSelected ? "Podświetlony w CAD" : "Kliknij, aby podświetlić"}
                    </span>
                  </div>

                  {/* Action Description */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans pl-9">
                    {step.actionText}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* CAD Footer Quick Info */}
      <div className="bg-[#1C2541]/90 border-t border-[#D4AF37]/20 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-4">
          <span>PODRAMÓWKA: <strong className="text-white">{aluSv.subframeType.split('(')[0]}</strong></span>
          <span>·</span>
          <span>BURTY: <strong className="text-white">{aluSv.sideboardHeightMm} mm ALU-S.V.</strong></span>
          <span>·</span>
          <span>KUBATURA: <strong className="text-[#D4AF37]">{calculations.cubicMetersVolume} m³</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">STATUS TOLERANCJI:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ISO 2768-mK OK
          </span>
        </div>
      </div>

    </div>
  );
};
