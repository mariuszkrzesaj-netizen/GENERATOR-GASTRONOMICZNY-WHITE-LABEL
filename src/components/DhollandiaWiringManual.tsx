import React, { useState } from 'react';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { DHALLANDIA_LIFTS } from '../data/masterSpecsData';
import { 
  Zap, 
  ShieldCheck, 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  FileText, 
  Info,
  Wrench,
  BatteryCharging,
  Cpu,
  Flame,
  Layers,
  ChevronRight,
  Video
} from 'lucide-react';
import { generateAndDownloadPdfDhollandia } from '../utils/generatePdfDhollandia';
import { DhollandiaVideoSequencePlayer } from './DhollandiaVideoSequencePlayer';

interface DhollandiaWiringManualProps {
  config: ActiveProjectConfiguration;
  calculations: AxleLoadCalculation;
  onBack: () => void;
  onSelectLift?: (liftId: string) => void;
  onOpenVideoSequence?: () => void;
}

type SelectedComponentId = 
  | 'battery'
  | 'megafuse'
  | 'master_switch'
  | 'cabin_indicator'
  | 'power_cable'
  | 'ground_cable'
  | 'control_box'
  | 'spiral_remote'
  | 'foot_controls'
  | 'powerpack'
  | 'starter_solenoid'
  | 'hydraulic_pump'
  | 'valve_ve1'
  | 'valve_ve2'
  | 'led_flashing'
  | 'tilt_sensor';

