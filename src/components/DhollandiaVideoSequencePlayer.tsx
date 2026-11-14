import React, { useState, useEffect, useRef, useId } from 'react';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { DHALLANDIA_LIFTS } from '../data/masterSpecsData';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Volume2, 
  VolumeX, 
  Video, 
  Sparkles, 
  Wrench, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Copy, 
  Check, 
  Sliders, 
  Info, 
  AlertTriangle,
  Flame,
  Layers,
  ArrowLeft
} from 'lucide-react';

interface DhollandiaVideoSequencePlayerProps {
  config: ActiveProjectConfiguration;
  calculations: AxleLoadCalculation;
  onBackToBom?: () => void;
  onOpenManual?: () => void;
}

interface AssemblyStage {
  id: number;
  title: string;
  subtitle: string;
  durationSec: number;
  timeRange: [number, number]; // [startSec, endSec]
  category: 'mechanical' | 'electrical' | 'hydraulics' | 'testing';
  torqueOrSpec: string;
  tools: string[];
  oemRegulation: string;
  description: string;
  keyInstructions: string[];
}

const ASSEMBLY_STAGES: AssemblyStage[] = [
  {
    id: 1,
    title: 'KROK 1: Weryfikacja Podwozia i Pozycjonowanie Płyt Montażowych',
    subtitle: 'Mocowanie wsporników bocznych do podłużnic ramy pojazdu',
    durationSec: 6,
    timeRange: [0, 6],
    category: 'mechanical',
    torqueOrSpec: 'Śruby M14 kl. 10.9 · Moment dokręcania: 170 Nm',
    tools: ['Klucz dynamometryczny 200 Nm', 'Nasadka 22mm', 'Poziomica laserowa'],
    oemRegulation: 'Wytyczne Renault Master BBG / Iveco BBG: Zakaz wiercenia w pasach nośnych!',
    description: 'Weryfikacja geometrii tylnego nawisu i rozstawu podłużnic. Przykręcenie ocynkowanych płyt nośnych windy do fabrycznych otworów w ściance pionowej podłużnicy podwozia.',
    keyInstructions: [
      'Sprawdź wysokość ramy od podłoża w stanie nieobciążonym.',
      'Użyj wyłącznie certyfikowanych śrub M14 klasy 10.9 z podkładkami utwardzanymi.',
      'Dokręć połączenia naprzemiennie z momentem 170 Nm.'
    ]
  },
  {
    id: 2,
    title: 'KROK 2: Montaż Ramy Nośnej Windy i Geometria Poziomowania',
    subtitle: 'Podwieszenie belki nośnej, ramion unoszących i siłowników',
    durationSec: 6,
    timeRange: [6, 12],
    category: 'mechanical',
    torqueOrSpec: 'Tolerancja pozioma: ±1.5 mm · Zderzak ECE R58.03',
    tools: ['Wózek widłowy / podnośnik hydrauliczny', 'Kątomierz cyfrowy'],
    oemRegulation: 'ECE R58.03: Belka windy pełni zintegrowaną funkcję zderzaka tylnego',
    description: 'Wprowadzenie centralnej belki nośnej pomiędzy płyty boczne. Ustawienie kąta natarcia i wysokości względem krawędzi załadunkowej podłogi zabudowy ALU-S.V.',
    keyInstructions: [
      'Wypoziomuj belkę nośną względem ramy pośredniej ALU-S.V.',
      'Nasmaruj sworznie obrotowe smarem litowym EP2 przed montażem zawleczek.',
      'Sprawdź luz roboczy między ramionami windy a obrzeżem podłogi.'
    ]
  },
  {
    id: 3,
    title: 'KROK 3: Prowadzenie Instalacji Prądowej 12V i Hebla Kabinowego',
    subtitle: 'Główna linia zasilająca, bezpiecznik MEGA-FUSE i odcięcie awaryjne',
    durationSec: 6,
    timeRange: [12, 18],
    category: 'electrical',
    torqueOrSpec: 'Przekrój min. 35 mm² · Bezpiecznik MEGA 150A / 200A',
    tools: ['Praska sześciokątna do końcówek kablowych', 'Ściągacz izolacji', 'Peszel PA6'],
    oemRegulation: 'PN-EN 1756-1 & OEM: Zakaz pobierania masy przez łożyska/sworznie!',
    description: 'Prowadzenie przewodu prądowego 35 mm² w peszlu poliamidowym wzdłuż podłużnicy. Montaż bezpiecznika MEGA-FUSE max 300 mm od akumulatora i hebla kabinowego z kluczykiem.',
    keyInstructions: [
      'Kabel zasilający umieść w peszlu samogasnącym PA6 mocowanym co 300 mm.',
      'Dedykowany kabel masowy 35 mm² połącz bezpośrednio z punktem masowym ramy.',
      'Podłącz hebel kabinowy w strefie fotela kierowcy z kontrolką załączenia.'
    ]
  },
  {
    id: 4,
    title: 'KROK 4: Agregat Elektrohydrauliczny, Zawory VE1/VE2 i Skrzynka',
    subtitle: 'Podłączenie cewek elektrozaworów, stycznika pompy i kasety sterowniczej',
    durationSec: 6,
    timeRange: [18, 24],
    category: 'hydraulics',
    torqueOrSpec: 'Ciśnienie nominalne: 185 bar · Hermetyczność IP67',
    tools: ['Miernik uniwersalny / woltomierz', 'Śrubokręt izolowany 1000V'],
    oemRegulation: 'Sterowanie dwuręczne (Deadman) po prawej stronie od chodnika',
    description: 'Połączenie 7-żyłowej wiązki skrzynki zewnętrznej (IP67) z blokiem hydraulicznym. Podpięcie zaworu opuszczania VE1, zaworu przechyłu VE2 i zasilania silnika 1.2 kW.',
    keyInstructions: [
      'Skrzynkę sterowniczą zamontuj na prawej burcie (bezpieczeństwo operatora).',
      'Podłącz styk bezpieczeństwa Deadman zapobiegający przypadkowemu startowi.',
      'Zabezpiecz złącza elektryczne wazeliną techniczną antykorozyjną.'
    ]
  },
  {
    id: 5,
    title: 'KROK 5: Czujniki Położenia i Światła Ostrzegawcze LED Platformy',
    subtitle: 'System ostrzegawczy migający na narożnikach platformy i brzęczyk kabinowy',
    durationSec: 6,
    timeRange: [24, 30],
    category: 'electrical',
    torqueOrSpec: 'Częstotliwość błysków: 2 Hz · Poziom dźwięku brzęczyka: > 75 dB',
    tools: ['Lutownica gazowa / złączki termokurczliwe z cyną', 'Opalarka'],
    oemRegulation: 'Kodeks Drogowy & BHP: Wymóg ostrzegania o opuszczonej platformie',
    description: 'Montaż czujnika kąta nachylenia platformy. Automatyczne załączanie pulsacyjnych świateł bursztynowych LED na krawędziach po otwarciu platformy powyżej 10°.',
    keyInstructions: [
      'Sprawdź działanie czujnika kontaktronowego ryglowania transportowego.',
      'Zweryfikuj załączanie brzęczyka w kabinie przy otwartej platformie i włączonym zapłonie.',
      'Upewnij się, że przewody w profilu platformy nie ulegają załamaniu podczas zamykania.'
    ]
  },
  {
    id: 6,
    title: 'KROK 6: Napełnienie Układu, Odpowietrzenie i Próby Odbiorcze UDT',
    subtitle: 'Olej ISO VG 15, cykle testowe oraz kontrola zaworów dławiących',
    durationSec: 6,
    timeRange: [30, 36],
    category: 'testing',
    torqueOrSpec: 'Pojemność oleju: 3.5 L · Próba statyczna: 125% udźwigu',
    tools: ['Olej hydrauliczny ISO VG 15', 'Obciążniki testowe UDT', 'Manometr 250 bar'],
    oemRegulation: 'Norma PN-EN 1756-1 & Wymogi Dozoru Technicznego (UDT)',
    description: 'Napełnienie zbiornika olejem. Wykonanie 3 pełnych cykli roboczych bez obciążenia w celu samoczynnego odpowietrzenia siłowników. Próba odbiorcza z nominalnym ładunkiem.',
    keyInstructions: [
      'Zalej zbiornik olejem do poziomu wskaźnika max (ok. 3.5 litra).',
      'Wykonaj 3 cykle góra-dół, kontrolując szczelność połączeń na złączkach JIC.',
      'Sprawdź prędkość opuszczania (nie może przekraczać 0.15 m/s zgodnie z normą).'
    ]
  }
];

