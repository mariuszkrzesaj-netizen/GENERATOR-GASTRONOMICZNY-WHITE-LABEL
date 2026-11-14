import { 
  OemChassis, 
  DhollandiaLift, 
  BodyOptionItem, 
  BodyWorkType 
} from '../types/itsMaster';

export interface MasterStandardDoc {
  id: number;
  code: string;
  name: string;
  shortDesc: string;
  complianceRule: string;
  category: string;
}

export const MASTER_STANDARDS: MasterStandardDoc[] = [
  {
    id: 1,
    code: "ISO GPS",
    name: "Geometrical Product Specifications (ISO 1101 / ISO 8015)",
    shortDesc: "Tolerowanie wymiarowe i geometryczne ramy pośredniej oraz zabudowy",
    complianceRule: "Wszystkie spawy, wiercenia i profile w tolerancji ISO 2768-mK. Równoległość belek wzdłużnych poniżej 1.5mm/m.",
    category: "Normy Geometryczne"
  },
  {
    id: 2,
    code: "OEM BBG",
    name: "Body Builder Guidelines (Mercedes / Iveco / MAN / Renault)",
    shortDesc: "Ścisłe wytyczne fabryczne producentów podwozi dla adaptatorów",
    complianceRule: "Zakaz spawania do pasów ramy. Wiercenie wyłącznie w strefach neutralnych. Zwis tylny ROH ≤ 60% rozstawu osi (WB).",
    category: "Integracja Podwozia"
  },
  {
    id: 3,
    code: "DH-LIFT",
    name: "Dhollandia Tail Lift Integration & ECE R58",
    shortDesc: "Montaż wind samozaładowczych i zderzaków przeciwnajazdowych",
    complianceRule: "Obliczenie momentu dociążenia tylnej osi wg wzoru Dhollandia. Zderzak R58.03 zintegrowany ze słupkami nośnymi windy.",
    category: "Załadunek i Bezpieczeństwo"
  },
  {
    id: 4,
    code: "ALU-S.V.",
    name: "ALU-S.V. Structural Extrusions & Kinegrip Systems",
    shortDesc: "Atestowane profile obrzeżowe, burty anodowane i słupki wypinane",
    complianceRule: "Stop aluminium 6005A-T6 / 6082-T6. Profil obrzeżowy z kieszeniami mocowania pasów co 100mm o wytrzymałości 500 daN.",
    category: "Struktura i Poszycie"
  },
  {
    id: 5,
    code: "CAD-ENG",
    name: "Parametric CAD Engine (2D/3D Live Geometry)",
    shortDesc: "Dynamiczny model wymiarowy z podglądem bocznym, górnym i przekrojowym",
    complianceRule: "Aktualizacja w czasie rzeczywistym wymiarów zewnętrznych, wewnętrznych, kubatury m³ i siatki europalet 1200x800mm.",
    category: "Inżynieria Cyfrowa"
  },
  {
    id: 6,
    code: "NAVY/GOLD",
    name: "Design System Navy & Gold (Nowa Firma Corporate Luxury)",
    shortDesc: "Korporacyjna identyfikacja wizualna klasy Industrial Luxury B2B",
    complianceRule: "Dominujący głęboki granat #0B132B / #1C2541, akcenty szczotkowanego złota #D4AF37 / #F59E0B, brak zbędnych ozdobników.",
    category: "Standard Wizualny"
  },
  {
    id: 7,
    code: "AXLE-DIST",
    name: "Axle Load Distribution & Center of Gravity (CoG)",
    shortDesc: "Obliczanie nacisków osi przedniej i tylnej oraz stateczności",
    complianceRule: "Wymóg zachowania minimum 25% rzeczywistego nacisku na oś kierowaną przy pełnym obciążeniu nominalnym.",
    category: "Bezpieczeństwo Dynamiczne"
  },
  {
    id: 8,
    code: "MAT-BOM",
    name: "Material Resistance & Automated Bill of Materials",
    shortDesc: "Generowanie kompletnego zestawienia komponentów i materiałów",
    complianceRule: "Dokładne rozbicie wagi stali S355, profili ALU-S.V., sklejki brzozowej 15-18mm, instalacji elektrycznej i okuć.",
    category: "Produkcja"
  },
  {
    id: 9,
    code: "COC-UE",
    name: "European Type Approval II Stage (EU 2018/858)",
    shortDesc: "Homologacja europejska drugiego etapu dla pojazdów skompletowanych",
    complianceRule: "Generowanie danych technicznych do świadectwa zgodności CoC kat. N1 (do 3.5t) oraz N2 (powyżej 3.5t).",
    category: "Certyfikacja Prawna"
  },
  {
    id: 10,
    code: "AERO-CAB",
    name: "Aerodynamic Sleeper Cabs & Deflectors",
    shortDesc: "Kabiny sypialne dachowe i tylne z owiewkami redukującymi opór Cx",
    complianceRule: "Zgodność z normami palności wnętrz FMVSS 302, współczynnik redukcji oporu powietrza -14% zużycia paliwa w trasie.",
    category: "Komfort Kierowcy"
  },
  {
    id: 11,
    code: "ATP-FRC",
    name: "ATP / FRC Isothermal & Refrigeration Class",
    shortDesc: "Atest higieniczny PZH i certyfikat ATP dla transportu żywności i leków",
    complianceRule: "Współczynnik K ≤ 0.40 W/m²K dla klasy FRC (-20°C). Panele PUR/XPS klejone próżniowo bez mostków cieplnych.",
    category: "Termoizolacja"
  },
  {
    id: 12,
    code: "CRASH-R17",
    name: "Van Racking Crash Safety (ECE R17 / DIN 75410-2)",
    shortDesc: "Zabudowy warsztatowe z testem zderzeniowym 20G",
    complianceRule: "Systemy regałowe mocowane wyłącznie do wzmocnień fabrycznych nadwozia i podłogi systemowej ze sklejki 12mm z miskami.",
    category: "Warsztaty Mobilne"
  },
  {
    id: 13,
    code: "CAD-EXPORT",
    name: "Technical Production Card & CAD Export",
    shortDesc: "Generowanie oficjalnego zlecenia produkcyjnego z numerem NF-CAD",
    complianceRule: "Unikalny identyfikator zamówienia z sumą kontrolną, specyfikacją materiałową i weryfikacją technologów Nowa Firma.",
    category: "Zarządzanie Zleceniem"
  }
];

