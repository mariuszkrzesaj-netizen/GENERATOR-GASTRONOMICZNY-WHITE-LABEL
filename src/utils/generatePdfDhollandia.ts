import { jsPDF } from 'jspdf';
import { 
  ActiveProjectConfiguration, 
  AxleLoadCalculation 
} from '../types/itsMaster';
import { DHALLANDIA_LIFTS } from '../data/masterSpecsData';

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

export function generateAndDownloadPdfDhollandia(
  config: ActiveProjectConfiguration,
  calculations: AxleLoadCalculation,
  liftId?: string | null
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const targetLiftId = liftId || config.dhollandiaLiftId || 'dhollandia_dhlm08_750';
  const lift = DHALLANDIA_LIFTS.find(l => l.id === targetLiftId) || DHALLANDIA_LIFTS[1];

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  let currentY = 12;

  // PAGE 1: Header, Mechanical Assembly, and Electrical Specifications
  // 1. Header Banner
  doc.setFillColor(11, 19, 43); // #0B132B Navy
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 25, 'F');
  doc.setFillColor(212, 175, 55); // #D4AF37 Gold accent
  doc.rect(marginX, currentY + 24, pageWidth - marginX * 2, 1.2, 'F');

  // Title
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(toPdfSafe(`KARTA TECHNOLOGICZNA: MONTAZ I PODLACZENIE WINDY DHOLLANDIA`), marginX + 4, currentY + 6.5);

  doc.setFontSize(7.5);
  doc.setTextColor(210, 220, 240);
  doc.setFont('helvetica', 'normal');
  doc.text(toPdfSafe(`Procedura Instalacji i Schemat Elektryczny 12V DC · Specyfikacja MASTER 4 / Dhollandia Europe`), marginX + 4, currentY + 12);
  doc.text(toPdfSafe(`Model windy: ${lift.model} · Udzwig nominalny: ${lift.capacityKg} kg · Zasilanie: ${lift.powerSupply}`), marginX + 4, currentY + 16.5);
  doc.text(toPdfSafe(`Pojazd bazowy: ${config.chassis.brand} ${config.chassis.model} (DMC: ${config.chassis.gvwKg} kg) · Wytyczne BBG: ${config.chassis.bbgReferenceDoc}`), marginX + 4, currentY + 21);

  // Right Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(212, 175, 55);
  doc.text(toPdfSafe('NORMA: ECE R58.03 / UDT'), pageWidth - marginX - 4, currentY + 6.5, { align: 'right' });
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(toPdfSafe(`SOP-DHL-${config.projectNumber}`), pageWidth - marginX - 4, currentY + 12, { align: 'right' });
  doc.setTextColor(16, 185, 129);
  doc.text(toPdfSafe('STATUS: HOMOLOGOWANY'), pageWidth - marginX - 4, currentY + 16.5, { align: 'right' });
  doc.setTextColor(190, 200, 215);
  doc.text(toPdfSafe(`Data: ${new Date().toLocaleDateString('pl-PL')}`), pageWidth - marginX - 4, currentY + 21, { align: 'right' });

  currentY += 31;

  // Section 1: Parametry Podstawowe i Wymogi Bezpieczenstwa
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('1. PARAMETRY ELEKTRYCZNE I MECHANICZNE DHOLLANDIA'), marginX + 3, currentY + 3.8);

  currentY += 7.5;

  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(210, 220, 230);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 22, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 41, 59);

  doc.text(toPdfSafe(`• Napiecie instalacji: 12V DC (akumulator pojazdu min. 100 Ah)`), marginX + 3, currentY + 4.5);
  doc.text(toPdfSafe(`• Silnik agregatu: 1.2 kW / 2.0 kW (pobor pradu 120A - 190A pod pelnym obciazeniem)`), marginX + 3, currentY + 8.5);
  doc.text(toPdfSafe(`• Glowny bezpiecznik ochronny: MEGA-FUSE 150A (1.2kW) lub 200A (2.0kW) montowany max 300 mm od akumulatora`), marginX + 3, currentY + 12.5);
  doc.text(toPdfSafe(`• Przekroj kabla zasilajacego (+) i masowego (-): min. 35 mm2 (do 6m dlugosci) lub 50 mm2 (powyzej 6m)`), marginX + 3, currentY + 16.5);
  doc.text(toPdfSafe(`• Olej hydrauliczny: ISO VG 15 / ISO VG 22 niskotemperaturowy (zbiornik 3.5 litra)`), marginX + 3, currentY + 20.5);

  doc.text(toPdfSafe(`• Udzwig nominalny: ${lift.capacityKg} kg w odleglosci CoG 600 mm od krawedzi`), marginX + 105, currentY + 4.5);
  doc.text(toPdfSafe(`• Dlugosc platformy: ${lift.platformLengthMm} mm (${lift.platformMaterial})`), marginX + 105, currentY + 8.5);
  doc.text(toPdfSafe(`• Zderzak przecinajazdowy: ${lift.underrunProtection} (certyfikacja ECE R58.03)`), marginX + 105, currentY + 12.5);
  doc.text(toPdfSafe(`• Waga kompletnej windy: ${lift.weightKg} kg (dociązenie osi tylnej wg BBG)`), marginX + 105, currentY + 16.5);
  doc.text(toPdfSafe(`• Zabezpieczenie przed przeciązeniem: Fabryczny zawor upustowy 110%`), marginX + 105, currentY + 20.5);

  currentY += 26;

  // Section 2: Schemat Polaczen Elektrycznych 12V
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('2. SCHEMAT ELEKTRYCZNY I ROZPISKA WIĄZKI STEROWNICZEJ'), marginX + 3, currentY + 3.8);

  currentY += 7.5;

  // Table of Wiring / Pinout
  const colW1 = 45;
  const colW2 = 30;
  const colW3 = 50;
  const colW4 = (pageWidth - marginX * 2) - (colW1 + colW2 + colW3);

  doc.setFillColor(235, 240, 248);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(toPdfSafe('Obwod / Przewod'), marginX + 2, currentY + 3.5);
  doc.text(toPdfSafe('Kolor / Oznaczenie'), marginX + colW1 + 2, currentY + 3.5);
  doc.text(toPdfSafe('Zrodlo -> Odbiornik'), marginX + colW1 + colW2 + 2, currentY + 3.5);
  doc.text(toPdfSafe('Funkcja / Zabezpieczenie'), marginX + colW1 + colW2 + colW3 + 2, currentY + 3.5);

  currentY += 5.5;

  const wiringRows = [
    {
      circuit: 'Zasilanie glowne (+12V)',
      color: 'Czerwony 35/50 mm2',
      fromTo: 'Akumulator (+) -> Bezpiecznik -> Hebel -> Stycznik',
      func: 'Linia glowna mocy. Bezpiecznik MEGA 150A/200A.'
    },
    {
      circuit: 'Masa zasilania (-12V)',
      color: 'Czarny 35/50 mm2',
      fromTo: 'Akumulator (-) / Rama OEM -> Silnik pompy',
      func: 'Bezposrednia masa. Zakaz pobierania masy przez zawiasy!'
    },
    {
      circuit: 'Sterowanie po heblu (+12V)',
      color: 'Czerwony 1.5 mm2',
      fromTo: 'Hebel kabinowy -> Skrzynka zewnetrzna',
      func: 'Zasilanie logiki sterowania. Bezpiecznik 10A w skrzynce.'
    },
    {
      circuit: 'Podnoszenie (UP)',
      color: 'Bialy (PIN 1) 1.0 mm2',
      fromTo: 'Przelacznik UP -> Cewka stycznika silnika',
      func: 'Uruchamia silnik pompy i tloczenie oleju do silownikow.'
    },
    {
      circuit: 'Opuszczanie (DOWN)',
      color: 'Niebieski (PIN 2) 1.0 mm2',
      fromTo: 'Przelacznik DOWN -> Zawor upustowy VE1',
      func: 'Otwiera elektrozawor grawitacyjnego opuszczania.'
    },
    {
      circuit: 'Zamykanie (TILT UP)',
      color: 'Zolty (PIN 3) 1.0 mm2',
      fromTo: 'Przelacznik TILT -> Stycznik + Zawor VE2',
      func: 'Zamyka platforme do pozycji pionowej za pomoca pompy.'
    },
    {
      circuit: 'Otwieranie (TILT DOWN)',
      color: 'Zielony (PIN 4) 1.0 mm2',
      fromTo: 'Przelacznik TILT -> Zawor VE2 powrot',
      func: 'Otwiera platforme z pionu do poziomu.'
    },
    {
      circuit: 'Styk bezpieczenstwa (Deadman)',
      color: 'Brazowy (PIN 5) 1.0 mm2',
      fromTo: 'Przycisk zezwolenia (reka 2) -> Obwod ster.',
      func: 'Wymog obslugi dwurecznej EN 1756-1.'
    },
    {
      circuit: 'Sygnalizacja pozycji (Kabinowa)',
      color: 'Szary 0.75 mm2',
      fromTo: 'Czujnik krancowy platformy -> Kontrolka w kabinie',
      func: 'Ostrzega kierowce w kabinie przed odjazdem z otwarta winda.'
    },
    {
      circuit: 'Swiatla ostrzegawcze platformy',
      color: 'Pomaranczowy 1.0 mm2',
      fromTo: 'Wylacznik grawitacyjny -> Lampy blyskowe LED',
      func: 'Ostrzeganie uczestnikow ruchu po opuszczeniu platformy.'
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);

  wiringRows.forEach((r, idx) => {
    const rowY = currentY + idx * 4.6;
    if (idx % 2 === 1) {
      doc.setFillColor(250, 252, 255);
      doc.rect(marginX, rowY - 0.8, pageWidth - marginX * 2, 4.6, 'F');
    }
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(toPdfSafe(r.circuit), marginX + 2, rowY + 2.5);
    doc.setFont('helvetica', 'normal');
    doc.text(toPdfSafe(r.color), marginX + colW1 + 2, rowY + 2.5);
    doc.text(toPdfSafe(r.fromTo), marginX + colW1 + colW2 + 2, rowY + 2.5);
    doc.setTextColor(70, 80, 95);
    doc.text(toPdfSafe(r.func), marginX + colW1 + colW2 + colW3 + 2, rowY + 2.5);
  });

  currentY += wiringRows.length * 4.6 + 5;

  // Section 3: Procedura Montazu Krok po Kroku (SOP)
  doc.setFillColor(28, 37, 65);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 5.5, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(toPdfSafe('3. INSTRUKCJA MONTAZU KROK PO KROKU (SOP-DH-2026)'), marginX + 3, currentY + 3.8);

  currentY += 7.5;

  const steps = [
    {
      step: 'Krok 1: Wzmocnienie ramy i montaz wspornikow',
      desc: 'Przygotowac podluznice podwozia wg wytycznych OEM BBG. Zastosowac plyty adaptacyjne Dhollandia. Skrecic srubami klasy 10.9 M14 (moment 175 Nm). Bezwzgledny zakaz spawania bezposrednio do pasa ramy pojazdu!'
    },
    {
      step: 'Krok 2: Prowadzenie kabla zasilajacego 12V (+ i -)',
      desc: 'Zainstalowac bezpiecznik glowny MEGA-FUSE (150A/200A) w odleglosci do 300 mm od klemy plusowej akumulatora. Poprowadzic wiazke zasilajaca w peszlu samogasnacym wzdluz lewej podluznicy ramy. Mocowac opaskami co 300 mm.'
    },
    {
      step: 'Krok 3: Montaz hebla i wylacznika kabinowego',
      desc: 'Zamontowac wylacznik zasilania (hebel) w kabinie kierowcy. Podlaczyc linie kontrolki ostrzegawczej oraz brzeczyka (buzzer) na desce rozdzielczej, aktywowana przy opuszczeniu platformy.'
    },
    {
      step: 'Krok 4: Skrzynka zewnetrzna i pilot kablowy',
      desc: 'Zamocowac hermetyczna skrzynke sterownicza (IP67) po prawej stronie nadwozia (od strony chodnika). Podlaczyc wiazke 7-zylowa. Zainstalowac gniazdo wewnetrznego pilota spiralnego na scianie bocznej.'
    },
    {
      step: 'Krok 5: Napełnienie uklad hydraulicznego i odpowietrzenie',
      desc: 'Zalac zbiornik agregatu olejem hydraulicznym ISO VG 15 do poziomu MAX. Wykonac 3 pelne cykle podnoszenia i opuszczania bez obciazenia w celu samoczynnego odpowietrzenia silownikow.'
    },
    {
      step: 'Krok 6: Proby odbiorcze i rejestracja UDT',
      desc: 'Przeprowadzic probe statyczna z obciazeniem 125% udzwigu (zatrzymanie platformy na 15 min - dopuszczalne opadniecie max 15 mm). Sprawdzic dzialanie zaworu przeciazeniowego przy 110% udzwigu.'
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);

  steps.forEach((s) => {
    doc.setFillColor(250, 252, 255);
    doc.setDrawColor(210, 220, 230);
    doc.rect(marginX, currentY, pageWidth - marginX * 2, 10, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 19, 43);
    doc.text(toPdfSafe(s.step), marginX + 3, currentY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 70, 85);
    doc.text(toPdfSafe(s.desc), marginX + 3, currentY + 7.5);

    currentY += 11.5;
  });

  currentY += 3;

  // Signatures Box
  doc.setFillColor(248, 250, 253);
  doc.setDrawColor(212, 175, 55);
  doc.rect(marginX, currentY, pageWidth - marginX * 2, 16, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(11, 19, 43);
  doc.text(toPdfSafe('PROTOKOL MONTAZU ELEKTRYCZNEGO I HYDRO-MECHANICZNEGO:'), marginX + 3, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.0);
  doc.setTextColor(80, 90, 105);
  doc.text(toPdfSafe('Potwierdzam zgodnosc podlaczenia ze schematem producenta Dhollandia Europe oraz wytycznymi zabudowy pojazdu OEM BBG.'), marginX + 3, currentY + 8.5);
  doc.text(toPdfSafe('Instalacja sprawdzona pod wzgledem spadkow napiecia, momentow dokrecenia zaciskow i szczelnosci hydrauliki.'), marginX + 3, currentY + 12.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(toPdfSafe('Inzynier Elektromechanik Nowa Firma: .......................................'), marginX + 110, currentY + 8.5);
  doc.text(toPdfSafe('Pieczec Serwisu / Certyfikacja UDT: .......................................'), marginX + 110, currentY + 12.5);

  // Footer Note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.4);
  doc.setTextColor(140, 150, 165);
  doc.text(toPdfSafe(`Karta Montazowa Dhollandia SOP-DH-2026 · Nowa Firma · Homologacja e20*2018/858 · Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`), marginX, pageHeight - 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 110, 125);
  doc.text(toPdfSafe('Projekt wdrozenia, wlasnosc intelektualna, Mariusz Krzesaj, wszelkie prawa zastrzezone.'), marginX, pageHeight - 4.5);

  // Save to browser download
  const filename = `Instrukcja_Montazu_Windy_Dhollandia_${lift.capacityKg}kg_${config.projectNumber}.pdf`;
  doc.save(filename);
}