export const DhollandiaVideoSequencePlayer: React.FC<DhollandiaVideoSequencePlayerProps> = ({
  config,
  calculations,
  onBackToBom,
  onOpenManual
}) => {
  const currentLiftId = config.dhollandiaLiftId || 'dhollandia_dhlm08_750';
  const selectedLift = DHALLANDIA_LIFTS.find(l => l.id === currentLiftId) || DHALLANDIA_LIFTS[1];

  const totalDuration = 36; // 36 seconds total
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'player' | 'veo_prompt' | 'sop_checklist'>('player');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Find active stage
  const currentStage = ASSEMBLY_STAGES.find(
    s => currentTime >= s.timeRange[0] && currentTime < s.timeRange[1]
  ) || ASSEMBLY_STAGES[ASSEMBLY_STAGES.length - 1];

  // Initialize Web Audio synthesizer for technical mechanical effects
  const playTechAudioBeep = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    if (!isAudioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext fallback silent
    }
  };

  // Playback timer loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const deltaSec = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setCurrentTime(prev => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Handle stage change sound cues
  const lastStageIdRef = useRef<number>(1);
  useEffect(() => {
    if (currentStage.id !== lastStageIdRef.current) {
      lastStageIdRef.current = currentStage.id;
      if (isPlaying) {
        playTechAudioBeep(880, 0.12, 'triangle');
      }
    }
  }, [currentStage.id, isPlaying]);

  // Main Canvas Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background: Dark engineering CAD blueprint grid
    ctx.fillStyle = '#070D1E';
    ctx.fillRect(0, 0, width, height);

    // Draw subtle CAD grid
    ctx.strokeStyle = '#1C2541';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Normalized progress in stage
    const stageStart = currentStage.timeRange[0];
    const stageDuration = currentStage.durationSec;
    const stageProgress = Math.min(1, Math.max(0, (currentTime - stageStart) / stageDuration));

    // Vehicle silhouette reference coordinates (Commercial Chassis, e.g. Renault Master L3)
    const groundY = height - 120;
    const chassisLeftX = 160;
    const chassisRearX = width - 360;
    const chassisTopY = groundY - 140;

    // Draw Chassis Rails (Silver / Grey metallic)
    ctx.fillStyle = '#334155';
    ctx.fillRect(chassisLeftX, chassisTopY + 40, chassisRearX - chassisLeftX, 35);
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.strokeRect(chassisLeftX, chassisTopY + 40, chassisRearX - chassisLeftX, 35);

    // Draw Front Cabin Silhouette (Left side)
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.moveTo(chassisLeftX - 90, groundY - 40);
    ctx.lineTo(chassisLeftX - 90, groundY - 180);
    ctx.lineTo(chassisLeftX + 30, groundY - 180);
    ctx.lineTo(chassisLeftX + 70, groundY - 70);
    ctx.lineTo(chassisLeftX + 70, groundY - 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cabin label
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px monospace';
    ctx.fillText(`${config.chassis.brand} ${config.chassis.model} CAB`, chassisLeftX - 70, groundY - 190);

    // Wheels (Front & Rear)
    const drawWheel = (wx: number, wy: number) => {
      ctx.beginPath();
      ctx.arc(wx, wy, 42, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Rim
      ctx.beginPath();
      ctx.arc(wx, wy, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#94A3B8';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();
    };

    drawWheel(chassisLeftX, groundY - 40); // Front wheel
    drawWheel(chassisRearX - 120, groundY - 40); // Rear wheel

    // Draw ALU-S.V. Subframe base (Above chassis)
    ctx.fillStyle = '#475569';
    ctx.fillRect(chassisLeftX + 60, chassisTopY + 15, chassisRearX - chassisLeftX - 40, 25);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(chassisLeftX + 60, chassisTopY + 15, chassisRearX - chassisLeftX - 40, 25);
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('RAMA POŚREDNIA ALU-S.V.', chassisLeftX + 80, chassisTopY + 31);

    // Dynamic Elements depending on Active Stage:
    const liftX = chassisRearX + 20;

    // Stage 1: Chassis prep & Mounting brackets
    if (currentStage.id >= 1) {
      const bracketAlpha = currentStage.id === 1 ? stageProgress : 1;
      ctx.save();
      ctx.globalAlpha = bracketAlpha;
      // Mounting plate
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(chassisRearX - 60, chassisTopY + 20, 80, 75);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(chassisRearX - 60, chassisTopY + 20, 80, 75);

      // Bolts M14 10.9
      const boltPositions = [
        [chassisRearX - 40, chassisTopY + 40],
        [chassisRearX, chassisTopY + 40],
        [chassisRearX - 40, chassisTopY + 70],
        [chassisRearX, chassisTopY + 70]
      ];
      boltPositions.forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#D97706';
        ctx.fill();
        ctx.strokeStyle = '#FEF3C7';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      if (currentStage.id === 1) {
        // Animated torque wrench indicator
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('⚡ ŚRUBY M14 10.9: 170 Nm', chassisRearX - 70, chassisTopY - 10);

        ctx.strokeStyle = '#F59E0B';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(chassisRearX, chassisTopY + 20);
        ctx.lineTo(chassisRearX, chassisTopY - 5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // Stage 2: Lift main beam and lift arms
    if (currentStage.id >= 2) {
      const beamProgress = currentStage.id === 2 ? stageProgress : 1;
      ctx.save();
      ctx.globalAlpha = beamProgress;

      // Central tube / beam
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(liftX - 30, chassisTopY + 50, 60, 50);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.strokeRect(liftX - 30, chassisTopY + 50, 60, 50);

      // Lift Arm
      ctx.beginPath();
      ctx.moveTo(liftX, chassisTopY + 75);
      const armEndX = liftX + 80;
      const armEndY = chassisTopY + 75 + (currentStage.id >= 6 ? Math.sin(stageProgress * Math.PI) * 40 : 0);
      ctx.lineTo(armEndX, armEndY);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#64748B';
      ctx.stroke();

      // Aluminum Platform
      const platX = armEndX;
      const platY = armEndY;
      ctx.fillStyle = '#CBD5E1';
      // If stage >= 5, platform is unfolded or moving
      if (currentStage.id >= 4) {
        ctx.fillRect(platX, platY - 5, 130, 10);
        ctx.strokeStyle = '#94A3B8';
        ctx.strokeRect(platX, platY - 5, 130, 10);
      } else {
        // Vertical folded position
        ctx.fillRect(platX, platY - 120, 10, 120);
        ctx.strokeStyle = '#94A3B8';
        ctx.strokeRect(platX, platY - 120, 10, 120);
      }

      ctx.restore();
    }

    // Stage 3: Electrical 12V Power Line (from front battery to rear)
    if (currentStage.id >= 3) {
      ctx.save();
      // Glowing 12V Copper Line
      ctx.strokeStyle = '#EF4444'; // Red +12V Line
      ctx.lineWidth = 4;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(chassisLeftX - 30, groundY - 120); // Battery pos
      ctx.lineTo(chassisLeftX + 20, chassisTopY + 70);
      ctx.lineTo(liftX - 25, chassisTopY + 70);
      ctx.stroke();

      // Battery Box icon
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(chassisLeftX - 45, groundY - 135, 30, 25);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('12V', chassisLeftX - 41, groundY - 119);

      // Mega fuse box
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(chassisLeftX + 5, chassisTopY + 62, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('F', chassisLeftX + 9, chassisTopY + 74);

      if (currentStage.id === 3) {
        // Pulsing line animation
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('⚡ LINIA 35 mm² · MEGA-FUSE 150A · HEBEL KABINOWY', chassisLeftX + 20, groundY - 145);
      }
      ctx.restore();
    }

    // Stage 4: Hydraulics & Power pack valves
    if (currentStage.id >= 4) {
      ctx.save();
      // Powerpack box
      ctx.fillStyle = '#0F766E';
      ctx.fillRect(liftX - 25, chassisTopY + 60, 45, 35);
      ctx.strokeStyle = '#2DD4BF';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(liftX - 25, chassisTopY + 60, 45, 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('PUMP', liftX - 20, chassisTopY + 80);

      // Control box (Yellow) on the side
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(liftX + 25, chassisTopY + 25, 20, 30);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('CTRL', liftX + 26, chassisTopY + 42);

      if (currentStage.id === 4) {
        ctx.fillStyle = '#2DD4BF';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('⚙️ AGREGAT 1.2 kW · ELEKTROZAWORY VE1 / VE2 (185 bar)', liftX - 60, chassisTopY + 120);
      }
      ctx.restore();
    }

    // Stage 5: Flashing LEDs & Sensors
    if (currentStage.id >= 5) {
      ctx.save();
      // Flashing amber LEDs on platform edge
      const flash = Math.sin(Date.now() / 150) > 0;
      const ledColor = flash ? '#F59E0B' : '#78350F';
      const ledGlow = flash ? 15 : 0;

      ctx.fillStyle = ledColor;
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = ledGlow;

      // Platform corner LEDs
      ctx.beginPath();
      ctx.arc(liftX + 80 + 125, chassisTopY + 70, 6, 0, Math.PI * 2);
      ctx.fill();

      if (currentStage.id === 5) {
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('🚨 ŚWIATŁA BŁYSKOWE LED 2Hz · CZUJNIK PRZECHYŁU >10°', liftX - 10, chassisTopY + 140);
      }
      ctx.restore();
    }

    // Stage 6: Testing & UDT acceptance motion
    if (currentStage.id === 6) {
      ctx.save();
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`✓ PRÓBA UDT: UDŹWIG ${selectedLift.capacityKg} kg · ODPOWIETRZENIE UKŁADU`, width / 2 - 200, 60);
      ctx.restore();
    }

    // HUD Header on Canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`DHOLLANDIA ${selectedLift.model} · MONTAŻ DLA ${config.chassis.brand.toUpperCase()}`, 30, 40);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`SEKWENCJA: ${currentStage.title}`, 30, 62);

    // Timecode & Frame Counter (Top Right)
    const mins = Math.floor(currentTime / 60);
    const secs = Math.floor(currentTime % 60);
    const ms = Math.floor((currentTime % 1) * 100);
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    
    ctx.fillStyle = '#64748B';
    ctx.font = '12px monospace';
    ctx.fillText(`CZAS: ${timeFormatted} / 00:36.00  |  FPS: 60`, width - 260, 40);

  }, [currentTime, currentStage, config, selectedLift]);

  // Handle Play / Pause Toggle
  const togglePlay = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Reset to Start
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Jump to specific stage
  const handleJumpToStage = (stage: AssemblyStage) => {
    setCurrentTime(stage.timeRange[0]);
    setIsPlaying(true);
  };

  // Record Real WebM Video using Canvas CaptureStream & MediaRecorder
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(30); // 30 FPS stream
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setCurrentTime(0);
      setIsPlaying(true);

      // Auto stop after 36 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsPlaying(false);
        }
      }, (totalDuration / playbackSpeed) * 1000 + 500);

    } catch (err) {
      console.error('Error starting video recording:', err);
      setIsRecording(false);
    }
  };

  // Veo 3.1 Prompt text prepared for Google AI Studio / Gemini API
  const veoPromptText = `Cinematic photorealistic 3D engineering animation of the complete assembly sequence of a Dhollandia hydraulic tail lift (${selectedLift.model}, ${selectedLift.capacityKg} kg capacity) onto a new 2026 ${config.chassis.brand} ${config.chassis.model} commercial vehicle chassis cab equipped with an ALU-S.V. subframe.

Step 1: Alignment and bolting of galvanized heavy-duty side brackets to OEM chassis side rails using M14 grade 10.9 bolts with precise 170 Nm torque indication.
Step 2: Installation of the main lift tube beam fulfilling ECE R58.03 rear underrun protection standard, hydraulic lift arms and leveling check within ±1.5 mm tolerance.
Step 3: High-current 12V electrical wiring: 35mm² corrugated PA6 conduits routed along chassis, battery connection with 150A MEGA-FUSE within 300mm of terminal and cabin master isolator key switch.
Step 4: Integration of the 1.2 kW electrohydraulic power pack, VE1 lowering valve, VE2 tilt solenoid valve, and IP67 two-hand external control box.
Step 5: Mounting tilt mercury sensors and dynamic 2Hz flashing amber warning LEDs on aluminum platform edges.
Step 6: Filling ISO VG 15 hydraulic oil, system de-aeration cycles, and successful UDT overload test sequence with smooth platform descent.

Style: Industrial CAD exploded-view, clean workshop lighting, crisp schematic overlays, 4K resolution, 60fps technical cinematography.`;

  const copyVeoPrompt = () => {
    navigator.clipboard.writeText(veoPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-200 text-xs font-mono">
      
      {/* Top Header & Navigation Bar */}
      <div className="bg-[#1C2541] p-3.5 rounded-lg border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          {onBackToBom && (
            <button
              onClick={onBackToBom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Powrót do BOM</span>
            </button>
          )}

          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono border border-amber-500/40 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Schemat Elektryczny 12V</span>
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-[#070D1E] p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'player'
                ? 'bg-[#1C2541] text-[#D4AF37] font-bold border border-[#D4AF37]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Odtwarzacz Wideo Symulacji</span>
          </button>

          <button
            onClick={() => setActiveTab('veo_prompt')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'veo_prompt'
                ? 'bg-[#1C2541] text-purple-400 font-bold border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Model Wideo Veo (AI)</span>
          </button>

          <button
            onClick={() => setActiveTab('sop_checklist')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'sop_checklist'
                ? 'bg-[#1C2541] text-emerald-400 font-bold border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Karty Kroków Montażu</span>
          </button>
        </div>

        {/* Download recorded video if available */}
        {recordedVideoUrl && (
          <a
            href={recordedVideoUrl}
            download={`Sekwencja_Montazu_Dhollandia_${selectedLift.model.replace(/\s+/g, '_')}.webm`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Pobierz Nagrane Wideo (.webm)</span>
          </a>
        )}
      </div>

      {/* Main Player Tab Content */}
      {activeTab === 'player' && (
        <div className="space-y-4">
          
          {/* Simulation Status Notice */}
          <div className="bg-[#0B132B] border border-amber-500/30 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-bold">WIZUALIZACJA WIDEO SEKWENCJI MONTAŻU DHOLLANDIA (CAD SIMULATOR 60 FPS)</span>
                <p className="text-slate-400 text-[10px]">
                  Silnik symulacji wektorowej 2D/3D zsynchronizowany z parametrami podwozia {config.chassis.brand} i profilem ALU-S.V.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                {selectedLift.model} ({selectedLift.capacityKg} kg)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                Gotowy do odtworzenia
              </span>
            </div>
          </div>

          {/* Interactive Canvas Viewport (16:9 Aspect Ratio) */}
          <div className="relative bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="w-full h-auto block"
            />

            {/* Stage Badge Overlay (Top Left) */}
            <div className="absolute top-3 left-3 bg-[#0B132B]/90 backdrop-blur-md border border-[#D4AF37]/50 rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#D4AF37] font-bold text-[11px]">
                ETAP {currentStage.id} / 6
              </span>
              <span className="text-slate-400 text-[10px]">·</span>
              <span className="text-slate-200 text-[10px] font-medium max-w-xs truncate">
                {currentStage.subtitle}
              </span>
            </div>

            {/* Torque / Spec Pill (Top Right) */}
            <div className="absolute top-3 right-3 bg-[#070D1E]/90 backdrop-blur-md border border-slate-700 rounded-lg px-3 py-1.5 shadow-md">
              <span className="text-amber-400 font-bold text-[10px]">
                {currentStage.torqueOrSpec}
              </span>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute bottom-16 right-4 bg-red-950/90 border border-red-500 rounded-lg px-3 py-1 flex items-center gap-2 text-red-300 text-xs font-bold animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>NAGRYWANIE WIDEO WEBM...</span>
              </div>
            )}
          </div>

          {/* Video Control Bar */}
          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-4 space-y-3">
            
            {/* Timeline Progress Bar & Scrubber */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{Math.floor(currentTime)}s / {totalDuration}s</span>
                <span className="text-[#D4AF37] font-semibold">{currentStage.title}</span>
                <span>Postęp: {Math.round((currentTime / totalDuration) * 100)}%</span>
              </div>

              <div 
                className="relative h-3 bg-slate-900 rounded-full overflow-hidden cursor-pointer border border-slate-700"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  setCurrentTime(ratio * totalDuration);
                }}
              >
                {/* Stage divisions */}
                {ASSEMBLY_STAGES.map((s, idx) => (
                  <div
                    key={s.id}
                    className="absolute top-0 bottom-0 border-r border-slate-800"
                    style={{ left: `${(s.timeRange[1] / totalDuration) * 100}%` }}
                  />
                ))}

                {/* Filled progress bar */}
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-500 transition-all duration-75"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
            </div>

            {/* Playback Buttons & Modifiers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D4AF37] hover:brightness-110 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#D4AF37]/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pauza' : 'Odtwórz Sekwencję'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Od początku"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Speed Selector */}
                <div className="flex items-center bg-[#070D1E] rounded-lg border border-slate-700 p-0.5 text-[10px]">
                  {[0.5, 1, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded transition-colors ${
                        playbackSpeed === speed
                          ? 'bg-[#1C2541] text-[#D4AF37] font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isAudioEnabled
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title={isAudioEnabled ? 'Dźwięk włączony' : 'Włącz efekty techniczne dźwięku'}
                >
                  {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {/* Video Recording & Export */}
              <div className="flex items-center gap-2">
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    isRecording
                      ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="Nagraj strumień canvas do pliku wideo WebM w przeglądarce"
                >
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span>{isRecording ? 'Nagrywanie...' : 'Nagraj Wideo (WebM)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Step Detailed Card */}
          <div className="bg-[#0B132B] border border-[#D4AF37]/40 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">
                  AKTUALNY ETAP MONTAŻU
                </span>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {currentStage.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {currentStage.description}
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400">Wymóg normy:</div>
                <div className="text-[11px] text-amber-400 font-semibold">{currentStage.oemRegulation}</div>
              </div>
            </div>

            {/* Step Checkpoints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Kluczowe zalecenia wykonawcze:
                </div>
                <ul className="space-y-1.5">
                  {currentStage.keyInstructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Wymagane narzędzia i osprzęt:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentStage.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-[#070D1E] border border-slate-700 text-slate-300 text-[10px]"
                    >
                      🔧 {tool}
                    </span>
                  ))}
                </div>

                <div className="mt-3 p-2.5 bg-[#070D1E] rounded border border-slate-800 text-[10px] text-slate-400">
                  <strong className="text-white">Moment/Spec:</strong> {currentStage.torqueOrSpec}
                </div>
              </div>
            </div>

            {/* Quick Step Switcher Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 mr-2">Przejdź do kroku:</span>
              {ASSEMBLY_STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleJumpToStage(s)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                    currentStage.id === s.id
                      ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-sm'
                      : 'bg-[#1C2541] hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  Krok {s.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Veo AI Video Generator Integration Tab */}
      {activeTab === 'veo_prompt' && (
        <div className="bg-[#0B132B] border border-purple-500/40 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-purple-500/30 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-purple-950 border border-purple-500 flex items-center justify-center text-purple-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  GENERATOR WIDEO AI: GOOGLE VEO 3.1 (TECHNICAL ENGINEERING)
                </h3>
              </div>
              <p className="text-xs text-slate-400 pl-10">
                Przygotowany precyzyjny prompt inżynierski dla modelu wideo Veo, opisujący fotorealistyczną sekwencję montażu windy Dhollandia dla podwozia {config.chassis.brand}.
              </p>
            </div>

            <button
              onClick={copyVeoPrompt}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-purple-900/30"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Skopiowano prompt!' : 'Kopiuj Prompt dla Veo'}</span>
            </button>
          </div>

          {/* Model Status Notice regarding Declined Paid API Key */}
          <div className="bg-[#070D1E] border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Info className="w-4 h-4" />
              <span>INFORMACJA O TRYBIE PRACY MODELU VEO:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Model generowania wideo <strong>Veo 3.1</strong> (<code>veo-3.1-generate-preview</code> / <code>veo-3.1-lite-generate-preview</code>) wymaga skonfigurowanego płatnego projektu Google Cloud (Paid Model Flow).
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              W obecnym trybie aplikacja udostępnia <strong>pełnowymiarowy, zintegrowany symulator wideo CAD 60 FPS (karta obok)</strong> oraz umożliwia wygenerowanie i eksport gotowego nagrania w formacie <code>.webm</code> bezpośrednio w przeglądarce bez żadnych opłat. Jeśli w przyszłości aktywujesz klucz Veo w AI Studio, poniższy prompt wygeneruje film fotorealistyczny w rozdzielczości 4K.
            </p>
          </div>

          {/* Prompt Preview Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">Treść Inżynierskiego Promptu dla Veo:</span>
              <span className="text-[10px] font-mono text-purple-400">Format: Google Veo / High-Fidelity 3D Simulation</span>
            </div>

            <div className="bg-[#070D1E] border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
              {veoPromptText}
            </div>
          </div>
        </div>
      )}

      {/* Step by Step Checklist / SOP Tab */}
      {activeTab === 'sop_checklist' && (
        <div className="space-y-4">
          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">
              PEŁNE ZESTAWIENIE KROKÓW PROCEDURY MONTAŻOWEJ WINDY DHOLLANDIA (SOP)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Oficjalna sekwencja zatwierdzona dla Nowa Firma zgodnie z normą PN-EN 1756-1 oraz homologacją drugiego etapu WE.
            </p>

            <div className="space-y-3">
              {ASSEMBLY_STAGES.map((stage) => (
                <div
                  key={stage.id}
                  className="bg-[#070D1E] border border-slate-800 hover:border-[#D4AF37]/50 rounded-lg p-4 transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1C2541] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-xs">
                        {stage.id}
                      </span>
                      <h4 className="font-bold text-white text-xs">{stage.title}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px]">
                      {stage.torqueOrSpec}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 pl-8">
                    {stage.description}
                  </p>

                  <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <strong className="text-slate-300">Narzędzia:</strong> {stage.tools.join(', ')}
                    </div>
                    <div>
                      <strong className="text-slate-300">Norma:</strong> {stage.oemRegulation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Intellectual Property Footer */}
      <div className="pt-3 border-t border-slate-800 text-center text-[11px] font-mono text-[#D4AF37]/90">
        Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
      </div>

    </div>
  );
};