export const OEM_CHASSIS_DATABASE: OemChassis[] = [
  {
    id: "iveco_daily_35s18",
    brand: "Iveco",
    model: "Daily 35S18",
    subModel: "Podwozie z pojedynczą kabiną, 3.0 HPI 176 KM",
    type: "chassis",
    wheelbaseMm: 4100,
    gvwKg: 3500,
    curbWeightChassisKg: 1880,
    frontAxleTareKg: 1220,
    rearAxleTareKg: 660,
    maxFrontAxleLoadKg: 1900,
    maxRearAxleLoadKg: 2240,
    frontOverhangMm: 1000,
    maxBodyLengthMm: 4950,
    maxBodyWidthMm: 2300,
    maxBodyHeightMm: 2600,
    driveType: "4x2 RWD",
    enginePowerHp: 176,
    fuelTankLitres: 90,
    frameWidthMm: 860,
    bbgReferenceDoc: "Iveco Daily BBG 2024 Rev 3 / Sekcja 4.2"
  },
  {
    id: "iveco_daily_50c18_twin",
    brand: "Iveco",
    model: "Daily 50C18 Bliźniak",
    subModel: "Podwozie HD z kołami bliźniaczymi, 3.0 HPI 180 KM",
    type: "chassis",
    wheelbaseMm: 4350,
    gvwKg: 5000,
    curbWeightChassisKg: 2150,
    frontAxleTareKg: 1310,
    rearAxleTareKg: 840,
    maxFrontAxleLoadKg: 2100,
    maxRearAxleLoadKg: 3700,
    frontOverhangMm: 1000,
    maxBodyLengthMm: 5400,
    maxBodyWidthMm: 2450,
    maxBodyHeightMm: 2700,
    driveType: "4x2 RWD Bliźniak",
    enginePowerHp: 180,
    fuelTankLitres: 100,
    frameWidthMm: 860,
    bbgReferenceDoc: "Iveco Daily HD BBG 2024 / Rozdział C"
  },
  {
    id: "mercedes_sprinter_319_cdi",
    brand: "Mercedes-Benz",
    model: "Sprinter 319 CDI",
    subModel: "Podwozie L3 9-Tronic RWD, 2.0 OM654 190 KM",
    type: "chassis",
    wheelbaseMm: 4325,
    gvwKg: 3500,
    curbWeightChassisKg: 1840,
    frontAxleTareKg: 1190,
    rearAxleTareKg: 650,
    maxFrontAxleLoadKg: 1860,
    maxRearAxleLoadKg: 2250,
    frontOverhangMm: 1021,
    maxBodyLengthMm: 5050,
    maxBodyWidthMm: 2280,
    maxBodyHeightMm: 2550,
    driveType: "4x2 RWD",
    enginePowerHp: 190,
    fuelTankLitres: 93,
    frameWidthMm: 840,
    bbgReferenceDoc: "Mercedes-Benz ABH / BBG Sprinter 907/910"
  },
  {
    id: "renault_master_dci165",
    brand: "Renault",
    model: "Master dCi 165",
    subModel: "Podwozie z kabiną L3 FWD Platforma, 2.3 dCi Twin-Turbo",
    type: "chassis",
    wheelbaseMm: 4006,
    gvwKg: 3500,
    curbWeightChassisKg: 1720,
    frontAxleTareKg: 1160,
    rearAxleTareKg: 560,
    maxFrontAxleLoadKg: 1850,
    maxRearAxleLoadKg: 2100,
    frontOverhangMm: 869,
    maxBodyLengthMm: 4900,
    maxBodyWidthMm: 2250,
    maxBodyHeightMm: 2500,
    driveType: "4x2 FWD",
    enginePowerHp: 165,
    fuelTankLitres: 105,
    frameWidthMm: 820,
    bbgReferenceDoc: "Renault Trucks Master BBG 2024 / Code 17A"
  },
  {
    id: "man_tge_3180",
    brand: "MAN",
    model: "TGE 3.180",
    subModel: "Podwozie z ramą L4 RWD, 2.0 BiTurbo 177 KM",
    type: "chassis",
    wheelbaseMm: 4490,
    gvwKg: 3500,
    curbWeightChassisKg: 1890,
    frontAxleTareKg: 1240,
    rearAxleTareKg: 650,
    maxFrontAxleLoadKg: 1800,
    maxRearAxleLoadKg: 2100,
    frontOverhangMm: 1000,
    maxBodyLengthMm: 5200,
    maxBodyWidthMm: 2280,
    maxBodyHeightMm: 2600,
    driveType: "4x2 RWD",
    enginePowerHp: 177,
    fuelTankLitres: 75,
    frameWidthMm: 850,
    bbgReferenceDoc: "MAN MANTED Portal / TGE Chassis Guidelines"
  },
  {
    id: "mercedes_sprinter_van_l3h2",
    brand: "Mercedes-Benz",
    model: "Sprinter Furgon L3H2",
    subModel: "Furgon blaszak bazowy pod Zabudowę Warsztatową ECE R17",
    type: "van",
    wheelbaseMm: 4325,
    gvwKg: 3500,
    curbWeightChassisKg: 2280,
    frontAxleTareKg: 1350,
    rearAxleTareKg: 930,
    maxFrontAxleLoadKg: 1860,
    maxRearAxleLoadKg: 2250,
    frontOverhangMm: 1021,
    maxBodyLengthMm: 4300,
    maxBodyWidthMm: 1780,
    maxBodyHeightMm: 1940,
    driveType: "4x2 RWD",
    enginePowerHp: 170,
    fuelTankLitres: 93,
    frameWidthMm: 840,
    bbgReferenceDoc: "Mercedes-Benz Van Racking Guidance V3"
  },
  {
    id: "ford_transit_350_l3",
    brand: "Ford",
    model: "Transit 350 L3",
    subModel: "Podwozie z pojedynczą kabiną, 2.0 EcoBlue HDT 170 KM",
    type: "chassis",
    wheelbaseMm: 3954,
    gvwKg: 3500,
    curbWeightChassisKg: 1740,
    frontAxleTareKg: 1140,
    rearAxleTareKg: 600,
    maxFrontAxleLoadKg: 1850,
    maxRearAxleLoadKg: 2250,
    frontOverhangMm: 1023,
    maxBodyLengthMm: 4850,
    maxBodyWidthMm: 2250,
    maxBodyHeightMm: 2500,
    driveType: "4x2 RWD",
    enginePowerHp: 170,
    fuelTankLitres: 80,
    frameWidthMm: 820,
    bbgReferenceDoc: "Ford BEMM (Body and Equipment Mounting Manual) 2024"
  },
  {
    id: "piaggio_porter_np6_long",
    brand: "Piaggio",
    model: "Porter NP6 L2",
    subModel: "Kompaktowe miejskie podwozie z ramą, 1.5 CombiFuel LPG/CNG 106 KM",
    type: "chassis",
    wheelbaseMm: 3250,
    gvwKg: 2800,
    curbWeightChassisKg: 1210,
    frontAxleTareKg: 680,
    rearAxleTareKg: 530,
    maxFrontAxleLoadKg: 1150,
    maxRearAxleLoadKg: 1800,
    frontOverhangMm: 620,
    maxBodyLengthMm: 3300,
    maxBodyWidthMm: 1850,
    maxBodyHeightMm: 2100,
    driveType: "4x2 RWD Bliźniak",
    enginePowerHp: 106,
    fuelTankLitres: 45,
    frameWidthMm: 740,
    bbgReferenceDoc: "Piaggio Commercial NP6 Conversion Manual 2024"
  }
];

