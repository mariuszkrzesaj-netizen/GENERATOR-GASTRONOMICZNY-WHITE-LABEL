import React from 'react';
import { 
  BodyWorkType, 
  OemChassis 
} from '../types/itsMaster';
import { 
  OEM_CHASSIS_DATABASE, 
  PRESET_BUILDS, 
  MASTER_STANDARDS 
} from '../data/masterSpecsData';
import { 
  Truck, 
  Snowflake, 
  Wrench, 
  Construction, 
  Car, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  SlidersHorizontal, 
  Rotate3d,
  Sparkles,
  ExternalLink,
  Eye,
  Download,
  Wifi,
  HardDrive
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeScreenProps {
  onSelectCategory: (category: BodyWorkType) => void;
  onSelectChassis: (chassis: OemChassis) => void;
  onLoadPreset: (presetId: string) => void;
  onOpenMasterSpecs: () => void;
  onOpenCadStudio: () => void;
  onOpen3dPreview: (category?: BodyWorkType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectCategory,
  onSelectChassis,
  onLoadPreset,
  onOpenMasterSpecs,
  onOpenCadStudio,
  onOpen3dPreview
}) => {
  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 pb-20">
      
      {/* Hero Section - Nowa Firma */}
      <section className="relative border-b border-[#D4AF37]/20 bg-gradient-to-b from-[#0B132B] via-[#0D1836] to-[#070D1E] pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Decorative Grid Mesh */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle, #D4AF37 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Top Compliance Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
            <span className="text-[#D4AF37] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              SPECYFIKACJA MASTER 1–13
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">ISO GPS (1101/8015)</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">OEM BBG (Iveco / MB / MAN / Renault)</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Dhollandia</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">ALU-S.V.</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
              Kreator Zabudów <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#E5B842]">Nowa Firma</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 font-normal">
              Inżynieryjny system projektowania i parametrycznej konfiguracji zabudów samochodów użytkowych dla Nowa Firma. Pełna zgodność z wytycznymi producentów podwozi (OEM BBG), normami ISO GPS oraz certyfikacją europejską CoC II Etapu.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenCadStudio}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#D4AF37]/25"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-950" />
                <span>Otwórz Studio CAD 2D/3D</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onOpen3dPreview()}
                className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#0B132B] hover:bg-[#1C2541] border-2 border-[#D4AF37] rounded-lg hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all active:scale-[0.98]"
              >
                <Rotate3d className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-[#D4AF37]">
                  Okno Podglądu 3D (360° Obrót Auta)
                </span>
              </button>

              <button
                onClick={onOpenMasterSpecs}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-200 bg-[#1C2541]/80 hover:bg-[#1C2541] border border-[#D4AF37]/30 rounded-lg transition-colors"
              >
                <span>Przeglądaj Normy MASTER 1–13</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>

              <PWAInstallButton variant="hero" />
            </div>

            {/* Offline PWA Ready Feature Banner */}
            <div className="mt-6 flex flex-wrap items-center gap-3 py-2 px-3.5 rounded-lg bg-[#0B132B]/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PWA READY (OFFLINE)
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-[#D4AF37]" />
                Autonomiczna instalacja na pulpicie Windows / macOS / Linux
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                Wszystkie schematy, obliczenia mas i CoC działają bez połączenia z siecią
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Section: 5 Primary Bodywork Category Tiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Wybierz Linię Zabudowy Nowa Firma
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              5 certyfikowanych systemów zabudów spełniających wymagania homologacji WE i OEM BBG
            </p>
          </div>
        </div>

        {/* 5 Distinctive Category Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* TILE 1: Zabudowa Międzynarodowa & Plandeka */}
          <div 
            onClick={() => onSelectCategory('curtain_sider')}
            className="group relative bg-[#0B132B] hover:bg-[#111C3D] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1C2541] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30 font-semibold">
                  MASTER 1 & 4
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-2">
                Zabudowa Międzynarodowa & Plandeka
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Firanki dwustronne z naciągiem dźwigniowym, dachy przesuwne Edscha, kabiny sypialne Spojkar/Lamar, profile burtowe ALU-S.V. oraz słupki Kinegrip.
              </p>

              <div className="space-y-1.5 font-mono text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Pojemność:</span>
                  <span className="text-white font-semibold">8 do 12 Europalet (4.2m - 5.2m)</span>
                </div>
                <div className="flex justify-between">
                  <span>Regulacja dachu:</span>
                  <span className="text-[#D4AF37]">Skokowa lub hydrauliczna (+300 mm)</span>
                </div>
                <div className="flex justify-between">
                  <span>Podwozia bazowe:</span>
                  <span className="text-white">Iveco Daily, MB Sprinter, Master</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#D4AF37] group-hover:underline flex items-center gap-1">
                Konfiguruj CAD <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen3dPreview('curtain_sider');
                }}
                className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-200 hover:text-white bg-[#1C2541] hover:bg-[#D4AF37] hover:text-slate-950 border border-[#D4AF37]/40 rounded transition-all flex items-center gap-1"
                title="Otwórz obracalny model 3D klatki, słupów i dachu"
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>Model 3D 360°</span>
              </button>
            </div>
          </div>

          {/* TILE 2: Izoterma & Kontener Chłodniczy */}
          <div 
            onClick={() => onSelectCategory('isotherm_fridge')}
            className="group relative bg-[#0B132B] hover:bg-[#111C3D] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1C2541] border border-sky-400/40 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                  <Snowflake className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/30 font-semibold">
                  MASTER 2, 3 & 11
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                Izoterma i Chłodnia ATP/FRC
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Bezmostkowe panele PUR 60/85mm z certyfikatem ATP, agregaty Carrier Transicold / Thermo King, integracja windy Dhollandia 750/1000 kg z belką R58.03.
              </p>

              <div className="space-y-1.5 font-mono text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Klasa chłodnicza:</span>
                  <span className="text-sky-300 font-semibold">FRC (-20°C) lub FNA (0°C)</span>
                </div>
                <div className="flex justify-between">
                  <span>Współczynnik K:</span>
                  <span className="text-white">&le; 0.40 W/(m²·K) · Atest PZH</span>
                </div>
                <div className="flex justify-between">
                  <span>Winda załadowcza:</span>
                  <span className="text-[#D4AF37]">Dhollandia 500 / 750 / 1000 kg</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-sky-400 group-hover:underline flex items-center gap-1">
                Konfiguruj CAD <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen3dPreview('isotherm_fridge');
                }}
                className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-200 hover:text-white bg-[#1C2541] hover:bg-sky-500 hover:text-slate-950 border border-sky-400/40 rounded transition-all flex items-center gap-1"
                title="Otwórz obracalny model 3D izotermy i portalu"
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>Model 3D 360°</span>
              </button>
            </div>
          </div>

          {/* TILE 3: Warsztat Mobilny & Van Racking */}
          <div 
            onClick={() => onSelectCategory('workshop_van')}
            className="group relative bg-[#0B132B] hover:bg-[#111C3D] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1C2541] border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Wrench className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 font-semibold">
                  MASTER 3 & 12
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                Warsztat Mobilny & Van Racking
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Zabudowy furgonów z testem zderzeniowym 20G wg ECE R17. Modułowe regały aluminiowe, stół warsztatowy z imadłem obrotowym i zasilanie Victron 230V.
              </p>

              <div className="space-y-1.5 font-mono text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Bezpieczeństwo:</span>
                  <span className="text-amber-400 font-semibold">Crash-Test 20G (ECE R17)</span>
                </div>
                <div className="flex justify-between">
                  <span>Zasilanie:</span>
                  <span className="text-white">Victron Phoenix 2000W + LiFePO4</span>
                </div>
                <div className="flex justify-between">
                  <span>Mocowanie:</span>
                  <span className="text-slate-300">Listwy Airline DIN 75410-2</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-400 group-hover:underline flex items-center gap-1">
                Konfiguruj CAD <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen3dPreview('workshop_van');
                }}
                className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-200 hover:text-white bg-[#1C2541] hover:bg-amber-500 hover:text-slate-950 border border-amber-400/40 rounded transition-all flex items-center gap-1"
                title="Otwórz obracalny model 3D klatki warsztatowej"
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>Model 3D 360°</span>
              </button>
            </div>
          </div>

          {/* TILE 4: Wywrotka 3-Stronna Hardox */}
          <div 
            onClick={() => onSelectCategory('tipper_3way')}
            className="group relative bg-[#0B132B] hover:bg-[#111C3D] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1C2541] border border-orange-500/40 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                  <Construction className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/30 font-semibold">
                  MASTER 4 & 8
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors mb-2">
                Wywrotka 3-Stronna Hardox (Kipper)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Platforma ze stali trudnościeralnej Hardox 450, siłownik teleskopowy 4-sekcyjny, burty ALU-S.V. z otwieraniem dolnym i górnym, pilot kablowy i radiowy.
              </p>

              <div className="space-y-1.5 font-mono text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Materiał podłogi:</span>
                  <span className="text-orange-300 font-semibold">Hardox 450 (3.0 mm)</span>
                </div>
                <div className="flex justify-between">
                  <span>Kąt wywrotu:</span>
                  <span className="text-white">50° tył / 45° boki (siłownik 4-stopnie)</span>
                </div>
                <div className="flex justify-between">
                  <span>Koła bliźniacze:</span>
                  <span className="text-slate-300">Iveco 50C / 70C / MB 519</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-orange-400 group-hover:underline flex items-center gap-1">
                Konfiguruj CAD <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen3dPreview('tipper_3way');
                }}
                className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-200 hover:text-white bg-[#1C2541] hover:bg-orange-500 hover:text-slate-950 border border-orange-400/40 rounded transition-all flex items-center gap-1"
                title="Otwórz obracalny model 3D wywrotki"
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>Model 3D 360°</span>
              </button>
            </div>
          </div>

          {/* TILE 5: Autolaweta Pomoc Drogowa */}
          <div 
            onClick={() => onSelectCategory('car_transporter')}
            className="group relative bg-[#0B132B] hover:bg-[#111C3D] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1C2541] border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/30 font-semibold">
                  MASTER 4 & 5
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition-colors mb-2">
                Autolaweta Pomoc Drogowa LOHR
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Konstrukcja 100% z profili aluminiowych ALU-S.V. Panele z otworowaniem LOHR, trapy najazdowe wsuwane centralnie, wciągarka Superwinch z liną syntetyczną.
              </p>

              <div className="space-y-1.5 font-mono text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Masa zabudowy:</span>
                  <span className="text-red-400 font-semibold">Tylko 340 kg! (Pełne aluminium)</span>
                </div>
                <div className="flex justify-between">
                  <span>Wciągarka:</span>
                  <span className="text-white">Superwinch 11500 lbs (pilot radiowy)</span>
                </div>
                <div className="flex justify-between">
                  <span>Kąt najazdu:</span>
                  <span className="text-slate-300">9.5° (bardzo niski próg)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-red-400 group-hover:underline flex items-center gap-1">
                Konfiguruj CAD <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen3dPreview('car_transporter');
                }}
                className="px-2.5 py-1 text-[11px] font-mono font-bold text-slate-200 hover:text-white bg-[#1C2541] hover:bg-red-500 hover:text-slate-950 border border-red-400/40 rounded transition-all flex items-center gap-1"
                title="Otwórz obracalny model 3D autolawety"
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span>Model 3D 360°</span>
              </button>
            </div>
          </div>

          {/* Quick Info Tile: MASTER 1-13 Overview */}
          <div 
            onClick={onOpenMasterSpecs}
            className="group relative bg-[#070D1E] hover:bg-[#0B132B] border border-dashed border-[#D4AF37]/50 rounded-xl p-6 transition-all duration-200 cursor-pointer shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#1C2541] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono text-[#D4AF37] font-semibold">
                  AUDYT INŻYNIERYJNY
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#D4AF37] mb-2">
                Specyfikacja MASTER 1–13
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Poznaj zestaw 13 rygorystycznych reguł konstrukcyjnych: tolerancje ISO GPS, ograniczenia zwisu tylnego OEM BBG, momenty obrotowe wind Dhollandia i atesty stopów ALU-S.V.
              </p>

              <div className="space-y-1 text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 13 / 13 Certyfikowanych Norm
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Dopuszczenie do Ruchu CoC Kat. N1 / N2
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#D4AF37] group-hover:underline flex items-center gap-1">
                Otwórz Kartę Norm MASTER <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* Section: Preconfigured OEM Industry Presets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] mb-1">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>SPRAWDZONE WZORCE FLOTOWE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Predefiniowane Pakiety Przemysłowe Nowa Firma
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Gotowe konfiguracje zoptymalizowane pod ładowność, aerodynamikę i czas montażu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_BUILDS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onLoadPreset(preset.id)}
              className="bg-[#0B132B]/90 hover:bg-[#111C3D] border border-slate-800 hover:border-[#D4AF37]/60 rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                    {preset.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {preset.targetCategory.toUpperCase()}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1">
                  {preset.name}
                </h4>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {preset.tagline}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-3 bg-[#070D1E] p-2.5 rounded-lg border border-slate-800">
                  {preset.highlightSpecs.map((spec, sIdx) => (
                    <div key={sIdx} className="text-slate-300 flex items-center gap-1 truncate">
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1">
                  Wczytaj do Studia CAD <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  ~{preset.basePriceEstimatePln.toLocaleString('pl-PL')} PLN
                </span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Section: OEM Chassis Quick Switcher */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Certyfikowane Podwozia Bazowe OEM BBG
          </h2>
          <p className="text-xs text-slate-400">
            Wybierz podwozie fabryczne, aby natychmiast załadować tolerancje ramy i limity osi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OEM_CHASSIS_DATABASE.map((chassis) => (
            <button
              key={chassis.id}
              onClick={() => onSelectChassis(chassis)}
              className="text-left bg-[#0B132B]/80 hover:bg-[#1C2541] border border-slate-800 hover:border-[#D4AF37]/40 rounded-lg p-3.5 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {chassis.brand} {chassis.model}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  DMC: {chassis.gvwKg} kg
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate mb-1">
                {chassis.subModel}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Rozstaw (WB): {chassis.wheelbaseMm} mm</span>
                <span className="text-emerald-400">{chassis.driveType}</span>
              </div>
            </button>
          ))}
        </div>

      </section>

    </div>
  );
};