export const DhollandiaWiringManual: React.FC<DhollandiaWiringManualProps> = ({
  config,
  calculations,
  onBack,
  onSelectLift
}) => {
  const currentLiftId = config.dhollandiaLiftId || 'dhollandia_dhlm08_750';
  const [selectedLiftId, setSelectedLiftId] = useState<string>(currentLiftId);
  const [activeComponent, setActiveComponent] = useState<SelectedComponentId>('master_switch');
  const [activeViewMode, setActiveViewMode] = useState<'schematic' | 'hydraulic' | 'pinout' | 'sop' | 'video'>('schematic');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const selectedLift = DHALLANDIA_LIFTS.find(l => l.id === selectedLiftId) || DHALLANDIA_LIFTS[1];

  const handleLiftChange = (id: string) => {
    setSelectedLiftId(id);
    if (onSelectLift) {
      onSelectLift(id);
    }
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateAndDownloadPdfDhollandia(config, calculations, selectedLiftId);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 4000);
    } catch (err) {
      console.error('Błąd podczas generowania instrukcji Dhollandia PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Component Details Dictionary for Interactive Clicking
  const componentDetails: Record<SelectedComponentId, {
    name: string;
    tag: string;
    location: string;
    voltage: string;
    specs: string;
    wiring: string;
    oemNotice: string;
  }> = {
    battery: {
      name: 'Główny Akumulator Pojazdu (OEM Battery)',
      tag: 'BATT 12V',
      location: 'Komora silnika / skrzynka akumulatora pod fotelem kierowcy',
      voltage: '12V DC nominalne (min. 100 Ah, zalecane 110-120 Ah)',
      specs: 'Prąd rozruchowy min. 800A EN. Napięcie spoczynkowe > 12.6V.',
      wiring: 'Klema dodatnia (+) podłączona bezpośrednio do bezpiecznika MEGA-FUSE. Klema ujemna (-) podłączona do punktu masowego ramy.',
      oemNotice: 'Zgodnie z wytycznymi Renault Master BBG / Iveco BBG: Zakaz zasilania windy bezpośrednio z alternatora bez bufora bateryjnego!'
    },
    megafuse: {
      name: 'Bezpiecznik Główny Wysokoprądowy MEGA-FUSE',
      tag: 'FUSE 150A / 200A',
      location: 'Maksymalnie 300 mm od klemy plusowej akumulatora',
      voltage: '12V DC / do 32V',
      specs: '150A dla agregatu 1.2 kW (DH-LM.08) lub 200A dla agregatu 2.0 kW (DH-LSU.11)',
      wiring: 'Przewód 35 mm² / 50 mm² w obudowie bezpiecznika hermetycznej IP66.',
      oemNotice: 'Konieczność ochrony całej długości kabla biegnącego pod podwoziem przed zwarciem do masy.'
    },
    master_switch: {
      name: 'Główny Wyłącznik Prądu (Hebel Kabinowy z Kluczykiem)',
      tag: 'HEBEL / MASTER SWITCH',
      location: 'W kabinie kierowcy: konsola deski rozdzielczej lub podstawa fotela',
      voltage: '12V DC (prąd ciągły 250A, chwilowy 1000A)',
      specs: 'Wyłącznik dwubiegunowy ze stacyjką wyjmowaną (czerwony kluczyk) i stykiem pomocniczym.',
      wiring: 'Przewód prądowy 35 mm² (styk 30 do 51) + cienki przewód 1.5 mm² do cewki przekaźnika sterowania i kontrolki.',
      oemNotice: 'Wymóg PN-EN 1756-1: Wyłączenie hebla w kabinie musi bezwzględnie odcinać zasilanie sterowania i pompy hydraulicznej podczas jazdy.'
    },
    cabin_indicator: {
      name: 'Kabinowy Wskaźnik Pozycji Windy i Brzęczyk Ostrzegawczy',
      tag: 'KONTROLKA + BUZZER',
      location: 'Deska rozdzielcza pojazdu (w polu widzenia kierowcy)',
      voltage: '12V DC (prąd < 0.2A)',
      specs: 'Czerwona dioda LED + sygnalizator akustyczny piezo (> 75 dB).',
      wiring: 'Zasilanie po zapłonie (PIN 15) przez styk czujnika położenia platformy do masy.',
      oemNotice: 'Homologacja WE: Sygnalizacja dźwiękowo-optyczna musi ostrzegać kierowcę przy włączonym zapłonie, gdy platforma nie jest zaryglowana w pionie.'
    },
    power_cable: {
      name: 'Główny Przewód Zasilający 12V (+)',
      tag: 'LINE +12V (35/50 mm²)',
      location: 'Wzdłuż lewej lub prawej podłużnicy ramy podwozia',
      voltage: '12V DC (spadek napięcia < 0.8V przy 150A)',
      specs: 'Kabel miedziany giętki kl. 5 (H01N2-D / LgY), średnica zewn. z peszlem ~18 mm.',
      wiring: 'W samogasnącym karbowanym peszlu poliamidowym PA6, mocowany opaskami co 300 mm.',
      oemNotice: 'Minimalna odległość od rury wydechowej i DPF: 150 mm (lub zastosowanie osłony termicznej aluminiowej).'
    },
    ground_cable: {
      name: 'Dedykowany Przewód Masowy (-)',
      tag: 'LINE -12V (35/50 mm²)',
      location: 'Od silnika agregatu do fabrycznego punktu masowego ramy OEM',
      voltage: '0V (Potencjał masy podwozia)',
      specs: 'Przekrój identyczny jak przewód zasilający: min. 35 mm².',
      wiring: 'Końcówka oczkowa M10/M12 zaciśnięta praską sześciokątną, zabezpieczona wazeliną techniczną.',
      oemNotice: 'KRYTYCZNE: Bezwzględny zakaz pobierania masy przez łożyska i sworznie zawiasów windy! Grozi zatarciem sworzni i pożarem instalacji!'
    },
    control_box: {
      name: 'Zewnętrzna Skrzynka Sterownicza Dhollandia (IP67)',
      tag: 'CONTROL BOX (ZEWN.)',
      location: 'Prawa strona pojazdu z tyłu (od strony pobocza / chodnika)',
      voltage: '12V DC (obwód sterujący 10A)',
      specs: 'Hermetyczna obudowa z tworzywa zamykana na kluczyk, z dławikami kablowymi PG.',
      wiring: 'Wiązka 7-żyłowa: czerwony (+12V), biały (Up), niebieski (Down), żółty (Tilt Up), zielony (Tilt Down), brązowy (Deadman), czarny (GND).',
      oemNotice: 'Norma PN-EN 1756-1 nakazuje montaż po prawej stronie (bezpieczeństwo operatora przed ruchem ulicznym) oraz sterowanie dwuręczne.'
    },
    spiral_remote: {
      name: 'Pilot Wewnętrzny na Przewodzie Spiralnym',
      tag: 'PILOT SPIRALNY',
      location: 'Gniazdo na tylnym słupku wewnątrz przestrzeni ładunkowej',
      voltage: '12V DC',
      specs: 'Pilot 2-przyciskowy (Góra/Dół) z magnesem mocującym i kablem spiralnym 3.5 m.',
      wiring: 'Gniazdo 3-pinowe lub 4-pinowe z wtyczką bagnetową wodoodporną.',
      oemNotice: 'Pozwala operatorowi na kontrolę ładunku z wnętrza zabudowy podczas załadunku palet wózkiem paletowym.'
    },
    foot_controls: {
      name: 'Sterowanie Nożne na Platformie Aluminiowej (Foot Controls)',
      tag: 'PRZYCISKI NOŻNE S1 / S2',
      location: 'Wpuszczone w powierzchnię pomostu platformy Dhollandia',
      voltage: '12V DC (obwód iskrobezpieczny)',
      specs: 'Dwa hermetyczne przyciski nożne (sekwencja nacisku stopami dla bezpieczeństwa).',
      wiring: 'Przewód giętki wewnątrz profilu platformy poprowadzony przez przegub obrotowy.',
      oemNotice: 'Wymaga jednoczesnego naciskania obu przycisków w odpowiedniej sekwencji czasowej (zapobiega przypadkowemu uruchomieniu stopą).'
    },
    powerpack: {
      name: 'Zintegrowany Agregat Elektrohydrauliczny (Power Pack)',
      tag: 'POWER PACK 12V',
      location: 'Wewnątrz belki nośnej zderzaka przeciwnajazdowego Dhollandia',
      voltage: '12V DC',
      specs: 'Zbiornik oleju 3.5 litra (olej ISO VG 15), zawór regulacji ciśnienia 180-210 bar.',
      wiring: 'Zasilanie grube 35mm² do stycznika, masa do bloku, złącza wielopinowe do zaworów.',
      oemNotice: 'Agregat jest w pełni osłonięty stalową ocynkowaną puszką spełniającą wymogi zderzaka ECE R58.03.'
    },
    starter_solenoid: {
      name: 'Główny Stycznik Rozrusznikowy Silnika Pompy',
      tag: 'STYCZNIK 150A/200A',
      location: 'Na korpusie agregatu elektrohydraulicznego',
      voltage: 'Cewka 12V DC / Styki robocze 12V do 200A',
      specs: 'Stycznik heavy-duty ze srebrzonymi stykami odpornymi na sklejanie.',
      wiring: 'Zacisk 30 (+12V z hebla), Zacisk 87 (do stojana silnika), Zaciski 85/86 (cewka sterująca).',
      oemNotice: 'Równolegle do cewki zamontowana jest dioda gasząca przepięcia indukcyjne 1N5408.'
    },
    hydraulic_pump: {
      name: 'Silnik Elektryczny Prądu Stałego & Pompa Zębata',
      tag: 'MOTOR 1.2kW / 2.0kW',
      location: 'Wewnątrz agregatu Dhollandia',
      voltage: '12V DC (obroty 2800 obr./min)',
      specs: 'Moc 1.2 kW (DH-LM.08) lub 2.0 kW (DH-LSU.11). Wydajność pompy ~2.2 cm³/obr.',
      wiring: 'Połączenie szyną miedzianą ze stycznikiem głównym, masa na obudowie.',
      oemNotice: 'Wyposażony w termobimetaliczne zabezpieczenie przed przegrzaniem przy ciągłej pracy.'
    },
    valve_ve1: {
      name: 'Elektrozawór Opuszczania Grawitacyjnego (VE1)',
      tag: 'ZAWÓR VE1 (DOWN)',
      location: 'Blok hydrauliczny agregatu',
      voltage: '12V DC (moc cewki ok. 25W, prąd ~2.1A)',
      specs: 'Zawór suwakowy 2/2 normalnie zamknięty z kompensacją ciśnieniową.',
      wiring: 'Zasilany z przewodu niebieskiego (PIN 2) skrzynki sterowniczej.',
      oemNotice: 'Opuszczanie odbywa się grawitacyjnie bez pracy silnika pompy, oszczędzając akumulator pojazdu.'
    },
    valve_ve2: {
      name: 'Elektrozawór Zamykania / Przechyłu Platformy (VE2)',
      tag: 'ZAWÓR VE2 (TILT)',
      location: 'Blok hydrauliczny agregatu',
      voltage: '12V DC (moc cewki ok. 25W)',
      specs: 'Kieruje strumień oleju pod ciśnieniem do siłowników zamykania platformy.',
      wiring: 'Zasilany z przewodu żółtego (PIN 3) równolegle z załączeniem stycznika silnika.',
      oemNotice: 'Współpracuje z zamkami hydraulicznymi na siłownikach zapobiegającymi opadnięciu platformy.'
    },
    led_flashing: {
      name: 'Ostrzegawcze Światła Błyskowe LED Platformy',
      tag: 'FLASHING LED',
      location: 'Lewy i prawy narożnik aluminiowej platformy',
      voltage: '12V DC (moc 2x 3W)',
      specs: 'Hermetyczne moduły LED bursztynowe z wbudowanym generatorem błysków (2 Hz).',
      wiring: 'Załączane automatycznie przez czujnik przechyłu rtęciowy/mikroprzełącznik przy opuszczeniu > 10°.',
      oemNotice: 'Wymóg kodeksu drogowego i BHP: Platforma wystająca poza obrys musi pulsować światłem żółtym.'
    },
    tilt_sensor: {
      name: 'Czujnik Pozycji Transportowej / Kontaktron Ryglujący',
      tag: 'SENSOR POZYCJI',
      location: 'Na ramie windy przy ryglowaniu pionowym',
      voltage: '12V DC obwód sygnałowy',
      specs: 'Magnetyczny czujnik kontaktronowy w obudowie mosiężnej IP67.',
      wiring: 'Przewód 2-żyłowy prowadzony do kabiny kierowcy (obwód kontrolki i brzęczyka).',
      oemNotice: 'Sygnalizuje natychmiastowe otwarcie windy w trakcie jazdy lub postoju z kluczykiem w stacyjce.'
    }
  };

  return (
    <div className="space-y-6 text-slate-200 text-xs font-mono">
      
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1C2541] p-3.5 rounded-lg border border-[#D4AF37]/30 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Powrót do Konfiguratora / Karty Zlecenia</span>
        </button>

        {/* Lift Model Switcher Buttons */}
        <div className="flex items-center bg-[#070D1E] p-1 rounded-lg border border-slate-700">
          {DHALLANDIA_LIFTS.map((lift) => (
            <button
              key={lift.id}
              onClick={() => handleLiftChange(lift.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                selectedLiftId === lift.id
                  ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lift.capacityKg} kg ({lift.model.split(' ')[1]})
            </button>
          ))}
        </div>

        {/* Download & Print Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'Generowanie PDF...' : 'Pobierz Instrukcję i Schemat (PDF)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Drukuj</span>
          </button>
        </div>
      </div>

      {pdfDownloaded && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200 no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Instrukcja i schemat montażu Dhollandia zostały pomyślnie pobrane w formacie PDF!</span>
        </div>
      )}

      {/* Main Document & Technical Blueprint Container */}
      <div className="bg-[#0B132B] border border-[#D4AF37]/50 rounded-xl p-5 sm:p-7 space-y-6 shadow-2xl">
        
        {/* Document Header */}
        <div className="border-b-2 border-[#D4AF37] pb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded bg-[#1C2541] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <Zap className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  INSTRUKCJA MONTAŻU I SCHEMAT ELEKTRYCZNY WINDY DHOLLANDIA
                </h1>
                <p className="text-[11px] text-[#D4AF37] font-semibold">
                  Specyfikacja MASTER 4 · Wytyczne OEM BBG (Renault Master, Iveco Daily) · ECE R58.03 · Normy UDT
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pl-11">
              Podłączenie układu elektrohydraulicznego 12V DC, hebla kabinowego, sterowania zewnętrznego, elektrozaworów i zabezpieczeń.
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold font-mono">
              <span>{selectedLift.model}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Udźwig: <strong className="text-white">{selectedLift.capacityKg} kg</strong> · Masa: <strong className="text-white">{selectedLift.weightKg} kg</strong>
            </div>
            <div className="text-[10px] text-slate-400">
              Zasilanie silnika: <strong className="text-emerald-400">{selectedLift.powerSupply}</strong>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Wybierz widok instrukcji:</span>
            <div className="flex bg-[#070D1E] p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveViewMode('schematic')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'schematic'
                    ? 'bg-[#1C2541] text-[#D4AF37] font-bold border border-[#D4AF37]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Interaktywny Schemat 12V</span>
              </button>

              <button
                onClick={() => setActiveViewMode('pinout')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'pinout'
                    ? 'bg-[#1C2541] text-[#D4AF37] font-bold border border-[#D4AF37]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Rozpiska Pinów i Wiązki</span>
              </button>

              <button
                onClick={() => setActiveViewMode('sop')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'sop'
                    ? 'bg-[#1C2541] text-[#D4AF37] font-bold border border-[#D4AF37]/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Procedura Krok po Kroku (SOP)</span>
              </button>

              <button
                onClick={() => setActiveViewMode('video')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'video'
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-purple-400 hover:text-white'
                }`}
                title="Wizualizacja sekwencji montażu w formacie wideo (Veo AI / Symulator CAD)"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Wideo Montażu Veo</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Kliknij na dowolny element schematu, aby zobaczyć szczegóły podłączenia.
          </div>
        </div>

        {/* VIEW 1: INTERACTIVE SVG ELECTRICAL SCHEMATIC */}
        {(activeViewMode === 'schematic' || activeViewMode === 'hydraulic') && (
          <div className="space-y-4">
            
            {/* SVG Canvas Box */}
            <div className="bg-[#070D1E] border border-slate-800 rounded-xl p-4 overflow-x-auto shadow-inner relative">
              <svg 
                viewBox="0 0 980 460" 
                className="w-full min-w-[850px] h-auto select-none"
                style={{ fontFamily: 'monospace' }}
              >
                {/* Background Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </pattern>

                  {/* Flow Arrow Markers */}
                  <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrowGold" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#D4AF37" />
                  </marker>
                  <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#38BDF8" />
                  </marker>
                </defs>

                <rect width="980" height="460" fill="#070D1E" />
                <rect width="980" height="460" fill="url(#grid)" />

                {/* ZONE 1: ENGINE / BATTERY COMPARTMENT (LEWA STRONA) */}
                <g transform="translate(20, 30)">
                  <rect x="0" y="0" width="220" height="390" rx="8" fill="#0B132B" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="15" y="24" fill="#94A3B8" fontSize="10" fontWeight="bold">
                    STREFA 1: PODWOZIE OEM / AKUMULATOR
                  </text>

                  {/* 1. AKUMULATOR */}
                  <g 
                    onClick={() => setActiveComponent('battery')} 
                    className="cursor-pointer group"
                    transform="translate(25, 45)"
                  >
                    <rect 
                      width="170" 
                      height="80" 
                      rx="6" 
                      fill={activeComponent === 'battery' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'battery' ? '#D4AF37' : '#475569'} 
                      strokeWidth={activeComponent === 'battery' ? 2.5 : 1.5} 
                    />
                    {/* Battery Terminals */}
                    <rect x="25" y="-6" width="20" height="8" rx="2" fill="#EF4444" />
                    <text x="35" y="-8" fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle">+</text>
                    <rect x="125" y="-6" width="20" height="8" rx="2" fill="#38BDF8" />
                    <text x="135" y="-8" fill="#38BDF8" fontSize="12" fontWeight="bold" textAnchor="middle">-</text>

                    <text x="85" y="32" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle">
                      AKUMULATOR 12V
                    </text>
                    <text x="85" y="48" fill="#D4AF37" fontSize="9" textAnchor="middle">
                      100-110 Ah / 850A EN
                    </text>
                    <text x="85" y="65" fill="#94A3B8" fontSize="8" textAnchor="middle">
                      Podwozie: {config.chassis.brand} {config.chassis.model.split(' ')[0]}
                    </text>
                  </g>

                  {/* 2. BEZPIECZNIK MEGA-FUSE */}
                  <g 
                    onClick={() => setActiveComponent('megafuse')} 
                    className="cursor-pointer"
                    transform="translate(25, 160)"
                  >
                    <rect 
                      width="170" 
                      height="55" 
                      rx="6" 
                      fill={activeComponent === 'megafuse' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'megafuse' ? '#F59E0B' : '#64748B'} 
                      strokeWidth={activeComponent === 'megafuse' ? 2.5 : 1.5} 
                    />
                    <text x="85" y="24" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">
                      MEGA-FUSE {selectedLift.capacityKg <= 750 ? '150A' : '200A'}
                    </text>
                    <text x="85" y="40" fill="#94A3B8" fontSize="8.5" textAnchor="middle">
                      Max 300mm od klemy (+)
                    </text>
                  </g>

                  {/* 3. PUNKT MASOWY RAMY OEM */}
                  <g 
                    onClick={() => setActiveComponent('ground_cable')} 
                    className="cursor-pointer"
                    transform="translate(25, 245)"
                  >
                    <rect 
                      width="170" 
                      height="50" 
                      rx="6" 
                      fill={activeComponent === 'ground_cable' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'ground_cable' ? '#38BDF8' : '#475569'} 
                      strokeWidth={activeComponent === 'ground_cable' ? 2.5 : 1.5} 
                    />
                    <text x="85" y="22" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      PUNKT MASY RAMY OEM
                    </text>
                    <text x="85" y="38" fill="#94A3B8" fontSize="8" textAnchor="middle">
                      Śruba M10/M12 (Rama podwozia)
                    </text>
                  </g>

                  {/* 4. HEBEL W KABINIE */}
                  <g 
                    onClick={() => setActiveComponent('master_switch')} 
                    className="cursor-pointer"
                    transform="translate(25, 315)"
                  >
                    <rect 
                      width="170" 
                      height="55" 
                      rx="6" 
                      fill={activeComponent === 'master_switch' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'master_switch' ? '#D4AF37' : '#D4AF37'} 
                      strokeWidth={activeComponent === 'master_switch' ? 2.5 : 1.5} 
                    />
                    <text x="85" y="24" fill="#D4AF37" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      HEBEL ZASILANIA (KABINA)
                    </text>
                    <text x="85" y="42" fill="#E2E8F0" fontSize="8.5" textAnchor="middle">
                      Wyłącznik Główny 250A
                    </text>
                  </g>
                </g>

                {/* ZONE 2: PODWOZIE & PROWADZENIE WIĄZKI (ŚRODEK) */}
                <g transform="translate(270, 30)">
                  <rect x="0" y="0" width="300" height="390" rx="8" fill="#0B132B" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="15" y="24" fill="#94A3B8" fontSize="10" fontWeight="bold">
                    STREFA 2: WIĄZKA W RAMIE PODWOZIA (BBG)
                  </text>

                  {/* KONTROLKA KABINOWA */}
                  <g 
                    onClick={() => setActiveComponent('cabin_indicator')} 
                    className="cursor-pointer"
                    transform="translate(25, 45)"
                  >
                    <rect 
                      width="250" 
                      height="60" 
                      rx="6" 
                      fill={activeComponent === 'cabin_indicator' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'cabin_indicator' ? '#EF4444' : '#64748B'} 
                      strokeWidth={activeComponent === 'cabin_indicator' ? 2.5 : 1.5} 
                    />
                    <circle cx="35" cy="30" r="10" fill="#EF4444" />
                    <text x="145" y="26" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                      KONTROLKA OTWARCIA + BUZZER
                    </text>
                    <text x="145" y="44" fill="#94A3B8" fontSize="8.5" textAnchor="middle">
                      Sygnalizacja na desce rozdzielczej (12V)
                    </text>
                  </g>

                  {/* LINIE PRZEWODÓW HIGH-CURRENT */}
                  {/* Przewód Czerwony (+) 35/50 mm2 */}
                  <g 
                    onClick={() => setActiveComponent('power_cable')} 
                    className="cursor-pointer"
                    transform="translate(25, 140)"
                  >
                    <rect 
                      width="250" 
                      height="60" 
                      rx="6" 
                      fill={activeComponent === 'power_cable' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'power_cable' ? '#EF4444' : '#475569'} 
                      strokeWidth={activeComponent === 'power_cable' ? 2.5 : 1.5} 
                    />
                    <line x1="20" y1="30" x2="230" y2="30" stroke="#EF4444" strokeWidth="6" />
                    <text x="125" y="20" fill="#EF4444" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                      KABEL ZASILAJĄCY (+) 35 mm² / 50 mm²
                    </text>
                    <text x="125" y="48" fill="#94A3B8" fontSize="8" textAnchor="middle">
                      Peszel ochronny PA6 · Spadek nap. &lt; 0.8V
                    </text>
                  </g>

                  {/* Przewód Masowy (-) 35/50 mm2 */}
                  <g 
                    onClick={() => setActiveComponent('ground_cable')} 
                    className="cursor-pointer"
                    transform="translate(25, 225)"
                  >
                    <rect 
                      width="250" 
                      height="60" 
                      rx="6" 
                      fill={activeComponent === 'ground_cable' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'ground_cable' ? '#38BDF8' : '#475569'} 
                      strokeWidth={activeComponent === 'ground_cable' ? 2.5 : 1.5} 
                    />
                    <line x1="20" y1="30" x2="230" y2="30" stroke="#38BDF8" strokeWidth="6" />
                    <text x="125" y="20" fill="#38BDF8" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                      DEDYKOWANY KABEL MASY (-) 35/50 mm²
                    </text>
                    <text x="125" y="48" fill="#94A3B8" fontSize="8" textAnchor="middle">
                      Zakaz masy przez zawiasy! Bezpośrednio do ramy.
                    </text>
                  </g>

                  {/* PILOT SPIRALNY WEWNĘTRZNY */}
                  <g 
                    onClick={() => setActiveComponent('spiral_remote')} 
                    className="cursor-pointer"
                    transform="translate(25, 310)"
                  >
                    <rect 
                      width="250" 
                      height="60" 
                      rx="6" 
                      fill={activeComponent === 'spiral_remote' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'spiral_remote' ? '#D4AF37' : '#475569'} 
                      strokeWidth={activeComponent === 'spiral_remote' ? 2.5 : 1.5} 
                    />
                    <text x="125" y="25" fill="#D4AF37" fontSize="10" fontWeight="bold" textAnchor="middle">
                      PILOT WEWNĘTRZNY (KABEL SPIRALNY)
                    </text>
                    <text x="125" y="45" fill="#94A3B8" fontSize="8.5" textAnchor="middle">
                      Gniazdo hermetyczne wewnątrz zabudowy
                    </text>
                  </g>
                </g>

                {/* ZONE 3: AGREGAT & STEROWANIE TYŁ POJAZDU (PRAWA STRONA) */}
                <g transform="translate(600, 30)">
                  <rect x="0" y="0" width="360" height="390" rx="8" fill="#0B132B" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="15" y="24" fill="#D4AF37" fontSize="10" fontWeight="bold">
                    STREFA 3: AGREGAT I ELEMENTY WYKONAWCZE DHOLLANDIA
                  </text>

                  {/* 1. SKRZYNKA ZEWNĘTRZNA KONTROLNA */}
                  <g 
                    onClick={() => setActiveComponent('control_box')} 
                    className="cursor-pointer"
                    transform="translate(20, 45)"
                  >
                    <rect 
                      width="320" 
                      height="65" 
                      rx="6" 
                      fill={activeComponent === 'control_box' ? '#1E293B' : '#0F172A'} 
                      stroke={activeComponent === 'control_box' ? '#D4AF37' : '#64748B'} 
                      strokeWidth={activeComponent === 'control_box' ? 2.5 : 1.5} 
                    />
                    <text x="160" y="24" fill="#D4AF37" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                      SKRZYNKA STERUJĄCA ZEWNĘTRZNA (IP67)
                    </text>
                    <text x="160" y="42" fill="#FFFFFF" fontSize="8.5" textAnchor="middle">
                      Przyciski: DEADMAN (Dwuręczny) + GÓRA/DÓŁ + ZAMKNIJ/OTWÓRZ
                    </text>
                    <text x="160" y="56" fill="#94A3B8" fontSize="7.5" textAnchor="middle">
                      Montaż z prawej strony nadwozia (od chodnika)
                    </text>
                  </g>

                  {/* 2. AGREGAT ELEKTROHYDRAULICZNY */}
                  <g 
                    onClick={() => setActiveComponent('powerpack')} 
                    className="cursor-pointer"
                    transform="translate(20, 125)"
                  >
                    <rect 
                      width="320" 
                      height="150" 
                      rx="6" 
                      fill={activeComponent === 'powerpack' ? '#1C2541' : '#0F172A'} 
                      stroke={activeComponent === 'powerpack' ? '#38BDF8' : '#334155'} 
                      strokeWidth={activeComponent === 'powerpack' ? 2.5 : 1.5} 
                    />
                    <text x="160" y="22" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">
                      AGREGAT ELEKTROHYDRAULICZNY 12V (POWER PACK)
                    </text>

                    {/* Stycznik silnika (Solenoid) */}
                    <g 
                      onClick={(e) => { e.stopPropagation(); setActiveComponent('starter_solenoid'); }}
                      transform="translate(15, 35)"
                      className="cursor-pointer"
                    >
                      <rect width="135" height="45" rx="4" fill="#1E293B" stroke={activeComponent === 'starter_solenoid' ? '#F59E0B' : '#475569'} strokeWidth="1" />
                      <text x="67" y="20" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="middle">STYCZNIK 150A</text>
                      <text x="67" y="34" fill="#94A3B8" fontSize="7.5" textAnchor="middle">Zacisk 30 / 87 / 86</text>
                    </g>

                    {/* Silnik pompy */}
                    <g 
                      onClick={(e) => { e.stopPropagation(); setActiveComponent('hydraulic_pump'); }}
                      transform="translate(170, 35)"
                      className="cursor-pointer"
                    >
                      <rect width="135" height="45" rx="4" fill="#1E293B" stroke={activeComponent === 'hydraulic_pump' ? '#38BDF8' : '#475569'} strokeWidth="1" />
                      <text x="67" y="20" fill="#38BDF8" fontSize="9" fontWeight="bold" textAnchor="middle">SILNIK DC 12V</text>
                      <text x="67" y="34" fill="#94A3B8" fontSize="7.5" textAnchor="middle">{selectedLift.powerSupply}</text>
                    </g>

                    {/* Elektrozawór VE1 (Opuszczanie) */}
                    <g 
                      onClick={(e) => { e.stopPropagation(); setActiveComponent('valve_ve1'); }}
                      transform="translate(15, 90)"
                      className="cursor-pointer"
                    >
                      <rect width="135" height="45" rx="4" fill="#1E293B" stroke={activeComponent === 'valve_ve1' ? '#10B981' : '#475569'} strokeWidth="1" />
                      <text x="67" y="20" fill="#10B981" fontSize="9" fontWeight="bold" textAnchor="middle">ZAWÓR VE1 (DÓŁ)</text>
                      <text x="67" y="34" fill="#94A3B8" fontSize="7.5" textAnchor="middle">Spływ grawitacyjny 12V</text>
                    </g>

                    {/* Elektrozawór VE2 (Pochył/Zamykanie) */}
                    <g 
                      onClick={(e) => { e.stopPropagation(); setActiveComponent('valve_ve2'); }}
                      transform="translate(170, 90)"
                      className="cursor-pointer"
                    >
                      <rect width="135" height="45" rx="4" fill="#1E293B" stroke={activeComponent === 'valve_ve2' ? '#F59E0B' : '#475569'} strokeWidth="1" />
                      <text x="67" y="20" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="middle">ZAWÓR VE2 (PRZECHYŁ)</text>
                      <text x="67" y="34" fill="#94A3B8" fontSize="7.5" textAnchor="middle">Siłowniki zamykające</text>
                    </g>
                  </g>

                  {/* 3. PLATFORMA ALUMINIOWA, ŚWIATŁA BŁYSKOWE & CZUJNIKI */}
                  <g transform="translate(20, 290)">
                    <rect width="320" height="85" rx="6" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                    
                    {/* Przyciski nożne */}
                    <g 
                      onClick={() => setActiveComponent('foot_controls')}
                      className="cursor-pointer"
                      transform="translate(15, 12)"
                    >
                      <rect width="135" height="60" rx="4" fill="#1E293B" stroke={activeComponent === 'foot_controls' ? '#D4AF37' : '#334155'} strokeWidth="1" />
                      <text x="67" y="22" fill="#D4AF37" fontSize="9" fontWeight="bold" textAnchor="middle">PRZYCISKI NOŻNE</text>
                      <text x="67" y="38" fill="#94A3B8" fontSize="7.5" textAnchor="middle">Sekwencja S1 + S2</text>
                      <text x="67" y="50" fill="#64748B" fontSize="7" textAnchor="middle">Na platformie alu</text>
                    </g>

                    {/* Światła LED i czujnik przechyłu */}
                    <g 
                      onClick={() => setActiveComponent('led_flashing')}
                      className="cursor-pointer"
                      transform="translate(170, 12)"
                    >
                      <rect width="135" height="60" rx="4" fill="#1E293B" stroke={activeComponent === 'led_flashing' ? '#F59E0B' : '#334155'} strokeWidth="1" />
                      <text x="67" y="22" fill="#F59E0B" fontSize="9" fontWeight="bold" textAnchor="middle">ŚWIATŁA BŁYSKOWE</text>
                      <text x="67" y="38" fill="#94A3B8" fontSize="7.5" textAnchor="middle">2x LED na narożnikach</text>
                      <text x="67" y="50" fill="#64748B" fontSize="7" textAnchor="middle">Auto-załączenie &gt; 10°</text>
                    </g>
                  </g>
                </g>

                {/* PRZEWODY POŁĄCZENIOWE (LINIE SCHEMATU) */}
                {/* Plus z aku do bezpiecznika */}
                <path d="M 70 125 L 70 160" stroke="#EF4444" strokeWidth="3" markerEnd="url(#arrowRed)" />
                {/* Z bezpiecznika do hebla */}
                <path d="M 70 215 L 70 315" stroke="#EF4444" strokeWidth="3" markerEnd="url(#arrowRed)" />
                {/* Z hebla do linii zasilającej strefy 2 */}
                <path d="M 195 342 L 245 342 L 245 170 L 295 170" stroke="#EF4444" strokeWidth="3" fill="none" markerEnd="url(#arrowRed)" />
                {/* Z linii zasilającej do agregatu strefy 3 */}
                <path d="M 545 170 L 635 170" stroke="#EF4444" strokeWidth="3.5" fill="none" markerEnd="url(#arrowRed)" />

                {/* Masa z aku do punktu masy ramy */}
                <path d="M 150 125 L 150 245" stroke="#38BDF8" strokeWidth="3" markerEnd="url(#arrowBlue)" />
                {/* Z punktu masy do przewodu masy w strefie 2 */}
                <path d="M 195 270 L 295 255" stroke="#38BDF8" strokeWidth="3" markerEnd="url(#arrowBlue)" />
                {/* Z przewodu masy strefy 2 do agregatu strefy 3 */}
                <path d="M 545 255 L 635 255" stroke="#38BDF8" strokeWidth="3" markerEnd="url(#arrowBlue)" />
              </svg>
            </div>

            {/* Selected Component Technical Detail Card */}
            {activeComponent && componentDetails[activeComponent] && (
              <div className="bg-[#1C2541] border-2 border-[#D4AF37] rounded-xl p-4 sm:p-5 shadow-lg animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37] text-slate-950 font-bold text-[10px]">
                      {componentDetails[activeComponent].tag}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {componentDetails[activeComponent].name}
                    </h3>
                  </div>

                  <span className="text-xs text-[#D4AF37] font-semibold">
                    Lokalizacja: {componentDetails[activeComponent].location}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-[11px]">
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Parametry Elektryczne / Robocze:</span>
                      <span className="text-white font-semibold">{componentDetails[activeComponent].voltage}</span>
                      <p className="text-slate-300 text-[10px] mt-0.5">{componentDetails[activeComponent].specs}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Połączenia Przewodowe & Zaciski:</span>
                      <p className="text-slate-200 leading-relaxed font-sans text-xs">{componentDetails[activeComponent].wiring}</p>
                    </div>
                  </div>

                  <div className="bg-[#0B132B] p-3 rounded-lg border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>WYMÓG OEM BBG & BEZPIECZEŃSTWA:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                      {componentDetails[activeComponent].oemNotice}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: PINOUT & WIRING MATRIX TABLE */}
        {activeViewMode === 'pinout' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase">
              <Cpu className="w-4 h-4" />
              <span>Tabela Połączeń, Kolorów Przewodów i Przypisania Pinów Wiązki</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-slate-800">
                <thead className="bg-[#1C2541] text-slate-300">
                  <tr>
                    <th className="p-2.5 border-b border-slate-800">Obwód / Nazwa</th>
                    <th className="p-2.5 border-b border-slate-800">Kolor / Przekrój</th>
                    <th className="p-2.5 border-b border-slate-800">Punkt Wyjścia</th>
                    <th className="p-2.5 border-b border-slate-800">Punkt Docelowy</th>
                    <th className="p-2.5 border-b border-slate-800">Bezpiecznik</th>
                    <th className="p-2.5 border-b border-slate-800">Rola / Zabezpieczenie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0B132B]">
                  <tr>
                    <td className="p-2 text-white font-bold">Moc Główna (+12V)</td>
                    <td className="p-2 text-rose-400 font-bold">Czerwony 35/50 mm²</td>
                    <td className="p-2 text-slate-300">Akumulator pojazdu (+)</td>
                    <td className="p-2 text-slate-300">Stycznik silnika (Zacisk 30)</td>
                    <td className="p-2 text-amber-400 font-bold">MEGA 150A/200A</td>
                    <td className="p-2 text-slate-400">Zasilanie silnika pompy hydraulicznej</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white font-bold">Masa Główna (-12V)</td>
                    <td className="p-2 text-sky-400 font-bold">Czarny 35/50 mm²</td>
                    <td className="p-2 text-slate-300">Rama OEM / Uziemienie</td>
                    <td className="p-2 text-slate-300">Blok agregatu Dhollandia</td>
                    <td className="p-2 text-slate-500">Brak (Masa)</td>
                    <td className="p-2 text-slate-400">Bezpośrednia masa. Zakaz przez zawiasy!</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white font-bold">Sterowanie (+12V Hebel)</td>
                    <td className="p-2 text-rose-300">Czerwony 1.5 mm²</td>
                    <td className="p-2 text-slate-300">Styk wyjściowy Hebla</td>
                    <td className="p-2 text-slate-300">Skrzynka sterownicza zewn.</td>
                    <td className="p-2 text-amber-400">Mini 10A</td>
                    <td className="p-2 text-slate-400">Zasilanie obwodów logiki i cewek</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Podnoszenie (UP - PIN 1)</td>
                    <td className="p-2 text-slate-100">Biały 1.0 mm²</td>
                    <td className="p-2 text-slate-300">Przełącznik UP / Pilot</td>
                    <td className="p-2 text-slate-300">Cewka stycznika (PIN 86)</td>
                    <td className="p-2 text-slate-400">10A</td>
                    <td className="p-2 text-slate-400">Uruchamia silnik i tłoczenie oleju</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Opuszczanie (DOWN - PIN 2)</td>
                    <td className="p-2 text-blue-400">Niebieski 1.0 mm²</td>
                    <td className="p-2 text-slate-300">Przełącznik DOWN / Pilot</td>
                    <td className="p-2 text-slate-300">Elektrozawór VE1 (Cewka)</td>
                    <td className="p-2 text-slate-400">10A</td>
                    <td className="p-2 text-slate-400">Grawitacyjny spływ bez pracy silnika</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Zamykanie (TILT UP - PIN 3)</td>
                    <td className="p-2 text-amber-300">Żółty 1.0 mm²</td>
                    <td className="p-2 text-slate-300">Przełącznik TILT</td>
                    <td className="p-2 text-slate-300">Stycznik + Zawór VE2</td>
                    <td className="p-2 text-slate-400">10A</td>
                    <td className="p-2 text-slate-400">Zamykanie platformy z poziomu do pionu</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Otwieranie (TILT DOWN - PIN 4)</td>
                    <td className="p-2 text-emerald-400">Zielony 1.0 mm²</td>
                    <td className="p-2 text-slate-300">Przełącznik TILT</td>
                    <td className="p-2 text-slate-300">Zawór VE2 (Powrót)</td>
                    <td className="p-2 text-slate-400">10A</td>
                    <td className="p-2 text-slate-400">Otwieranie platformy z pionu do poziomu</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Styk Bezpieczeństwa (DEADMAN)</td>
                    <td className="p-2 text-amber-600">Brązowy 1.0 mm²</td>
                    <td className="p-2 text-slate-300">Przycisk 2 ręki</td>
                    <td className="p-2 text-slate-300">Szeregowe zezwolenie ruchu</td>
                    <td className="p-2 text-slate-400">10A</td>
                    <td className="p-2 text-slate-400">Wymóg obsługi oburęcznej EN 1756-1</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Sygnalizator Pozycji (KABINA)</td>
                    <td className="p-2 text-slate-400">Szary 0.75 mm²</td>
                    <td className="p-2 text-slate-300">Kontaktron rygla platformy</td>
                    <td className="p-2 text-slate-300">Dioda LED i Buzzer w kabinie</td>
                    <td className="p-2 text-slate-400">5A po stacyjce</td>
                    <td className="p-2 text-slate-400">Ostrzeżenie przed odjazdem z otwartą windą</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: STEP-BY-STEP INSTALLATION SOP */}
        {activeViewMode === 'sop' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase">
              <Wrench className="w-4 h-4" />
              <span>Procedura Montażowa Krok po Kroku (SOP-DH-2026)</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: 'Przygotowanie podwozia i montaż mechaniczny płyt adaptacyjnych',
                  norm: 'OEM BBG (Renault Master / Iveco Daily) · ECE R58.03',
                  desc: 'Oczyścić podłużnice ramy podwozia. Zamocować płyty montażowe Dhollandia za pomocą fabrycznych otworów w środniku ramy. Skręcić śrubami klasy 10.9 M14 (moment 175 Nm) lub M16 (moment 270 Nm). BEZWZGLĘDNY ZAKAZ SPAWANIA DO GÓRNEGO I DOLNEGO PASA RAMY POJAZDU! Zachować prześwit zderzaka podjazdu max 450 mm nad nawierzchnią.',
                  check: 'Weryfikacja momentu kluczem dynamometrycznym i brak kolizji z kołem zapasowym/tłumikiem.'
                },
                {
                  step: 2,
                  title: 'Instalacja głównego bezpiecznika MEGA-FUSE i prowadzenie kabla 12V',
                  norm: 'DIN 72551 · VDE 0100',
                  desc: 'Zamontować oprawę bezpiecznika MEGA-FUSE (150A dla 1.2 kW lub 200A dla 2.0 kW) w odległości nie większej niż 300 mm od bieguna dodatniego akumulatora. Poprowadzić kabel 35 mm² lub 50 mm² w samogasnącym peszlu karbowanym PA6 wzdłuż lewej podłużnicy ramy, z dala od rury wydechowej (min. 150 mm) i elementów wirujących wału napędowego. Mocować opaskami odpornymi na UV co 300 mm.',
                  check: 'Zabezpieczenie przejść przez przegrody gumowymi przelotkami ochronnymi.'
                },
                {
                  step: 3,
                  title: 'Podłączenie głównego wyłącznika prądu (Hebel w kabinie)',
                  norm: 'PN-EN 1756-1 · Regulamin ECE R10',
                  desc: 'W kabinie kierowcy na podstawie fotela lub konsoli zamontować hebel 250A z kluczykiem wyjmowanym. Przewód zasilający podłączyć pod styk główny. Obwód sterujący zasilić ze styku wyjściowego przez bezpiecznik 10A. Podłączyć linię kontrolki LED i brzęczyka ostrzegawczego, która przy włączonym zapłonie sygnalizuje brak zaryglowania platformy.',
                  check: 'Przetestowanie odcięcia zasilania windy po wyjęciu kluczyka hebla.'
                },
                {
                  step: 4,
                  title: 'Montaż skrzynki sterowniczej zewnętrznej i pilota spiralnego',
                  norm: 'Stopień ochrony IP67 · EN 1756-1',
                  desc: 'Skrzynkę sterowniczą zamontować na stałe po prawej stronie pojazdu (od krawężnika). Wprowadzić wiązkę 7-żyłową przez dławiki kablowe szczelne. Podłączyć kolory żył zgodnie z tabelą pinoutu. Zainstalować gniazdo pilota kablowego spiralnego na słupku tylnym wewnątrz skrzyni ładunkowej.',
                  check: 'Prawidłowość działania układu dwuręcznego (DEADMAN) - winda nie rusza bez wciśnięcia przycisku zezwolenia.'
                },
                {
                  step: 5,
                  title: 'Podłączenie bezpośredniej masy silnika agregatu',
                  norm: 'Wymóg krytyczny Dhollandia Europe',
                  desc: 'Podłączyć przewód masowy 35/50 mm² bezpośrednio od zacisku ujemnego agregatu do fabrycznego punktu uziemienia ramy OEM. Oczyścić powierzchnię styku do gołego metalu, zastosować podkładkę zębatą Nord-Lock i zabezpieczyć wazeliną techniczną bezkwasową. Nigdy nie polegać na masie przez zawiasy i sworznie platformy!',
                  check: 'Pomiar rezystancji przejścia masy: spadek napięcia poniżej 0.2V przy prądzie 150A.'
                },
                {
                  step: 6,
                  title: 'Zalanie układu olejem hydraulicznym i odpowietrzenie siłowników',
                  norm: 'ISO VG 15 / ISO VG 22 (odporność do -30°C)',
                  desc: 'Wlać do zbiornika agregatu 3.5 litra niskotemperaturowego oleju hydraulicznego Dhollandia. Włączyć hebel. Za pomocą sterowania wykonać 3 pełne cykle podnoszenia i opuszczania bez obciążenia. Odpowietrzenie następuje samoczynnie poprzez powrót oleju do zbiornika. Sprawdzić poziom oleju przy opuszczonej platformie na gruncie (poziom między MIN a MAX).',
                  check: 'Brak jakichkolwiek wycieków na złączkach hydraulicznych i wężach wysokociśnieniowych.'
                },
                {
                  step: 7,
                  title: 'Próby obciążeniowe i przygotowanie dokumentacji UDT',
                  norm: 'Urząd Dozoru Technicznego (UDT) · PN-EN 1756-1',
                  desc: 'Przeprowadzić próbę dynamiczną z obciążeniem nominalnym 100% ({selectedLift.capacityKg} kg na środku platformy). Następnie wykonać próbę statyczną 125% ({Math.round(selectedLift.capacityKg * 1.25)} kg) - unieść ładunek na wysokość 1 metra i odczekać 15 minut. Dopuszczalne samoczynne opadnięcie platformy to maks. 15 mm. Wypełnić Książkę Rewizyjną UDT.',
                  check: 'Weryfikacja zaworu przeciążeniowego - zawór musi zadziałać przy obciążeniu 110% udźwigu.'
                }
              ].map((item) => (
                <div key={item.step} className="bg-[#0B132B] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-[#D4AF37] text-slate-950 font-bold flex items-center justify-center text-xs">
                        {item.step}
                      </span>
                      <h4 className="text-white font-bold text-xs">{item.title}</h4>
                    </div>
                    <span className="text-[10px] text-[#D4AF37] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                      {item.norm}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed pl-8">
                    {item.desc}
                  </p>

                  <div className="ml-8 mt-2 p-2 rounded bg-[#070D1E] border border-emerald-900/40 text-[11px] text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span><strong>Punkt kontrolny jakości: </strong>{item.check}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: VIDEO SEQUENCE SIMULATOR (VEO & CAD ENGINE) */}
        {activeViewMode === 'video' && (
          <DhollandiaVideoSequencePlayer
            config={config}
            calculations={calculations}
            onBackToBom={onBack}
            onOpenManual={() => setActiveViewMode('schematic')}
          />
        )}

        {/* Footer Technical Stamp / Certification Section */}
        <div className="bg-[#070D1E] p-4 rounded-xl border border-[#D4AF37]/40 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>DHOLLANDIA QUALITY ASSURANCE · NOWA FIRMA</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Dokumentacja zgodna z Dyrektywą Maszynową 2006/42/WE, normą PN-EN 1756-1 oraz Regulaminem EKG ONZ ECE R58.03.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:brightness-110 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Generowanie...' : 'Pobierz Pełną Instrukcję Montażu (PDF)'}</span>
            </button>
          </div>

          <div className="w-full pt-3 border-t border-slate-800 text-center text-[11px] font-mono text-[#D4AF37]/90">
            Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
          </div>
        </div>

      </div>

    </div>
  );
};