export const DHALLANDIA_LIFTS: DhollandiaLift[] = [
  {
    id: "dhollandia_dhlma08_500",
    model: "Dhollandia DH-LMA.08 (500 kg Ultralight)",
    capacityKg: 500,
    weightKg: 165,
    platformLengthMm: 1450,
    platformMaterial: "Aluminium Ultralight",
    underrunProtection: "R58.03 Zintegrowana z belką",
    controlsType: "Sterownik zewnętrzny w skrzynce + pilot 2-przyciskowy na kablu spirala",
    powerSupply: "12V 1.2kW",
    rearOverhangAddedMm: 140,
    pricePln: 14800
  },
  {
    id: "dhollandia_dhlm08_750",
    model: "Dhollandia DH-LM.08 (750 kg Bestseller Express)",
    capacityKg: 750,
    weightKg: 195,
    platformLengthMm: 1600,
    platformMaterial: "Aluminium Heavy-Duty",
    underrunProtection: "R58.03 Zintegrowana z belką",
    controlsType: "Sterownik zewnętrzny w skrzynce + pilot 2-przyciskowy na kablu spirala",
    powerSupply: "12V 1.2kW",
    rearOverhangAddedMm: 155,
    pricePln: 16900
  },
  {
    id: "dhollandia_dhlsu11_1000",
    model: "Dhollandia DH-LSU.11 (1000 kg Heavy Duty)",
    capacityKg: 1000,
    weightKg: 275,
    platformLengthMm: 1800,
    platformMaterial: "Aluminium Heavy-Duty",
    underrunProtection: "R58.03 Podwójna",
    controlsType: "Sterownik zewnętrzny w skrzynce + pilot 2-przyciskowy na kablu spirala",
    powerSupply: "12V 2.0kW",
    rearOverhangAddedMm: 170,
    pricePln: 21500
  }
];

