import { 
  OemChassis, 
  ParametricCadDimensions, 
  AluSvProfileSystem, 
  AxleLoadCalculation, 
  BodyWorkType 
} from '../types/itsMaster';
import { DHALLANDIA_LIFTS, MASTER_OPTIONS_CATALOG } from '../data/masterSpecsData';

export function calculateAxleLoadsAndCompliance(
  chassis: OemChassis,
  dimensions: ParametricCadDimensions,
  aluSv: AluSvProfileSystem,
  bodyType: BodyWorkType,
  dhollandiaLiftId: string | null,
  selectedOptionsIds: string[],
  sleeperCab: 'none' | 'roof_spojkar_aeromax' | 'back_sleeper_lamar',
  coolingUnit: string
): AxleLoadCalculation {
  const wb = chassis.wheelbaseMm;
  const L = dimensions.lengthMm;
  const W = dimensions.widthMm;
  const H = dimensions.heightMm;

  // 1. Calculate Subframe & Body Shell Weight
  const floorAreaM2 = (L * W) / 1_000_000;
  
  let subframeWeightKg = 0;
  if (aluSv.subframeType.includes('Alu-System')) {
    subframeWeightKg = Math.round(110 + (L / 1000) * 14); // lekka alu
  } else {
    subframeWeightKg = Math.round(180 + (L / 1000) * 26); // stal S355
  }

  // Plywood flooring
  let floorWeightKg = Math.round(floorAreaM2 * 10.5); // 15mm birch

  let bodyShellKg = 0;
  let basePricePln = 0;

  switch (bodyType) {
    case 'curtain_sider': {
      // Aluminum sideboards + pillars + curtain framework + tarpaulin
      const sideboardsKg = Math.round((aluSv.sideboardHeightMm / 100) * (L / 1000) * 12);
      const tarpaulinRoofKg = Math.round(floorAreaM2 * 5 + (L / 1000) * 25);
      bodyShellKg = subframeWeightKg + floorWeightKg + sideboardsKg + tarpaulinRoofKg + 90;
      basePricePln = 28500 + Math.round((L / 1000) * 2200);
      if (dimensions.roofLiftMm > 0) {
        bodyShellKg += 35;
        basePricePln += 3400;
      }
      break;
    }
    case 'isotherm_fridge': {
      // Sandwich PUR panels (approx 22 kg/m2 of shell surface)
      const wallAreaM2 = 2 * (L * H / 1_000_000) + 2 * (W * H / 1_000_000) + floorAreaM2;
      const panelsKg = Math.round(wallAreaM2 * 18);
      const rearDoorStainlessKg = 75;
      bodyShellKg = subframeWeightKg + floorWeightKg + panelsKg + rearDoorStainlessKg;
      basePricePln = 38000 + Math.round((L / 1000) * 3100);
      if (coolingUnit !== 'none') {
        bodyShellKg += 85;
        basePricePln += 18900;
      }
      break;
    }
    case 'workshop_van': {
      // Fitted inside standard van body
      bodyShellKg = 160; // base floor + wall lining
      basePricePln = 19500;
      break;
    }
    case 'tipper_3way': {
      // Hardox body floor + tipping subframe + hydraulic ram
      bodyShellKg = subframeWeightKg + 340 + Math.round((L / 1000) * 45) + 85;
      basePricePln = 34000 + Math.round((L / 1000) * 2500);
      break;
    }
    case 'car_transporter': {
      // Structural aluminium perforated deck LOHR
      bodyShellKg = subframeWeightKg + 210 + Math.round((L / 1000) * 18);
      basePricePln = 31000 + Math.round((L / 1000) * 2000);
      break;
    }
  }

  // 2. Dhollandia Lift
  let dhollandiaWeightKg = 0;
  let dhollandiaPricePln = 0;
  const dhollandiaLift = DHALLANDIA_LIFTS.find(l => l.id === dhollandiaLiftId);
  if (dhollandiaLift && bodyType !== 'workshop_van' && bodyType !== 'car_transporter') {
    dhollandiaWeightKg = dhollandiaLift.weightKg;
    dhollandiaPricePln = dhollandiaLift.pricePln;
  }

  // 3. Sleeper Cab
  let sleeperWeightKg = 0;
  let sleeperPricePln = 0;
  if (sleeperCab === 'roof_spojkar_aeromax') {
    sleeperWeightKg = 85;
    sleeperPricePln = 9800;
  } else if (sleeperCab === 'back_sleeper_lamar') {
    sleeperWeightKg = 145;
    sleeperPricePln = 18500;
  }

  // 4. Options weight & price
  let optionsWeightKg = sleeperWeightKg;
  let optionsPricePln = sleeperPricePln;

  selectedOptionsIds.forEach(optId => {
    const opt = MASTER_OPTIONS_CATALOG.find(o => o.id === optId);
    if (opt) {
      optionsWeightKg += opt.weightKg;
      optionsPricePln += opt.pricePln;
    }
  });

  // 5. Total weights
  const totalChassisTareKg = chassis.curbWeightChassisKg;
  const totalEmptyWeightKg = totalChassisTareKg + bodyShellKg + dhollandiaWeightKg + optionsWeightKg;
  const maxLegalGvwKg = chassis.gvwKg;
  const netPayloadCapacityKg = Math.max(0, maxLegalGvwKg - totalEmptyWeightKg);

  // 6. Geometry & Overhang Calculations (OEM BBG)
  // Distance from front axle to front of bodywork (cab offset)
  const cabOffsetMm = chassis.type === 'van' ? 950 : 1320;
  const rearOverhangMm = Math.max(0, (cabOffsetMm + L) - wb);
  const maxAllowedRearOverhangMm = Math.round(wb * 0.60); // 60% rule from OEM BBG
  const rearOverhangRatioPct = Math.round((rearOverhangMm / wb) * 100);
  const isOverhangLegal = rearOverhangMm <= maxAllowedRearOverhangMm;

  // 7. Center of Gravity (CoG) & Axle Distribution Math
  // Body center of gravity from front axle:
  const bodyCoGDistanceMm = cabOffsetMm + (L / 2);
  
  // Weight transfer to rear axle for empty body:
  const bodyToRearKg = (bodyShellKg * bodyCoGDistanceMm) / wb;
  const bodyToFrontKg = bodyShellKg - bodyToRearKg;

  // Dhollandia lift is positioned at the very rear (lever arm):
  const liftDistanceMm = cabOffsetMm + L + 100;
  const liftToRearKg = (dhollandiaWeightKg * liftDistanceMm) / wb;
  const liftToFrontKg = dhollandiaWeightKg - liftToRearKg; // can be negative (lifts front axle!)

  // Options CoG (approximate 60% front, 40% rear for cab/accessories):
  const optionsToFrontKg = optionsWeightKg * 0.55;
  const optionsToRearKg = optionsWeightKg * 0.45;

  // Empty vehicle axle loads:
  const emptyFrontAxleKg = Math.round(chassis.frontAxleTareKg + bodyToFrontKg + liftToFrontKg + optionsToFrontKg);
  const emptyRearAxleKg = Math.round(chassis.rearAxleTareKg + bodyToRearKg + liftToRearKg + optionsToRearKg);

  // Full nominal load distribution:
  // Payload is assumed uniformly distributed inside cargo bed (CoG at L/2):
  const payloadToRearKg = (netPayloadCapacityKg * bodyCoGDistanceMm) / wb;
  const payloadToFrontKg = netPayloadCapacityKg - payloadToRearKg;

  const fullFrontAxleKg = Math.round(emptyFrontAxleKg + payloadToFrontKg);
  const fullRearAxleKg = Math.round(emptyRearAxleKg + payloadToRearKg);

  const frontAxleUtilizationPct = Math.min(150, Math.round((fullFrontAxleKg / chassis.maxFrontAxleLoadKg) * 100));
  const rearAxleUtilizationPct = Math.min(150, Math.round((fullRearAxleKg / chassis.maxRearAxleLoadKg) * 100));

  // Steering axle safety rule (OEM BBG & ECE: Front axle must carry >= 25% of gross mass)
  const steeringAxleLoadPercentage = Math.round((fullFrontAxleKg / maxLegalGvwKg) * 100);
  const isSteeringSafe = steeringAxleLoadPercentage >= 25;

  // 8. Euro-Pallet capacity (1200 x 800 mm)
  let euroPalletSpaces = 0;
  if (bodyType !== 'workshop_van' && bodyType !== 'car_transporter') {
    if (W >= 2420) {
      // 3 pallets crosswise or 2 rows lengthwise
      const count1 = Math.floor(L / 800) * 2;
      const count2 = Math.floor(L / 1200) * 3;
      euroPalletSpaces = Math.max(count1, count2);
    } else if (W >= 2100) {
      // 2 pallets lengthwise or crosswise
      const count1 = Math.floor(L / 1200) * 2;
      const count2 = Math.floor(L / 800) * 2;
      euroPalletSpaces = Math.max(count1, count2);
    } else {
      euroPalletSpaces = Math.floor(L / 1200);
    }
  }

  // 9. Cargo Volume (m3)
  const cubicMetersVolume = Number(((L * W * H) / 1_000_000_000).toFixed(1));

  // 10. Financial calculations
  const subtotalNettoPln = basePricePln + dhollandiaPricePln + optionsPricePln;
  const vatRatePct = 23;
  const totalBruttoPln = Math.round(subtotalNettoPln * (1 + vatRatePct / 100));
  
  // Production lead time (working days)
  let estimatedLeadDays = 14;
  if (bodyType === 'isotherm_fridge') estimatedLeadDays = 21;
  if (bodyType === 'tipper_3way') estimatedLeadDays = 18;
  if (dhollandiaLiftId) estimatedLeadDays += 3;

  return {
    totalChassisTareKg,
    bodyWeightKg: bodyShellKg,
    optionsWeightKg,
    dhollandiaWeightKg,
    totalEmptyWeightKg,
    maxLegalGvwKg,
    netPayloadCapacityKg,
    emptyFrontAxleKg,
    emptyRearAxleKg,
    fullFrontAxleKg,
    fullRearAxleKg,
    frontAxleUtilizationPct,
    rearAxleUtilizationPct,
    steeringAxleLoadPercentage,
    isSteeringSafe,
    rearOverhangMm,
    maxAllowedRearOverhangMm,
    rearOverhangRatioPct,
    isOverhangLegal,
    euroPalletSpaces,
    cubicMetersVolume,
    subtotalNettoPln,
    vatRatePct,
    totalBruttoPln,
    estimatedLeadDays
  };
}
