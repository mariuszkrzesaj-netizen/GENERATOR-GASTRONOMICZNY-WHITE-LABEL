import React, { useState, useMemo } from 'react';
import { 
  ActiveProjectConfiguration, 
  BodyWorkType, 
  OemChassis, 
  ParametricCadDimensions, 
  AluSvProfileSystem 
} from './types/itsMaster';
import { 
  OEM_CHASSIS_DATABASE, 
  PRESET_BUILDS 
} from './data/masterSpecsData';
import { calculateAxleLoadsAndCompliance } from './utils/engineeringMath';
import { NavigationHeader } from './components/NavigationHeader';
import { HomeScreen } from './components/HomeScreen';
import { ConfiguratorStudio } from './components/ConfiguratorStudio';
import { OemBbgAxleCalculator } from './components/OemBbgAxleCalculator';
import { MasterSpecsModal } from './components/MasterSpecsModal';
import { CadBomExportModal } from './components/CadBomExportModal';
import { BodyType3dModal } from './components/BodyType3dModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Navigation State - STRICTLY starts on 'home' per MASTER specification:
  // "Każdą nową sesję rozpoczynasz bezpośrednio od ekranu startowego HOME SCREEN z kafelkami wyboru zabudowy i panelem nawigacyjnym"
  const [currentView, setCurrentView] = useState<'home' | 'cad' | 'axle' | 'presets'>('home');
  
  // Modals
  const [isMasterSpecsOpen, setIsMasterSpecsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalTab, setExportModalTab] = useState<'bom' | 'assembly_instructions' | 'coc_report' | 'dhollandia_manual' | 'video_sequence'>('bom');
  const [is3dModalOpen, setIs3dModalOpen] = useState(false);
  const [target3dCategory, setTarget3dCategory] = useState<BodyWorkType>('curtain_sider');

  const handleOpenExportModal = (tab: 'bom' | 'assembly_instructions' | 'coc_report' | 'dhollandia_manual' | 'video_sequence' = 'bom') => {
    setExportModalTab(tab);
    setIsExportModalOpen(true);
  };

  const handleOpen3dModal = (category?: BodyWorkType) => {
    if (category) {
      setTarget3dCategory(category);
    } else {
      setTarget3dCategory(config.selectedBodyType);
    }
    setIs3dModalOpen(true);
  };

  // Default initial configuration
  const defaultChassis = OEM_CHASSIS_DATABASE[0]; // Iveco Daily 35S18

  const [config, setConfig] = useState<ActiveProjectConfiguration>({
    projectNumber: 'NF-CAD-2026-081',
    clientName: 'Inżynier Floty Transportowej',
    clientCompany: 'Nowa Firma',
    selectedBodyType: 'curtain_sider',
    chassis: defaultChassis,
    dimensions: {
      lengthMm: 4900,
      widthMm: 2250,
      heightMm: 2350,
      subframeHeightMm: 120,
      sideboardThicknessMm: 25,
      roofLiftMm: 300,
      rearOverhangMm: 1200
    },
    aluSv: {
      subframeType: 'Alu-System 120/140 (Lekka rama anodowana)',
      sideboardHeightMm: 400,
      pillarType: 'Kinegrip K20 aluminiowy wypinany',
      edgeProfile: 'ALU-S.V. z otworami mocowania pasów co 100mm (500 daN)',
      flooringMaterial: 'Sklejka brzozowa wodoodporna antypoślizgowa 15mm'
    },
    dhollandiaLiftId: null,
    selectedOptions: ['spojkar_aeromax_pod', 'webasto_airtop_2000', 'air_suspension_dual', 'daken_toolboxes_pair', 'water_tank_soap', 'airline_rails_floor'],
    curtainColorHex: '#0B132B',
    curtainColorRal: 'RAL 5002',
    roofSystem: 'sliding_edscha',
    sleeperCab: 'roof_spojkar_aeromax',
    coolingUnit: 'none',
    atpClass: 'Brak',
    workshopRackingLeft: false,
    workshopRackingRight: false,
    workshopInverterPower: 0,
    tipperHydraulics: 'electro_hydraulic_12v',
    winchSystem: 'none',
    customNotes: ''
  });

  // Calculate live engineering math
  const calculations = useMemo(() => {
    return calculateAxleLoadsAndCompliance(
      config.chassis,
      config.dimensions,
      config.aluSv,
      config.selectedBodyType,
      config.dhollandiaLiftId,
      config.selectedOptions,
      config.sleeperCab,
      config.coolingUnit
    );
  }, [
    config.chassis,
    config.dimensions,
    config.aluSv,
    config.selectedBodyType,
    config.dhollandiaLiftId,
    config.selectedOptions,
    config.sleeperCab,
    config.coolingUnit
  ]);

  // Handlers for Category change
  const handleSelectCategory = (category: BodyWorkType) => {
    // If workshop, auto select van chassis if needed
    let targetChassis = config.chassis;
    if (category === 'workshop_van' && targetChassis.type !== 'van') {
      const vanChassis = OEM_CHASSIS_DATABASE.find(c => c.type === 'van') || targetChassis;
      targetChassis = vanChassis;
    } else if (category !== 'workshop_van' && targetChassis.type === 'van') {
      targetChassis = OEM_CHASSIS_DATABASE[0];
    }

    let defaultLift: string | null = config.dhollandiaLiftId;
    if (category === 'isotherm_fridge' && !defaultLift) {
      defaultLift = 'dhollandia_dhlm08_750';
    } else if (category === 'workshop_van' || category === 'car_transporter') {
      defaultLift = null;
    }

    setConfig(prev => ({
      ...prev,
      selectedBodyType: category,
      chassis: targetChassis,
      dhollandiaLiftId: defaultLift
    }));
    setCurrentView('cad');
  };

  // Handlers for Chassis change
  const handleSelectChassis = (newChassis: OemChassis) => {
    setConfig(prev => ({
      ...prev,
      chassis: newChassis,
      dimensions: {
        ...prev.dimensions,
        lengthMm: Math.min(prev.dimensions.lengthMm, newChassis.maxBodyLengthMm),
        widthMm: Math.min(prev.dimensions.widthMm, newChassis.maxBodyWidthMm)
      }
    }));
    setCurrentView('cad');
  };

  // Handlers for Presets
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_BUILDS.find(p => p.id === presetId);
    if (!preset) return;

    const matchedChassis = OEM_CHASSIS_DATABASE.find(c => c.id === preset.chassisId) || config.chassis;
    
    setConfig(prev => ({
      ...prev,
      selectedBodyType: preset.targetCategory,
      chassis: matchedChassis,
      dimensions: {
        ...prev.dimensions,
        lengthMm: preset.recommendedDimensions.lengthMm,
        widthMm: preset.recommendedDimensions.widthMm,
        heightMm: preset.recommendedDimensions.heightMm,
        roofLiftMm: preset.recommendedDimensions.roofLiftMm
      },
      selectedOptions: [...preset.defaultOptions],
      dhollandiaLiftId: preset.dhollandiaLiftId,
      sleeperCab: preset.defaultOptions.includes('spojkar_aeromax_pod') ? 'roof_spojkar_aeromax' : 'none'
    }));

    setCurrentView('cad');
  };

  // Update Dimensions
  const handleUpdateDimensions = (dims: Partial<ParametricCadDimensions>) => {
    setConfig(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, ...dims }
    }));
  };

  // Update ALU-S.V.
  const handleUpdateAluSv = (alu: Partial<AluSvProfileSystem>) => {
    setConfig(prev => ({
      ...prev,
      aluSv: { ...prev.aluSv, ...alu }
    }));
  };

  // Toggle options
  const handleToggleOption = (optId: string) => {
    setConfig(prev => {
      const exists = prev.selectedOptions.includes(optId);
      const next = exists 
        ? prev.selectedOptions.filter(id => id !== optId) 
        : [...prev.selectedOptions, optId];
      return { ...prev, selectedOptions: next };
    });
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-slate-950">
      
      {/* Navy/Gold Navigation Top Bar */}
      <NavigationHeader
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenMasterSpecs={() => setIsMasterSpecsOpen(true)}
        onOpenExportModal={() => handleOpenExportModal('bom')}
        onOpen3dPreview={() => handleOpen3dModal()}
        projectNumber={config.projectNumber}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeScreen
            onSelectCategory={handleSelectCategory}
            onSelectChassis={handleSelectChassis}
            onLoadPreset={handleLoadPreset}
            onOpenMasterSpecs={() => setIsMasterSpecsOpen(true)}
            onOpenCadStudio={() => setCurrentView('cad')}
            onOpen3dPreview={handleOpen3dModal}
          />
        )}

        {currentView === 'cad' && (
          <ConfiguratorStudio
            config={config}
            calculations={calculations}
            onChangeCategory={handleSelectCategory}
            onChangeChassis={handleSelectChassis}
            onChangeDimensions={handleUpdateDimensions}
            onChangeAluSv={handleUpdateAluSv}
            onChangeDhollandia={(liftId) => setConfig(prev => ({ ...prev, dhollandiaLiftId: liftId }))}
            onToggleOption={handleToggleOption}
            onChangeSleeperCab={(cab) => setConfig(prev => ({ ...prev, sleeperCab: cab }))}
            onChangeCoolingUnit={(unit) => setConfig(prev => ({ ...prev, coolingUnit: unit }))}
            onColorChange={(hex, ral) => setConfig(prev => ({ ...prev, curtainColorHex: hex, curtainColorRal: ral }))}
            onOpenDhollandiaManual={() => handleOpenExportModal('dhollandia_manual')}
            onOpenVideoSequence={() => handleOpenExportModal('video_sequence')}
            onOpen3dModal={() => handleOpen3dModal()}
            onGenerateDocumentation={() => handleOpenExportModal('bom')}
          />
        )}

        {currentView === 'axle' && (
          <OemBbgAxleCalculator
            chassis={config.chassis}
            calculations={calculations}
            config={config}
            onOpenExportModal={() => handleOpenExportModal('coc_report')}
          />
        )}

        {currentView === 'presets' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="bg-[#0B132B] border border-[#D4AF37]/30 rounded-xl p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Szablony Przemysłowe Nowa Firma
              </h2>
              <p className="text-sm text-slate-300">
                Wybierz zweryfikowany szablon zabudowy, aby natychmiast załadować optymalne parametry CAD, rozkład mas i wycenę materiałową.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PRESET_BUILDS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className="bg-[#0B132B] hover:bg-[#111C3D] border border-slate-800 hover:border-[#D4AF37] rounded-xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2541] text-[#D4AF37] border border-[#D4AF37]/30 font-semibold">
                        {preset.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        ~{preset.basePriceEstimatePln.toLocaleString('pl-PL')} PLN
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1.5">{preset.name}</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">{preset.description}</p>

                    <div className="space-y-1.5 text-xs font-mono text-slate-300 bg-[#070D1E] p-3 rounded-lg border border-slate-800 mb-4">
                      {preset.highlightSpecs.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full py-2 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-slate-950 font-bold rounded text-xs hover:brightness-110 transition-all">
                    Wczytaj Konfigurację do CAD
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Corporate & Intellectual Property Footer */}
      <footer className="border-t border-[#D4AF37]/25 bg-[#050A17] text-slate-400 text-xs py-7 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white font-mono">Nowa Firma</span>
              <span>·</span>
              <span>KREATOR ZABUDÓW v1.0</span>
              <span>·</span>
              <span className="text-slate-500">Specyfikacja MASTER 1–13</span>
            </div>

            <div className="text-slate-500 font-mono text-[11px] text-center md:text-right">
              ISO GPS · OEM BBG (Iveco / MB / MAN / Renault) · Dhollandia · ALU-S.V. · CoC Rozp. UE 2018/858
            </div>
          </div>

          <div className="pt-3 border-t border-slate-900 text-center text-[11px] font-mono text-[#D4AF37]/90">
            Projekt wdrożenia, własność intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MasterSpecsModal
        isOpen={isMasterSpecsOpen}
        onClose={() => setIsMasterSpecsOpen(false)}
        onOpenDhollandiaManual={() => handleOpenExportModal('dhollandia_manual')}
      />

      <CadBomExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        calculations={calculations}
        initialTab={exportModalTab}
        onSelectLift={(liftId) => setConfig(prev => ({ ...prev, dhollandiaLiftId: liftId }))}
        onUpdateClientInfo={(name, company, notes) => {
          setConfig(prev => ({
            ...prev,
            clientName: name,
            clientCompany: company,
            customNotes: notes
          }));
        }}
      />

      {/* 3D Realtime Orbit Modal (360°, Ford Transit, Piaggio Porter NP6, Renault Master) */}
      <BodyType3dModal
        isOpen={is3dModalOpen}
        onClose={() => setIs3dModalOpen(false)}
        initialBodyType={target3dCategory}
        initialChassis={config.chassis}
        onApplyAndConfigure={(category, chassis) => {
          setConfig(prev => ({
            ...prev,
            selectedBodyType: category,
            chassis: chassis,
            dimensions: {
              ...prev.dimensions,
              lengthMm: Math.min(prev.dimensions.lengthMm, chassis.maxBodyLengthMm),
              widthMm: Math.min(prev.dimensions.widthMm, chassis.maxBodyWidthMm)
            }
          }));
          setCurrentView('cad');
        }}
      />

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />

    </div>
  );
}