export const MASTER_OPTIONS_CATALOG: BodyOptionItem[] = [
  {
    id: "webasto_airtop_2000",
    name: "Ogrzewanie postojowe Webasto Air Top 2000 STC 12V",
    code: "OPT-WEB-01",
    category: "comfort",
    weightKg: 14,
    pricePln: 4900,
    description: "Niezależne ogrzewanie zasilane ze zbiornika paliwa pojazdu z regulatorem cyfrowym w kabinie sypialnej.",
    standardNorm: "ECE R122 / DIN EN 14418"
  },
  {
    id: "spojkar_aeromax_pod",
    name: "Kabina sypialna dachowa Spojkar Aeromax + owiewki boczne",
    code: "OPT-SPOJ-02",
    category: "aerodynamics",
    weightKg: 85,
    pricePln: 9800,
    description: "Aerodynamiczna sypialnia z izolacją termiczną, oknami uchylnymi, welurowym materacem 200x80cm i gniazdem 12V/USB.",
    standardNorm: "FMVSS 302 (Trudnopalność)"
  },
  {
    id: "back_sleeper_lamar",
    name: "Kabina sypialna tylna za fotelami (Backsleeper Nowa Firma)",
    code: "OPT-LAM-03",
    category: "aerodynamics",
    weightKg: 140,
    pricePln: 18500,
    description: "Zabudowa zintegrowana z kabiną, podwójne łóżko, wysoka pozycja stojąca, zoptymalizowany środek ciężkości.",
    standardNorm: "ECE R29 (Wytrzymałość kabiny)"
  },
  {
    id: "air_suspension_dual",
    name: "Zawieszenie pneumatyczne tylnej osi z kompresorem 2-obwodowym",
    code: "OPT-SUSP-04",
    category: "safety",
    weightKg: 28,
    pricePln: 3600,
    description: "Miechy powietrzne 170mm z manometrami i kompresorem z kabiny. Poziomowanie pojazdu pod obciążeniem.",
    standardNorm: "TÜV Rheinland / OEM BBG Approved"
  },
  {
    id: "daken_toolboxes_pair",
    name: "Zestaw 2x skrzynka narzędziowa Daken Just 600 z mocowaniami",
    code: "OPT-DAK-05",
    category: "storage",
    weightKg: 18,
    pricePln: 1100,
    description: "Skrzynki podwieszane pod ramą z tworzywa wzmocnionego, wodoszczelne zamki ryglowane na klucz.",
    standardNorm: "ECE R73 (Osłony boczne)"
  },
  {
    id: "water_tank_soap",
    name: "Zbiornik na wodę czystą 30L z dozownikiem mydła Lokhen",
    code: "OPT-WAT-06",
    category: "accessories",
    weightKg: 6,
    pricePln: 450,
    description: "Atestowany zbiornik z kranikiem spustowym do mycia rąk w trasie.",
    standardNorm: "PZH Certyfikat"
  },
  {
    id: "airline_rails_floor",
    name: "Listwy mocujące ładunek Airline zintegrowane w podłodze (DIN 75410)",
    code: "OPT-AIR-07",
    category: "cargo_securing",
    weightKg: 22,
    pricePln: 1950,
    description: "2 rzędy profili aluminiowych Airline wpuszczonych na równo ze sklejką podłogową, wytrzymałość 1000 daN na punkt.",
    standardNorm: "EN 12640 / DIN 75410-1"
  },
  {
    id: "led_interior_worklight",
    name: "Oświetlenie wewnętrzne LED o podwyższonej jasności (IP67)",
    code: "OPT-LED-08",
    category: "electrical",
    weightKg: 4,
    pricePln: 950,
    description: "Paski LED w profilu aluminiowym na całej długości dachu ze sterowaniem wyłącznikiem krańcowym w drzwiach.",
    standardNorm: "ECE R10 (Kompatybilność EMC)"
  },
  {
    id: "victron_inverter_2000w",
    name: "System zasilania 230V: Victron Phoenix 2000W + Akumulator LiFePO4 100Ah",
    code: "OPT-VIC-09",
    category: "electrical",
    weightKg: 34,
    pricePln: 8900,
    description: "Czysta sinusoida do zasilania elektronarzędzi i ładowarek w warsztacie mobilnym, ładowanie z alternatora DC-DC.",
    standardNorm: "CE / ECE R10"
  },
  {
    id: "superwinch_synthetic_12000",
    name: "Wciągarka elektryczna Superwinch Tiger Shark 11500 lbs lina syntetyczna",
    code: "OPT-WIN-10",
    category: "accessories",
    weightKg: 36,
    pricePln: 4400,
    description: "Wciągarka z przesuwnym łożem do autolawety, bezprzewodowy pilot radiowy + pilot przewodowy.",
    standardNorm: "EN 14492-1 (Wciągarki)"
  }
];

