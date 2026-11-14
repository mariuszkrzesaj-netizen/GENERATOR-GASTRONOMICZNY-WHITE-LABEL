import React, { useState } from 'react';
import { 
  BodyWorkType, 
  OemChassis, 
  ParametricCadDimensions, 
  AluSvProfileSystem 
} from '../types/itsMaster';
import { OEM_CHASSIS_DATABASE } from '../data/masterSpecsData';
import { AluSv3dSubframePreview } from './AluSv3dSubframePreview';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Rotate3d, 
  Truck, 
  Layers, 
  Check, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Compass,
  Boxes
} from 'lucide-react';

interface BodyType3dModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBodyType?: BodyWorkType;
  initialChassis?: OemChassis;
  onApplyAndConfigure: (category: BodyWorkType, chassis: OemChassis) => void;
}

interface BodyTypeMeta {
  type: BodyWorkType;
  name: string;
  shortDesc: string;
  badge: string;
  defaultDims: ParametricCadDimensions;
  defaultAluSv: AluSvProfileSystem;
  defaultLiftId: string | null;
  features: string[];
}

const BODY_TYPES_INFO: Record<BodyWorkType, BodyTypeMeta> = {
  curtain_sider: {
    type: 'curtain_sider',
    name: 'Zabudowa Międzynarodowa & Plandeka Firanka',
    shortDesc: 'Firanki dwustronne z naciągiem dźwigniowym, dachy przesuwne Edscha, słupki Kinegrip K20 i burty anodowane ALU-S.V.',
    badge: 'MASTER 1 & 4',
    defaultDims: {
      lengthMm: 4900,
      widthMm: 2250,
      heightMm: 2350,
      subframeHeightMm: 120,
      sideboardThicknessMm: 25,
      roofLiftMm: 300,
      rearOverhangMm: 1200
    },
    defaultAluSv: {
      subframeType: 'Alu-System 120/140 (Lekka rama anodowana)',
      sideboardHeightMm: 400,
      pillarType: 'Kinegrip K20 aluminiowy wypinany',
      edgeProfile: 'ALU-S.V. z otworami mocowania pasów co 100mm (500 daN)',
      flooringMaterial: 'Sklejka brzozowa wodoodporna antypoślizgowa 15mm'
    },
    defaultLiftId: 'dhollandia_dhlm08_750',
    features: [
      'Aluminiowa klatka i sufit z pałąkami co 600 mm',
      'Prowadnice sufitowe Edscha i rurki wzdłużne',
      'Wypinane słupki Kinegrip K20 (120-150 N)',
      'Podłoga brzozowa antypoślizgowa 15mm z dylatacją'
    ]
  },
  isotherm_fridge: {
    type: 'isotherm_fridge',
    name: 'Izoterma & Chłodnia Kontenerowa ATP/FRC',
    shortDesc: 'Bezmostkowe panele PUR 60/85mm ze stopniem K ≤ 0.40, portal tylny ze stali nierdzewnej, winda Dhollandia.',
    badge: 'MASTER 2, 3 & 11',
    defaultDims: {
      lengthMm: 4500,
      widthMm: 2200,
      heightMm: 2200,
      subframeHeightMm: 120,
      sideboardThicknessMm: 25,
      roofLiftMm: 0,
      rearOverhangMm: 1100
    },
    defaultAluSv: {
      subframeType: 'Alu-System 120/140 (Lekka rama anodowana)',
      sideboardHeightMm: 400,
      pillarType: 'Słupki stałe narożne',
      edgeProfile: 'ALU-S.V. z otworami mocowania pasów co 100mm (500 daN)',
      flooringMaterial: 'Panel kompozytowy alu-plast'
    },
    defaultLiftId: 'dhollandia_dhlm08_750',
    features: [
      'Izotermiczna klatka konstrukcyjna PUR/XPS',
      'Ściana przednia z przygotowaniem pod agregat chłodniczy',
      'Wzmocniona rama tylna portalowa pod windę Dhollandia',
      'Szczelny sufit termoizolowany z odpływami skroplin'
    ]
  },
  workshop_van: {
    type: 'workshop_van',
    name: 'Warsztat Mobilny & Van Racking ECE R17',
    shortDesc: 'Zabudowa serwisowa z testem zderzeniowym 20G. Klatka zabezpieczająca, regały modułowe i instalacja Victron 230V.',
    badge: 'MASTER 3 & 12',
    defaultDims: {
      lengthMm: 4200,
      widthMm: 1850,
      heightMm: 1950,
      subframeHeightMm: 80,
      sideboardThicknessMm: 25,
      roofLiftMm: 0,
      rearOverhangMm: 950
    },
    defaultAluSv: {
      subframeType: 'Alu-System 120/140 (Lekka rama anodowana)',
      sideboardHeightMm: 400,
      pillarType: 'Słupki stałe narożne',
      edgeProfile: 'ALU-S.V. z otworami mocowania pasów co 100mm (500 daN)',
      flooringMaterial: 'Sklejka brzozowa wodoodporna antypoślizgowa 15mm'
    },
    defaultLiftId: null,
    features: [
      'Klatka bezpieczeństwa ECE R17 wytrzymująca przeciążenie 20G',
      'Podłoga warsztatowa z wpuszczanymi miskami kotwiczącymi',
      'Aluminiowe słupki pionowe pod system regałowy',
      'Sufit techniczny z oświetleniem LED i kanałami kablowymi'
    ]
  },
  tipper_3way: {
    type: 'tipper_3way',
    name: 'Wywrotka 3-Stronna Hardox 450 (Kipper)',
    shortDesc: 'Stalowa rama wywrotu Hardox 450 z burtami ALU-S.V. i siłownikiem teleskopowym pod kątem 50°/45°.',
    badge: 'MASTER 4 & 8',
    defaultDims: {
      lengthMm: 4100,
      widthMm: 2150,
      heightMm: 1600,
      subframeHeightMm: 140,
      sideboardThicknessMm: 25,
      roofLiftMm: 0,
      rearOverhangMm: 1000
    },
    defaultAluSv: {
      subframeType: 'Stal S355 ocynkowana ogniowo (Heavy-Duty)',
      sideboardHeightMm: 500,
      pillarType: 'Kinegrip stalowy ze wspomaganiem',
      edgeProfile: 'Profil gładki z uchwytami wpuszczanymi',
      flooringMaterial: 'Sklejka 18mm wzmocniona'
    },
    defaultLiftId: null,
    features: [
      'Wzmocniona podramówka kołyskowa ze stali S355 / Hardox',
      'Słupy narożne z automatycznymi zamkami wywrotu',
      'Krata osłonowa ściany przedniej kabiny (dachowa)',
      'Burty uchylne góra/dół z centralnym ryglem'
    ]
  },
  car_transporter: {
    type: 'car_transporter',
    name: 'Autolaweta Pomoc Drogowa ALU-S.V. LOHR',
    shortDesc: 'W 100% aluminiowa platforma z otworowaniem LOHR, pałąkiem aerodynamicznym i wciągarką Superwinch.',
    badge: 'MASTER 4 & 5',
    defaultDims: {
      lengthMm: 5000,
      widthMm: 2150,
      heightMm: 1500,
      subframeHeightMm: 100,
      sideboardThicknessMm: 25,
      roofLiftMm: 0,
      rearOverhangMm: 1250
    },
    defaultAluSv: {
      subframeType: 'Alu-System 120/140 (Lekka rama anodowana)',
      sideboardHeightMm: 400,
      pillarType: 'Słupki stałe narożne',
      edgeProfile: 'ALU-S.V. z otworami mocowania pasów co 100mm (500 daN)',
      flooringMaterial: 'Panel kompozytowy alu-plast'
    },
    defaultLiftId: null,
    features: [
      'Aluminiowa klatka pałąka przedniego (Fly-over) z oświetleniem LED',
      'Ultra lekka podłoga z tłoczonymi otworami LOHR',
      'Podłużnice pochylone o niskim kącie natarcia 9.5°',
      'Centralne łoże wciągarki z mocowaniem 11500 lbs'
    ]
  }
};

