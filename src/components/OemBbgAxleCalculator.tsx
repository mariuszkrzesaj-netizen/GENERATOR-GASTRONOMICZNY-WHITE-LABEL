import React, { useState, useMemo } from 'react';
import { 
  OemChassis, 
  AxleLoadCalculation, 
  ActiveProjectConfiguration 
} from '../types/itsMaster';
import { 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Compass, 
  Layers,
  FileCheck2,
  XCircle
} from 'lucide-react';
import { OemBbgCogScatterPlot } from './OemBbgCogScatterPlot';
import { IsoAxleWarningModule, SimulationMode, ActiveLoadsSummary } from './IsoAxleWarningModule';

interface OemBbgAxleCalculatorProps {
  chassis: OemChassis;
  calculations: AxleLoadCalculation;
  config: ActiveProjectConfiguration;
  onOpenExportModal: () => void;
}

export const OemBbgAxleCalculator: React.FC<OemBbgAxleCalculatorProps> = ({
  chassis,
  calculations,
  config,
  onOpenExportModal
}) => {
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('nominal');

  // Dynamic simulation values (allows testing overload states and ISO warning module response)
  const activeLoads = useMemo<ActiveLoadsSummary>(() => {
    let frontKg = calculations.fullFrontAxleKg;
    let rearKg = calculations.fullRearAxleKg;
    let totalKg = calculations.totalEmptyWeightKg + calculations.netPayloadCapacityKg;

    if (simulationMode === 'test_rear_overload') {
      const extraRear = 450;
      rearKg += Math.round(extraRear * 1.25);
      frontKg -= Math.round(extraRear * 0.25);
      totalKg += extraRear;
    } else if (simulationMode === 'test_payload_excess') {
      const extraPayload = 700;
      rearKg += Math.round(extraPayload * 0.7);
      frontKg += Math.round(extraPayload * 0.3);
      totalKg += extraPayload;
    } else if (simulationMode === 'test_front_lift') {
      const liftLoad = 650;
      rearKg += Math.round(liftLoad * 1.4);
      frontKg -= Math.round(liftLoad * 0.4);
      totalKg += liftLoad;
    }

    const frontUtilPct = Math.round((frontKg / chassis.maxFrontAxleLoadKg) * 100);
    const rearUtilPct = Math.round((rearKg / chassis.maxRearAxleLoadKg) * 100);
    const steeringPct = Math.round((frontKg / totalKg) * 100);

    const isFrontOverloaded = frontKg > chassis.maxFrontAxleLoadKg;
    const isRearOverloaded = rearKg > chassis.maxRearAxleLoadKg;
    const isSteeringSafe = steeringPct >= 25;
    const isGvwOverloaded = totalKg > calculations.maxLegalGvwKg;
    const isOverhangLegal = calculations.isOverhangLegal;

    const hasAnyOverload = isFrontOverloaded || isRearOverloaded || !isSteeringSafe || isGvwOverloaded || !isOverhangLegal;

    return {
      frontKg,
      rearKg,
      totalKg,
      frontUtilPct,
      rearUtilPct,
      steeringPct,
      isFrontOverloaded,
      isRearOverloaded,
      isSteeringSafe,
      isGvwOverloaded,
      isOverhangLegal,
      hasAnyOverload,
      frontExcessKg: Math.max(0, frontKg - chassis.maxFrontAxleLoadKg),
      rearExcessKg: Math.max(0, rearKg - chassis.maxRearAxleLoadKg),
      steeringDeficitKg: Math.max(0, Math.round(totalKg * 0.25) - frontKg),
      gvwExcessKg: Math.max(0, totalKg - calculations.maxLegalGvwKg)
    };
  }, [calculations, chassis, simulationMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-[#0B132B] border border-[#D4AF37]/30 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] mb-1">
              <Scale className="w-4 h-4 text-[#D4AF37]" />
              <span>SPECYFIKACJA MASTER 2 & 7: OEM BBG & ISO GPS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Kalkulator Rozkładu Mas & Zgodności z DMC
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Weryfikacja nacisków na osie, stateczności osi kierowanej oraz dopuszczalnego zwisu tylnego dla {chassis.brand} {chassis.model}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400">Wytyczne OEM BBG:</span>
            <div className="text-xs font-mono font-semibold text-[#D4AF37]">{chassis.bbgReferenceDoc}</div>
          </div>
        </div>
      </div>

      {/* ISO Axle Load Warning & Monitoring Module */}
      <IsoAxleWarningModule
        chassis={chassis}
        calculations={calculations}
        activeLoads={activeLoads}
        simulationMode={simulationMode}
        onChangeSimulationMode={setSimulationMode}
      />

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: DMC vs Masa Własna */}
        <div className="bg-[#0B132B]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-400 mb-1">DMC (F.2) / MASA WŁASNA (G)</div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-mono font-bold text-white">{calculations.maxLegalGvwKg} kg</span>
            <span className="text-xs font-mono text-slate-400">Pusty: {calculations.totalEmptyWeightKg} kg</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-[#D4AF37] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (calculations.totalEmptyWeightKg / calculations.maxLegalGvwKg) * 100)}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Udział zabudowy: {Math.round((calculations.totalEmptyWeightKg / calculations.maxLegalGvwKg) * 100)}% DMC</span>
            <span className="text-emerald-400">Norma N1/N2</span>
          </div>
        </div>

        {/* KPI 2: Czysta Ładowność Użytkowa */}
        <div className="bg-[#0B132B]/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-400 mb-1">ŁADOWNOŚĆ UŻYTECZNA NETTO</div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-mono font-bold text-emerald-400">{calculations.netPayloadCapacityKg} kg</span>
            <span className="text-xs font-mono text-slate-400">do DMC 3.5t</span>
          </div>
          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            <div>Podwozie: {calculations.totalChassisTareKg} kg</div>
            <div>Zabudowa + Winda: {calculations.bodyWeightKg + calculations.dhollandiaWeightKg} kg</div>
          </div>
        </div>

        {/* KPI 3: Zwis Tylny (ROH) */}
        <div className={`bg-[#0B132B]/90 border rounded-xl p-4 flex flex-col justify-between ${
          calculations.isOverhangLegal ? 'border-slate-800' : 'border-rose-500/50'
        }`}>
          <div className="text-[11px] font-mono text-slate-400 mb-1">ZWIS TYLNY (ROH / WB)</div>
          <div className="flex items-baseline justify-between mb-2">
            <span className={`text-2xl font-mono font-bold ${calculations.isOverhangLegal ? 'text-white' : 'text-rose-400'}`}>
              {calculations.rearOverhangMm} mm
            </span>
            <span className="text-xs font-mono text-slate-400">{calculations.rearOverhangRatioPct}% WB</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {calculations.isOverhangLegal ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zgodny z limitem (&le;60% WB: {calculations.maxAllowedRearOverhangMm}mm)
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Przekroczenie limitu 60% rozstawu osi!
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Oś Kierowana (Kierowalność) */}
        <div className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
          activeLoads.isSteeringSafe 
            ? 'bg-[#0B132B]/90 border-slate-800' 
            : 'bg-rose-950/40 border-2 border-rose-500 ring-2 ring-rose-500/30 shadow-lg shadow-rose-950'
        }`}>
          <div className="text-[11px] font-mono text-slate-400 mb-1">NACISK OSI KIEROWANEJ (MIN. 25%)</div>
          <div className="flex items-baseline justify-between mb-2">
            <span className={`text-2xl font-mono font-bold ${
              activeLoads.isSteeringSafe ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
            }`}>
              {activeLoads.steeringPct}%
            </span>
            <span className="text-xs font-mono text-slate-400">{activeLoads.frontKg} kg</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {activeLoads.isSteeringSafe ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Stateczność kierunkowa zachowana
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" /> Zbyt mały nacisk na przód (&lt;25%)!
              </span>
            )}
          </div>
        </div>

      </div>
      
      {/* Visual Graphical Scatter Plot: Center of Gravity (CoG) & OEM BBG Axle Stability */}
      <OemBbgCogScatterPlot
        chassis={chassis}
        calculations={calculations}
        config={config}
      />

      {/* Detailed Axle Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Front Axle Detail */}
        <div className={`border rounded-xl p-5 space-y-4 transition-all ${
          activeLoads.isFrontOverloaded || !activeLoads.isSteeringSafe
            ? 'bg-rose-950/30 border-2 border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-950/50'
            : 'bg-[#0B132B]/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                activeLoads.isFrontOverloaded || !activeLoads.isSteeringSafe ? 'bg-rose-500 animate-pulse' : 'bg-sky-400'
              }`} />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Oś Przednia (Oś 1 - Kierowana)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {activeLoads.isFrontOverloaded && (
                <span className="text-[10px] font-mono font-bold bg-rose-950 border border-rose-500 text-rose-300 px-2 py-0.5 rounded animate-pulse">
                  ALARM ISO: +{activeLoads.frontExcessKg} kg
                </span>
              )}
              <span className="text-xs font-mono text-slate-400">
                Dopuszczalny (GAWR 1): <strong className="text-white">{chassis.maxFrontAxleLoadKg} kg</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-[#070D1E] p-3 rounded border border-slate-800">
              <span className="text-slate-400 block mb-1">Stan Pusty (Nieobciążony):</span>
              <span className="text-lg font-bold text-white">{calculations.emptyFrontAxleKg} kg</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {Math.round((calculations.emptyFrontAxleKg / chassis.maxFrontAxleLoadKg) * 100)}% GAWR
              </span>
            </div>

            <div className={`p-3 rounded border ${
              activeLoads.isFrontOverloaded 
                ? 'bg-rose-950/60 border-rose-500/80' 
                : 'bg-[#070D1E] border-slate-800'
            }`}>
              <span className="text-slate-400 block mb-1">Stan Pełnego Załadunku:</span>
              <span className={`text-lg font-bold ${activeLoads.isFrontOverloaded ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`}>
                {activeLoads.frontKg} kg
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {activeLoads.frontUtilPct}% GAWR {activeLoads.isFrontOverloaded ? '(PRZEKROCZENIE!)' : ''}
              </span>
            </div>
          </div>

          {/* Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Wykorzystanie nośności osi przedniej:</span>
              <span className={`font-semibold ${activeLoads.isFrontOverloaded ? 'text-rose-400 font-bold' : 'text-white'}`}>
                {activeLoads.frontUtilPct}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  activeLoads.isFrontOverloaded ? 'bg-rose-500' : 'bg-sky-400'
                }`}
                style={{ width: `${Math.min(100, activeLoads.frontUtilPct)}%` }}
              />
            </div>
          </div>

          {/* Diagnostic status block */}
          {activeLoads.isFrontOverloaded ? (
            <div className="text-[11px] font-mono text-rose-300 bg-rose-950/60 p-2.5 rounded border border-rose-500/60 leading-relaxed font-semibold">
              🚨 KRYTYCZNE OSTRZEŻENIE ISO 1176: Oś przednia przekracza dopuszczalny nacisk o {activeLoads.frontExcessKg} kg ({activeLoads.frontUtilPct}% GAWR 1). Ryzyko przeciążenia łożysk kół, zawieszenia McPhersona i uszkodzenia opon.
            </div>
          ) : !activeLoads.isSteeringSafe ? (
            <div className="text-[11px] font-mono text-rose-300 bg-rose-950/60 p-2.5 rounded border border-rose-500/60 leading-relaxed font-semibold">
              🚨 OSTRZEŻENIE ECE R13 / ISO: Zbyt mały nacisk na oś kierowaną ({activeLoads.steeringPct}% &lt; 25%). Deficyt {activeLoads.steeringDeficitKg} kg grozi podsterownością przy hamowaniu awaryjnym.
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-400 bg-[#070D1E] p-2.5 rounded border border-slate-800 leading-relaxed">
              Nacisk na oś przednią pozostaje w bezpiecznym zakresie. Geometria zawieszenia pojazdu nie ulegnie nadmiernemu odciążeniu przy hamowaniu awaryjnym. Zapas nośności: +{chassis.maxFrontAxleLoadKg - activeLoads.frontKg} kg.
            </div>
          )}
        </div>

        {/* Rear Axle Detail */}
        <div className={`border rounded-xl p-5 space-y-4 transition-all ${
          activeLoads.isRearOverloaded
            ? 'bg-rose-950/30 border-2 border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-950/50'
            : 'bg-[#0B132B]/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                activeLoads.isRearOverloaded ? 'bg-rose-500 animate-pulse' : 'bg-[#D4AF37]'
              }`} />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                Oś Tylna (Oś 2 - Napędowa)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {activeLoads.isRearOverloaded && (
                <span className="text-[10px] font-mono font-bold bg-rose-950 border border-rose-500 text-rose-300 px-2 py-0.5 rounded animate-pulse">
                  ALARM ISO: +{activeLoads.rearExcessKg} kg
                </span>
              )}
              <span className="text-xs font-mono text-slate-400">
                Dopuszczalny (GAWR 2): <strong className="text-white">{chassis.maxRearAxleLoadKg} kg</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-[#070D1E] p-3 rounded border border-slate-800">
              <span className="text-slate-400 block mb-1">Stan Pusty (Nieobciążony):</span>
              <span className="text-lg font-bold text-white">{calculations.emptyRearAxleKg} kg</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {Math.round((calculations.emptyRearAxleKg / chassis.maxRearAxleLoadKg) * 100)}% GAWR
              </span>
            </div>

            <div className={`p-3 rounded border ${
              activeLoads.isRearOverloaded 
                ? 'bg-rose-950/60 border-rose-500/80' 
                : 'bg-[#070D1E] border-slate-800'
            }`}>
              <span className="text-slate-400 block mb-1">Stan Pełnego Załadunku:</span>
              <span className={`text-lg font-bold ${activeLoads.isRearOverloaded ? 'text-rose-400 animate-pulse' : 'text-[#D4AF37]'}`}>
                {activeLoads.rearKg} kg
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {activeLoads.rearUtilPct}% GAWR {activeLoads.isRearOverloaded ? '(PRZEKROCZENIE!)' : ''}
              </span>
            </div>
          </div>

          {/* Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Wykorzystanie nośności osi tylnej:</span>
              <span className={`font-semibold ${activeLoads.isRearOverloaded ? 'text-rose-400 font-bold' : 'text-white'}`}>
                {activeLoads.rearUtilPct}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  activeLoads.isRearOverloaded ? 'bg-rose-500' : 'bg-[#D4AF37]'
                }`}
                style={{ width: `${Math.min(100, activeLoads.rearUtilPct)}%` }}
              />
            </div>
          </div>

          {/* Diagnostic status block */}
          {activeLoads.isRearOverloaded ? (
            <div className="text-[11px] font-mono text-rose-300 bg-rose-950/60 p-2.5 rounded border border-rose-500/60 leading-relaxed font-semibold">
              🚨 KRYTYCZNE PRZEKROCZENIE NORMY ISO 1176 / GAWR 2: Oś tylna napędowa przekracza dopuszczalny nacisk o {activeLoads.rearExcessKg} kg ({activeLoads.rearUtilPct}% dopuszczalnego limitu). Ryzyko pęknięcia resorów, zniszczenia ogumienia oraz natychmiastowej utraty homologacji WE.
            </div>
          ) : (
            <div className="text-[11px] font-mono text-slate-400 bg-[#070D1E] p-2.5 rounded border border-slate-800 leading-relaxed">
              {config.dhollandiaLiftId ? (
                <span>
                  Zamontowana winda Dhollandia ({calculations.dhollandiaWeightKg} kg) powoduje dynamiczny moment gnący na tylnym nawisie. Nacisk w normie ({activeLoads.rearUtilPct}% GAWR 2). Zapas: +{chassis.maxRearAxleLoadKg - activeLoads.rearKg} kg.
                </span>
              ) : (
                <span>
                  Równomierny rozkład ładunku gwarantuje brak przeciążenia tylnego mostu napędowego. Zapas nośności do limitu GAWR 2: +{chassis.maxRearAxleLoadKg - activeLoads.rearKg} kg.
                </span>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Bill of Materials & Technical Quote Button */}
      <div className="bg-gradient-to-r from-[#1C2541] to-[#0B132B] border border-[#D4AF37]/30 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#D4AF37] font-semibold mb-1">
            HOMOLOGACJA WE II ETAPU (EU 2018/858)
          </div>
          <div className="text-sm text-slate-200">
            Kompletne dane masowe spełniają kryteria badań homologacyjnych drugiego etapu Nowa Firma.
          </div>
        </div>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap"
        >
          <FileCheck2 className="w-4 h-4 text-slate-950" />
          <span>Generuj Kartę Zlecenia CAD & Zestawienie BOM</span>
        </button>
      </div>

    </div>
  );
};