export interface PresetIndustryBuild {
  id: string;
  name: string;
  badge: string;
  targetCategory: BodyWorkType;
  chassisId: string;
  tagline: string;
  description: string;
  recommendedDimensions: { lengthMm: number; widthMm: number; heightMm: number; roofLiftMm: number };
  defaultOptions: string[];
  dhollandiaLiftId: string | null;
  basePriceEstimatePln: number;
  highlightSpecs: string[];
}

export const PRESET_BUILDS: PresetIndustryBuild[] = [
  {
    id: "preset_international_express_10ep",
    name: "Nowa Firma Express Międzynarodówka 10 EP",
    badge: "10 Europalet · TIR Express",
    targetCategory: "curtain_sider",
    chassisId: "iveco_daily_35s18",
    tagline: "Najpopularniejsza konfiguracja pod spedycję międzynarodową z DMC 3.5t",
    description: "Zabudowa firankowa dwustronna z dachem przesuwnym Edscha, kabiną sypialną dachową Spojkar, Webasto i zawieszeniem pneumatycznym.",
    recommendedDimensions: { lengthMm: 4900, widthMm: 2250, heightMm: 2350, roofLiftMm: 300 },
    defaultOptions: ["spojkar_aeromax_pod", "webasto_airtop_2000", "air_suspension_dual", "daken_toolboxes_pair", "water_tank_soap", "airline_rails_floor"],
    dhollandiaLiftId: null,
    basePriceEstimatePln: 46800,
    highlightSpecs: ["10 Palet EUR (4.9m)", "Regulacja dachu +30cm", "Webasto + Sypialnia", "Ładowność ~1080 kg"]
  },
  {
    id: "preset_pharma_fridge_lift",
    name: "Nowa Firma Pharma & Food FRC (-20°C) z Windą",
    badge: "ATP/FRC Certyfikat · Dhollandia",
    targetCategory: "isotherm_fridge",
    chassisId: "iveco_daily_35s18",
    tagline: "Dystrybucja leków i głęboko mrożonej żywności z pełną windą 750 kg",
    description: "Zabudowa izotermiczna z panelami PUR 85mm bez mostków cieplnych, agregat Carrier Citimax 400 z zasilaniem sieciowym i winda DH-LM.08.",
    recommendedDimensions: { lengthMm: 4200, widthMm: 2200, heightMm: 2150, roofLiftMm: 0 },
    defaultOptions: ["air_suspension_dual", "daken_toolboxes_pair", "led_interior_worklight"],
    dhollandiaLiftId: "dhollandia_dhlm08_750",
    basePriceEstimatePln: 74200,
    highlightSpecs: ["Klasa FRC (-20°C)", "Agregat Carrier 400", "Winda Dhollandia 750kg", "Atest PZH / ATP"]
  },
  {
    id: "preset_mobile_workshop_service",
    name: "Nowa Firma Mobile Service Van Racking ECE R17",
    badge: "Crash-Test 20G · Victron 230V",
    targetCategory: "workshop_van",
    chassisId: "mercedes_sprinter_van_l3h2",
    tagline: "Kompletny mobilny warsztat dla serwisantów maszyn i flot technicznych",
    description: "Zabudowa modułowa z atestem zderzeniowym 20G: podwójny regał aluminiowy z szufladami, stół warsztatowy z imadłem obrotowym, zasilanie Victron 230V.",
    recommendedDimensions: { lengthMm: 4300, widthMm: 1780, heightMm: 1940, roofLiftMm: 0 },
    defaultOptions: ["victron_inverter_2000w", "led_interior_worklight", "airline_rails_floor"],
    dhollandiaLiftId: null,
    basePriceEstimatePln: 39500,
    highlightSpecs: ["Atest ECE R17 20G", "Zasilanie Victron 230V", "Wysuwany stół + imadło", "Podłoga antypoślizgowa"]
  },
  {
    id: "preset_kipper_construction",
    name: "Nowa Firma Kipper 3-Stronny Hardox Heavy-Duty",
    badge: "Siłownik 4-stopniowy · Stal S355",
    targetCategory: "tipper_3way",
    chassisId: "iveco_daily_50c18_twin",
    tagline: "Masywna wywrotka budowlano-komunalna na kołach bliźniaczych",
    description: "Platforma ze stali trudnościeralnej Hardox, burty aluminiowe ALU-S.V. z otwieraniem dolnym i górnym, siłownik teleskopowy 4-sekcyjny.",
    recommendedDimensions: { lengthMm: 4000, widthMm: 2150, heightMm: 500, roofLiftMm: 0 },
    defaultOptions: ["daken_toolboxes_pair", "air_suspension_dual", "water_tank_soap"],
    dhollandiaLiftId: null,
    basePriceEstimatePln: 52000,
    highlightSpecs: ["Stal Hardox 450", "Wywrot 3-stronny 50°", "Siłownik Penta/Penta-4", "Burty wahliwe ALU-S.V."]
  },
  {
    id: "preset_recovery_transporter",
    name: "Nowa Firma Auto-Transporter Pomoc Drogowa",
    badge: "Pełne Aluminium · Wciągarka 12000",
    targetCategory: "car_transporter",
    chassisId: "iveco_daily_35s18",
    tagline: "Najlżejsza w klasie autolaweta z paneli otworowanych typu LOHR",
    description: "Konstrukcja 100% aluminium profilowane ALU-S.V., wózki najazdowe wysuwane ze zintegrowanym ryglem, wciągarka Superwinch z liną syntetyczną.",
    recommendedDimensions: { lengthMm: 5100, widthMm: 2100, heightMm: 350, roofLiftMm: 0 },
    defaultOptions: ["superwinch_synthetic_12000", "air_suspension_dual", "daken_toolboxes_pair"],
    dhollandiaLiftId: null,
    basePriceEstimatePln: 43900,
    highlightSpecs: ["Masa zabudowy tylko 340 kg!", "Panele LOHR Alu", "Wciągarka Superwinch", "Kąt najazdu 9.5°"]
  }
];
