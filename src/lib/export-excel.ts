// src/lib/export-excel.ts
import ExcelJS from "exceljs";
import { formatMonthName } from "./kas-utils";

interface TransactionRow {
  day: number;
  description: string;
  type: "debet" | "kredit";
  amount: number;
}

export async function exportKasToExcel({
  periodKey,
  initialBalance,
  transactions,
}: {
  periodKey: string;
  initialBalance: number;
  transactions: TransactionRow[];
}) {
  const monthName = formatMonthName(periodKey);
  const sortedTx = [...transactions].sort((a, b) => a.day - b.day);

  // 1. Buat Workbook & Worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Buku Kas App";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Buku Kas", {
    views: [{ showGridLines: true }],
  });

  // 2. Atur Lebar Kolom
  worksheet.columns = [
    { key: "day", width: 12 },          // Kolom A: Tanggal
    { key: "description", width: 36 },  // Kolom B: Keterangan
    { key: "debet", width: 20 },        // Kolom C: Debet
    { key: "kredit", width: 20 },       // Kolom D: Kredit
    { key: "saldo", width: 22 },        // Kolom E: Saldo
  ];

  // 3. Header Judul Laporan (Row 1)
  worksheet.mergeCells("A1:E1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "BUKU KAS DEBET / KREDIT";
  titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FF0F172A" } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  worksheet.getRow(1).height = 28;

  // 4. Informasi Periode & Saldo Awal (Row 2)
  worksheet.getCell("A2").value = "Periode:";
  worksheet.getCell("A2").font = { bold: true };
  worksheet.getCell("B2").value = monthName;
  worksheet.getCell("B2").font = { bold: true, color: { argb: "FF0284C7" } };

  worksheet.getCell("D2").value = "Saldo Awal:";
  worksheet.getCell("D2").font = { bold: true };
  worksheet.getCell("D2").alignment = { horizontal: "right" };

  const saldoAwalCell = worksheet.getCell("E2");
  saldoAwalCell.value = initialBalance;
  saldoAwalCell.numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0;"Rp" 0';
  saldoAwalCell.font = { bold: true, color: { argb: "FF0284C7" } };
  saldoAwalCell.alignment = { horizontal: "right" };
  worksheet.getRow(2).height = 20;

  // 5. Header Tabel Transaksi (Row 4)
  const headerRowIdx = 4;
  const headerRow = worksheet.getRow(headerRowIdx);
  headerRow.values = ["Tanggal", "Keterangan", "Debet (Pemasukan)", "Kredit (Pengeluaran)", "Saldo"];
  headerRow.height = 26;

  const headerFills: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E293B" }, // Warna Navy Elegan
  };

  const headerBorder: Partial<ExcelJS.Borders> = {
    top: { style: "medium", color: { argb: "FF0F172A" } },
    bottom: { style: "medium", color: { argb: "FF0F172A" } },
    left: { style: "thin", color: { argb: "FF334155" } },
    right: { style: "thin", color: { argb: "FF334155" } },
  };

  for (let col = 1; col <= 5; col++) {
    const cell = headerRow.getCell(col);
    cell.fill = headerFills;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = {
      vertical: "middle",
      horizontal: col === 1 ? "center" : col === 2 ? "left" : "right",
    };
    cell.border = headerBorder;
  }

  // Border tipis untuk isi data
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } },
  };

  // 6. Mengisi Data Baris Transaksi
  const startRow = 5;
  sortedTx.forEach((item, idx) => {
    const r = startRow + idx;
    const row = worksheet.getRow(r);
    row.height = 22;

    const prevSaldoCell = idx === 0 ? "E2" : `E${r - 1}`;
    const debetVal = item.type === "debet" ? item.amount : 0;
    const kreditVal = item.type === "kredit" ? item.amount : 0;

    row.getCell(1).value = item.day || "";
    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

    row.getCell(2).value = item.description || "";
    row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };

    row.getCell(3).value = debetVal;
    row.getCell(3).numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0;"-"';
    row.getCell(3).alignment = { vertical: "middle", horizontal: "right" };
    if (debetVal > 0) {
      row.getCell(3).font = { color: { argb: "FF16A34A" }, bold: true }; // Hijau
    }

    row.getCell(4).value = kreditVal;
    row.getCell(4).numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0;"-"';
    row.getCell(4).alignment = { vertical: "middle", horizontal: "right" };
    if (kreditVal > 0) {
      row.getCell(4).font = { color: { argb: "FFDC2626" }, bold: true }; // Merah
    }

    // Rumus Dinamis Saldo Excel: =PrevSaldo + Debet - Kredit
    row.getCell(5).value = { formula: `${prevSaldoCell}+C${r}-D${r}` };
    row.getCell(5).numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0;"Rp" 0';
    row.getCell(5).alignment = { vertical: "middle", horizontal: "right" };
    row.getCell(5).font = { bold: true };

    // Zebra striping untuk baris genap
    const isEven = idx % 2 === 1;
    for (let c = 1; c <= 5; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }
    }
  });

  // 7. Baris Total Bulan Ini (Footer)
  const lastTxRow = sortedTx.length > 0 ? startRow + sortedTx.length - 1 : 4;
  const totalRowIdx = lastTxRow + 1;
  const totalRow = worksheet.getRow(totalRowIdx);
  totalRow.height = 24;

  worksheet.mergeCells(`A${totalRowIdx}:B${totalRowIdx}`);
  const totalLabelCell = totalRow.getCell(1);
  totalLabelCell.value = "Total Bulan Ini";
  totalLabelCell.font = { bold: true, size: 11 };
  totalLabelCell.alignment = { vertical: "middle", horizontal: "center" };

  // Rumus SUM Debet
  const totalDebetCell = totalRow.getCell(3);
  totalDebetCell.value = { formula: `SUM(C${startRow}:C${lastTxRow})` };
  totalDebetCell.numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0;"Rp" 0';
  totalDebetCell.font = { bold: true, color: { argb: "FF16A34A" } };
  totalDebetCell.alignment = { vertical: "middle", horizontal: "right" };

  // Rumus SUM Kredit
  const totalKreditCell = totalRow.getCell(4);
  totalKreditCell.value = { formula: `SUM(D${startRow}:D${lastTxRow})` };
  totalKreditCell.numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0;"Rp" 0';
  totalKreditCell.font = { bold: true, color: { argb: "FFDC2626" } };
  totalKreditCell.alignment = { vertical: "middle", horizontal: "right" };

  // Rumus Net Debet - Kredit
  const netCell = totalRow.getCell(5);
  netCell.value = { formula: `C${totalRowIdx}-D${totalRowIdx}` };
  netCell.numFmt = '"Rp" #,##0;[Red]-"Rp" #,##0;"Rp" 0';
  netCell.font = { bold: true };
  netCell.alignment = { vertical: "middle", horizontal: "right" };

  const footerBorder: Partial<ExcelJS.Borders> = {
    top: { style: "medium", color: { argb: "FF0F172A" } },
    bottom: { style: "double", color: { argb: "FF0F172A" } }, // Garis ganda khas laporan akuntansi
    left: { style: "thin", color: { argb: "FFE2E8F0" } },
    right: { style: "thin", color: { argb: "FFE2E8F0" } },
  };

  for (let c = 1; c <= 5; c++) {
    const cell = totalRow.getCell(c);
    cell.border = footerBorder;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF1F5F9" },
    };
  }

  // 8. Download File Excel ke Browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Buku_Kas_${periodKey}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}