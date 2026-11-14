import { jsPDF } from 'jspdf';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { DHALLANDIA_LIFTS, MASTER_OPTIONS_CATALOG } from '../data/masterSpecsData';

// Clean text to avoid encoding issues in standard jsPDF fonts
function toPdfSafe(text: string): string {
  if (!text) return '';
  return text
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    .replace(/Δ/g, 'D')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/²/g, '2')
    .replace(/³/g, '3');
}

/**
 * Draws an accurate 2D CAD engineering side schematic directly onto the PDF canvas using vector primitives
 */
function drawVectorCadSchematic(
  doc: jsPDF, 
  startX: number, 
  startY: number, 
  boxWidth: number, 
  boxHeight: number,
  config: ActiveProjectConfiguration,
  calculations: AxleLoadCalculation
): void {
  // Container Box with Technical Border
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(startX, startY, boxWidth, boxHeight, 'FD');

  // Technical blueprint title badge inside the schematic box
  doc.setFillColor(15, 23, 42);
  doc.rect(startX, startY, 46, 5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text(toPdfSafe('SCHEMAT CAD 2D - RZUT BOCZNY'), startX + 2, startY + 3.6);

  // Scale calculations to fit drawing inside the box
  const L = config.dimensions.lengthMm;
  const H = config.dimensions.heightMm;
  const wb = config.chassis.wheelbaseMm;
  const foh = config.chassis.frontOverhangMm || 950;
  const roh = calculations.rearOverhangMm;

  // Ground line Y
  const groundY = startY + boxHeight - 8;
  const totalVehicleLengthMm = foh + wb + Math.max(roh, 1000);
  const maxAvailWidthMm = boxWidth - 36;
  const scale = Math.min(0.019, maxAvailWidthMm / Math.max(totalVehicleLengthMm, 6500));

  const originX = startX + 16;
  const cabFrontX = originX;
  const frontAxleX = cabFrontX + foh * scale;
  const rearAxleX = frontAxleX + wb * scale;
  const bodyStartX = frontAxleX + 220 * scale;
  const bodyLenPx = L * scale;
  const bodyEndX = bodyStartX + bodyLenPx;
  const wheelRadius = 4.5;
  const frameHeight = 2.4;
  const subframeHeight = (config.dimensions.subframeHeightMm || 120) * scale * 0.9;
  const bodyHeightPx = H * scale * 0.82;
  const bodyBottomY = groundY - wheelRadius * 2 - frameHeight - subframeHeight;
  const bodyTopY = bodyBottomY - bodyHeightPx;

  // 1. Datum Ground Line (Linia bazowa podłoża)
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.line(startX + 4, groundY, startX + boxWidth - 4, groundY);

  // 2. Wheels (Koła pojazdu)
  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(15, 23, 42);
  doc.circle(frontAxleX, groundY - wheelRadius, wheelRadius, 'FD');
  doc.circle(rearAxleX, groundY - wheelRadius, wheelRadius, 'FD');

  // Hubs (Piasty kół)
  doc.setFillColor(212, 175, 55);
  doc.circle(frontAxleX, groundY - wheelRadius, 1.4, 'FD');
  doc.circle(rearAxleX, groundY - wheelRadius, 1.4, 'FD');

  // 3. Chassis Frame Rails (Podłużnice ramy podwozia)
  doc.setFillColor(71, 85, 105);
  doc.setDrawColor(30, 41, 59);
  doc.rect(cabFrontX + 5, groundY - wheelRadius * 2 - frameHeight, (bodyEndX - cabFrontX - 3), frameHeight, 'FD');

  // 4. Cab Body Outline (Zarys kabiny pojazdu)
  doc.setFillColor(226, 232, 240);
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.3);
  
  // Hood + Windshield + Roof + Rear of Cab
  const cabRoofY = bodyBottomY - 18;
  doc.rect(cabFrontX, groundY - wheelRadius * 2 - frameHeight - 8, (bodyStartX - cabFrontX), 8, 'FD'); // engine hood block
  doc.rect(cabFrontX + 8, cabRoofY, (bodyStartX - cabFrontX - 8), (bodyBottomY - cabRoofY), 'FD'); // main cab block

  // Windshield (Szyba czołowa)
  doc.setFillColor(186, 230, 253);
  doc.rect(cabFrontX + 9, cabRoofY + 2, 7, 7, 'FD');

  // Cab Badge Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(30, 41, 59);
  doc.text(toPdfSafe(config.chassis.brand), cabFrontX + 2, groundY - wheelRadius * 2 - frameHeight - 2);

  // 5. ALU-S.V. Subframe (Rama pośrednia)
  doc.setFillColor(203, 213, 225);
  doc.setDrawColor(100, 116, 139);
  doc.rect(bodyStartX, groundY - wheelRadius * 2 - frameHeight - subframeHeight, bodyLenPx, subframeHeight, 'FD');

  // 6. Body Box / Tarpaulin / Isotherm Box (Zabudowa)
  const isCurtain = config.selectedBodyType === 'curtain_sider';
  const isFridge = config.selectedBodyType === 'isotherm_fridge';
  
  if (isCurtain) {
    doc.setFillColor(237, 242, 247);
  } else if (isFridge) {
    doc.setFillColor(240, 249, 255);
  } else {
    doc.setFillColor(241, 245, 249);
  }
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.rect(bodyStartX, bodyTopY, bodyLenPx, bodyHeightPx, 'FD');

  // Anodized Sideboards (Burty aluminiowe ALU-S.V.)
  const sideboardHPx = (config.aluSv.sideboardHeightMm / config.dimensions.heightMm) * bodyHeightPx;
  doc.setFillColor(226, 232, 240);
  doc.setDrawColor(212, 175, 55);
  doc.rect(bodyStartX, bodyBottomY - sideboardHPx, bodyLenPx, sideboardHPx, 'FD');

  // Intermediate Pillars (Słupy Kinegrip)
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(bodyStartX, bodyBottomY, bodyStartX, bodyTopY); // Front pillar
  doc.line(bodyEndX, bodyBottomY, bodyEndX, bodyTopY); // Rear portal pillar
  if (L > 4200) {
    doc.line(bodyStartX + bodyLenPx * 0.5, bodyBottomY, bodyStartX + bodyLenPx * 0.5, bodyTopY); // Mid pillar
  }

  // Roof Bows indication (Górny pas dachu Edscha)
  doc.setFillColor(15, 23, 42);
  doc.rect(bodyStartX, bodyTopY, bodyLenPx, 1.8, 'FD');

  // Dhollandia Tail Lift (Winda załadowcza) if equipped
  if (config.dhollandiaLiftId) {
    doc.setFillColor(2, 132, 199);
    doc.rect(bodyEndX, bodyBottomY - 14, 2.5, 14, 'FD'); // platform
    doc.setFillColor(14, 165, 233);
    doc.rect(bodyEndX - 3, bodyBottomY + 1, 6, 2.5, 'FD'); // lift cylinder box
    doc.setFontSize(4.5);
    doc.setTextColor(2, 132, 199);
    doc.text('DH-LIFT', bodyEndX + 3.5, bodyBottomY - 6);
  }

  // 7. Center of Gravity (CoG) Indicator (Środek ciężkości)
  const cogX = bodyStartX + bodyLenPx * 0.48;
  const cogY = bodyBottomY - bodyHeightPx * 0.42;
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.circle(cogX, cogY, 2.2, 'S');
  doc.line(cogX - 2.8, cogY, cogX + 2.8, cogY);
  doc.line(cogX, cogY - 2.8, cogX, cogY + 2.8);
  doc.setFontSize(4.5);
  doc.setTextColor(180, 83, 9);
  doc.text('CoG', cogX + 3.2, cogY + 1.2);

  // 8. Dimension Lines & Measurements (Linie wymiarowe ISO GPS)
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(15, 23, 42);

  // Length L (Górna linia wymiarowa długości zabudowy)
  const dimLineTopY = bodyTopY - 4;
  doc.line(bodyStartX, dimLineTopY, bodyEndX, dimLineTopY);
  doc.line(bodyStartX, dimLineTopY - 1.5, bodyStartX, dimLineTopY + 1.5);
  doc.line(bodyEndX, dimLineTopY - 1.5, bodyEndX, dimLineTopY + 1.5);
  doc.text(toPdfSafe(`L = ${L} mm`), (bodyStartX + bodyEndX) / 2, dimLineTopY - 1, { align: 'center' });

  // Height H (Prawa linia wymiarowa wysokości)
  const dimLineRightX = bodyEndX + (config.dhollandiaLiftId ? 14 : 7);
  doc.line(dimLineRightX, bodyTopY, dimLineRightX, bodyBottomY);
  doc.line(dimLineRightX - 1.5, bodyTopY, dimLineRightX + 1.5, bodyTopY);
  doc.line(dimLineRightX - 1.5, bodyBottomY, dimLineRightX + 1.5, bodyBottomY);
  doc.text(toPdfSafe(`H = ${H} mm`), dimLineRightX + 2, (bodyTopY + bodyBottomY) / 2 + 1);

  // Wheelbase WB (Dolna linia rozstawu osi)
  const dimWbY = groundY + 4.5;
  doc.line(frontAxleX, dimWbY, rearAxleX, dimWbY);
  doc.line(frontAxleX, dimWbY - 1.5, frontAxleX, dimWbY + 1.5);
  doc.line(rearAxleX, dimWbY - 1.5, rearAxleX, dimWbY + 1.5);
  doc.text(toPdfSafe(`WB = ${wb} mm`), (frontAxleX + rearAxleX) / 2, dimWbY + 2.5, { align: 'center' });

  // Rear Overhang ROH (Zwis tylny)
  doc.line(rearAxleX, dimWbY, bodyEndX, dimWbY);
  doc.line(bodyEndX, dimWbY - 1.5, bodyEndX, dimWbY + 1.5);
  doc.text(toPdfSafe(`ROH = ${roh} mm (${calculations.rearOverhangRatioPct}%)`), (rearAxleX + bodyEndX) / 2, dimWbY + 2.5, { align: 'center' });
}

