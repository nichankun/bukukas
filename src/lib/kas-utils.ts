// src/lib/kas-utils.ts
const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function formatMonthName(periodKey: string): string {
  if (!periodKey || !periodKey.includes("-")) return periodKey;
  const [year, month] = periodKey.split("-");
  const monthIdx = parseInt(month, 10) - 1;
  return `${NAMA_BULAN[monthIdx] || month} ${year}`;
}

// Jumlah hari valid untuk periode "YYYY-MM" tertentu (memperhitungkan
// tahun kabisat untuk Februari). Dipakai untuk memvalidasi `day` transaksi
// supaya tanggal seperti 31 Februari atau 31 April tidak bisa tersimpan.
export function getDaysInMonth(periodKey: string): number {
  const [yearStr, monthStr] = periodKey.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  // Tanggal ke-0 dari bulan berikutnya = tanggal terakhir bulan ini.
  return new Date(year, month, 0).getDate();
}

export function formatRupiah(number: number): string {
  if (number === 0 || isNaN(number)) return "Rp0";
  const isNegative = number < 0;
  const absVal = Math.abs(number);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absVal);
  return isNegative ? `-${formatted}` : formatted;
}

export function parseFormattedNumber(str: string): number {
  if (!str) return 0;
  const clean = str.toString().replace(/\D/g, "");
  return parseFloat(clean) || 0;
}

export function formatNumberInput(value: string | number): string {
  const clean = value.toString().replace(/\D/g, "");
  if (!clean) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(clean, 10));
}