import React from 'react';
import { 
  OemChassis, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { 
  AlertOctagon, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal, 
  RotateCcw, 
  Wrench, 
  Info,
  Scale,
  FileWarning
} from 'lucide-react';

export type SimulationMode = 
  | 'nominal' 
  | 'test_rear_overload' 
  | 'test_payload_excess' 
  | 'test_front_lift';

export interface ActiveLoadsSummary {
  frontKg: number;
  rearKg: number;
  totalKg: number;
  frontUtilPct: number;
  rearUtilPct: number;
  steeringPct: number;
  isFrontOverloaded: boolean;
  isRearOverloaded: boolean;
  isSteeringSafe: boolean;
  isGvwOverloaded: boolean;
  isOverhangLegal: boolean;
  hasAnyOverload: boolean;
  frontExcessKg: number;
  rearExcessKg: number;
  steeringDeficitKg: number;
  gvwExcessKg: number;
}

interface IsoAxleWarningModuleProps {
  chassis: OemChassis;
  calculations: AxleLoadCalculation;
  activeLoads: ActiveLoadsSummary;
  simulationMode: SimulationMode;
  onChangeSimulationMode: (mode: SimulationMode) => void;
}

export const IsoAxleWarningModule: React.FC<IsoAxleWarningModuleProps> = ({
  chassis,
  calculations,
  activeLoads,
  simulationMode,
  onChangeSimulationMode
}) => {
  const isViolated = activeLoads.hasAnyOverload;

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden shadow-2xl ${
      isViolated
        ? 'border-2 border-rose-500 bg-gradient-to-r from-[#3B0712] via-[#24060C] to-[#120205] ring-2 ring-rose-500/30'
        : 'border border-emerald-500/40 bg-gradient-to-r from-[#062419] via-[#091C26] to-[#0B132B]'
    }`}>
      
      {/* Top Banner Header */}
      <div className={`p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isViolated ? 'border-rose-500/40 bg-rose-950/40' : 'border-emerald-500/20 bg-emerald-950/20'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-lg border mt-0.5 ${
            isViolated 
              ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-950 animate-pulse' 
              : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
          }`}>
            {isViolated ? (
              <AlertOctagon className="w-6 h-6 text-white" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider mb-1">
              <span className={isViolated ? 'text-rose-400' : 'text-emerald-400'}>
                {isViolated 
                  ? '🚨 KRYTYCZNY ALARM HOMOLOGACYJNY: PRZEKROCZENIE NORM ISO & OEM BBG'
                  : '✅ STATUS HOMOLOGACJI WE: NACISKI OSIOWE ZGODNE Z NORMAMI ISO'}
              </span>
              <span className="text-slate-400 text-[10px] hidden sm:inline">· ISO 1176 / ISO 2631 / ECE R13</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isViolated 
                ? 'Wykryto niedozwolone przeciążenie osi lub utratę stateczności kierunkowej!'
                : `Rozkład mas pojazdu ${chassis.brand} ${chassis.model} w pełni spełnia kryteria bezpieczeństwa.`}
            </h3>

            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {isViolated 
                ? 'Wyliczona konfiguracja narusza dopuszczalne limity obciążeń osiowych lub proporcji kierowalności. Eksploatacja w tym stanie grozi uszkodzeniem zawieszenia, odmową wydania homologacji drugiego etapu (EU 2018/858) oraz negatywnym wynikiem badań technicznych.'
                : `Wszystkie naciski na oś przednią (GAWR 1: ${chassis.maxFrontAxleLoadKg} kg) oraz tylną (GAWR 2: ${chassis.maxRearAxleLoadKg} kg) pozostają w bezpiecznych granicach tolerancji OEM Body Builder Guidelines (${chassis.bbgReferenceDoc}).`}
            </p>
          </div>
        </div>

        {/* Simulation Scenario Selector */}
        <div className="bg-[#070D1E]/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between min-w-[260px]">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-bold text-slate-300">
              <SlidersHorizontal className="w-3 h-3 text-[#D4AF37]" />
              TRYB TESTOWANIA NORM ISO:
            </span>
            {simulationMode !== 'nominal' && (
              <button
                onClick={() => onChangeSimulationMode('nominal')}
                className="text-xs text-amber-400 hover:text-white flex items-center gap-0.5"
                title="Wróć do obliczeń nominalnych"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <button
              onClick={() => onChangeSimulationMode('nominal')}
              className={`px-2 py-1.5 rounded border text-left transition-all ${
                simulationMode === 'nominal'
                  ? 'bg-[#1C2541] border-[#D4AF37] text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              1. Nominalny (100% DMC)
            </button>

            <button
              onClick={() => onChangeSimulationMode('test_rear_overload')}
              className={`px-2 py-1.5 rounded border text-left transition-all ${
                simulationMode === 'test_rear_overload'
                  ? 'bg-rose-900/60 border-rose-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300'
              }`}
            >
              2. Test: Przeciążenie Tyłu (+450kg)
            </button>

            <button
              onClick={() => onChangeSimulationMode('test_payload_excess')}
              className={`px-2 py-1.5 rounded border text-left transition-all ${
                simulationMode === 'test_payload_excess'
                  ? 'bg-rose-900/60 border-rose-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300'
              }`}
            >
              3. Test: Nadmiar DMC (+700kg)
            </button>

            <button
              onClick={() => onChangeSimulationMode('test_front_lift')}
              className={`px-2 py-1.5 rounded border text-left transition-all ${
                simulationMode === 'test_front_lift'
                  ? 'bg-rose-900/60 border-rose-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-300'
              }`}
            >
              4. Test: Odciążenie Przodu (Winda)
            </button>
          </div>
        </div>

      </div>

      {/* 4 Diagnostic Metric Cards (Automatycznie świecące na czerwono przy przekroczeniu) */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* CARD 1: Oś Przednia (GAWR 1 / ISO 1176) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          activeLoads.isFrontOverloaded
            ? 'bg-rose-950/70 border-2 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950'
            : 'bg-[#070D1E]/90 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>OŚ 1: PRZÓD (GAWR 1)</span>
              {activeLoads.isFrontOverloaded ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> PRZEKROCZONY
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-2xl font-mono font-bold ${
                activeLoads.isFrontOverloaded ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}>
                {activeLoads.frontKg} kg
              </span>
              <span className="text-xs font-mono text-slate-400">
                Limit: {chassis.maxFrontAxleLoadKg} kg
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-300 ${
                  activeLoads.isFrontOverloaded ? 'bg-rose-500' : 'bg-sky-400'
                }`}
                style={{ width: `${Math.min(100, activeLoads.frontUtilPct)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] font-mono pt-2 border-t border-slate-800/80">
            {activeLoads.isFrontOverloaded ? (
              <div className="text-rose-300 font-bold flex items-center gap-1">
                <span>+ {activeLoads.frontExcessKg} kg ({activeLoads.frontUtilPct}% GAWR 1)</span>
              </div>
            ) : (
              <div className="text-emerald-400 flex items-center gap-1">
                <span>Zapas: + {chassis.maxFrontAxleLoadKg - activeLoads.frontKg} kg do limitu</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: Oś Tylna (GAWR 2 / ISO 1176) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          activeLoads.isRearOverloaded
            ? 'bg-rose-950/70 border-2 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950'
            : 'bg-[#070D1E]/90 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>OŚ 2: TYŁ NAPĘD (GAWR 2)</span>
              {activeLoads.isRearOverloaded ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> PRZEKROCZONY
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNY
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-2xl font-mono font-bold ${
                activeLoads.isRearOverloaded ? 'text-rose-400 animate-pulse' : 'text-[#D4AF37]'
              }`}>
                {activeLoads.rearKg} kg
              </span>
              <span className="text-xs font-mono text-slate-400">
                Limit: {chassis.maxRearAxleLoadKg} kg
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-300 ${
                  activeLoads.isRearOverloaded ? 'bg-rose-500' : 'bg-[#D4AF37]'
                }`}
                style={{ width: `${Math.min(100, activeLoads.rearUtilPct)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] font-mono pt-2 border-t border-slate-800/80">
            {activeLoads.isRearOverloaded ? (
              <div className="text-rose-300 font-bold flex items-center gap-1">
                <span>+ {activeLoads.rearExcessKg} kg ({activeLoads.rearUtilPct}% GAWR 2)</span>
              </div>
            ) : (
              <div className="text-emerald-400 flex items-center gap-1">
                <span>Zapas: + {chassis.maxRearAxleLoadKg - activeLoads.rearKg} kg do limitu</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: Kierowalność Osi 1 (min. 25% DMC / ECE R13 & ISO 2631) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          !activeLoads.isSteeringSafe
            ? 'bg-rose-950/70 border-2 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950'
            : 'bg-[#070D1E]/90 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>STATECZNOŚĆ (MIN. 25% DMC)</span>
              {!activeLoads.isSteeringSafe ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> ODCIĄŻENIE
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> BEZPIECZNA
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-2xl font-mono font-bold ${
                !activeLoads.isSteeringSafe ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}>
                {activeLoads.steeringPct}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                Wymóg: &ge; 25.0%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-300 ${
                  !activeLoads.isSteeringSafe ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (activeLoads.steeringPct / 35) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] font-mono pt-2 border-t border-slate-800/80">
            {!activeLoads.isSteeringSafe ? (
              <div className="text-rose-300 font-bold flex items-center gap-1">
                <span>Deficyt: {activeLoads.steeringDeficitKg} kg poniżej 25% DMC</span>
              </div>
            ) : (
              <div className="text-emerald-400 flex items-center gap-1">
                <span>{activeLoads.frontKg} kg na osi przedniej (Bezpieczna)</span>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: Zwis Tylny ROH (&le; 60% WB) */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
          !activeLoads.isOverhangLegal
            ? 'bg-rose-950/70 border-2 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950'
            : 'bg-[#070D1E]/90 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>ZWIS TYLNY (ROH / WB)</span>
              {!activeLoads.isOverhangLegal ? (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> LIMIT 60%
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> W NORMIE
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-2xl font-mono font-bold ${
                !activeLoads.isOverhangLegal ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}>
                {calculations.rearOverhangMm} mm
              </span>
              <span className="text-xs font-mono text-slate-400">
                Max: {calculations.maxAllowedRearOverhangMm} mm
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-300 ${
                  !activeLoads.isOverhangLegal ? 'bg-rose-500' : 'bg-slate-400'
                }`}
                style={{ width: `${Math.min(100, (calculations.rearOverhangRatioPct / 60) * 100)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] font-mono pt-2 border-t border-slate-800/80">
            {!activeLoads.isOverhangLegal ? (
              <div className="text-rose-300 font-bold flex items-center gap-1">
                <span>Przekroczenie: {calculations.rearOverhangRatioPct}% WB (&gt;60%)</span>
              </div>
            ) : (
              <div className="text-emerald-400 flex items-center gap-1">
                <span>{calculations.rearOverhangRatioPct}% rozstawu osi (Zgodny z BBG)</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Actionable Engineering Remediation Guidance (Gdy występuje błąd) */}
      {isViolated && (
        <div className="mx-5 mb-5 p-4 rounded-xl bg-[#1F040A] border border-rose-500/60 text-xs font-mono space-y-2.5">
          <div className="flex items-center gap-2 text-rose-300 font-bold">
            <Wrench className="w-4 h-4 text-rose-400" />
            <span>ZALECENIA KORYGUJĄCE NOWA FIRMA DLA ODZYSKANIA ZGODNOŚCI Z HOMOLOGACJĄ WE:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            {activeLoads.isRearOverloaded && (
              <div className="bg-rose-950/40 p-2.5 rounded border border-rose-500/40">
                <strong className="text-white block mb-0.5">1. Korekta Nacisku Tylnego Mostu:</strong>
                Przekroczenie o <span className="text-rose-400 font-bold">{activeLoads.rearExcessKg} kg</span> wymaga skrócenia długości zabudowy L lub zastosowania ultralekkiej ramy podłogi <strong className="text-white">Alu-System 120/140</strong> (redukcja masy o ok. 70 kg). W przypadku windy Dhollandia zamontuj zestaw wzmocnionego zawieszenia pneumatycznego 2-obwodowego.
              </div>
            )}

            {!activeLoads.isSteeringSafe && (
              <div className="bg-rose-950/40 p-2.5 rounded border border-rose-500/40">
                <strong className="text-white block mb-0.5">2. Odzyskanie Kierowalności Osi Przedniej (&ge;25% DMC):</strong>
                Deficyt nacisku przodu wynosi <span className="text-rose-400 font-bold">{activeLoads.steeringDeficitKg} kg</span>. Zmniejsz długość zwisu tylnego (ROH) lub przesuń środek ciężkości ładunku i akcesoria w stronę ściany grodziowej kabiny.
              </div>
            )}

            {activeLoads.isFrontOverloaded && (
              <div className="bg-rose-950/40 p-2.5 rounded border border-rose-500/40">
                <strong className="text-white block mb-0.5">3. Odciążenie Osi Przedniej (GAWR 1):</strong>
                Oś 1 przekroczona o <span className="text-rose-400 font-bold">{activeLoads.frontExcessKg} kg</span>. Skoryguj położenie agregatu chłodniczego lub kabiny sypialnej górnej Aeromax.
              </div>
            )}

            {!activeLoads.isOverhangLegal && (
              <div className="bg-rose-950/40 p-2.5 rounded border border-rose-500/40">
                <strong className="text-white block mb-0.5">4. Skrócenie Zwis Tylnego:</strong>
                Zwis {calculations.rearOverhangMm} mm przekracza limit 60% WB ({calculations.maxAllowedRearOverhangMm} mm). Skróć długość zabudowy w parametrach CAD lub wybierz podwozie o dłuższym rozstawie osi.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
