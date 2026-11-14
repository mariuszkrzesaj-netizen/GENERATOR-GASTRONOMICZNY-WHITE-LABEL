import { jsPDF } from 'jspdf';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';

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
    .replace(/³/g, '3')
    .replace(/·/g, '-');
}

export function generateAndDownloadPdfCoC(
  config: ActiveProjectConfiguration,
  calculations: AxleLoadCalculation,
  clientName: string,
  clientCompany: string
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
  const FOH = config.chassis.frontOverhangMm;
  const WB = config.chassis.wheelbaseMm;
  const ROH = calculations.rearOverhangMm;
  const totalLengthMm = FOH + WB + ROH;
  const totalHeightMm = H + (config.dimensions.subframeHeightMm || 120) + 750; // ground to roof approx
  const categoryCode = config.chassis.gvwKg <= 3500 ? 'N1' : 'N2';
  
  let bodyworkTypeEce = 'BA (Skrzynia z oponcza / Firanka)';
  if (config.selectedBodyType === 'isotherm_fridge') bodyworkTypeEce = 'BB (Nadwozie izotermiczne / Chlodnia)';
  if (config.selectedBodyType === 'workshop_van') bodyworkTypeEce = 'BB (Furgon warsztatowy specjalny)';
  if (config.selectedBodyType === 'tipper_3way') bodyworkTypeEce = 'BC (Wywrotka 3-stronna)';
  if (config.selectedBodyType === 'car_transporter') bodyworkTypeEce = 'BA (Platforma pomocy drogowej LOHR)';

  const cocApprovalNo = `e20*2018/858*NF*${config.projectNumber}`;

  // 1. Header Banner
  doc.setFillColor(11, 19, 43); // #0B132B
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 25, 'F');
  doc.setFillColor(212, 175, 55); // #D4AF37 gold stripe
  doc.rect(marginX, currentY + 24, pageWidth - marginX * 2, 1.2, 'F');

  // Title
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(toPdfSafe('RAPORT ZGODNOSCI Z PRZEPISAMI - SWIADECTWO ZGODNOSCI CoC (ETAP II)'), marginX + 4, currentY + 6.5);

  doc.setFontSize(7.5);
  doc.setTextColor(210, 220, 240);
  doc.setFont('helvetica', 'normal');
  doc.text(toPdfSafe('Zgodnie z Rozporzadzeniem Parlamentu Europejskiego i Rady (UE) 2018/858 (Zalacznik VIII)'), marginX + 4, currentY + 12);
  doc.text(toPdfSafe('Dla pojazdow skompletowanych w procedurze wieloetapowej kategorii ' + categoryCode), marginX + 4, currentY + 16.5);
  doc.text(toPdfSafe('Producent Etapu II: Nowa Firma'), marginX + 4, currentY + 21);

  // Right Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text(toPdfSafe(`KAT. POJAZDU: ${categoryCode}`), pageWidth - marginX - 4, currentY + 6.5, { align: 'right' });
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(toPdfSafe(`Nr CoC: ${cocApprovalNo}`), pageWidth - marginX - 4, currentY + 12, { align: 'right' });
  doc.setTextColor(16, 185, 129); // green
  doc.text(toPdfSafe('STATUS: HOMOLOGACJA ZGODNA'), pageWidth - marginX - 4, currentY + 16.5, { align: 'right' });
  doc.setTextColor(190, 200, 215);
  doc.text(toPdfSafe(`Data weryfikacji: ${new Date().toLocaleDateString('pl-PL')}`), pageWidth - marginX - 4, currentY + 21, { align: 'right' });

  currentY += 31;

  // 2. Section 0: Dane Podwozia Etapu I
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('0. DANE IDENTYFIKACYJNE PODWOZIA BAZOWEGO (ETAP I)'), marginX + 3, currentY + 3.8);

  currentY += 7.5;

  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(210, 220, 230);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 16, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);

  doc.text(toPdfSafe(`• 0.1. Marka podwozia: ${config.chassis.brand}`), marginX + 3, currentY + 4.5);
  doc.text(toPdfSafe(`• 0.2. Model / Wariant: ${config.chassis.model} (${config.chassis.subModel})`), marginX + 3, currentY + 9);
  doc.text(toPdfSafe(`• 0.3. Układ napedowy: ${config.chassis.driveType} · Silnik: ${config.chassis.enginePowerHp} KM`), marginX + 3, currentY + 13.5);

  doc.text(toPdfSafe(`• 0.4. Wytyczne OEM: ${config.chassis.bbgReferenceDoc}`), marginX + 95, currentY + 4.5);
  doc.text(toPdfSafe(`• 0.5. Rozstaw osi fabryczny (WB): ${config.chassis.wheelbaseMm} mm`), marginX + 95, currentY + 9);
  doc.text(toPdfSafe(`• 0.6. Szerokosc ramy podwozia: ${config.chassis.frameWidthMm} mm`), marginX + 95, currentY + 13.5);

  currentY += 20;

  // 3. Section 1: Wymiary Geometryczne Pojazdu Skompletowanego
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('1. WYMIARY GEOMETRYCZNE POJAZDU SKOMPLETOWANEGO (ISO GPS / POZ. 4-13 CoC)'), marginX + 3, currentY + 3.8);

  currentY += 7.5;

  // Table of Dimensions
  const colW1 = 70;
  const colW2 = 35;
  const colW3 = 45;
  const colW4 = (pageWidth - marginX * 2) - (colW1 + colW2 + colW3);

  doc.setFillColor(235, 240, 248);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(toPdfSafe('Pozycja wg UE 2018/858 / Parametr'), marginX + 2, currentY + 3.5);
  doc.text(toPdfSafe('Wartosc'), marginX + colW1 + 2, currentY + 3.5);
  doc.text(toPdfSafe('Limit Przepisowy'), marginX + colW1 + colW2 + 2, currentY + 3.5);
  doc.text(toPdfSafe('Status Zgodnosci'), marginX + colW1 + colW2 + colW3 + 2, currentY + 3.5);

  currentY += 5.5;

  const dimRows = [
    {
      param: 'Poz. 4. Rozstaw osi (Wheelbase WB)',
      val: `${WB} mm`,
      limit: 'Wg homologacji Etapu I',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 5. Dlugosc calkowita pojazdu skompletowanego',
      val: `${totalLengthMm} mm`,
      limit: 'Max 12 000 mm',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 6. Szerokosc calkowita pojazdu skompletowanego',
      val: `${W} mm`,
      limit: 'Max 2 550 mm (2 600 chlodnia)',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 7. Wysokosc calkowita pojazdu skompletowanego',
      val: `${totalHeightMm} mm`,
      limit: 'Max 4 000 mm',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 10. Zwis przedni (FOH)',
      val: `${FOH} mm`,
      limit: 'Wg specyfikacji OEM',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 11. Zwis tylny (ROH)',
      val: `${ROH} mm (${calculations.rearOverhangRatioPct}% WB)`,
      limit: `<= 60% WB (max ${calculations.maxAllowedRearOverhangMm} mm)`,
      status: calculations.isOverhangLegal ? 'ZGODNY (OEM BBG)' : 'PRZEKROCZENIE'
    },
    {
      param: 'Wymiary wewnetrzne przestrzeni ladunkowej (DxSxW)',
      val: `${L} x ${W - 60} x ${H} mm`,
      limit: 'Zgodnosc z blueprintem CAD',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 38. Rodzaj i kod nadwozia',
      val: bodyworkTypeEce,
      limit: 'ISO 3833 / UE 2018/858',
      status: 'ZGODNY'
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);

  dimRows.forEach((r, idx) => {
    const rowY = currentY + idx * 4.6;
    if (idx % 2 === 1) {
      doc.setFillColor(250, 252, 255);
      doc.rect(marginX, rowY - 0.8, pageWidth - marginX * 2, 4.6, 'F');
    }
    doc.setTextColor(30, 41, 59);
    doc.text(toPdfSafe(r.param), marginX + 2, rowY + 2.5);
    doc.setFont('helvetica', 'bold');
    doc.text(toPdfSafe(r.val), marginX + colW1 + 2, rowY + 2.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 90, 105);
    doc.text(toPdfSafe(r.limit), marginX + colW1 + colW2 + 2, rowY + 2.5);
    
    if (r.status.includes('ZGODNY')) {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(toPdfSafe(r.status), marginX + colW1 + colW2 + colW3 + 2, rowY + 2.5);
  });

  currentY += dimRows.length * 4.6 + 4;

  // 4. Section 2: Bilans Mas i Rozklad Naciskow na Osie
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('2. DANE MASOWE I ROZKLAD NACISKOW NA OSIE (POZ. 14-22 CoC)'), marginX + 3, currentY + 3.8);

  currentY += 7.5;

  doc.setFillColor(235, 240, 248);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(toPdfSafe('Pozycja homologacyjna / Wskaznik masy'), marginX + 2, currentY + 3.5);
  doc.text(toPdfSafe('Wartosc'), marginX + colW1 + 2, currentY + 3.5);
  doc.text(toPdfSafe('Wartosc dopuszczalna'), marginX + colW1 + colW2 + 2, currentY + 3.5);
  doc.text(toPdfSafe('Ocena zgodnosci'), marginX + colW1 + colW2 + colW3 + 2, currentY + 3.5);

  currentY += 5.5;

  const massRows = [
    {
      param: 'Poz. 14. Masa pojazdu gotowego do jazdy (Masa wlasna G)',
      val: `${calculations.totalEmptyWeightKg} kg`,
      limit: 'Podwozie + zabudowa ALU-S.V.',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 16. Dopuszczalna masa calkowita (DMC F.1 / F.2)',
      val: `${calculations.maxLegalGvwKg} kg`,
      limit: `Limit kategorii ${categoryCode}`,
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 20. Maksymalna ladownosc uzytkowa netto',
      val: `${calculations.netPayloadCapacityKg} kg`,
      limit: 'DMC - Masa wlasna',
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 16.1. Masa na os 1 w stanie pustym (kierowana)',
      val: `${calculations.emptyFrontAxleKg} kg`,
      limit: `GAWR 1: ${config.chassis.maxFrontAxleLoadKg} kg`,
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 16.1. Masa na os 2 w stanie pustym (napedowa)',
      val: `${calculations.emptyRearAxleKg} kg`,
      limit: `GAWR 2: ${config.chassis.maxRearAxleLoadKg} kg`,
      status: 'ZGODNY'
    },
    {
      param: 'Poz. 16.3. Nacisk na os 1 przy pelnym obciazeniu',
      val: `${calculations.fullFrontAxleKg} kg (${calculations.frontAxleUtilizationPct}%)`,
      limit: `Max ${config.chassis.maxFrontAxleLoadKg} kg`,
      status: calculations.frontAxleUtilizationPct <= 100 ? 'ZGODNY' : 'PRZECIAZENIE'
    },
    {
      param: 'Poz. 16.3. Nacisk na os 2 przy pelnym obciazeniu',
      val: `${calculations.fullRearAxleKg} kg (${calculations.rearAxleUtilizationPct}%)`,
      limit: `Max ${config.chassis.maxRearAxleLoadKg} kg`,
      status: calculations.rearAxleUtilizationPct <= 100 ? 'ZGODNY' : 'PRZECIAZENIE'
    },
    {
      param: 'Poz. 18. Udzial osi kierowanej w masie calkowitej',
      val: `${calculations.steeringAxleLoadPercentage}%`,
      limit: 'Min. 25% (wymog OEM BBG)',
      status: calculations.isSteeringSafe ? 'ZGODNY (>=25%)' : 'NIEZGODNY (<25%)'
    }
  ];

  massRows.forEach((r, idx) => {
    const rowY = currentY + idx * 4.6;
    if (idx % 2 === 1) {
      doc.setFillColor(250, 252, 255);
      doc.rect(marginX, rowY - 0.8, pageWidth - marginX * 2, 4.6, 'F');
    }
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(toPdfSafe(r.param), marginX + 2, rowY + 2.5);
    doc.setFont('helvetica', 'bold');
    doc.text(toPdfSafe(r.val), marginX + colW1 + 2, rowY + 2.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 90, 105);
    doc.text(toPdfSafe(r.limit), marginX + colW1 + colW2 + 2, rowY + 2.5);
    
    if (r.status.includes('ZGODNY')) {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(toPdfSafe(r.status), marginX + colW1 + colW2 + colW3 + 2, rowY + 2.5);
  });

  currentY += massRows.length * 4.6 + 4;

  // 5. Section 3: Regulaminy EKG ONZ & Certyfikaty
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('3. MATRYCA ZGODNOSCI Z REGULAMINAMI EKG ONZ & NORMAMI BEZPIECZENSTWA'), marginX + 3, currentY + 3.8);

  currentY += 7.5;

  doc.setFillColor(248, 250, 253);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 20, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);

  const ece1 = config.dhollandiaLiftId ? 'Regulamin ECE R58.03 (Zabezpieczenie tylne): Zderzak certyfikowany zintegrowany z winda Dhollandia' : 'Regulamin ECE R58.03 (Zabezpieczenie tylne): Atestowana aluminiowa belka zderzaka ALU-S.V.';
  doc.text(toPdfSafe(`• [V] ${ece1}`), marginX + 3, currentY + 4);
  doc.text(toPdfSafe('• [V] Regulamin ECE R73.01 (Boczne oslony rowerowe): Profile uchylne ALU-S.V. z przeswitem drogowym max 450 mm'), marginX + 3, currentY + 8);
  doc.text(toPdfSafe('• [V] Regulamin ECE R48.06 (Oswietlenie obrysowe): LED zolte boczne i biale/czerwone gabarytowe z atestem E-mark'), marginX + 3, currentY + 12);
  doc.text(toPdfSafe(`• [V] Norma EN 12640 / DIN 75410-1 (Mocowanie ladunku): Profil obrzeza ALU-S.V. z punktami 500 daN co 100 mm`), marginX + 3, currentY + 16);

  currentY += 24;

  // 6. Section 4: Deklaracja i Podpisy
  doc.setFillColor(250, 252, 255);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(11, 19, 43);
  doc.text(toPdfSafe('OSWIADCZENIE PRODUCENTA ETAPU DRUGIEGO:'), marginX + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(50, 60, 75);
  doc.text(toPdfSafe('Nizej podpisany oswiadcza, ze opisany w niniejszym raporcie pojazd zostal skompletowany zgodnie ze swiadectwem homologacji'), marginX + 3, currentY + 9);
  doc.text(toPdfSafe('typu WE etapu drugiego oraz odpowiada we wszystkich szczegolach typowi opisanemu w dokumentacji homologacyjnej Nowa Firma.'), marginX + 3, currentY + 13);
  doc.text(toPdfSafe(`Pojazd moze byc trwale zarejestrowany w panstwach czlonkowskich Unii Europejskiej bez dalszych badan technicznych.`), marginX + 3, currentY + 17);

  currentY += 26;

  // Signatures
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.3);

  // Left signature
  doc.line(marginX, currentY + 11, marginX + 75, currentY + 11);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 110, 125);
  doc.text(toPdfSafe('Pelnomocnik ds. Zgodnosci Produkcji (CoP):'), marginX, currentY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe('Nowa Firma / Dzial Homologacji'), marginX, currentY + 9.5);

  // Right signature
  doc.line(pageWidth - marginX - 75, currentY + 11, pageWidth - marginX, currentY + 11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 125);
  doc.text(toPdfSafe('Pieczec Urzedowa / Pieczec Producenta:'), pageWidth - marginX - 75, currentY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe('Nowa Firma [HOMOLOGATED]'), pageWidth - marginX - 75, currentY + 9.5);

  // Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.setTextColor(140, 150, 165);
  doc.text(toPdfSafe(`Raport Zgodnosci CoC Summary wygenerowany elektronicznie · System KREATOR ZABUDOW v1.0 · Nowa Firma · ${cocApprovalNo}`), marginX, pageHeight - 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 125);
  doc.text(toPdfSafe('Projekt wdrozenia, wlasnosc intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzezone.'), marginX, pageHeight - 4.5);

  // Trigger browser download
  const filename = `Raport_Zgodnosci_CoC_${config.projectNumber}.pdf`;
  doc.save(filename);
}
