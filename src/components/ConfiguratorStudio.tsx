import React, { useState } from 'react';
import { 
  ActiveProjectConfiguration, 
  BodyWorkType, 
  OemChassis, 
  ParametricCadDimensions, 
  AluSvProfileSystem, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { 
  OEM_CHASSIS_DATABASE, 
  DHALLANDIA_LIFTS, 
  MASTER_OPTIONS_CATALOG 
} from '../data/masterSpecsData';
import { CadParametricViewer } from './CadParametricViewer';
import { AluSv3dSubframePreview } from './AluSv3dSubframePreview';
import { 
  Sliders, 
  Truck, 
  Box, 
  Check, 
  Flame, 
  BatteryCharging, 
  HelpCircle,
  AlertCircle,
  Rotate3d,
  Zap,
  Video
} from 'lucide-react';

interface ConfiguratorStudioProps {
  config: ActiveProjectConfiguration;
  calculations: AxleLoadCalculation;
  onChangeCategory: (cat: BodyWorkType) => void;
  onChangeChassis: (chassis: OemChassis) => void;
  onChangeDimensions: (dims: Partial<ParametricCadDimensions>) => void;
  onChangeAluSv: (alu: Partial<AluSvProfileSystem>) => void;
  onChangeDhollandia: (liftId: string | null) => void;
  onToggleOption: (optionId: string) => void;
  onChangeSleeperCab: (cab: 'none' | 'roof_spojkar_aeromax' | 'back_sleeper_lamar') => void;
  onChangeCoolingUnit: (unit: 'none' | 'carrier_citimax_400' | 'thermo_king_v300_max' | 'zanotti_sfz008') => void;
  onColorChange: (hex: string, ralName: string) => void;
  onOpenDhollandiaManual?: () => void;
  onOpenVideoSequence?: () => void;
  onOpen3dModal?: () => void;
  onGenerateDocumentation?: () => void;
}

export const ConfiguratorStudio: React.FC<ConfiguratorStudioProps> = ({
  config,
  calculations,
  onChangeCategory,
  onChangeChassis,
  onChangeDimensions,
  onChangeAluSv,
  onChangeDhollandia,
  onToggleOption,
  onChangeSleeperCab,
  onChangeCoolingUnit,
  onColorChange,
  onOpenDhollandiaManual,
  onOpenVideoSequence,
  onOpen3dModal,
  onGenerateDocumentation
}) => {
  const [show3dPreview, setShow3dPreview] = useState<boolean>(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B132B] p-3 rounded-lg border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#D4AF37] font-semibold">STUDIO CAD 2D/3D:</span>
          <span className="text-white font-bold">{config.chassis.brand} {config.chassis.model}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300">
            {config.selectedBodyType === 'curtain_sider' && 'Zabudowa Międzynarodowa & Plandeka'}
            {config.selectedBodyType === 'isotherm_fridge' && 'Izoterma & Chłodnia ATP/FRC'}
            {config.selectedBodyType === 'workshop_van' && 'Warsztat Mobilny ECE R17'}
            {config.selectedBodyType === 'tipper_3way' && 'Wywrotka 3-Stronna Hardox'}
            {config.selectedBodyType === 'car_transporter' && 'Autolaweta Pomoc Drogowa'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onOpen3dModal && (
            <button
              onClick={onOpen3dModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#D4AF37]/20"
              title="Otwórz pełnoekranowe okno obracalnego modelu 3D (360°)"
            >
              <Rotate3d className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>OKNO PODGLĄDU 3D (360°)</span>
            </button>
          )}

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-slate-400">Ładowność:</span>
            <span className="text-emerald-400 font-bold">
              {calculations.netPayloadCapacityKg} kg
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">DMC:</span>
            <span className="text-white font-bold">{calculations.maxLegalGvwKg} kg</span>
          </div>
        </div>
      </div>

      {/* Quick Model Selector: Ford Transit, Piaggio Porter NP6, Renault Master */}
      <div className="bg-[#0B132B]/80 border border-slate-800/80 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-slate-300 font-bold">SZYBKIE PRZEŁĄCZANIE MODELI BUSA:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ford_transit_350_l3', name: 'Ford Transit 350 L3', brand: 'Ford' },
            { id: 'piaggio_porter_np6_long', name: 'Piaggio Porter NP6 L2', brand: 'Piaggio' },
            { id: 'renault_master_dci165', name: 'Renault Master dCi 165', brand: 'Renault' },
            { id: 'iveco_daily_35s18', name: 'Iveco Daily 35S18', brand: 'Iveco' },
            { id: 'mercedes_sprinter_319_cdi', name: 'Mercedes Sprinter 319', brand: 'Mercedes-Benz' }
          ].map(m => {
            const isCurrent = config.chassis.id === m.id;
            const targetChassis = OEM_CHASSIS_DATABASE.find(c => c.id === m.id);
            if (!targetChassis) return null;
            return (
              <button
                key={m.id}
                onClick={() => onChangeChassis(targetChassis)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-sm'
                    : 'bg-[#1C2541]/70 hover:bg-[#1C2541] text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{m.name}</span>
                {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive CAD Blueprint Canvas */}
      <CadParametricViewer
        chassis={config.chassis}
        dimensions={config.dimensions}
        aluSv={config.aluSv}
        bodyType={config.selectedBodyType}
        dhollandiaLiftId={config.dhollandiaLiftId}
        curtainColorHex={config.curtainColorHex}
        sleeperCab={config.sleeperCab}
        coolingUnit={config.coolingUnit}
        calculations={calculations}
        onColorChange={onColorChange}
        onGenerateDocumentation={onGenerateDocumentation}
      />

      {/* 3D Complete Bodywork & Bus Skeleton Simulation Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center gap-1.5">
              <Rotate3d className="w-4 h-4 text-[#D4AF37]" />
              Kompletny Szkielet 3D Zabudowy & Busa (Rama, Poprzeczki Podłogi, Słupy, Dach)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              {config.aluSv.subframeType.includes('Alu') ? 'Profil C-Alu 120/140' : 'Stal S355 HD'} · Kinegrip K20 · Dach Edscha
            </span>
          </div>

          <button
            onClick={() => setShow3dPreview(!show3dPreview)}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 bg-[#0B132B] px-3 py-1 rounded-md border border-slate-800 hover:border-[#D4AF37]/40 transition-colors"
          >
            <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{show3dPreview ? 'Zwiń Szkielet 3D' : 'Rozwiń Szkielet 3D (Rama, Słupy, Dach)'}</span>
          </button>
        </div>

        {show3dPreview && (
          <AluSv3dSubframePreview
            dimensions={config.dimensions}
            aluSv={config.aluSv}
            chassis={config.chassis}
            dhollandiaLiftId={config.dhollandiaLiftId}
            bodyType={config.selectedBodyType}
          />
        )}
      </div>

      {/* Parametric Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: Dimensions & Subframe Structure */}
        <div className="bg-[#0B132B]/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              1. Wymiary Parametryczne & Rama
            </h3>
          </div>

          {/* Body Length */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Długość Zewnętrzna (L):</span>
              <span className="text-[#D4AF37] font-bold">{config.dimensions.lengthMm} mm</span>
            </div>
            <input
              type="range"
              min="3600"
              max={config.chassis.maxBodyLengthMm}
              step="50"
              value={config.dimensions.lengthMm}
              onChange={(e) => onChangeDimensions({ lengthMm: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>Min: 3600 mm</span>
              <span>Max BBG: {config.chassis.maxBodyLengthMm} mm</span>
            </div>
          </div>

          {/* Body Width */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Szerokość Zewnętrzna (W):</span>
              <span className="text-[#D4AF37] font-bold">{config.dimensions.widthMm} mm</span>
            </div>
            <input
              type="range"
              min="2000"
              max={config.chassis.maxBodyWidthMm}
              step="20"
              value={config.dimensions.widthMm}
              onChange={(e) => onChangeDimensions({ widthMm: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>Standard: 2200 mm</span>
              <span>Max: {config.chassis.maxBodyWidthMm} mm</span>
            </div>
          </div>

          {/* Internal Height */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300">Wysokość Wewnętrzna (H):</span>
              <span className="text-[#D4AF37] font-bold">{config.dimensions.heightMm} mm</span>
            </div>
            <input
              type="range"
              min="1900"
              max={config.chassis.maxBodyHeightMm}
              step="50"
              value={config.dimensions.heightMm}
              onChange={(e) => onChangeDimensions({ heightMm: Number(e.target.value) })}
              className="w-full accent-[#D4AF37] bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>1900 mm</span>
              <span>Max: {config.chassis.maxBodyHeightMm} mm</span>
            </div>
          </div>

          {/* Roof Elevation System (for Curtain Sider) */}
          {config.selectedBodyType === 'curtain_sider' && (
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-mono text-slate-300 mb-2">
                Regulacja Wysokości Dachu (+ mm):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 150, 300].map((lift) => (
                  <button
                    key={lift}
                    onClick={() => onChangeDimensions({ roofLiftMm: lift })}
                    className={`px-2.5 py-1.5 text-xs font-mono rounded border transition-all ${
                      config.dimensions.roofLiftMm === lift
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lift === 0 ? 'Stały dach' : `+${lift} mm`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subframe Type Selection (ALU-S.V. vs Steel S355) */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-mono text-slate-300 mb-2">
              Typ Ramy Pośredniej:
            </label>
            <div className="space-y-2">
              <button
                onClick={() => onChangeAluSv({ subframeType: 'Alu-System 120/140 (Lekka rama anodowana)' })}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  config.aluSv.subframeType.includes('Alu-System')
                    ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">Alu-System 120/140 (ALU-S.V.)</div>
                  <div className="text-[10px] text-slate-400">Ultralekka rama, oszczędność ~95 kg masy</div>
                </div>
                {config.aluSv.subframeType.includes('Alu-System') && (
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                )}
              </button>

              <button
                onClick={() => onChangeAluSv({ subframeType: 'Stal S355 ocynkowana ogniowo (Heavy-Duty)' })}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  config.aluSv.subframeType.includes('Stal S355')
                    ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">Stal S355 Cynkowana Ogniowo</div>
                  <div className="text-[10px] text-slate-400">Do ciężkich ładunków punktowych i wind</div>
                </div>
                {config.aluSv.subframeType.includes('Stal S355') && (
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                )}
              </button>
            </div>

            {/* Quick 3D status & shortcut in Column 1 */}
            <div className="pt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Symulator 3D: <strong className="text-white">{config.dimensions.lengthMm} x {config.dimensions.widthMm} mm</strong></span>
              </span>
              <button
                onClick={() => setShow3dPreview(true)}
                className="text-[#D4AF37] hover:underline"
              >
                {show3dPreview ? 'Aktywny na górze' : 'Pokaż 3D'}
              </button>
            </div>
          </div>

        </div>

        {/* COLUMN 2: Dhollandia Lift & Loading Equipment */}
        <div className="bg-[#0B132B]/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Box className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              2. Winda Dhollandia & Aerodynamika
            </h3>
          </div>

          {/* Dhollandia Tail Lift Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300">
                Winda Samozaładowcza Dhollandia:
              </label>
              <span className="text-[10px] font-mono text-[#D4AF37]">Zderzak R58.03</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onChangeDhollandia(null)}
                className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  config.dhollandiaLiftId === null
                    ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>Brak windy (Drzwi standard / klapa)</span>
                {config.dhollandiaLiftId === null && <Check className="w-4 h-4 text-[#D4AF37]" />}
              </button>

              {DHALLANDIA_LIFTS.map((lift) => (
                <button
                  key={lift.id}
                  onClick={() => onChangeDhollandia(lift.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                    config.dhollandiaLiftId === lift.id
                      ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white">{lift.model}</div>
                    <div className="text-[10px] text-slate-400">
                      Masa: {lift.weightKg} kg · Udźwig: {lift.capacityKg} kg · +{lift.pricePln.toLocaleString('pl-PL')} PLN
                    </div>
                  </div>
                  {config.dhollandiaLiftId === lift.id && <Check className="w-4 h-4 text-[#D4AF37]" />}
                </button>
              ))}
            </div>

            {config.dhollandiaLiftId && (
              <div className="mt-2 space-y-2">
                <div className="p-2 bg-[#070D1E] rounded border border-slate-800 text-[10px] font-mono text-slate-400">
                  Winda dociąża tylną oś o ok. {Math.round(calculations.dhollandiaWeightKg * 1.35)} kg (ramię dźwigni za osią).
                </div>

                {onOpenDhollandiaManual && (
                  <button
                    onClick={onOpenDhollandiaManual}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#1C2541] hover:bg-[#253256] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-mono transition-all hover:border-[#D4AF37] shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Schemat Elektryczny 12V & Montaż</span>
                  </button>
                )}

                {onOpenVideoSequence && (
                  <button
                    onClick={onOpenVideoSequence}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-500/50 text-xs font-mono transition-all hover:border-purple-400 shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span>Wideo Montażu Veo (Animacja 3D)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sleeper Cab Selection */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-mono text-slate-300 mb-2">
              Kabina Sypialna / Owiewka Dachowa:
            </label>
            <div className="space-y-2">
              <button
                onClick={() => onChangeSleeperCab('none')}
                className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  config.sleeperCab === 'none'
                    ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span>Brak kabiny sypialnej (Spoiler standard)</span>
                {config.sleeperCab === 'none' && <Check className="w-4 h-4 text-[#D4AF37]" />}
              </button>

              <button
                onClick={() => onChangeSleeperCab('roof_spojkar_aeromax')}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  config.sleeperCab === 'roof_spojkar_aeromax'
                    ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">Kabina Dachowa Spojkar Aeromax</div>
                  <div className="text-[10px] text-slate-400">85 kg · Materac 200x80 · Izolacja termiczna · +9 800 PLN</div>
                </div>
                {config.sleeperCab === 'roof_spojkar_aeromax' && <Check className="w-4 h-4 text-[#D4AF37]" />}
              </button>

              <button
                onClick={() => onChangeSleeperCab('back_sleeper_lamar')}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  config.sleeperCab === 'back_sleeper_lamar'
                    ? 'bg-[#1C2541] border-[#D4AF37] text-white'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-white">Kabina Tylna Backsleeper (Za fotelami)</div>
                  <div className="text-[10px] text-slate-400">145 kg · 2 łóżka · Wysoka ergonomia · +18 500 PLN</div>
                </div>
                {config.sleeperCab === 'back_sleeper_lamar' && <Check className="w-4 h-4 text-[#D4AF37]" />}
              </button>
            </div>
          </div>

          {/* Refrigeration Unit (for Isotherm/Fridge) */}
          {config.selectedBodyType === 'isotherm_fridge' && (
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-mono text-slate-300 mb-2">
                Agregat Chłodniczy (ATP/FRC):
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'carrier_citimax_400', name: 'Carrier Citimax 400 (do -20°C FRC)', price: '18 900 PLN' },
                  { id: 'thermo_king_v300_max', name: 'Thermo King V-300 Max (Zasilanie 230V)', price: '21 200 PLN' },
                  { id: 'none', name: 'Tylko izolacja pasywna (bez agregatu)', price: '0 PLN' }
                ].map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => onChangeCoolingUnit(unit.id as any)}
                    className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                      config.coolingUnit === unit.id
                        ? 'bg-[#1C2541] border-sky-400 text-sky-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{unit.name}</span>
                    <span className="text-[10px] text-slate-400">{unit.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* COLUMN 3: Options, Heating, Suspension & Accessories */}
        <div className="bg-[#0B132B]/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              3. Zabezpieczenie Ładunku & Osprzęt
            </h3>
          </div>

          <div className="space-y-2">
            {MASTER_OPTIONS_CATALOG.map((opt) => {
              const isSelected = config.selectedOptions.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => onToggleOption(opt.id)}
                  className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow-sm'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>{opt.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-5">
                      {opt.description}
                    </div>
                    <div className="text-[9px] font-mono text-[#D4AF37] pl-5">
                      {opt.standardNorm} · +{opt.weightKg} kg
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap text-xs font-bold text-white pt-0.5">
                    +{opt.pricePln.toLocaleString('pl-PL')} PLN
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
