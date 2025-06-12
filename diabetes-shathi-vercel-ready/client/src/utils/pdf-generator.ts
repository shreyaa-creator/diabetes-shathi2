import jsPDF from "jspdf";
import "jspdf-autotable";
import type { GlucoseReading, FoodEntry, MedicineRecord } from "@shared/schema";
import { formatDate, formatTime } from "./date-utils";

interface ReportData {
  glucoseReadings: GlucoseReading[];
  foodEntries: FoodEntry[];
  medicineRecords: MedicineRecord[];
  startDate: Date;
  endDate: Date;
}

export function generatePDFReport(data: ReportData): void {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text("ডায়াবেটিস সাথী - স্বাস্থ্য রিপোর্ট", 105, 20, { align: "center" });
  
  // Date range
  doc.setFontSize(12);
  doc.text(
    `রিপোর্ট সময়কাল: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`,
    105,
    30,
    { align: "center" }
  );

  let yPosition = 50;

  // Glucose Readings Table
  if (data.glucoseReadings.length > 0) {
    doc.setFontSize(14);
    doc.text("গ্লুকোজ রিডিং", 20, yPosition);
    yPosition += 10;

    const glucoseData = data.glucoseReadings.map(reading => [
      formatDate(reading.measuredAt),
      formatTime(reading.measuredAt),
      `${reading.level} mmol/L`,
      reading.measurementType,
      reading.notes || "-"
    ]);

    (doc as any).autoTable({
      head: [["তারিখ", "সময়", "লেভেল", "ধরন", "নোট"]],
      body: glucoseData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [20, 184, 166] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Medicine Records Table
  if (data.medicineRecords.length > 0 && yPosition < 250) {
    doc.setFontSize(14);
    doc.text("ওষুধ গ্রহণের রেকর্ড", 20, yPosition);
    yPosition += 10;

    const medicineData = data.medicineRecords.map(record => [
      formatDate(record.takenAt),
      formatTime(record.takenAt),
      record.wasOnTime ? "সময়মতো" : "দেরিতে",
      record.notes || "-"
    ]);

    (doc as any).autoTable({
      head: [["তারিখ", "সময়", "স্ট্যাটাস", "নোট"]],
      body: medicineData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Food Entries Table (on new page if needed)
  if (data.foodEntries.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.text("খাবারের রেকর্ড", 20, yPosition);
    yPosition += 10;

    const foodData = data.foodEntries.map(entry => [
      formatDate(entry.consumedAt),
      entry.foodName,
      entry.portion,
      `${entry.carbohydrates}গ্রা`,
      entry.mealType
    ]);

    (doc as any).autoTable({
      head: [["তারিখ", "খাবার", "পরিমাণ", "কার্বস", "খাবারের ধরন"]],
      body: foodData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [139, 92, 246] },
    });
  }

  // Summary
  if (data.glucoseReadings.length > 0) {
    const averageGlucose = data.glucoseReadings.reduce((sum, reading) => sum + reading.level, 0) / data.glucoseReadings.length;
    
    doc.addPage();
    doc.setFontSize(16);
    doc.text("সারসংক্ষেপ", 20, 30);
    
    doc.setFontSize(12);
    doc.text(`গড় গ্লুকোজ লেভেল: ${averageGlucose.toFixed(1)} mmol/L`, 20, 50);
    doc.text(`মোট গ্লুকোজ রিডিং: ${data.glucoseReadings.length}টি`, 20, 65);
    doc.text(`মোট ওষুধ গ্রহণ: ${data.medicineRecords.length}টি`, 20, 80);
    doc.text(`মোট খাবার রেকর্ড: ${data.foodEntries.length}টি`, 20, 95);
  }

  // Save the PDF
  const fileName = `diabetes-report-${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
