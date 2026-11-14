// Specification MASTER 1–13 for Nowa Firma

export type BodyWorkType = 
  | 'curtain_sider'    // MASTER 1: Zabudowa Międzynarodowa / Plandeka / Firanka
  | 'isotherm_fridge'  // MASTER 2: Izoterma i Chłodnia ATP/FRC
  | 'workshop_van'     // MASTER 3: Warsztat Mobilny / Van Racking ECE R17
  | 'tipper_3way'      // MASTER 4: Wywrotka 3-Stronna Hardox/Alu
  | 'car_transporter'; // MASTER 5: Autolaweta Pomoc Drogowa ALU-S.V.

export type OemBrand = 'Iveco' | 'Mercedes-Benz' | 'MAN' | 'Renault' | 'Ford' | 'Piaggio';

export interface OemChassis {
  id: string;
  brand: OemBrand;
  model: string;
  subModel: string;
  type: 'chassis' | 'van'; // podwozie ramowe lub furgon (furgon dla warsztatu)
  wheelbaseMm: number; // Rozstaw osi (WB)
  gvwKg: number; // DMC (Dopuszczalna Masa Całkowita: 3500, 5000, 7200 kg)
  curbWeightChassisKg: number; // Masa podwozia gotowego do jazdy
  frontAxleTareKg: number; // Nacisk osi przedniej w stanie nieobciążonym
  rearAxleTareKg: number; // Nacisk osi tylnej w stanie nieobciążonym
  maxFrontAxleLoadKg: number; // GAWR 1 - Dopuszczalny nacisk osi przedniej
  maxRearAxleLoadKg: number; // GAWR 2 - Dopuszczalny nacisk osi tylnej
  frontOverhangMm: number; // Zwis przedni
  maxBodyLengthMm: number; // Max dł. zabudowy wg OEM BBG
  maxBodyWidthMm: number; // Max szer. zabudowy wg OEM BBG
  maxBodyHeightMm: number; // Max wys. zabudowy wg OEM BBG
  driveType: '4x2 RWD' | '4x2 FWD' | '4x2 RWD Bliźniak' | '4x4';
  enginePowerHp: number;
  fuelTankLitres: number;
  frameWidthMm: number; // Szerokość ramy nośnej podwozia (np. 860 mm)
  bbgReferenceDoc: string; // Dokument wytycznych OEM (np. "Iveco Daily BBG 2024 Rev 3")
}

export interface DhollandiaLift {
  id: string;
  model: string;
  capacityKg: number; // Udźwig (np. 500, 750, 1000 kg)
  weightKg: number; // Masa własna windy z platformą aluminiową
  platformLengthMm: number; // Wysokość platformy (np. 1450 mm, 1600 mm)
  platformMaterial: 'Aluminium Ultralight' | 'Aluminium Heavy-Duty';
  underrunProtection: 'R58.03 Zintegrowana z belką' | 'R58.03 Podwójna';
  controlsType: 'Sterownik zewnętrzny w skrzynce + pilot 2-przyciskowy na kablu spirala';
  powerSupply: '12V 1.2kW' | '12V 2.0kW';
  rearOverhangAddedMm: number; // Odchylenie zwisu tylnego
  pricePln: number;
}

export interface AluSvProfileSystem {
  subframeType: 'Alu-System 120/140 (Lekka rama anodowana)' | 'Stal S355 ocynkowana ogniowo (Heavy-Duty)';
  sideboardHeightMm: 400 | 500 | 600;
  pillarType: 'Kinegrip K20 aluminiowy wypinany' | 'Kinegrip stalowy ze wspomaganiem' | 'Słupki stałe narożne';
  edgeProfile: 'ALU-S.V. z otworami mocowania pasów co 100mm (500 daN)' | 'Profil gładki z uchwytami wpuszczanymi';
  flooringMaterial: 'Sklejka brzozowa wodoodporna antypoślizgowa 15mm' | 'Sklejka 18mm wzmocniona' | 'Panel kompozytowy alu-plast';
}

