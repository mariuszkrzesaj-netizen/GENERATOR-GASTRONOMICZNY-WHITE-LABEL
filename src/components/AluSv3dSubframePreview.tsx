import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ParametricCadDimensions, 
  AluSvProfileSystem, 
  OemChassis,
  BodyWorkType
} from '../types/itsMaster';
import { 
  Box, 
  Rotate3d, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Eye, 
  RotateCcw, 
  Info,
  Sliders,
  Check,
  Truck,
  Grid,
  Compass,
  Wrench,
  HelpCircle
} from 'lucide-react';

interface AluSv3dSubframePreviewProps {
  dimensions: ParametricCadDimensions;
  aluSv: AluSvProfileSystem;
  chassis: OemChassis;
  dhollandiaLiftId: string | null;
  bodyType?: BodyWorkType;
  initialPreset?: 'all' | 'skeleton' | 'floor' | 'roof';
  className?: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Point2D {
  x: number;
  y: number;
  depth: number;
}

export type SkeletonPartCategory = 
  | 'bus_chassis'
  | 'bus_cab'
  | 'bus_wheel'
  | 'longitudinal' 
  | 'crossmember' 
  | 'edge' 
  | 'bracket' 
  | 'pillar' 
  | 'bulkhead'
  | 'roof_rail'
  | 'roof_bow'
  | 'roof_tube'
  | 'lift';

export interface Box3D {
  id: string;
  name: string;
  category: SkeletonPartCategory;
  min: Point3D;
  max: Point3D;
  color: string;
  stroke: string;
  spec?: string;
}

export const AluSv3dSubframePreview: React.FC<AluSv3dSubframePreviewProps> = ({
  dimensions,
  aluSv,
  chassis,
  dhollandiaLiftId,
  initialPreset = 'all',
  className = ''
}) => {
  // 3D Camera State
  const [yaw, setYaw] = useState<number>(36); // rotation around Y (degrees)
  const [pitch, setPitch] = useState<number>(22); // rotation around X (degrees)
  const [zoom, setZoom] = useState<number>(0.095);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'shaded' | 'wireframe' | 'dimensions'>('shaded');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [hoveredPart, setHoveredPart] = useState<Box3D | null>(null);

  // Layer visibility toggles (complete skeleton)
  const [showBus, setShowBus] = useState<boolean>(true);
  const [showFloorSubframe, setShowFloorSubframe] = useState<boolean>(true);
  const [showPillars, setShowPillars] = useState<boolean>(true);
  const [showBulkhead, setShowBulkhead] = useState<boolean>(true);
  const [showRoof, setShowRoof] = useState<boolean>(true);
  const [showLift, setShowLift] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const L = dimensions.lengthMm;
  const W = dimensions.widthMm;
  const H = dimensions.heightMm;
  const isAlu = aluSv.subframeType.includes('Alu-System');
  const subframeHeight = dimensions.subframeHeightMm || 120;
  const hasLift = Boolean(dhollandiaLiftId);

  // Dynamic calculations for subframe elements
  const numCrossmembers = Math.floor((L - 200) / 380) + 2;
  const numRoofBows = Math.floor((L - 300) / 600) + 2;
  const isDivided = L > 4200;
  const chassisFrameSpacing = chassis.frameWidthMm || 860;
  const wb = chassis.wheelbaseMm;
  const foh = chassis.frontOverhangMm || 950;
  const isPiaggio = chassis.brand === 'Piaggio' || chassis.id.includes('piaggio');
  const isFord = chassis.brand === 'Ford' || chassis.id.includes('ford');
  const isRenault = chassis.brand === 'Renault' || chassis.id.includes('renault');
  const cabOffset = isPiaggio ? 750 : (chassis.type === 'van' ? 950 : 1320);

  // Touch gesture state (drag rotate & pinch zoom)
  const touchStartRef = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });

  // Presets handling
  const applyPreset = (preset: 'all' | 'skeleton' | 'floor' | 'roof') => {
    if (preset === 'all') {
      setShowBus(true);
      setShowFloorSubframe(true);
      setShowPillars(true);
      setShowBulkhead(true);
      setShowRoof(true);
      setShowLift(true);
    } else if (preset === 'skeleton') {
      setShowBus(false);
      setShowFloorSubframe(true);
      setShowPillars(true);
      setShowBulkhead(true);
      setShowRoof(true);
      setShowLift(true);
    } else if (preset === 'floor') {
      setShowBus(true);
      setShowFloorSubframe(true);
      setShowPillars(false);
      setShowBulkhead(false);
      setShowRoof(false);
      setShowLift(true);
    } else if (preset === 'roof') {
      setShowBus(false);
      setShowFloorSubframe(false);
      setShowPillars(true);
      setShowBulkhead(true);
      setShowRoof(true);
      setShowLift(false);
    }
  };

  // Auto rotation effect
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setYaw(prev => (prev + 0.5) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Handle Mouse Drag for 3D Orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setYaw(prev => (prev + dx * 0.5) % 360);
    setPitch(prev => Math.max(-65, Math.min(85, prev - dy * 0.4)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom (oddalanie i przybliżanie)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.008 : -0.008;
    setZoom(prev => Math.max(0.04, Math.min(0.28, prev + zoomFactor)));
  };

  // Touch handlers for mobile / tablet (rotacja palcem 360° + pinch zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    setAutoRotate(false);
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      setYaw(prev => (prev + dx * 0.6) % 360);
      setPitch(prev => Math.max(-65, Math.min(85, prev - dy * 0.5)));
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (e.touches.length === 2 && touchStartRef.current && touchStartRef.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      const diff = currentDist - touchStartRef.current.dist;
      setZoom(prev => Math.max(0.04, Math.min(0.28, prev + diff * 0.0006)));
      touchStartRef.current.dist = currentDist;
    }
  };

  // Generate complete 3D geometry boxes: Bus + Subframe + Crossmembers + Pillars + Roof + Lift
  const all3DParts = useMemo<Box3D[]>(() => {
    const parts: Box3D[] = [];
    const halfL = L / 2;
    const halfW = W / 2;
    const halfChassis = chassisFrameSpacing / 2;
    const railWidth = 65;

    // Palette: ALU-S.V. Anodized vs Steel vs Gold vs Bus Blue
    const primaryAluColor = isAlu ? '#CBD5E1' : '#64748B';
    const primaryStroke = isAlu ? '#94A3B8' : '#475569';
    const edgeColor = isAlu ? '#E2E8F0' : '#94A3B8';
    const goldAccent = '#D4AF37';
    const pillarColor = '#94A3B8';
    const roofColor = '#E2E8F0';
    const busBodyColor = 'rgba(30, 41, 59, 0.75)';
    const busStroke = '#475569';
    const wheelRubber = '#0F172A';

    // =========================================================================
    // 1. VEHICLE CHASSIS & CAB (PODWOZIE I KABINA BUSA)
    // =========================================================================
    if (showBus) {
      const frontAxleX = -halfL - cabOffset;
      const rearAxleX = frontAxleX + wb;
      const frontBumperX = frontAxleX - foh;

      // 1.1 Longitudinal Chassis Frame Rails (Podłużnice ramy podwozia)
      parts.push({
        id: 'bus_chassis_left',
        name: `Podłużnica Ramy Podwozia Lewa ${chassis.brand} (${Math.round(halfL - frontBumperX)} mm)`,
        category: 'bus_chassis',
        min: { x: frontBumperX, y: -150, z: -halfChassis - 35 },
        max: { x: halfL, y: 0, z: -halfChassis + 35 },
        color: '#334155',
        stroke: '#475569',
        spec: `Stal tłoczona OEM BBG ${chassis.bbgReferenceDoc}`
      });

      parts.push({
        id: 'bus_chassis_right',
        name: `Podłużnica Ramy Podwozia Prawa ${chassis.brand} (${Math.round(halfL - frontBumperX)} mm)`,
        category: 'bus_chassis',
        min: { x: frontBumperX, y: -150, z: halfChassis - 35 },
        max: { x: halfL, y: 0, z: halfChassis + 35 },
        color: '#334155',
        stroke: '#475569',
        spec: `Stal tłoczona OEM BBG ${chassis.bbgReferenceDoc}`
      });

      // Chassis Transverse Crossmembers (Poprzeczki ramy podwozia)
      const chassisXCross = [frontAxleX, (frontAxleX + rearAxleX) * 0.45, rearAxleX];
      chassisXCross.forEach((xPos, idx) => {
        parts.push({
          id: `bus_chassis_cross_${idx}`,
          name: `Poprzeczka Ramy Podwozia #${idx + 1}`,
          category: 'bus_chassis',
          min: { x: xPos - 30, y: -140, z: -halfChassis + 35 },
          max: { x: xPos + 30, y: -10, z: halfChassis - 35 },
          color: '#1E293B',
          stroke: '#475569',
          spec: 'Poprzeczka rurowa ramy podwozia'
        });
      });

      // 1.2 Front Axle & Wheels (Oś przednia i koła)
      // Front Axle Beam
      parts.push({
        id: 'bus_front_axle_beam',
        name: 'Belka Osi Przedniej (Kierowana)',
        category: 'bus_chassis',
        min: { x: frontAxleX - 35, y: -260, z: -halfW + 80 },
        max: { x: frontAxleX + 35, y: -200, z: halfW - 80 },
        color: '#1E293B',
        stroke: '#38BDF8',
        spec: `Nośność GAWR 1: ${chassis.maxFrontAxleLoadKg} kg`
      });

      // Front Left Wheel
      parts.push({
        id: 'wheel_fl',
        name: 'Koło Przednie Lewe (225/75 R16C)',
        category: 'bus_wheel',
        min: { x: frontAxleX - 290, y: -380, z: -halfW - 35 },
        max: { x: frontAxleX + 290, y: -20, z: -halfW + 85 },
        color: wheelRubber,
        stroke: '#64748B',
        spec: 'Koło 16-calowe z oponą wzmacnianą C'
      });
      // Front Right Wheel
      parts.push({
        id: 'wheel_fr',
        name: 'Koło Przednie Prawe (225/75 R16C)',
        category: 'bus_wheel',
        min: { x: frontAxleX - 290, y: -380, z: halfW - 85 },
        max: { x: frontAxleX + 290, y: -20, z: halfW + 35 },
        color: wheelRubber,
        stroke: '#64748B',
        spec: 'Koło 16-calowe z oponą wzmacnianą C'
      });

      // 1.3 Rear Axle & Wheels (Oś tylna i koła napędowe)
      // Rear Axle Diff Housing
      parts.push({
        id: 'bus_rear_axle_beam',
        name: 'Tylny Most Napędowy / Oś Zawieszenia',
        category: 'bus_chassis',
        min: { x: rearAxleX - 50, y: -270, z: -halfW + 80 },
        max: { x: rearAxleX + 50, y: -190, z: halfW - 80 },
        color: '#1E293B',
        stroke: '#D4AF37',
        spec: `Nośność GAWR 2: ${chassis.maxRearAxleLoadKg} kg`
      });

      // Rear Left Wheel
      parts.push({
        id: 'wheel_rl',
        name: 'Koło Tylne Lewe (Napęd)',
        category: 'bus_wheel',
        min: { x: rearAxleX - 290, y: -380, z: -halfW - 35 },
        max: { x: rearAxleX + 290, y: -20, z: -halfW + 85 },
        color: wheelRubber,
        stroke: '#64748B',
        spec: 'Oś 2 napędowa'
      });
      // Rear Right Wheel
      parts.push({
        id: 'wheel_rr',
        name: 'Koło Tylne Prawe (Napęd)',
        category: 'bus_wheel',
        min: { x: rearAxleX - 290, y: -380, z: halfW - 85 },
        max: { x: rearAxleX + 290, y: -20, z: halfW + 35 },
        color: wheelRubber,
        stroke: '#64748B',
        spec: 'Oś 2 napędowa'
      });

      // 1.4 Bus Cab Profile & Framework (Kabina kierowcy busa)
      // Front Bumper Block
      parts.push({
        id: 'bus_front_bumper',
        name: `Zderzak Przedni & Reflektory ${chassis.brand}`,
        category: 'bus_cab',
        min: { x: frontBumperX - 70, y: -140, z: -halfW - 15 },
        max: { x: frontBumperX + 80, y: 350, z: halfW + 15 },
        color: '#0F172A',
        stroke: '#475569',
        spec: 'Zderzak przedni OEM z absorbem energii'
      });

      // Hood / Engine Compartment
      parts.push({
        id: 'bus_engine_hood',
        name: `Maska Silnika & Przedział Napędowy ${chassis.brand}`,
        category: 'bus_cab',
        min: { x: frontBumperX + 80, y: 150, z: -halfW + 20 },
        max: { x: frontAxleX + 180, y: 780, z: halfW - 20 },
        color: busBodyColor,
        stroke: busStroke,
        spec: 'Komora silnika podwozia bazowego'
      });

      // Lower Cab Body / Doors
      parts.push({
        id: 'bus_cab_doors',
        name: `Dolna Część Kabiny & Drzwi Kierowcy (${chassis.brand})`,
        category: 'bus_cab',
        min: { x: frontAxleX + 180, y: 0, z: -halfW + 10 },
        max: { x: -halfL - 25, y: 920, z: halfW - 10 },
        color: busBodyColor,
        stroke: busStroke,
        spec: 'Moduł kabiny załogowej OEM'
      });

      // Windshield & Upper Cab / A-Pillars
      parts.push({
        id: 'bus_cab_upper',
        name: 'Górna Część Kabiny (Szyba Czołowa & Dach Kabiny)',
        category: 'bus_cab',
        min: { x: frontAxleX + 220, y: 920, z: -halfW + 30 },
        max: { x: -halfL - 25, y: 1820, z: halfW - 30 },
        color: 'rgba(15, 23, 42, 0.85)',
        stroke: '#38BDF8',
        spec: 'Przeszklona strefa kabiny z dachem OEM'
      });
    }

    // =========================================================================
    // 2. FLOOR SUBFRAME & CROSSMEMBERS (RAMA POŚREDNIA & POPRZECZKI PODŁOGI)
    // =========================================================================
    if (showFloorSubframe) {
      // 2.1 Main Longitudinal Subframe Rails (Podłużnice C-Alu 120/140)
      parts.push({
        id: 'rail_left',
        name: `Podłużnica Lewa ${isAlu ? 'C-Alu 120/140' : 'Stal S355'} (${L} mm)`,
        category: 'longitudinal',
        min: { x: -halfL, y: 0, z: -halfChassis - railWidth / 2 },
        max: { x: halfL, y: subframeHeight, z: -halfChassis + railWidth / 2 },
        color: primaryAluColor,
        stroke: isAlu ? goldAccent : primaryStroke,
        spec: `Profil EN AW-6005A-T6 cięty na ${L} mm`
      });

      parts.push({
        id: 'rail_right',
        name: `Podłużnica Prawa ${isAlu ? 'C-Alu 120/140' : 'Stal S355'} (${L} mm)`,
        category: 'longitudinal',
        min: { x: -halfL, y: 0, z: halfChassis - railWidth / 2 },
        max: { x: halfL, y: subframeHeight, z: halfChassis + railWidth / 2 },
        color: primaryAluColor,
        stroke: isAlu ? goldAccent : primaryStroke,
        spec: `Profil EN AW-6005A-T6 cięty na ${L} mm`
      });

      // 2.2 Transverse Floor Z-Crossmembers (Poprzeczki profilowe Z-Alu co 380 mm)
      const stepX = (L - 100) / Math.max(1, numCrossmembers - 1);
      for (let i = 0; i < numCrossmembers; i++) {
        const xPos = -halfL + 50 + i * stepX;
        parts.push({
          id: `crossmember_${i}`,
          name: `Poprzeczka Podłogi Z-Alu #${i + 1} (${W - 80} mm)`,
          category: 'crossmember',
          min: { x: xPos - 22, y: subframeHeight - 45, z: -halfW + 35 },
          max: { x: xPos + 22, y: subframeHeight, z: halfW - 35 },
          color: isAlu ? '#94A3B8' : '#475569',
          stroke: '#64748B',
          spec: `Poprzeczka Z-Alu h=45mm co 380 mm pod płytę podłogową`
        });
      }

      // 2.3 Perimeter Edge Profiles (Obrzeża ALU-S.V. z otworami)
      const edgeThick = 35;
      // Left edge
      parts.push({
        id: 'edge_left',
        name: `Profil Obrzeżowy Lewy ALU-S.V. (${L} mm)`,
        category: 'edge',
        min: { x: -halfL, y: subframeHeight - 65, z: -halfW },
        max: { x: halfL, y: subframeHeight + 15, z: -halfW + edgeThick },
        color: edgeColor,
        stroke: goldAccent,
        spec: 'Rowek mocowania pasów co 100 mm (500 daN)'
      });

      // Right edge
      parts.push({
        id: 'edge_right',
        name: `Profil Obrzeżowy Prawy ALU-S.V. (${L} mm)`,
        category: 'edge',
        min: { x: -halfL, y: subframeHeight - 65, z: halfW - edgeThick },
        max: { x: halfL, y: subframeHeight + 15, z: halfW },
        color: edgeColor,
        stroke: goldAccent,
        spec: 'Rowek mocowania pasów co 100 mm (500 daN)'
      });

      // Front edge
      parts.push({
        id: 'edge_front',
        name: `Profil Obrzeżowy Przedni (${W} mm)`,
        category: 'edge',
        min: { x: -halfL, y: subframeHeight - 65, z: -halfW },
        max: { x: -halfL + edgeThick, y: subframeHeight + 15, z: halfW },
        color: edgeColor,
        stroke: primaryStroke,
        spec: 'Obrzeże przednie podłogi z rowkiem montażowym'
      });

      // Rear edge / tail bar
      parts.push({
        id: 'edge_rear',
        name: hasLift ? `Belka Tylna z Adapterem Dhollandia (${W} mm)` : `Belka Obrzeżowa Tylna (${W} mm)`,
        category: 'edge',
        min: { x: halfL - edgeThick, y: subframeHeight - 65, z: -halfW },
        max: { x: halfL, y: subframeHeight + 15, z: halfW },
        color: hasLift ? '#38BDF8' : edgeColor,
        stroke: hasLift ? '#0284C7' : primaryStroke,
        spec: hasLift ? 'Belka tylna zintegrowana z konsolą windy' : 'Belka tylna zamknięta'
      });

      // 2.4 OEM Chassis Flexible Mounting Brackets (Konsole mocujące)
      const bracketPositions = [-halfL + 300, -halfL * 0.2, halfL * 0.4, halfL - 300];
      bracketPositions.forEach((pos, idx) => {
        // Left bracket
        parts.push({
          id: `bracket_l_${idx}`,
          name: `Konsola Mocująca OEM BBG #${idx + 1} Lewa (85 Nm)`,
          category: 'bracket',
          min: { x: pos - 35, y: -45, z: -halfChassis - 50 },
          max: { x: pos + 35, y: 0, z: -halfChassis + 50 },
          color: '#38BDF8',
          stroke: '#0284C7',
          spec: 'Konsola elastyczna z przekładką EPDM 3mm'
        });
        // Right bracket
        parts.push({
          id: `bracket_r_${idx}`,
          name: `Konsola Mocująca OEM BBG #${idx + 1} Prawa (85 Nm)`,
          category: 'bracket',
          min: { x: pos - 35, y: -45, z: halfChassis - 50 },
          max: { x: pos + 35, y: 0, z: halfChassis + 50 },
          color: '#38BDF8',
          stroke: '#0284C7',
          spec: 'Konsola elastyczna z przekładką EPDM 3mm'
        });
      });
    }

    // =========================================================================
    // 3. PILLARS & VERTICAL COLUMNS (SŁUPY KONSTRUKCYJNE)
    // =========================================================================
    if (showPillars) {
      const pillarSize = 55;
      const pillarTopY = subframeHeight + H;

      // 3.1 Four Corner Pillars (4 Słupy Narożne)
      // Front Left Pillar
      parts.push({
        id: 'pillar_front_left',
        name: `Słupek Narożny Przód-Lewy (${H} mm)`,
        category: 'pillar',
        min: { x: -halfL, y: subframeHeight, z: -halfW },
        max: { x: -halfL + pillarSize, y: pillarTopY, z: -halfW + pillarSize },
        color: goldAccent,
        stroke: '#F59E0B',
        spec: `Słupek narożny anodowany h=${H} mm`
      });

      // Front Right Pillar
      parts.push({
        id: 'pillar_front_right',
        name: `Słupek Narożny Przód-Prawy (${H} mm)`,
        category: 'pillar',
        min: { x: -halfL, y: subframeHeight, z: halfW - pillarSize },
        max: { x: -halfL + pillarSize, y: pillarTopY, z: halfW },
        color: goldAccent,
        stroke: '#F59E0B',
        spec: `Słupek narożny anodowany h=${H} mm`
      });

      // Rear Left Pillar
      parts.push({
        id: 'pillar_rear_left',
        name: `Słupek Narożny Tył-Lewy (${H} mm)`,
        category: 'pillar',
        min: { x: halfL - pillarSize, y: subframeHeight, z: -halfW },
        max: { x: halfL, y: pillarTopY, z: -halfW + pillarSize },
        color: goldAccent,
        stroke: '#F59E0B',
        spec: `Słupek narożny portalowy h=${H} mm`
      });

      // Rear Right Pillar
      parts.push({
        id: 'pillar_rear_right',
        name: `Słupek Narożny Tył-Prawy (${H} mm)`,
        category: 'pillar',
        min: { x: halfL - pillarSize, y: subframeHeight, z: halfW - pillarSize },
        max: { x: halfL, y: pillarTopY, z: halfW },
        color: goldAccent,
        stroke: '#F59E0B',
        spec: `Słupek narożny portalowy h=${H} mm`
      });

      // 3.2 Intermediate Sliding Pillars (Słupy środkowe Kinegrip K20)
      if (isDivided) {
        // Two mid pillars per side if extra long (>4200mm)
        const midOffsets = [-halfL * 0.3, halfL * 0.3];
        midOffsets.forEach((xOffset, mIdx) => {
          // Left Mid Pillar
          parts.push({
            id: `pillar_mid_l_${mIdx}`,
            name: `Słupek Środkowy Kinegrip K20 Lewy #${mIdx + 1} (${H} mm)`,
            category: 'pillar',
            min: { x: xOffset - 25, y: subframeHeight, z: -halfW },
            max: { x: xOffset + 25, y: pillarTopY, z: -halfW + 45 },
            color: pillarColor,
            stroke: goldAccent,
            spec: 'Słupek aluminiowy wypinany Kinegrip K20 ze wspomaganiem'
          });
          // Right Mid Pillar
          parts.push({
            id: `pillar_mid_r_${mIdx}`,
            name: `Słupek Środkowy Kinegrip K20 Prawy #${mIdx + 1} (${H} mm)`,
            category: 'pillar',
            min: { x: xOffset - 25, y: subframeHeight, z: halfW - 45 },
            max: { x: xOffset + 25, y: pillarTopY, z: halfW },
            color: pillarColor,
            stroke: goldAccent,
            spec: 'Słupek aluminiowy wypinany Kinegrip K20 ze wspomaganiem'
          });
        });
      } else {
        // One center pillar per side (in middle X = 0)
        parts.push({
          id: 'pillar_mid_left',
          name: `Słupek Środkowy Kinegrip K20 Lewy (${H} mm)`,
          category: 'pillar',
          min: { x: -25, y: subframeHeight, z: -halfW },
          max: { x: 25, y: pillarTopY, z: -halfW + 45 },
          color: pillarColor,
          stroke: goldAccent,
          spec: 'Słupek aluminiowy wypinany Kinegrip K20 z zamkiem kasetowym'
        });

        parts.push({
          id: 'pillar_mid_right',
          name: `Słupek Środkowy Kinegrip K20 Prawy (${H} mm)`,
          category: 'pillar',
          min: { x: -25, y: subframeHeight, z: halfW - 45 },
          max: { x: 25, y: pillarTopY, z: halfW },
          color: pillarColor,
          stroke: goldAccent,
          spec: 'Słupek aluminiowy wypinany Kinegrip K20 z zamkiem kasetowym'
        });
      }
    }

    // =========================================================================
    // 4. FRONT BULKHEAD FRAME & REAR PORTAL (ŚCIANA PRZEDNIA I PORTAL TYLNY)
    // =========================================================================
    if (showBulkhead) {
      const pillarTopY = subframeHeight + H;

      // 4.1 Front Bulkhead Reinforcements (Szczeble poziome ściany przedniej)
      // Lower front panel frame
      parts.push({
        id: 'bulkhead_lower',
        name: `Belka Dolna Ściany Przedniej ALU-S.V. (${W - 110} mm)`,
        category: 'bulkhead',
        min: { x: -halfL, y: subframeHeight, z: -halfW + 55 },
        max: { x: -halfL + 30, y: subframeHeight + 350, z: halfW - 55 },
        color: '#94A3B8',
        stroke: '#64748B',
        spec: 'Osłona ze sklejki + panel aluminiowy DIN EN 12642'
      });

      // Mid bulkhead crossbar
      parts.push({
        id: 'bulkhead_mid',
        name: `Belka Poprzeczna Wzmacniająca Ściany Przedniej (${W - 110} mm)`,
        category: 'bulkhead',
        min: { x: -halfL, y: subframeHeight + H * 0.5 - 25, z: -halfW + 55 },
        max: { x: -halfL + 30, y: subframeHeight + H * 0.5 + 25, z: halfW - 55 },
        color: '#64748B',
        stroke: '#475569',
        spec: 'Poprzeczka wzmacniająca ścianę przednią ECE R126'
      });

      // Upper front header beam
      parts.push({
        id: 'bulkhead_upper',
        name: `Górna Belka Czołowa Ściany Przedniej (${W} mm)`,
        category: 'bulkhead',
        min: { x: -halfL, y: pillarTopY - 55, z: -halfW },
        max: { x: -halfL + 45, y: pillarTopY, z: halfW },
        color: edgeColor,
        stroke: goldAccent,
        spec: 'Profil wieńczący ścianę przednią'
      });

      // 4.2 Rear Portal Upper Beam (Belka Górna Portalu Tylnego / Nadproże)
      parts.push({
        id: 'portal_rear_upper',
        name: `Górna Belka Portalu Tylnego / Nadproże (${W} mm)`,
        category: 'bulkhead',
        min: { x: halfL - 45, y: pillarTopY - 55, z: -halfW },
        max: { x: halfL, y: pillarTopY, z: halfW },
        color: edgeColor,
        stroke: goldAccent,
        spec: 'Nadproże tylne pod zasuwaną plandekę lub drzwi kontenerowe'
      });
    }

    // =========================================================================
    // 5. ROOF FRAMEWORK & BOWS (SZKIELET DACHU: PODŁUŻNICE, PAŁĄKI, RURKI)
    // =========================================================================
    if (showRoof) {
      const pillarTopY = subframeHeight + H;
      const roofRailWidth = 45;
      const roofRailHeight = 40;

      // 5.1 Left & Right Roof Cant-Rails (Podłużnice dachowe / Prowadnice Edscha)
      // Left Roof Rail
      parts.push({
        id: 'roof_rail_left',
        name: `Podłużnica Dachowa Lewa (Prowadnica Edscha) (${L} mm)`,
        category: 'roof_rail',
        min: { x: -halfL, y: pillarTopY - roofRailHeight, z: -halfW },
        max: { x: halfL, y: pillarTopY, z: -halfW + roofRailWidth },
        color: roofColor,
        stroke: goldAccent,
        spec: 'Aluminiowa podłużnica dachowa z rowkiem wózków plandeki'
      });

      // Right Roof Rail
      parts.push({
        id: 'roof_rail_right',
        name: `Podłużnica Dachowa Prawa (Prowadnica Edscha) (${L} mm)`,
        category: 'roof_rail',
        min: { x: -halfL, y: pillarTopY - roofRailHeight, z: halfW - roofRailWidth },
        max: { x: halfL, y: pillarTopY, z: halfW },
        color: roofColor,
        stroke: goldAccent,
        spec: 'Aluminiowa podłużnica dachowa z rowkiem wózków plandeki'
      });

      // 5.2 Transverse Roof Bows (Pałąki dachowe poprzeczne co 600 mm)
      const roofStepX = (L - 160) / Math.max(1, numRoofBows - 1);
      for (let j = 0; j < numRoofBows; j++) {
        const bowX = -halfL + 80 + j * roofStepX;
        parts.push({
          id: `roof_bow_${j}`,
          name: `Pałąk Dachowy Poprzeczny #${j + 1} (${W - 90} mm)`,
          category: 'roof_bow',
          min: { x: bowX - 16, y: pillarTopY - 25, z: -halfW + roofRailWidth },
          max: { x: bowX + 16, y: pillarTopY + 5, z: halfW - roofRailWidth },
          color: '#CBD5E1',
          stroke: '#64748B',
          spec: `Łuk dachowy rurowy co 600 mm podtrzymujący dach`
        });
      }

      // 5.3 Longitudinal Roof Tubes / Slats (Listwy wzdłużne stabilizujące dach)
      const tubeZOffsets = [-halfW * 0.45, 0, halfW * 0.45];
      tubeZOffsets.forEach((zOff, tIdx) => {
        parts.push({
          id: `roof_tube_${tIdx}`,
          name: `Wzdłużna Rurka Dachowa #${tIdx + 1} (${L - 100} mm)`,
          category: 'roof_tube',
          min: { x: -halfL + 50, y: pillarTopY - 15, z: zOff - 12 },
          max: { x: halfL - 50, y: pillarTopY + 5, z: zOff + 12 },
          color: '#E2E8F0',
          stroke: '#94A3B8',
          spec: 'Aluminiowa rurka wzdłużna stężająca dach'
        });
      });
    }

    // =========================================================================
    // 6. DHOLLANDIA TAIL LIFT ASSEMBLY (WINDA ZAŁADOWCZA NA TYLNYM NAWISIE)
    // =========================================================================
    if (hasLift && showLift) {
      // Lift Cantilever Brackets (Wsporniki montażowe)
      parts.push({
        id: 'lift_cantilever_left',
        name: 'Wspornik Przedłużenia Ramy Dhollandia Lewy (210 Nm)',
        category: 'lift',
        min: { x: halfL, y: -80, z: -halfChassis - 35 },
        max: { x: halfL + 180, y: subframeHeight - 20, z: -halfChassis + 35 },
        color: '#0284C7',
        stroke: '#38BDF8',
        spec: 'Śruby HV M16 kl. 10.9 (210 Nm)'
      });

      parts.push({
        id: 'lift_cantilever_right',
        name: 'Wspornik Przedłużenia Ramy Dhollandia Prawy (210 Nm)',
        category: 'lift',
        min: { x: halfL, y: -80, z: halfChassis - 35 },
        max: { x: halfL + 180, y: subframeHeight - 20, z: halfChassis + 35 },
        color: '#0284C7',
        stroke: '#38BDF8',
        spec: 'Śruby HV M16 kl. 10.9 (210 Nm)'
      });

      // Underrun Bar R58.03 (Belka przeciwnajazdowa zintegrowana)
      parts.push({
        id: 'lift_underrun_bar',
        name: 'Belka Zderzaka R58.03 Zintegrowana z Windą',
        category: 'lift',
        min: { x: halfL + 120, y: -190, z: -halfW + 80 },
        max: { x: halfL + 180, y: -120, z: halfW - 80 },
        color: '#0369A1',
        stroke: '#38BDF8',
        spec: 'Certyfikat ECE R58.03 zintegrowany z pompą 12V'
      });

      // Aluminum Lift Platform (Platforma windy pionowa na tylnym portalu)
      parts.push({
        id: 'lift_platform_folded',
        name: `Platforma Aluminiowa Dhollandia (${W - 40} mm)`,
        category: 'lift',
        min: { x: halfL + 15, y: subframeHeight - 40, z: -halfW + 20 },
        max: { x: halfL + 55, y: subframeHeight + 1450, z: halfW - 20 },
        color: '#0284C7',
        stroke: '#38BDF8',
        spec: 'Platforma lekka anodowana z profilami antypoślizgowymi'
      });
    }

    return parts;
  }, [
    L, 
    W, 
    H, 
    subframeHeight, 
    isAlu, 
    numCrossmembers, 
    numRoofBows, 
    isDivided, 
    chassisFrameSpacing, 
    hasLift,
    showBus,
    showFloorSubframe,
    showPillars,
    showBulkhead,
    showRoof,
    showLift,
    chassis,
    wb,
    foh,
    cabOffset
  ]);

  // Project 3D Point onto 2D Canvas space
  const project = (p: Point3D, cx: number, cy: number): Point2D => {
    const radY = (yaw * Math.PI) / 180;
    const x1 = p.x * Math.cos(radY) - p.z * Math.sin(radY);
    const z1 = p.x * Math.sin(radY) + p.z * Math.cos(radY);

    const radX = (pitch * Math.PI) / 180;
    const y2 = p.y * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = p.y * Math.sin(radX) + z1 * Math.cos(radX);

    // Perspective projection formula
    const cameraDist = 3600;
    const scaleFactor = (cameraDist / (cameraDist + z2)) * zoom;
    const screenX = cx + x1 * scaleFactor;
    // Invert Y for screen coordinates (Y up in 3D, Y down on screen)
    const screenY = cy - y2 * scaleFactor;

    return { x: screenX, y: screenY, depth: z2 };
  };

  // Render 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2 + 35;

    // Clear Canvas with sleek CAD background
    ctx.clearRect(0, 0, width, height);

    // Background CAD radial gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.7);
    bgGrad.addColorStop(0, '#0F1C3F');
    bgGrad.addColorStop(0.6, '#0B132B');
    bgGrad.addColorStop(1, '#070D1E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle 3D Isometric Ground Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 3500;
    const gridStep = 500;
    for (let x = -gridSize; x <= gridSize; x += gridStep) {
      const p1 = project({ x, y: -380, z: -gridSize }, cx, cy);
      const p2 = project({ x, y: -380, z: gridSize }, cx, cy);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let z = -gridSize; z <= gridSize; z += gridStep) {
      const p1 = project({ x: -gridSize, y: -380, z }, cx, cy);
      const p2 = project({ x: gridSize, y: -380, z }, cx, cy);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();

    // Sort 3D boxes by depth (Painter's algorithm)
    const sortedParts = [...all3DParts].map(part => {
      const center3D = {
        x: (part.min.x + part.max.x) / 2,
        y: (part.min.y + part.max.y) / 2,
        z: (part.min.z + part.max.z) / 2
      };
      const proj = project(center3D, cx, cy);
      return { part, depth: proj.depth };
    }).sort((a, b) => b.depth - a.depth);

    // Render each 3D box
    sortedParts.forEach(({ part }) => {
      const isHovered = hoveredPart?.id === part.id;
      const min = part.min;
      const max = part.max;

      // 8 Vertices of a Box
      const vertices: Point3D[] = [
        { x: min.x, y: min.y, z: min.z }, // 0
        { x: max.x, y: min.y, z: min.z }, // 1
        { x: max.x, y: max.y, z: min.z }, // 2
        { x: min.x, y: max.y, z: min.z }, // 3
        { x: min.x, y: min.y, z: max.z }, // 4
        { x: max.x, y: min.y, z: max.z }, // 5
        { x: max.x, y: max.y, z: max.z }, // 6
        { x: min.x, y: max.y, z: max.z }  // 7
      ];

      const projVertices = vertices.map(v => project(v, cx, cy));

      // 6 Faces: [v0, v1, v2, v3], normal, lighting
      const faces = [
        { indices: [0, 1, 2, 3], light: 0.85, name: 'front' },  // -Z
        { indices: [5, 4, 7, 6], light: 0.95, name: 'back' },   // +Z
        { indices: [3, 2, 6, 7], light: 1.15, name: 'top' },    // +Y
        { indices: [4, 5, 1, 0], light: 0.65, name: 'bottom' }, // -Y
        { indices: [4, 0, 3, 7], light: 0.75, name: 'left' },   // -X
        { indices: [1, 5, 6, 2], light: 1.05, name: 'right' }   // +X
      ];

      // Draw faces or wireframe
      if (viewMode === 'wireframe') {
        ctx.strokeStyle = isHovered ? '#D4AF37' : (part.stroke || '#94A3B8');
        ctx.lineWidth = isHovered ? 2.5 : 1;
        faces.forEach(face => {
          ctx.beginPath();
          ctx.moveTo(projVertices[face.indices[0]].x, projVertices[face.indices[0]].y);
          for (let i = 1; i < face.indices.length; i++) {
            ctx.lineTo(projVertices[face.indices[i]].x, projVertices[face.indices[i]].y);
          }
          ctx.closePath();
          ctx.stroke();
        });
      } else {
        // Shaded mode: draw faces with basic shading
        faces.forEach(face => {
          const pts = face.indices.map(i => projVertices[i]);
          
          // Backface culling check using cross product
          const v0 = pts[0];
          const v1 = pts[1];
          const v2 = pts[2];
          const cross = (v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x);
          if (cross > 0) return; // facing away

          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();

          // Calculate shaded color
          if (isHovered) {
            ctx.fillStyle = '#D4AF37';
          } else {
            ctx.fillStyle = part.color;
          }
          ctx.fill();

          ctx.strokeStyle = isHovered ? '#FFFFFF' : (part.stroke || 'rgba(0,0,0,0.4)');
          ctx.lineWidth = isHovered ? 1.5 : 0.8;
          ctx.stroke();
        });
      }
    });

    // 3D Annotations & Dimension Arrows
    if (viewMode === 'dimensions') {
      ctx.save();
      ctx.strokeStyle = '#D4AF37';
      ctx.fillStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.font = 'bold 11px monospace';

      // Length Dimension (L mm)
      const pL1 = project({ x: -L / 2, y: subframeHeight + H + 80, z: -W / 2 - 80 }, cx, cy);
      const pL2 = project({ x: L / 2, y: subframeHeight + H + 80, z: -W / 2 - 80 }, cx, cy);
      ctx.beginPath();
      ctx.moveTo(pL1.x, pL1.y);
      ctx.lineTo(pL2.x, pL2.y);
      ctx.stroke();
      const midL = { x: (pL1.x + pL2.x) / 2, y: (pL1.y + pL2.y) / 2 - 10 };
      ctx.fillText(`Długość Zabudowy L: ${L} mm`, midL.x - 45, midL.y);

      // Width Dimension (W mm)
      const pW1 = project({ x: L / 2 + 80, y: subframeHeight + 80, z: -W / 2 }, cx, cy);
      const pW2 = project({ x: L / 2 + 80, y: subframeHeight + 80, z: W / 2 }, cx, cy);
      ctx.beginPath();
      ctx.moveTo(pW1.x, pW1.y);
      ctx.lineTo(pW2.x, pW2.y);
      ctx.stroke();
      const midW = { x: (pW1.x + pW2.x) / 2 + 10, y: (pW1.y + pW2.y) / 2 };
      ctx.fillText(`Szerokość W: ${W} mm`, midW.x, midW.y);

      // Height Dimension (H mm)
      const pH1 = project({ x: -L / 2 - 80, y: subframeHeight, z: -W / 2 }, cx, cy);
      const pH2 = project({ x: -L / 2 - 80, y: subframeHeight + H, z: -W / 2 }, cx, cy);
      ctx.beginPath();
      ctx.moveTo(pH1.x, pH1.y);
      ctx.lineTo(pH2.x, pH2.y);
      ctx.stroke();
      ctx.fillText(`Wysokość H: ${H} mm`, pH2.x - 65, (pH1.y + pH2.y) / 2);

      // Frame Spacing Dimension
      const pC1 = project({ x: 0, y: -60, z: -chassisFrameSpacing / 2 }, cx, cy);
      const pC2 = project({ x: 0, y: -60, z: chassisFrameSpacing / 2 }, cx, cy);
      ctx.beginPath();
      ctx.moveTo(pC1.x, pC1.y);
      ctx.lineTo(pC2.x, pC2.y);
      ctx.stroke();
      ctx.fillText(`Rozstaw Ramy OEM: ${chassisFrameSpacing} mm`, (pC1.x + pC2.x) / 2 - 55, (pC1.y + pC2.y) / 2 + 16);

      ctx.restore();
    }

    // 3D Axis Indicator in corner
    ctx.save();
    const axisOrigin = { x: 55, y: height - 55 };
    const axisLen = 35;
    const axX = project({ x: 1, y: 0, z: 0 }, 0, 0);
    const axY = project({ x: 0, y: 1, z: 0 }, 0, 0);
    const axZ = project({ x: 0, y: 0, z: 1 }, 0, 0);

    // X axis (Red)
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(axisOrigin.x, axisOrigin.y);
    ctx.lineTo(axisOrigin.x + axX.x * axisLen * 10, axisOrigin.y - axX.y * axisLen * 10);
    ctx.stroke();

    // Y axis (Green)
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(axisOrigin.x, axisOrigin.y);
    ctx.lineTo(axisOrigin.x + axY.x * axisLen * 10, axisOrigin.y - axY.y * axisLen * 10);
    ctx.stroke();

    // Z axis (Blue)
    ctx.strokeStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(axisOrigin.x, axisOrigin.y);
    ctx.lineTo(axisOrigin.x + axZ.x * axisLen * 10, axisOrigin.y - axZ.y * axisLen * 10);
    ctx.stroke();

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('CAD 3D', axisOrigin.x - 18, axisOrigin.y + 22);
    ctx.restore();

  }, [
    all3DParts, 
    yaw, 
    pitch, 
    zoom, 
    viewMode, 
    hoveredPart, 
    L, 
    W, 
    H, 
    chassisFrameSpacing, 
    subframeHeight
  ]);

  return (
    <div className={`bg-[#0B132B] border border-[#D4AF37]/30 rounded-xl overflow-hidden shadow-2xl transition-all ${
      isExpanded ? 'fixed inset-4 z-50 flex flex-col bg-[#070D1E]' : 'relative'
    } ${className}`}>
      
      {/* 3D Header & Control Toolbar */}
      <div className="bg-[#1C2541]/90 border-b border-[#D4AF37]/25 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#0B132B] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-sm">
            <Rotate3d className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs tracking-wide">
                KOMPLETNY SZKIELET 3D ZABUDOWY & BUSA
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                Rama · Słupy · Dach · Podwozie
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Podwozie: {chassis.brand} {chassis.model} · Wymiary: {L} x {W} x {H} mm · {all3DParts.length} elementów CAD
            </div>
          </div>
        </div>

        {/* View Mode Buttons & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Quick Skeleton Filter Presets */}
          <div className="hidden sm:flex items-center bg-[#070D1E] p-0.5 rounded border border-slate-700">
            <button
              onClick={() => applyPreset('all')}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-white transition-colors"
              title="Pokaż wszystko: Bus, rama, słupy, dach"
            >
              Kompletny
            </button>
            <button
              onClick={() => applyPreset('skeleton')}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-[#D4AF37] transition-colors"
              title="Sam szkielet nadwozia bez kabiny"
            >
              Sam Szkielet
            </button>
            <button
              onClick={() => applyPreset('floor')}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-sky-400 transition-colors"
              title="Rama pośrednia i poprzeczki podłogi"
            >
              Podłoga
            </button>
            <button
              onClick={() => applyPreset('roof')}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-emerald-400 transition-colors"
              title="Tylko słupy i dach"
            >
              Dach+Słupy
            </button>
          </div>

          {/* Shading mode */}
          <div className="flex items-center bg-[#070D1E] p-0.5 rounded border border-slate-700">
            <button
              onClick={() => setViewMode('shaded')}
              className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                viewMode === 'shaded' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cieniowanie
            </button>
            <button
              onClick={() => setViewMode('wireframe')}
              className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                viewMode === 'wireframe' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Szkielet CAD
            </button>
            <button
              onClick={() => setViewMode('dimensions')}
              className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                viewMode === 'dimensions' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wymiary 3D
            </button>
          </div>

          {/* Preset Camera Angles */}
          <div className="hidden md:flex items-center gap-1 bg-[#070D1E] p-0.5 rounded border border-slate-700">
            <button
              onClick={() => { setYaw(42); setPitch(24); setZoom(0.095); }}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-[#D4AF37]"
              title="Izometria 3D"
            >
              Izometria
            </button>
            <button
              onClick={() => { setYaw(0); setPitch(75); setZoom(0.105); }}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-[#D4AF37]"
              title="Rzut z góry"
            >
              Z góry
            </button>
            <button
              onClick={() => { setYaw(90); setPitch(8); setZoom(0.095); }}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-[#D4AF37]"
              title="Rzut boczny"
            >
              Bok
            </button>
          </div>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded border transition-colors ${
              autoRotate ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={autoRotate ? "Zatrzymaj obrót automatyczny" : "Uruchom obrót 3D"}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>

          {/* Expand / Collapse Fullscreen */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded border border-slate-700 bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isExpanded ? "Zmniejsz widok" : "Powiększ na cały ekran"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Layer Visibility Quick Bar */}
      <div className="bg-[#0B132B] px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
          WARSTWY SZKIELETU:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBus(!showBus)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showBus ? 'bg-sky-500/15 border-sky-500/40 text-sky-300' : 'bg-slate-800/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Kabina & Koła Busa</span>
          </button>

          <button
            onClick={() => setShowFloorSubframe(!showFloorSubframe)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showFloorSubframe ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' : 'bg-slate-800/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>Rama & Poprzeczki Podłogi ({numCrossmembers})</span>
          </button>

          <button
            onClick={() => setShowPillars(!showPillars)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showPillars ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300' : 'bg-slate-800/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span>🏛️ Słupy Narożne & Kinegrip</span>
          </button>

          <button
            onClick={() => setShowRoof(!showRoof)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showRoof ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-800/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span>⛺ Szkielet Dachu ({numRoofBows} pałąków)</span>
          </button>

          <button
            onClick={() => setShowBulkhead(!showBulkhead)}
            className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
              showBulkhead ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' : 'bg-slate-800/50 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span>🚪 Ściana Przednia & Portal</span>
          </button>

          {hasLift && (
            <button
              onClick={() => setShowLift(!showLift)}
              className={`px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                showLift ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' : 'bg-slate-800/50 border-slate-800 text-slate-500 line-through'
              }`}
            >
              <span>🦽 Winda Dhollandia</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive 3D Canvas Viewport */}
      <div 
        className={`relative w-full ${isExpanded ? 'flex-1' : 'h-[360px] sm:h-[440px]'} cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <canvas
          ref={canvasRef}
          width={isExpanded ? 1440 : 1000}
          height={isExpanded ? 800 : 440}
          className="w-full h-full object-cover"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 left-3 pointer-events-none space-y-1 font-mono text-[10px]">
          <div className="bg-[#0B132B]/90 border border-slate-800 p-2.5 rounded backdrop-blur-sm space-y-1 shadow-lg max-w-xs">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>Rotacja 3D myszką (Pitch: {Math.round(pitch)}° · Yaw: {Math.round(yaw)}°)</span>
            </div>
            <div className="text-slate-300 text-[10px]">
              Elementy szkieletu: <strong className="text-white">{all3DParts.length} szt.</strong>
            </div>
            <div className="text-slate-400 text-[9px] leading-tight">
              Podłużnice: 2x {L}mm · Poprzeczki podłogi: {numCrossmembers}x co 380mm · Pałąki dachu: {numRoofBows}x co 600mm
            </div>
            {hasLift && (
              <div className="text-sky-400 font-semibold text-[9.5px]">
                Winda Dhollandia zamontowana na belce tylnej
              </div>
            )}
          </div>
        </div>

        {/* Zoom Controls Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-[#0B132B]/85 border border-slate-800 p-1 rounded backdrop-blur-sm shadow-md">
          <button
            onClick={() => setZoom(prev => Math.max(0.05, prev - 0.015))}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold font-mono"
            title="Oddal 3D"
          >
            -
          </button>
          <span className="text-[10px] font-mono text-slate-300 px-1">
            {Math.round(zoom * 1000)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(0.25, prev + 0.015))}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold font-mono"
            title="Przybliż 3D"
          >
            +
          </button>
        </div>

        {/* Legend of 3D Skeleton Components */}
        <div className="absolute bottom-3 left-3 hidden lg:flex items-center gap-2.5 bg-[#0B132B]/90 border border-slate-800 px-3 py-1.5 rounded backdrop-blur-sm text-[10px] font-mono shadow-md">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#334155] border border-[#475569]" />
            <span className="text-slate-300">Rama Busa</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#CBD5E1] border border-[#94A3B8]" />
            <span className="text-slate-300">Podłużnice C-120</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#94A3B8]" />
            <span className="text-slate-300">Poprzeczki Z-Alu</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37]" />
            <span className="text-slate-300">Słupy Kinegrip K20</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#E2E8F0] border border-[#D4AF37]" />
            <span className="text-slate-300">Szkielet Dachu</span>
          </div>
        </div>

      </div>

      {/* Footer Info Ribbon with Engineering Specifications */}
      <div className="bg-[#1C2541]/90 border-t border-[#D4AF37]/20 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-300">
        <div className="flex flex-wrap items-center gap-3">
          <span>TOLERANCJA RAMY: <strong className="text-emerald-400">ISO 2768-mK (&Delta;D &le; 1.5 mm)</strong></span>
          <span>·</span>
          <span>ROZSTAW POPRZECZEK PODŁOGI: <strong className="text-white">380 mm</strong></span>
          <span>·</span>
          <span>ROZSTAW PAŁĄKÓW DACHU: <strong className="text-white">600 mm</strong></span>
          <span>·</span>
          <span>STOPOWE PROFILE: <strong className="text-[#D4AF37]">EN AW-6005A-T6 Anodowane</strong></span>
        </div>

        <div className="text-[10px] text-slate-400">
          ALU-S.V. Full-Skeleton CAD Engine · Zgodność OEM BBG & DIN EN 12642
        </div>
      </div>

    </div>
  );
};
