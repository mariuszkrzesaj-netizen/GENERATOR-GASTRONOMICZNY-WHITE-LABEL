export type VehicleBrand = 'Iveco' | 'Mercedes-Benz' | 'Renault' | 'MAN' | 'Ford';

export type BodyCategory = 
  | 'curtain_sider'    // Skrzynia z plandeką / firanka / międzynarodówka
  | 'refrigerated_box' // Izoterma / Kontener chłodniczy (ATP/FRC)
  | 'van_workshop'     // Zabudowa warsztatowa furgonu (Van Racking)
  | 'tipper_3way'      // Wywrotka trójstronna (Kipper)
  | 'car_transporter'; // Autolaweta pomoc drogowa

export interface BaseVehicle {
  id: string;
  brand: VehicleBrand;
  model: string;
  type: 'chassis' | 'van'; // podwozie pod zabudowę lub furgon blaszak
  wheelbaseMm: number;
  gvwrKg: number; // DMC (Dopuszczalna Masa Całkowita np. 3500 lub 7200)
  curbWeightKg: number; // Masa własna podwozia/furgonu
  maxBodyLengthMm: number;
  maxBodyWidthMm: number;
  maxBodyHeightMm: number;
  engine: string;
  drive: 'FWD' | 'RWD' | 'AWD' | 'RWD Twin';
  cabinType: 'single' | 'double';
  basePricePln: number;
}

export interface BodyDimensions {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
}

export interface AccessoryOption {
  id: string;
  name: string;
  description: string;
  weightKg: number;
  pricePln: number;
  category: 'aerodynamics' | 'loading' | 'electrical' | 'storage' | 'comfort' | 'safety';
  applicableBodies: BodyCategory[];
}

export interface RackingModule {
  id: string;
  side: 'left' | 'right';
  name: string;
  description: string;
  weightKg: number;
  pricePln: number;
  shelvesCount: number;
  drawersCount: number;
  hasVice: boolean;
  hasCaseShelf: boolean;
}

export interface BodyConfiguration {
  vehicleId: string;
  category: BodyCategory;
  dimensions: BodyDimensions;
  subframeMaterial: 'aluminum' | 'galvanized_steel';
  tarpaulinColor: string;
  
  // Specific category settings
  curtainType?: 'standard_tilt' | 'one_side_curtain' | 'two_side_curtain' | 'sliding_roof_edscha';
  sideboardHeightMm?: number; // 400mm, 500mm, 600mm
  roofElevationSystem?: 'fixed' | 'manual_crank_300' | 'hydraulic_lift_300';
  sleepingCab?: 'none' | 'roof_pod_spojkar' | 'back_sleeper_cab';
  
  // Refrigerated options
  panelThicknessMm?: 40 | 60 | 85;
  refrigerationUnit?: 'none' | 'carrier_citimax' | 'thermo_king_v300' | 'zanotti_zer0';
  standbyPower230V?: boolean;
  tempRecorderWithGps?: boolean;
  movablePartition?: boolean;

  // Workshop options
  flooringType?: 'plywood_anti_slip' | 'aluminum_checker_plate' | 'composite';
  wallLining?: 'honeycomb_plastic' | 'perforated_aluminum' | 'standard_plywood';
  inverterPowerWatts?: 0 | 1000 | 2000 | 3000;
  auxiliaryBattery?: 'none' | 'agm_100ah' | 'lifepo4_150ah';
  rackingModules: string[]; // ids of RackingModule

  // Tipper options
  tipperFloorMaterial?: 'hardox_steel' | 'light_aluminum';
  hydraulicPowerUnit?: 'standard_12v' | 'pto_gearbox';
  cabProtectionRack?: boolean;

  // Car Transporter options
  winchType?: 'none' | 'electric_12000lbs_steel' | 'electric_12000lbs_synthetic';
  lightbarHomologated?: boolean;
  rampType?: 'central_slide_in' | 'hydraulic_tilt_deck';

  // Universal accessories selected
  selectedAccessories: string[]; // accessory IDs
}

export interface CalculationResult {
  totalCurbWeightKg: number;
  remainingPayloadKg: number;
  maxPayloadKg: number;
  isOverweight: boolean;
  weightUsagePercentage: number;
  euroPalletCapacity: number;
  cargoVolumeM3: number;
  totalPriceNetPln: number;
  vatRate: number;
  totalPriceGrossPln: number;
  estimatedLeadDays: number;
  homologationClass: string;
}

export interface PresetProject {
  id: string;
  title: string;
  subtitle: string;
  category: BodyCategory;
  vehicleId: string;
  recommendedUse: string;
  estimatedPayloadKg: number;
  palletCount: number;
  highlightFeatures: string[];
  baseConfig: Partial<BodyConfiguration>;
}
