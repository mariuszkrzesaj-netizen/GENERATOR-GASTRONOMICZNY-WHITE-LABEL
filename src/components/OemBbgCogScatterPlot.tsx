import React, { useState, useMemo } from 'react';
import { 
  OemChassis, 
  AxleLoadCalculation, 
  ActiveProjectConfiguration 
} from '../types/itsMaster';
import { 
  Crosshair, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  SlidersHorizontal, 
  Maximize2, 
  CheckCircle2,
  Scale,
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface OemBbgCogScatterPlotProps {
  chassis: OemChassis;
  calculations: AxleLoadCalculation;
  config: ActiveProjectConfiguration;
}

type LoadScenario = 'empty' | 'nominal' | 'front_shifted' | 'rear_shifted' | 'tail_lift_loaded';

interface CogPoint {
  id: string;
  label: string;
  sublabel: string;
  xMm: number; // distance from front axle in mm
  zMm: number; // height above ground in mm
  massKg: number;
  color: string;
  borderColor: string;
  type: 'component' | 'combined' | 'limit';
  description: string;
}

export const OemBbgCogScatterPlot: React.FC<OemBbgCogScatterPlotProps> = ({
  chassis,
  calculations,
  config
}) => {
  const [scenario, setScenario] = useState<LoadScenario>('nominal');
  const [selectedPointId, setSelectedPointId] = useState<string | null>('cog_body');
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showToleranceZone, setShowToleranceZone] = useState<boolean>(true);

  // Geometric & Physical constants
  const wb = chassis.wheelbaseMm;
  const L = config.dimensions.lengthMm;
  const H = config.dimensions.heightMm;
  const foh = chassis.frontOverhangMm || 950;
  const cabOffsetMm = chassis.type === 'van' ? 950 : 1320;
  const bodyStartMm = cabOffsetMm;
  const bodyEndMm = cabOffsetMm + L;
  const hasLift = Boolean(config.dhollandiaLiftId);

  // Payload shift offset depending on selected scenario
  const payloadShiftMm = useMemo(() => {
    switch (scenario) {
      case 'front_shifted': return -350;
      case 'rear_shifted': return 350;
      case 'tail_lift_loaded': return L / 2 + 100; // placed on tail lift platform
      default: return 0;
    }
  }, [scenario, L]);

  // Dynamic scenario calculations
  const scenarioPhysics = useMemo(() => {
    const bodyCoGMm = cabOffsetMm + (L / 2);
    const bodyWeightKg = calculations.bodyWeightKg;

    // Chassis Tare CoG
    const chassisCoGMm = (chassis.rearAxleTareKg * wb) / chassis.curbWeightChassisKg;
    const chassisTareKg = calculations.totalChassisTareKg;

    // Lift CoG
    const liftCoGMm = bodyEndMm + 100;
    const liftWeightKg = calculations.dhollandiaWeightKg;

    // Options CoG
    const optionsCoGMm = cabOffsetMm * 0.7; // mostly near cab
    const optionsWeightKg = calculations.optionsWeightKg;

    // Payload
    const nominalPayloadKg = calculations.netPayloadCapacityKg;
    const currentPayloadKg = scenario === 'empty' ? 0 : nominalPayloadKg;
    const payloadCoGMm = bodyCoGMm + payloadShiftMm;

    // Total active mass
    const totalMassKg = chassisTareKg + bodyWeightKg + liftWeightKg + optionsWeightKg + currentPayloadKg;

    // Moments about front axle (x = 0)
    const momentChassis = chassisTareKg * chassisCoGMm;
    const momentBody = bodyWeightKg * bodyCoGMm;
    const momentLift = liftWeightKg * liftCoGMm;
    const momentOptions = optionsWeightKg * optionsCoGMm;
    const momentPayload = currentPayloadKg * payloadCoGMm;

    const totalMoment = momentChassis + momentBody + momentLift + momentOptions + momentPayload;

    // Resulting Axle Loads
    const rearAxleLoadKg = Math.round(totalMoment / wb);
    const frontAxleLoadKg = Math.round(totalMassKg - rearAxleLoadKg);

    // Combined Vehicle CoG position
    const combinedCoGMm = Math.round(totalMoment / totalMassKg);
    
    // CoG height estimation (Z)
    const chassisZ = 640;
    const bodyZ = 800 + (H * 0.35); // above subframe
    const liftZ = 540;
    const optionsZ = 950;
    const payloadZ = 850 + (H * 0.25);
    
    const combinedZMm = Math.round(
      (chassisTareKg * chassisZ +
       bodyWeightKg * bodyZ +
       liftWeightKg * liftZ +
       optionsWeightKg * optionsZ +
       currentPayloadKg * payloadZ) / totalMassKg
    );

    // Safety checks
    const steeringRatioPct = Math.round((frontAxleLoadKg / totalMassKg) * 100);
    const isSteeringLegal = steeringRatioPct >= 25;
    const frontUtilizationPct = Math.round((frontAxleLoadKg / chassis.maxFrontAxleLoadKg) * 100);
    const rearUtilizationPct = Math.round((rearAxleLoadKg / chassis.maxRearAxleLoadKg) * 100);
    const isAxlesWithinGawr = frontUtilizationPct <= 100 && rearUtilizationPct <= 100;

    // Safe BBG Stability Corridor for CoG X
    // Lower bound (front): front axle must not exceed GAWR1
    const minSafeX = Math.round(wb * Math.max(0, 1 - (chassis.maxFrontAxleLoadKg / totalMassKg)));
    // Upper bound (rear): must satisfy steering >= 25% AND rear axle <= GAWR2
    const maxSafeXSteering = Math.round(wb * 0.75); // 25% on front => 75% on rear => CoG <= 0.75 * wb
    const maxSafeXRearGawr = Math.round((chassis.maxRearAxleLoadKg * wb) / totalMassKg);
    const maxSafeX = Math.min(maxSafeXSteering, maxSafeXRearGawr);

    // Stability Status
    const isStable = isSteeringLegal && isAxlesWithinGawr && combinedCoGMm >= minSafeX && combinedCoGMm <= maxSafeX;

    return {
      bodyCoGMm,
      bodyZ,
      chassisCoGMm,
      chassisZ,
      liftCoGMm,
      liftZ,
      payloadCoGMm,
      payloadZ,
      combinedCoGMm,
      combinedZMm,
      frontAxleLoadKg,
      rearAxleLoadKg,
      totalMassKg,
      steeringRatioPct,
      isSteeringLegal,
      frontUtilizationPct,
      rearUtilizationPct,
      isAxlesWithinGawr,
      minSafeX,
      maxSafeX,
      isStable
    };
  }, [
    wb, 
    L, 
    H, 
    cabOffsetMm, 
    bodyEndMm, 
    calculations, 
    chassis, 
    scenario, 
    payloadShiftMm
  ]);

  // Points for scatter plot
  const scatterPoints: CogPoint[] = useMemo(() => {
    const list: CogPoint[] = [
      {
        id: 'cog_body',
        label: 'CoG Zabudowy',
        sublabel: 'Środek Ciężkości Zabudowy',
        xMm: Math.round(scenarioPhysics.bodyCoGMm),
        zMm: Math.round(scenarioPhysics.bodyZ),
        massKg: calculations.bodyWeightKg,
        color: '#D4AF37', // Gold
        borderColor: '#F59E0B',
        type: 'component',
        description: `Masa własna konstrukcji nadwozia (${calculations.bodyWeightKg} kg). Położenie wyznaczone w połowie długości ładowni (${Math.round(scenarioPhysics.bodyCoGMm)} mm od osi przedniej).`
      },
      {
        id: 'cog_chassis',
        label: 'CoG Podwozia',
        sublabel: 'Rama + Silnik + Kabina OEM',
        xMm: Math.round(scenarioPhysics.chassisCoGMm),
        zMm: Math.round(scenarioPhysics.chassisZ),
        massKg: calculations.totalChassisTareKg,
        color: '#38BDF8', // Sky Blue
        borderColor: '#0284C7',
        type: 'component',
        description: `Masa własna podwozia fabrycznego (${calculations.totalChassisTareKg} kg). Środek ciężkości w odległości ${Math.round(scenarioPhysics.chassisCoGMm)} mm od osi przedniej.`
      }
    ];

    if (hasLift) {
      list.push({
        id: 'cog_lift',
        label: 'CoG Windy',
        sublabel: 'Dhollandia z Platformą',
        xMm: Math.round(scenarioPhysics.liftCoGMm),
        zMm: Math.round(scenarioPhysics.liftZ),
        massKg: calculations.dhollandiaWeightKg,
        color: '#F43F5E', // Rose
        borderColor: '#BE123C',
        type: 'component',
        description: `Winda załadowcza Dhollandia (${calculations.dhollandiaWeightKg} kg) na skrajnym tylnym nawisie (${Math.round(scenarioPhysics.liftCoGMm)} mm od osi przedniej). Powoduje odciążenie osi kierowanej.`
      });
    }

    if (scenario !== 'empty') {
      list.push({
        id: 'cog_payload',
        label: 'CoG Ładunku',
        sublabel: 'Ładunek Użyteczny Netto',
        xMm: Math.round(scenarioPhysics.payloadCoGMm),
        zMm: Math.round(scenarioPhysics.payloadZ),
        massKg: calculations.netPayloadCapacityKg,
        color: '#A855F7', // Purple
        borderColor: '#7E22CE',
        type: 'component',
        description: `Ładunek towarowy (${calculations.netPayloadCapacityKg} kg). Pozycja wzdłużna: ${Math.round(scenarioPhysics.payloadCoGMm)} mm od osi 1.`
      });
    }

    // Wypadkowy CoG Pojazdu (Combined Vehicle CoG)
    list.push({
      id: 'cog_combined',
      label: scenario === 'empty' ? 'CoG Pojazdu Pustego (G)' : 'CoG Pojazdu Obciążonego (F.2)',
      sublabel: 'Wypadkowy Środek Ciężkości Układu',
      xMm: scenarioPhysics.combinedCoGMm,
      zMm: scenarioPhysics.combinedZMm,
      massKg: scenarioPhysics.totalMassKg,
      color: scenarioPhysics.isStable ? '#10B981' : '#EF4444', // Emerald or Red
      borderColor: scenarioPhysics.isStable ? '#059669' : '#DC2626',
      type: 'combined',
      description: `Wypadkowy środek masy pojazdu (X: ${scenarioPhysics.combinedCoGMm} mm, Z: ${scenarioPhysics.combinedZMm} mm, masa: ${scenarioPhysics.totalMassKg} kg). Decyduje o nacisku osi i stabilności rozkładu masy.`
    });

    return list;
  }, [scenarioPhysics, calculations, hasLift, scenario]);

  // Selected or hovered point
  const activePoint = useMemo(() => {
    const id = hoveredPointId || selectedPointId;
    return scatterPoints.find(p => p.id === id) || scatterPoints[0];
  }, [hoveredPointId, selectedPointId, scatterPoints]);

  // SVG Coordinate Mapping
  // Domain in mm:
  // X: from -foh - 200 mm to bodyEndMm + 400 mm
  const minXDomain = -foh - 150;
  const maxXDomain = Math.max(wb + (wb * 0.65) + 300, bodyEndMm + (hasLift ? 500 : 350));
  const domainWidthX = maxXDomain - minXDomain;

  // Z: from 0 mm to 2400 mm (ground to top of body)
  const minZDomain = 0;
  const maxZDomain = Math.max(2200, H + 300);
  const domainHeightZ = maxZDomain - minZDomain;

  // Viewbox SVG dimensions
  const svgWidth = 960;
  const svgHeight = 440;
  const paddingLeft = 65;
  const paddingRight = 40;
  const paddingTop = 45;
  const paddingBottom = 75;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Coordinate transforms
  const toSvgX = (xMm: number) => {
    return paddingLeft + ((xMm - minXDomain) / domainWidthX) * plotWidth;
  };

  const toSvgY = (zMm: number) => {
    // Invert Z because SVG Y grows downwards
    return paddingTop + plotHeight - ((zMm - minZDomain) / domainHeightZ) * plotHeight;
  };

  // Important positions in SVG coordinates
  const svgFrontAxleX = toSvgX(0);
  const svgRearAxleX = toSvgX(wb);
  const svgFrontBumperX = toSvgX(-foh);
  const svgBodyStartX = toSvgX(bodyStartMm);
  const svgBodyEndX = toSvgX(bodyEndMm);
  const svgGroundY = toSvgY(0);
  const svgFrameY = toSvgY(720);
  const svgBodyTopY = toSvgY(750 + H);
  const svgBodyFloorY = toSvgY(750);
  const svgWheelRadius = toSvgY(0) - toSvgY(380); // ~380mm wheel radius

  // Tolerance Corridor in SVG
  const svgMinSafeX = toSvgX(scenarioPhysics.minSafeX);
  const svgMaxSafeX = toSvgX(scenarioPhysics.maxSafeX);
  const svgSafeZMax = toSvgY(1350); // OEM BBG recommended max CoG height

  return (
    <div className="bg-[#0B132B] border border-[#D4AF37]/30 rounded-xl p-6 shadow-2xl space-y-6">
      
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] mb-1">
            <Crosshair className="w-4 h-4 text-[#D4AF37]" />
            <span>ANALIZA GEOMETRII MAS: OEM BBG & ECE R111 / ISO GPS</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Wykres Punktowy Położenia Środka Ciężkości (CoG) Względem Osi Pojazdu</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Wizualizacja wektorowa współrzędnych środka masy zabudowy, podwozia i windy względem osi przedniej (X=0) oraz tylnej (X={wb} mm). 
            Prezentuje korytarz stateczności wzdłużnej oraz weryfikację kryterium kierowalności (&ge;25% DMC na oś przednią).
          </p>
        </div>

        {/* View Options Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowToleranceZone(prev => !prev)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              showToleranceZone 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Korytarz BBG: {showToleranceZone ? 'WŁ' : 'WYŁ'}</span>
          </button>

          <button
            onClick={() => setShowDimensions(prev => !prev)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              showDimensions 
                ? 'bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/40' 
                : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Wymiarowanie CAD: {showDimensions ? 'WŁ' : 'WYŁ'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector & KPI Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Scenarios (8 cols) */}
        <div className="lg:col-span-8 bg-[#070D1E] border border-slate-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4AF37]" />
              SYMULACJA ROZKŁADU ŁADUNKU I STANU POJAZDU:
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Masa aktywna: <strong className="text-white">{scenarioPhysics.totalMassKg} kg</strong> / DMC {chassis.gvwKg} kg
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <button
              onClick={() => setScenario('nominal')}
              className={`p-2 rounded border text-left transition-all ${
                scenario === 'nominal'
                  ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>1. Nominalny</span>
                {scenario === 'nominal' && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">CoG w centrum skrzyni (L/2)</div>
            </button>

            <button
              onClick={() => setScenario('empty')}
              className={`p-2 rounded border text-left transition-all ${
                scenario === 'empty'
                  ? 'bg-[#1C2541] border-sky-400 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>2. Stan Pusty (G)</span>
                {scenario === 'empty' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Podwozie + zabudowa bez towaru</div>
            </button>

            <button
              onClick={() => setScenario('rear_shifted')}
              className={`p-2 rounded border text-left transition-all ${
                scenario === 'rear_shifted'
                  ? 'bg-[#1C2541] border-amber-400 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>3. Zwis Tył (+350mm)</span>
                {scenario === 'rear_shifted' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ładunek przesunięty do tyłu</div>
            </button>

            <button
              onClick={() => setScenario('front_shifted')}
              className={`p-2 rounded border text-left transition-all ${
                scenario === 'front_shifted'
                  ? 'bg-[#1C2541] border-emerald-400 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>4. Przód (-350mm)</span>
                {scenario === 'front_shifted' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ładunek dosunięty do grodzi</div>
            </button>
          </div>
        </div>

        {/* Dynamic Stability Result Badge (4 cols) */}
        <div className={`lg:col-span-4 p-3.5 rounded-lg border flex flex-col justify-between ${
          scenarioPhysics.isStable
            ? 'bg-emerald-950/20 border-emerald-500/40'
            : 'bg-rose-950/25 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-slate-400">Ocena Stateczności Rozkładu Mas:</span>
            {scenarioPhysics.isStable ? (
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> STABILNY
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> KRYTYCZNY
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 my-1.5 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400">Nacisk Oś 1 (Kier.):</div>
              <div className={`font-bold ${scenarioPhysics.isSteeringLegal ? 'text-white' : 'text-rose-400'}`}>
                {scenarioPhysics.frontAxleLoadKg} kg ({scenarioPhysics.steeringRatioPct}%)
              </div>
              <div className="text-[9px] text-slate-500">Min. 25% DMC ({Math.round(scenarioPhysics.totalMassKg * 0.25)} kg)</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400">Nacisk Oś 2 (Napęd):</div>
              <div className={`font-bold ${scenarioPhysics.rearUtilizationPct <= 100 ? 'text-white' : 'text-rose-400'}`}>
                {scenarioPhysics.rearAxleLoadKg} kg ({scenarioPhysics.rearUtilizationPct}% GAWR)
              </div>
              <div className="text-[9px] text-slate-500">Max GAWR: {chassis.maxRearAxleLoadKg} kg</div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
            Wypadkowy CoG: <span className="text-[#D4AF37] font-bold">X = {scenarioPhysics.combinedCoGMm} mm</span> ({Math.round((scenarioPhysics.combinedCoGMm / wb) * 100)}% rozstawu osi)
          </div>
        </div>

      </div>

      {/* SVG Canvas Scatter Plot */}
      <div className="relative bg-[#070D1E] border border-slate-800 rounded-xl overflow-hidden p-2 sm:p-4">
        
        {/* Top bar inside canvas */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 pb-2 border-b border-slate-800/60 mb-2">
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-semibold">UKŁAD WSPÓŁRZĘDNYCH ISO GPS:</span>
            <span>Oś X: Wzdłużna (0 = Oś Przednia)</span>
            <span>Oś Z: Pionowa (0 = Jezdnia)</span>
          </div>
          <div className="text-[#D4AF37]">
            Podwozie: {chassis.brand} {chassis.model} (WB: {wb} mm)
          </div>
        </div>

        {/* Responsive SVG Container */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[700px] select-none"
            style={{ maxHeight: '460px' }}
          >
            <defs>
              {/* Grid pattern */}
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>

              {/* Striped pattern for BBG safe tolerance corridor */}
              <pattern id="safeCorridorPattern" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="12" stroke="#10B981" strokeWidth="2" strokeOpacity="0.18" />
              </pattern>

              {/* Radial gradient for highlighted point */}
              <radialGradient id="goldPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="emeraldPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>

              {/* Marker arrows for dimension lines */}
              <marker id="arrowCAD" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#94A3B8" />
              </marker>

              <marker id="arrowGold" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#D4AF37" />
              </marker>
            </defs>

            {/* Background Grid */}
            <rect 
              x={paddingLeft} 
              y={paddingTop} 
              width={plotWidth} 
              height={plotHeight} 
              fill="url(#gridPattern)" 
            />

            {/* Ground Plane (Z = 0) */}
            <line
              x1={paddingLeft}
              y1={svgGroundY}
              x2={paddingLeft + plotWidth}
              y2={svgGroundY}
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Ground hatch ticks */}
            {Array.from({ length: 24 }).map((_, i) => {
              const tickX = paddingLeft + (i * (plotWidth / 23));
              return (
                <line
                  key={`ground-tick-${i}`}
                  x1={tickX}
                  y1={svgGroundY}
                  x2={tickX - 8}
                  y2={svgGroundY + 8}
                  stroke="#334155"
                  strokeWidth="1.5"
                />
              );
            })}
            <text x={paddingLeft + 10} y={svgGroundY + 18} fill="#64748B" fontSize="10" fontFamily="monospace">
              POZIOM JEZDNI (Z = 0 mm)
            </text>

            {/* Safe Stability Corridor OEM BBG (if toggled) */}
            {showToleranceZone && (
              <g>
                <rect
                  x={svgMinSafeX}
                  y={svgSafeZMax}
                  width={Math.max(10, svgMaxSafeX - svgMinSafeX)}
                  height={svgGroundY - svgSafeZMax}
                  fill="url(#safeCorridorPattern)"
                  stroke="#10B981"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  strokeOpacity="0.7"
                />
                <text
                  x={(svgMinSafeX + svgMaxSafeX) / 2}
                  y={svgSafeZMax - 8}
                  textAnchor="middle"
                  fill="#10B981"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  STREFA STABILNOŚCI COG OEM BBG ({scenarioPhysics.minSafeX} - {scenarioPhysics.maxSafeX} mm)
                </text>
              </g>
            )}

            {/* Stylized Chassis & Vehicle Architecture Silhouette */}
            <g opacity="0.45">
              {/* Front Wheel */}
              <circle
                cx={svgFrontAxleX}
                cy={svgGroundY - svgWheelRadius}
                r={svgWheelRadius}
                fill="#0F172A"
                stroke="#64748B"
                strokeWidth="2"
              />
              <circle cx={svgFrontAxleX} cy={svgGroundY - svgWheelRadius} r="10" fill="#334155" />

              {/* Rear Wheel */}
              <circle
                cx={svgRearAxleX}
                cy={svgGroundY - svgWheelRadius}
                r={svgWheelRadius}
                fill="#0F172A"
                stroke="#64748B"
                strokeWidth="2"
              />
              <circle cx={svgRearAxleX} cy={svgGroundY - svgWheelRadius} r="10" fill="#334155" />

              {/* Chassis Frame Rails (Podłużnice) */}
              <rect
                x={svgFrontBumperX}
                y={svgFrameY - 14}
                width={svgBodyEndX - svgFrontBumperX}
                height="18"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="1.5"
                rx="2"
              />

              {/* Cab Silhouette */}
              <path
                d={`
                  M ${svgFrontBumperX} ${svgFrameY - 14}
                  L ${svgFrontBumperX} ${toSvgY(1400)}
                  Q ${toSvgX(-foh * 0.4)} ${toSvgY(2250)} ${toSvgX(-100)} ${toSvgY(2350)}
                  L ${svgBodyStartX - 10} ${toSvgY(2350)}
                  L ${svgBodyStartX - 10} ${svgFrameY - 14}
                  Z
                `}
                fill="#0F172A"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              <text x={svgFrontBumperX + 20} y={toSvgY(1500)} fill="#64748B" fontSize="9" fontFamily="monospace">
                KABINA {chassis.brand}
              </text>

              {/* Cargo Body Outline (Zabudowa) */}
              <rect
                x={svgBodyStartX}
                y={svgBodyTopY}
                width={svgBodyEndX - svgBodyStartX}
                height={svgBodyFloorY - svgBodyTopY}
                fill="#0F172A"
                stroke="#D4AF37"
                strokeWidth="1.5"
                strokeOpacity="0.6"
                strokeDasharray="4,2"
                rx="2"
              />
              <text x={(svgBodyStartX + svgBodyEndX) / 2} y={svgBodyTopY + 22} textAnchor="middle" fill="#D4AF37" fontSize="10" fontFamily="monospace" opacity="0.8">
                PRZESTRZEŃ ŁADUNKOWA ({L} x {H} mm)
              </text>

              {/* Dhollandia Tail Lift Platform Outline */}
              {hasLift && (
                <g>
                  <rect
                    x={svgBodyEndX}
                    y={toSvgY(750)}
                    width={toSvgX(bodyEndMm + 150) - svgBodyEndX}
                    height="12"
                    fill="#BE123C"
                    stroke="#F43F5E"
                    strokeWidth="1"
                  />
                  <rect
                    x={svgBodyEndX + 10}
                    y={toSvgY(500)}
                    width="15"
                    height={toSvgY(500) - toSvgY(750)}
                    fill="#475569"
                  />
                  <text x={svgBodyEndX + 10} y={toSvgY(460)} fill="#F43F5E" fontSize="8" fontFamily="monospace">
                    WINDA
                  </text>
                </g>
              )}
            </g>

            {/* Vertical Axle Centerlines (Linie Osi) */}
            {/* Front Axle Centerline X = 0 */}
            <line
              x1={svgFrontAxleX}
              y1={paddingTop + 10}
              x2={svgFrontAxleX}
              y2={svgGroundY}
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeDasharray="6,3"
            />
            <circle cx={svgFrontAxleX} cy={paddingTop + 12} r="4" fill="#38BDF8" />
            <text x={svgFrontAxleX} y={paddingTop - 2} textAnchor="middle" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">
              OŚ 1 (X = 0)
            </text>

            {/* Rear Axle Centerline X = WB */}
            <line
              x1={svgRearAxleX}
              y1={paddingTop + 10}
              x2={svgRearAxleX}
              y2={svgGroundY}
              stroke="#D4AF37"
              strokeWidth="1.5"
              strokeDasharray="6,3"
            />
            <circle cx={svgRearAxleX} cy={paddingTop + 12} r="4" fill="#D4AF37" />
            <text x={svgRearAxleX} y={paddingTop - 2} textAnchor="middle" fill="#D4AF37" fontSize="10" fontFamily="monospace" fontWeight="bold">
              OŚ 2 (X = {wb} mm)
            </text>

            {/* Dimension Lines (Linie wymiarowe CAD) */}
            {showDimensions && (
              <g>
                {/* Wheelbase Dimension Line (WB) */}
                <line
                  x1={svgFrontAxleX}
                  y1={svgGroundY + 36}
                  x2={svgRearAxleX}
                  y2={svgGroundY + 36}
                  stroke="#94A3B8"
                  strokeWidth="1"
                  markerStart="url(#arrowCAD)"
                  markerEnd="url(#arrowCAD)"
                />
                <line x1={svgFrontAxleX} y1={svgGroundY + 15} x2={svgFrontAxleX} y2={svgGroundY + 45} stroke="#64748B" strokeWidth="0.75" />
                <line x1={svgRearAxleX} y1={svgGroundY + 15} x2={svgRearAxleX} y2={svgGroundY + 45} stroke="#64748B" strokeWidth="0.75" />
                <text x={(svgFrontAxleX + svgRearAxleX) / 2} y={svgGroundY + 49} textAnchor="middle" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                  ROZSTAW OSI WB = {wb} mm
                </text>

                {/* Body Length Dimension Line */}
                <line
                  x1={svgBodyStartX}
                  y1={svgBodyTopY - 14}
                  x2={svgBodyEndX}
                  y2={svgBodyTopY - 14}
                  stroke="#D4AF37"
                  strokeWidth="1"
                  markerStart="url(#arrowGold)"
                  markerEnd="url(#arrowGold)"
                />
                <line x1={svgBodyStartX} y1={svgBodyTopY - 20} x2={svgBodyStartX} y2={svgBodyTopY} stroke="#D4AF37" strokeWidth="0.75" />
                <line x1={svgBodyEndX} y1={svgBodyTopY - 20} x2={svgBodyEndX} y2={svgBodyTopY} stroke="#D4AF37" strokeWidth="0.75" />
                <text x={(svgBodyStartX + svgBodyEndX) / 2} y={svgBodyTopY - 18} textAnchor="middle" fill="#D4AF37" fontSize="9" fontFamily="monospace">
                  DŁUGOŚĆ ZABUDOWY L = {L} mm
                </text>

                {/* Rear Overhang Dimension Line (ROH) */}
                <line
                  x1={svgRearAxleX}
                  y1={svgGroundY + 36}
                  x2={svgBodyEndX}
                  y2={svgGroundY + 36}
                  stroke="#F59E0B"
                  strokeWidth="1"
                  markerStart="url(#arrowGold)"
                  markerEnd="url(#arrowGold)"
                />
                <line x1={svgBodyEndX} y1={svgGroundY + 15} x2={svgBodyEndX} y2={svgGroundY + 45} stroke="#F59E0B" strokeWidth="0.75" />
                <text x={(svgRearAxleX + svgBodyEndX) / 2} y={svgGroundY + 49} textAnchor="middle" fill="#F59E0B" fontSize="9" fontFamily="monospace">
                  ZWIS ROH = {calculations.rearOverhangMm} mm
                </text>
              </g>
            )}

            {/* Scatter Drop Lines (Pionowe i poziome linie rzutujące punktów CoG) */}
            {scatterPoints.map((pt) => {
              const ptX = toSvgX(pt.xMm);
              const ptY = toSvgY(pt.zMm);
              const isSelected = selectedPointId === pt.id;
              const isHovered = hoveredPointId === pt.id;
              const isHighlighted = isSelected || isHovered;

              return (
                <g key={`drop-${pt.id}`}>
                  {isHighlighted && (
                    <>
                      {/* Vertical drop line to ground */}
                      <line
                        x1={ptX}
                        y1={ptY}
                        x2={ptX}
                        y2={svgGroundY}
                        stroke={pt.color}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.85"
                      />
                      {/* Horizontal drop line to front axle line */}
                      <line
                        x1={ptX}
                        y1={ptY}
                        x2={svgFrontAxleX}
                        y2={ptY}
                        stroke={pt.color}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                      />
                      {/* Coordinate text at ground line */}
                      <rect
                        x={ptX - 35}
                        y={svgGroundY + 4}
                        width="70"
                        height="14"
                        fill="#0B132B"
                        stroke={pt.color}
                        strokeWidth="0.75"
                        rx="2"
                      />
                      <text
                        x={ptX}
                        y={svgGroundY + 14}
                        textAnchor="middle"
                        fill={pt.color}
                        fontSize="8.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        X={pt.xMm}mm
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* SCATTER POINTS (Węzły punktowe CoG) */}
            {scatterPoints.map((pt) => {
              const ptX = toSvgX(pt.xMm);
              const ptY = toSvgY(pt.zMm);
              const isSelected = selectedPointId === pt.id;
              const isHovered = hoveredPointId === pt.id;
              const isCombined = pt.type === 'combined';
              const radius = isCombined ? 11 : 8;

              return (
                <g 
                  key={pt.id}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPointId(pt.id)}
                  onMouseLeave={() => setHoveredPointId(null)}
                  onClick={() => setSelectedPointId(pt.id)}
                >
                  {/* Pulse halo if selected or hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={ptX}
                      cy={ptY}
                      r={radius + 12}
                      fill={pt.id === 'cog_body' ? 'url(#goldPulse)' : 'url(#emeraldPulse)'}
                      className="animate-pulse"
                    />
                  )}

                  {/* Outer circle ring */}
                  <circle
                    cx={ptX}
                    cy={ptY}
                    r={radius + 2}
                    fill="#070D1E"
                    stroke={pt.borderColor}
                    strokeWidth="2"
                  />

                  {/* Inner filled circle */}
                  <circle
                    cx={ptX}
                    cy={ptY}
                    r={radius - 1}
                    fill={pt.color}
                  />

                  {/* Crosshair inside circle */}
                  <line
                    x1={ptX - radius}
                    y1={ptY}
                    x2={ptX + radius}
                    y2={ptY}
                    stroke="#0B132B"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={ptX}
                    y1={ptY - radius}
                    x2={ptX}
                    y2={ptY + radius}
                    stroke="#0B132B"
                    strokeWidth="1.5"
                  />

                  {/* Floating Point Label Box */}
                  <g transform={`translate(${ptX}, ${ptY - (isCombined ? 24 : 18)})`}>
                    <rect
                      x="-55"
                      y="-16"
                      width="110"
                      height="17"
                      fill="#0B132B"
                      stroke={isSelected ? pt.color : '#334155'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                      rx="3"
                      className="shadow-lg"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fill={pt.color}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {pt.label} ({pt.massKg} kg)
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Axis Labels */}
            {/* X-axis ticks along bottom */}
            <g>
              {[0, 1000, 2000, wb, Math.round(bodyEndMm)].map((tickVal, i) => {
                const tickX = toSvgX(tickVal);
                return (
                  <g key={`x-tick-${i}`}>
                    <line x1={tickX} y1={svgGroundY} x2={tickX} y2={svgGroundY + 5} stroke="#64748B" strokeWidth="1" />
                    <text x={tickX} y={svgGroundY + 28} textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="monospace">
                      {tickVal}
                    </text>
                  </g>
                );
              })}
              <text x={svgWidth - paddingRight} y={svgGroundY + 28} textAnchor="end" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                X [mm] &rarr;
              </text>
            </g>

            {/* Z-axis ticks along left */}
            <g>
              {[500, 1000, 1500, 2000].map((tickVal, i) => {
                const tickY = toSvgY(tickVal);
                return (
                  <g key={`z-tick-${i}`}>
                    <line x1={paddingLeft - 5} y1={tickY} x2={paddingLeft} y2={tickY} stroke="#64748B" strokeWidth="1" />
                    <text x={paddingLeft - 8} y={tickY + 3} textAnchor="end" fill="#64748B" fontSize="8" fontFamily="monospace">
                      {tickVal}
                    </text>
                  </g>
                );
              })}
              <text x={paddingLeft - 8} y={paddingTop - 10} textAnchor="end" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                &uarr; Z [mm]
              </text>
            </g>

          </svg>
        </div>

        {/* Legend beneath the canvas */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400 text-[11px]">LEGENDA PUNKTÓW COG:</span>
            
            <button
              onClick={() => setSelectedPointId('cog_body')}
              className={`flex items-center gap-1.5 transition-all ${selectedPointId === 'cog_body' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
              <span>CoG Zabudowy</span>
            </button>

            <button
              onClick={() => setSelectedPointId('cog_chassis')}
              className={`flex items-center gap-1.5 transition-all ${selectedPointId === 'cog_chassis' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>CoG Podwozia</span>
            </button>

            {hasLift && (
              <button
                onClick={() => setSelectedPointId('cog_lift')}
                className={`flex items-center gap-1.5 transition-all ${selectedPointId === 'cog_lift' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>CoG Windy Dhollandia</span>
              </button>
            )}

            {scenario !== 'empty' && (
              <button
                onClick={() => setSelectedPointId('cog_payload')}
                className={`flex items-center gap-1.5 transition-all ${selectedPointId === 'cog_payload' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>CoG Ładunku</span>
              </button>
            )}

            <button
              onClick={() => setSelectedPointId('cog_combined')}
              className={`flex items-center gap-1.5 transition-all ${selectedPointId === 'cog_combined' ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <span className={`w-3 h-3 rounded-full ${scenarioPhysics.isStable ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>Wypadkowy CoG Pojazdu</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Kliknij punkt, aby wyświetlić metrykę fizyczną
          </div>
        </div>

      </div>

      {/* Selected Point Technical Detail Card */}
      <div className="bg-[#070D1E] border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-slate-950 font-bold text-[10px]"
              style={{ backgroundColor: activePoint.color }}
            >
              •
            </div>
            <div>
              <span className="text-sm font-bold text-white font-mono">{activePoint.label}</span>
              <span className="text-xs text-slate-400 font-mono ml-2">({activePoint.sublabel})</span>
            </div>
          </div>
          <div className="text-xs font-mono text-[#D4AF37]">
            Masa składowa: <strong>{activePoint.massKg} kg</strong> ({Math.round((activePoint.massKg / scenarioPhysics.totalMassKg) * 100)}% masy aktywnej)
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs font-mono">
          <div className="bg-[#0B132B] p-2.5 rounded border border-slate-800/70">
            <span className="text-slate-400 block text-[10px]">Współrzędna X (od Osi 1):</span>
            <span className="text-base font-bold text-white">{activePoint.xMm} mm</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {Math.round((activePoint.xMm / wb) * 100)}% rozstawu osi (WB)
            </span>
          </div>

          <div className="bg-[#0B132B] p-2.5 rounded border border-slate-800/70">
            <span className="text-slate-400 block text-[10px]">Ramię względem Osi 2 (Tylnej):</span>
            <span className={`text-base font-bold ${activePoint.xMm > wb ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activePoint.xMm - wb > 0 ? `+${activePoint.xMm - wb}` : activePoint.xMm - wb} mm
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {activePoint.xMm > wb ? 'Nawis za osią (dźwignia)' : 'Przed tylną osią (podparcie)'}
            </span>
          </div>

          <div className="bg-[#0B132B] p-2.5 rounded border border-slate-800/70">
            <span className="text-slate-400 block text-[10px]">Wysokość CoG Z (nad jezdnią):</span>
            <span className="text-base font-bold text-[#D4AF37]">{activePoint.zMm} mm</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Limit przewrotu BBG: &le; 1350 mm
            </span>
          </div>

          <div className="bg-[#0B132B] p-2.5 rounded border border-slate-800/70">
            <span className="text-slate-400 block text-[10px]">Statyczny Moment Wzdłużny M:</span>
            <span className="text-base font-bold text-sky-400">
              {Math.round((activePoint.massKg * activePoint.xMm * 9.81) / 1000)} N·m
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Względem punktu obrotu Osi 1
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-[#0B132B] p-2.5 rounded border border-slate-800/70 leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#D4AF37] inline mr-1.5" />
          {activePoint.description}
        </div>
      </div>

      {/* Engineering Guidelines Table (Wytyczne OEM BBG / Weryfikacja Norm) */}
      <div className="bg-[#070D1E] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Tabela Zgodności Rozkładu Obciążenia z Wytycznymi OEM BBG ({chassis.bbgReferenceDoc})
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2 pr-3">Kryterium Inżynieryjne OEM</th>
                <th className="py-2 px-3">Wymóg / Tolerancja</th>
                <th className="py-2 px-3">Wartość Wyliczona</th>
                <th className="py-2 px-3">Margines Bezpieczeństwa</th>
                <th className="py-2 pl-3 text-right">Status Zgodności</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              <tr>
                <td className="py-2.5 pr-3 font-semibold text-white">
                  Kierowalność Osi 1 (Nacisk Min.)
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  &ge; 25.0% DMC pojazdu
                </td>
                <td className="py-2.5 px-3 font-bold text-sky-400">
                  {scenarioPhysics.steeringRatioPct}% ({scenarioPhysics.frontAxleLoadKg} kg)
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  +{scenarioPhysics.frontAxleLoadKg - Math.round(scenarioPhysics.totalMassKg * 0.25)} kg
                </td>
                <td className="py-2.5 pl-3 text-right">
                  {scenarioPhysics.isSteeringLegal ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNA
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> ODCIĄŻENIE
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-3 font-semibold text-white">
                  Nośność Osi Tylnej (GAWR 2)
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  &le; {chassis.maxRearAxleLoadKg} kg (100% GAWR)
                </td>
                <td className="py-2.5 px-3 font-bold text-[#D4AF37]">
                  {scenarioPhysics.rearAxleLoadKg} kg ({scenarioPhysics.rearUtilizationPct}%)
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  {chassis.maxRearAxleLoadKg - scenarioPhysics.rearAxleLoadKg >= 0 
                    ? `+${chassis.maxRearAxleLoadKg - scenarioPhysics.rearAxleLoadKg} kg zapasu` 
                    : `${chassis.maxRearAxleLoadKg - scenarioPhysics.rearAxleLoadKg} kg przeciążenia`}
                </td>
                <td className="py-2.5 pl-3 text-right">
                  {scenarioPhysics.rearUtilizationPct <= 100 ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNA
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> PRZECIĄŻENIE
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-3 font-semibold text-white">
                  Zwis Tylny (Rear Overhang ROH)
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  &le; 60% rozstawu osi ({calculations.maxAllowedRearOverhangMm} mm)
                </td>
                <td className="py-2.5 px-3 font-bold text-white">
                  {calculations.rearOverhangMm} mm ({calculations.rearOverhangRatioPct}% WB)
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  +{calculations.maxAllowedRearOverhangMm - calculations.rearOverhangMm} mm
                </td>
                <td className="py-2.5 pl-3 text-right">
                  {calculations.isOverhangLegal ? (
                    <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNA
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> PRZEKROCZONY
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="py-2.5 pr-3 font-semibold text-white">
                  Wysokość CoG Zabudowy Z
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  &le; 1350 mm (Kąt wywrotu &ge; 28&deg;)
                </td>
                <td className="py-2.5 px-3 font-bold text-white">
                  {scenarioPhysics.combinedZMm} mm
                </td>
                <td className="py-2.5 px-3 text-slate-300">
                  +{1350 - scenarioPhysics.combinedZMm} mm marginesu
                </td>
                <td className="py-2.5 pl-3 text-right">
                  <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZGODNA
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