// 3 prominent models requested by the user + other OEM models
const FEATURED_CHASSIS_IDS = [
  'ford_transit_350_l3',
  'piaggio_porter_np6_long',
  'renault_master_dci165'
];

export const BodyType3dModal: React.FC<BodyType3dModalProps> = ({
  isOpen,
  onClose,
  initialBodyType = 'curtain_sider',
  initialChassis,
  onApplyAndConfigure
}) => {
  const [selectedBodyType, setSelectedBodyType] = useState<BodyWorkType>(initialBodyType);
  
  // Choose default chassis: prefer Ford Transit, Piaggio Porter NP6 or Renault Master
  const [selectedChassisId, setSelectedChassisId] = useState<string>(() => {
    if (initialChassis) return initialChassis.id;
    return 'ford_transit_350_l3';
  });

  const [activePreset, setActivePreset] = useState<'all' | 'skeleton' | 'floor' | 'roof'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const currentMeta = BODY_TYPES_INFO[selectedBodyType];
  const currentChassis = OEM_CHASSIS_DATABASE.find(c => c.id === selectedChassisId) || OEM_CHASSIS_DATABASE[0];

  // Adjust dimensions dynamically to stay within chosen chassis BBG limits
  const currentDims: ParametricCadDimensions = {
    ...currentMeta.defaultDims,
    lengthMm: Math.min(currentMeta.defaultDims.lengthMm, currentChassis.maxBodyLengthMm),
    widthMm: Math.min(currentMeta.defaultDims.widthMm, currentChassis.maxBodyWidthMm),
    heightMm: Math.min(currentMeta.defaultDims.heightMm, currentChassis.maxBodyHeightMm)
  };

  const handleApply = () => {
    onApplyAndConfigure(selectedBodyType, currentChassis);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`bg-[#0B132B] border border-[#D4AF37]/40 rounded-2xl shadow-2xl flex flex-col w-full transition-all duration-300 ${
          isFullscreen 
            ? 'fixed inset-2 z-50 max-w-none max-h-none h-[calc(100vh-16px)]' 
            : 'max-w-6xl max-h-[94vh] h-[92vh]'
        } overflow-hidden`}
      >
        {/* Top Header */}
        <div className="bg-[#1C2541] border-b border-[#D4AF37]/25 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 text-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0B132B] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Rotate3d className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                  <span>OKNO PODGLĄDU 3D ZABUDOWY & PODWOZIA</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                  OBRÓT 360° · ZOOM · KLATKA · SŁUPY · SUFIT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Wybierz typ zabudowy i przełączaj podwozia (Ford Transit, Piaggio Porter NP6, Renault Master). Kręć modelem myszką lub palcem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title={isFullscreen ? 'Zmniejsz okno' : 'Tryb pełnoekranowy'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors border border-slate-700"
              title="Zamknij okno podglądu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Selector Tabs (5 Bodywork Types) */}
        <div className="bg-[#070D1E] px-4 sm:px-6 py-2.5 border-b border-slate-800 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs font-mono font-semibold text-[#D4AF37] uppercase flex items-center gap-1 mr-1">
              <Boxes className="w-3.5 h-3.5" />
              TYP ZABUDOWY:
            </span>
            {(Object.keys(BODY_TYPES_INFO) as BodyWorkType[]).map((typeKey) => {
              const meta = BODY_TYPES_INFO[typeKey];
              const isSelected = selectedBodyType === typeKey;
              return (
                <button
                  key={typeKey}
                  onClick={() => setSelectedBodyType(typeKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold shadow-md shadow-[#D4AF37]/20 scale-[1.02]'
                      : 'bg-[#1C2541]/70 hover:bg-[#1C2541] text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{meta.name.split('&')[0]}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chassis Selector Bar - FORD TRANSIT, PIAGGIO PORTER NP6, RENAULT MASTER HIGHLIGHTED */}
        <div className="bg-[#0B132B] px-4 sm:px-6 py-2 border-b border-slate-800/80 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
              MODELE AUTA:
            </span>

            {/* Featured 3 requested models */}
            <div className="flex items-center gap-1.5 bg-[#070D1E] p-1 rounded-lg border border-[#D4AF37]/30">
              {OEM_CHASSIS_DATABASE.filter(c => FEATURED_CHASSIS_IDS.includes(c.id)).map(chassis => {
                const isSelected = selectedChassisId === chassis.id;
                return (
                  <button
                    key={chassis.id}
                    onClick={() => setSelectedChassisId(chassis.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{chassis.brand} {chassis.model}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Other OEM Models Dropdown / Toggle */}
            <select
              value={selectedChassisId}
              onChange={(e) => setSelectedChassisId(e.target.value)}
              className="bg-[#1C2541] border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-[#D4AF37]"
            >
              <optgroup label="Wszystkie podwozia bazowe OEM">
                {OEM_CHASSIS_DATABASE.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.model} ({c.gvwKg} kg · rozstaw {c.wheelbaseMm} mm)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Quick preset camera / component buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Widok:</span>
            <button
              onClick={() => setActivePreset('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activePreset === 'all' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Kompletny 3D
            </button>
            <button
              onClick={() => setActivePreset('skeleton')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activePreset === 'skeleton' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Klatka+Słupy
            </button>
            <button
              onClick={() => setActivePreset('floor')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activePreset === 'floor' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Podłoga
            </button>
            <button
              onClick={() => setActivePreset('roof')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                activePreset === 'roof' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Sufit
            </button>
          </div>
        </div>

        {/* Main 3D Viewport Area */}
        <div className="flex-1 relative flex flex-col bg-[#070D1E] min-h-0">
          <AluSv3dSubframePreview
            dimensions={currentDims}
            aluSv={currentMeta.defaultAluSv}
            chassis={currentChassis}
            dhollandiaLiftId={currentMeta.defaultLiftId}
            bodyType={selectedBodyType}
            initialPreset={activePreset}
            className="w-full h-full flex-1 border-0 rounded-none shadow-none"
          />

          {/* Floating Live Dimensions & Specs badge */}
          <div className="absolute top-3 right-3 hidden sm:flex flex-col gap-1.5 pointer-events-none max-w-xs text-right font-mono text-[11px]">
            <div className="bg-[#0B132B]/95 border border-[#D4AF37]/40 p-2.5 rounded-lg shadow-xl backdrop-blur-md">
              <div className="text-[#D4AF37] font-bold text-xs">{currentMeta.name}</div>
              <div className="text-white mt-1">
                {currentDims.lengthMm} × {currentDims.widthMm} × {currentDims.heightMm} mm
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">
                Podwozie: {currentChassis.brand} {currentChassis.model} (DMC: {currentChassis.gvwKg} kg)
              </div>
              <div className="text-emerald-400 font-semibold text-[10px] mt-1 flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Zgodne z {currentChassis.bbgReferenceDoc.split('/')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer with Specifications Summary */}
        <div className="bg-[#1C2541] border-t border-[#D4AF37]/25 px-4 sm:px-6 py-3 flex flex-col gap-2 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>Rotacja 360° myszką / palcem</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Zoom kółkiem myszki (+ / -)</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Słupy, sufit, podłoga i klatka w czasie rzeczywistym</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                Zamknij podgląd
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-[#D4AF37]/25 flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-950" />
                <span>Przejdź do Konfiguratora CAD z tym autem</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-700/60 text-center sm:text-left text-[10px] font-mono text-[#D4AF37]/90">
            Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
          </div>
        </div>

      </div>
    </div>
  );
};