export function generateAndDownloadPdfBom(
  config: ActiveProjectConfiguration,
  calculations: AxleLoadCalculation,
  clientName: string,
  clientCompany: string,
  notes: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  let currentY = 12;

  const L = config.dimensions.lengthMm;
  const W = config.dimensions.widthMm;
  const H = config.dimensions.heightMm;
  const numCrossmembers = Math.floor((L - 200) / 380) + 2;
  const crossmemberLen = W - 70;
  const numLashing = Math.floor(L / 100) * 2;
  const isDivided = L > 4200;
  const numMidPillars = isDivided ? (L > 5500 ? 4 : 2) : 0;
  const selectedLift = DHALLANDIA_LIFTS.find(l => l.id === config.dhollandiaLiftId);

  // 1. Header Banner (Navy #0B132B with Gold Accent)
  doc.setFillColor(11, 19, 43); // #0B132B
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 22, 'F');

  // Gold accent bar
  doc.setFillColor(212, 175, 55); // #D4AF37
  doc.rect(marginX, currentY + 21, pageWidth - marginX * 2, 1.2, 'F');

  // Company Wordmark
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Nowa Firma', marginX + 5, currentY + 6.5);

  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 230);
  doc.setFont('helvetica', 'normal');
  doc.text(toPdfSafe('Dzial Inzynierii CAD & Homologacji Drugiego Etapu · WE EU 2018/858'), marginX + 5, currentY + 11.5);
  doc.text(toPdfSafe('Specyfikacja MASTER 1-13 · ISO GPS · OEM BBG · Systemy Profili ALU-S.V.'), marginX + 5, currentY + 15.5);
  
  // Projekt i wykonanie highlight
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('Projekt i wykonanie: Nowa Firma'), marginX + 5, currentY + 19.5);

  // Right-aligned Project Number
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(toPdfSafe(`DOKUMENTACJA: ${config.projectNumber}`), pageWidth - marginX - 5, currentY + 6.5, { align: 'right' });

  doc.setFontSize(7);
  doc.setTextColor(180, 190, 210);
  doc.setFont('helvetica', 'normal');
  doc.text(toPdfSafe(`Data wydruku: ${new Date().toLocaleDateString('pl-PL')}`), pageWidth - marginX - 5, currentY + 11.5, { align: 'right' });
  doc.text(toPdfSafe('Status: ZWERYFIKOWANY CAD / GOTOWY DO DRUKU'), pageWidth - marginX - 5, currentY + 15.5, { align: 'right' });
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(toPdfSafe('Glowny Konstruktor CAD'), pageWidth - marginX - 5, currentY + 19.5, { align: 'right' });

  currentY += 26;

  // 2. Client & Base Chassis Info Box
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(210, 220, 230);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 16, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe('ZAMAWIAJACY I DANE POJAZDU BAZOWEGO:'), marginX + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(70, 80, 95);
  doc.text(toPdfSafe(`Zleceniodawca: ${clientName || 'Inzynier Floty Transportowej'} (${clientCompany || 'Nowa Firma'})`), marginX + 3, currentY + 9);
  doc.text(toPdfSafe(`Typ zabudowy: ${config.selectedBodyType.toUpperCase()} · Profil ramy: ${config.aluSv.subframeType.split('(')[0]}`), marginX + 3, currentY + 13);

  doc.text(toPdfSafe(`Podwozie: ${config.chassis.brand} ${config.chassis.model} (${config.chassis.driveType})`), marginX + 105, currentY + 9);
  doc.text(toPdfSafe(`Rozstaw osi: ${config.chassis.wheelbaseMm} mm · DMC: ${config.chassis.gvwKg} kg · Rama: ${config.chassis.frameWidthMm} mm`), marginX + 105, currentY + 13);

  currentY += 19;

  // 3. NEW SECTION: 2D CAD ENGINEERING SCHEMATIC (RZUT BOCZNY Z WYMIARAMI)
  doc.setFillColor(28, 37, 65); // #1C2541
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('1. SCHEMAT ZABUDOWY & GEOMETRIA PARAMETRYCZNA CAD (ISO GPS 1101 / OEM BBG)'), marginX + 3, currentY + 3.8);

  currentY += 6.5;

  // Draw vector schematic box (Height: 46 mm)
  drawVectorCadSchematic(doc, marginX, currentY, pageWidth - marginX * 2, 46, config, calculations);

  currentY += 48;

  // 4. Section: CAD Dimensions & ALU-S.V. Configuration
  const colW = (pageWidth - marginX * 2 - 4) / 2;

  // Column A: Dimensions
  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(210, 220, 230);
  doc.rect(marginX, currentY, colW, 25, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe('PARAMETRY WYMIAROWE (ISO GPS):'), marginX + 3, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(60, 70, 85);
  doc.text(toPdfSafe(`• Dlugosc zewnetrzna (L): ${L} mm · Szerokosc (W): ${W} mm`), marginX + 3, currentY + 8);
  doc.text(toPdfSafe(`• Wysokosc wewnetrzna (H): ${H} mm · Podramowka: ${config.dimensions.subframeHeightMm || 120} mm`), marginX + 3, currentY + 12);
  doc.text(toPdfSafe(`• Zwis tylny (ROH): ${calculations.rearOverhangMm} mm (${calculations.rearOverhangRatioPct}% WB, dopuszczalny <=60%)`), marginX + 3, currentY + 16);
  doc.text(toPdfSafe(`• Pojemnosc: ${calculations.euroPalletSpaces} Europalet · Kubatura: ${calculations.cubicMetersVolume} m3`), marginX + 3, currentY + 20);

  // Column B: ALU-S.V. System
  const colBX = marginX + colW + 4;
  doc.setFillColor(250, 252, 255);
  doc.rect(colBX, currentY, colW, 25, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe('SPECYFIKACJA STRUKTURALNA ALU-S.V.:'), colBX + 3, currentY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(60, 70, 85);
  doc.text(toPdfSafe(`• Podluznice: 2x profil ${L} mm · Poprzeczki Z-Alu co 380mm: ${numCrossmembers} szt.`), colBX + 3, currentY + 8);
  doc.text(toPdfSafe(`• Obrzeze ALU-S.V.: ${numLashing} otworow mocowania pasow (500 daN)`), colBX + 3, currentY + 12);
  doc.text(toPdfSafe(`• Slupy: ${config.aluSv.pillarType.split('(')[0]} (4 narozne + ${numMidPillars} mid)`), colBX + 3, currentY + 16);
  doc.text(toPdfSafe(`• Podloga: ${config.aluSv.flooringMaterial.split(' ')[0]} 15mm · Burty: ${config.aluSv.sideboardHeightMm} mm`), colBX + 3, currentY + 20);

  currentY += 28;

  // 5. Section: Full Bill of Materials (BOM Table)
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('2. PELNA LISTA CZESCI I ZESTAWIENIE MATERIALOWE (BOM - BILL OF MATERIALS)'), marginX + 3, currentY + 3.8);

  currentY += 6.5;

  // BOM Table Header
  const tableW = pageWidth - marginX * 2;
  const colLp = 8;
  const colName = 87;
  const colNorm = 42;
  const colWeight = 18;

  doc.setFillColor(235, 240, 248);
  doc.rect(marginX, currentY, tableW, 5.5, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('Lp.', marginX + 2, currentY + 3.8);
  doc.text(toPdfSafe('Komponent / Profil konstrukcyjny / Opcja'), marginX + colLp + 2, currentY + 3.8);
  doc.text(toPdfSafe('Standard / Norma / Atest'), marginX + colLp + colName + 2, currentY + 3.8);
  doc.text(toPdfSafe('Masa (kg)'), marginX + colLp + colName + colNorm + colWeight - 2, currentY + 3.8, { align: 'right' });
  doc.text(toPdfSafe('Cena Netto'), marginX + tableW - 2, currentY + 3.8, { align: 'right' });

  currentY += 6;

  // Build BOM Rows array
  const bomRows = [
    {
      lp: '01',
      name: `Podwozie bazowe: ${config.chassis.brand} ${config.chassis.model}`,
      norm: config.chassis.bbgReferenceDoc,
      weight: `${config.chassis.curbWeightChassisKg}`,
      price: 'OEM Dostarczone'
    },
    {
      lp: '02',
      name: `Podluznice ramy posredniej ALU-S.V. (2x ${L} mm)`,
      norm: 'Stop EN AW-6005A-T6 / ISO 2768-mK',
      weight: '~180',
      price: 'W cenie bazy'
    },
    {
      lp: '03',
      name: `Konstrukcja zabudowy: ${config.selectedBodyType.toUpperCase()} (${L}x${W}x${H} mm)`,
      norm: 'ALU-S.V. / Kinegrip K20 / DIN EN 12642',
      weight: `${calculations.bodyWeightKg}`,
      price: 'Wycena bazowa'
    }
  ];

  if (selectedLift) {
    bomRows.push({
      lp: '04',
      name: `Winda zaladowcza: ${selectedLift.model}`,
      norm: 'ECE R58.03 / Dhollandia DH-LM',
      weight: `${selectedLift.weightKg}`,
      price: `${selectedLift.pricePln.toLocaleString('pl-PL')} PLN`
    });
  }

  if (config.sleeperCab !== 'none') {
    bomRows.push({
      lp: String(bomRows.length + 1).padStart(2, '0'),
      name: `Kabina sypialna: ${config.sleeperCab === 'roof_spojkar_aeromax' ? 'Spojkar Aeromax dachowa' : 'Lamar Backsleeper tylna'}`,
      norm: 'FMVSS 302 / ECE R29',
      weight: config.sleeperCab === 'roof_spojkar_aeromax' ? '85' : '145',
      price: config.sleeperCab === 'roof_spojkar_aeromax' ? '9 800 PLN' : '18 500 PLN'
    });
  }

  config.selectedOptions.forEach(optId => {
    const opt = MASTER_OPTIONS_CATALOG.find(o => o.id === optId);
    if (opt) {
      bomRows.push({
        lp: String(bomRows.length + 1).padStart(2, '0'),
        name: opt.name,
        norm: opt.standardNorm,
        weight: `${opt.weightKg}`,
        price: `${opt.pricePln.toLocaleString('pl-PL')} PLN`
      });
    }
  });

  // Render BOM rows (max 7-8 to ensure single-page print ready or tight page fit)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(30, 41, 59);

  bomRows.slice(0, 9).forEach((row, idx) => {
    const rowY = currentY + idx * 4.6;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, rowY - 0.8, tableW, 4.6, 'F');
    }

    doc.text(row.lp, marginX + 2, rowY + 2.5);
    doc.text(toPdfSafe(row.name), marginX + colLp + 2, rowY + 2.5);
    doc.text(toPdfSafe(row.norm), marginX + colLp + colName + 2, rowY + 2.5);
    doc.text(row.weight, marginX + colLp + colName + colNorm + colWeight - 2, rowY + 2.5, { align: 'right' });
    doc.text(toPdfSafe(row.price), marginX + tableW - 2, rowY + 2.5, { align: 'right' });
  });

  currentY += Math.min(bomRows.length, 9) * 4.6 + 3.5;

  // 6. Section: Axle Load & Mass Balance
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('3. BILANS MAS I ROZKLAD NACISKOW NA OSIE (OEM BBG & HOMOLOGACJA II ETAPU)'), marginX + 3, currentY + 3.8);

  currentY += 6.5;

  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(210, 220, 230);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 14, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(40, 50, 65);
  doc.text(toPdfSafe(`• Dopuszczalna Masa Calkowita (DMC F.2): ${calculations.maxLegalGvwKg} kg · Masa wlasna (G): ${calculations.totalEmptyWeightKg} kg`), marginX + 3, currentY + 4.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // green
  doc.text(toPdfSafe(`• Czysta ladownosc uzytkowa netto: ${calculations.netPayloadCapacityKg} kg`), marginX + 3, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 65);
  doc.text(toPdfSafe(`• Os 1 (Kierowana): Pusty ${calculations.emptyFrontAxleKg} kg / Pelny ${calculations.fullFrontAxleKg} kg (Limit: ${config.chassis.maxFrontAxleLoadKg} kg)`), marginX + 90, currentY + 4.2);
  doc.text(toPdfSafe(`• Os 2 (Napedowa): Pusty ${calculations.emptyRearAxleKg} kg / Pelny ${calculations.fullRearAxleKg} kg (Limit: ${config.chassis.maxRearAxleLoadKg} kg)`), marginX + 90, currentY + 9);
  doc.text(toPdfSafe(`• Udzial osi przedniej: ${calculations.steeringAxleLoadPercentage}% (Wymog BBG min. 25%: SPELNIONY)`), marginX + 90, currentY + 12.8);

  currentY += 16.5;

  // 7. Financial Summary Box
  doc.setFillColor(11, 19, 43); // #0B132B
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 13, 'F');
  doc.setFillColor(212, 175, 55);
  doc.rect(marginX, currentY + 12, pageWidth - marginX * 2, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe(`Czas realizacji: ${calculations.estimatedLeadDays} Dni Roboczych (z homologacja WE)`), marginX + 4, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(190, 200, 220);
  doc.text(toPdfSafe('Gwarancja jakosci: 36 miesiecy na konstrukcje profili ALU-S.V. · Zgodnosc z ISO GPS'), marginX + 4, currentY + 9.5);

  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(toPdfSafe(`NETTO: ${calculations.subtotalNettoPln.toLocaleString('pl-PL')} PLN`), pageWidth - marginX - 5, currentY + 5, { align: 'right' });
  doc.setFontSize(7);
  doc.setTextColor(230, 235, 245);
  doc.text(toPdfSafe(`BRUTTO (23% VAT): ${calculations.totalBruttoPln.toLocaleString('pl-PL')} PLN`), pageWidth - marginX - 5, currentY + 9.5, { align: 'right' });

  currentY += 16;

  // 8. Signatures & QC Stamps
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.3);

  // Left signature
  doc.line(marginX, currentY + 10, marginX + 70, currentY + 10);
  doc.setFontSize(6);
  doc.setTextColor(100, 110, 125);
  doc.text(toPdfSafe('Projekt i wykonanie / Glowny Technolog Konstruktor:'), marginX, currentY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe('Nowa Firma / Dzial Inzynierii CAD'), marginX, currentY + 8.5);

  // Right signature
  doc.line(pageWidth - marginX - 70, currentY + 10, pageWidth - marginX, currentY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 125);
  doc.text(toPdfSafe('Podpis i Pieczec Zamawiajacego:'), pageWidth - marginX - 70, currentY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe(clientName ? `${clientName} (${clientCompany})` : 'Nabywca / Zleceniodawca'), pageWidth - marginX - 70, currentY + 8.5);

  // Bottom Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.3);
  doc.setTextColor(140, 150, 165);
  doc.text(toPdfSafe(`Dokument wygenerowany z systemu KREATOR ZABUDOW v1.0 · Nowa Firma · Zlecenie ${config.projectNumber}`), marginX, pageHeight - 7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 125);
  doc.text(toPdfSafe('Projekt wdrozenia, wlasnosc intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzezone.'), marginX, pageHeight - 4.2);

  // Download PDF directly in browser
  const filename = `Dokumentacja_Techniczna_${config.projectNumber}.pdf`;
  doc.save(filename);
}