export interface ParametricCadDimensions {
  lengthMm: number; // Długość zewnętrzna zabudowy
  widthMm: number;  // Szerokość zewnętrzna zabudowy
  heightMm: number; // Wysokość wewnętrzna pod plandeką / dachem
  subframeHeightMm: number; // Wysokość ramy pośredniej (np. 120 mm)
  sideboardThicknessMm: number;
  roofLiftMm: number; // Regulacja wysokości dachu (0, 150, 300 mm)
  rearOverhangMm: number; // Zwis tylny obliczony (ROH)
}

export interface BodyOptionItem {
  id: string;
  name: string;
  code: string;
  category: 'aerodynamics' | 'loading' | 'electrical' | 'cargo_securing' | 'accessories' | 'comfort' | 'safety' | 'storage';
  weightKg: number;
  pricePln: number;
  description: string;
  standardNorm: string; // np. "ISO 27956", "DIN 75410", "ECE R65"
}

export interface ActiveProjectConfiguration {
  projectNumber: string; // np. "NF-CAD-2026-081"
  clientName: string;
  clientCompany: string;
  selectedBodyType: BodyWorkType;
  chassis: OemChassis;
  dimensions: ParametricCadDimensions;
  aluSv: AluSvProfileSystem;
  dhollandiaLiftId: string | null; // Id wybranej windy lub null
  selectedOptions: string[]; // ID opcji
  curtainColorHex: string;
  curtainColorRal: string;
  roofSystem: 'fixed' | 'sliding_edscha' | 'double_curtain';
  sleeperCab: 'none' | 'roof_spojkar_aeromax' | 'back_sleeper_lamar';
  coolingUnit: 'none' | 'carrier_citimax_400' | 'thermo_king_v300_max' | 'zanotti_sfz008';
  atpClass: 'Brak' | 'FNA (0°C do +12°C)' | 'FRC (-20°C do +12°C)';
  workshopRackingLeft: boolean;
  workshopRackingRight: boolean;
  workshopInverterPower: 0 | 1500 | 2500;
  tipperHydraulics: 'electro_hydraulic_12v' | 'pto_shaft';
  winchSystem: 'none' | 'superwinch_12000' | 'kangaroo_synth_13500';
  customNotes: string;
}

export interface AxleLoadCalculation {
  totalChassisTareKg: number;
  bodyWeightKg: number;
  optionsWeightKg: number;
  dhollandiaWeightKg: number;
  totalEmptyWeightKg: number; // Masa własna pojazdu z zabudową (G)
  maxLegalGvwKg: number; // F.2 DMC
  netPayloadCapacityKg: number; // Ładowność użyteczna (kg)
  
  // Rozkład nacisków na osie w stanie pustym
  emptyFrontAxleKg: number;
  emptyRearAxleKg: number;
  
  // Rozkład nacisków na osie przy pełnym obciążeniu nominalnym (równomierny ładunek CoG w centrum skrzyni)
  fullFrontAxleKg: number;
  fullRearAxleKg: number;
  frontAxleUtilizationPct: number;
  rearAxleUtilizationPct: number;
  steeringAxleLoadPercentage: number; // Min. 25% dla zachowania kierowalności (wymóg OEM BBG!)
  isSteeringSafe: boolean;
  
  // Zwis tylny (ROH) i proporcje OEM BBG
  rearOverhangMm: number;
  maxAllowedRearOverhangMm: number;
  rearOverhangRatioPct: number; // ROH / WB * 100% (max 60%)
  isOverhangLegal: boolean;
  
  // Palety i kubatura
  euroPalletSpaces: number; // Palety 1200x800mm
  cubicMetersVolume: number;
  
  // Finanse
  subtotalNettoPln: number;
  vatRatePct: number;
  totalBruttoPln: number;
  estimatedLeadDays: number;
}
