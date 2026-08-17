// src/app/actions/kas.ts
"use server";

import { db } from "@/db";
import { periodsTable, transactionsTable } from "@/db/database/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/require-session";
import { getDaysInMonth } from "@/lib/kas-utils";

// Angka desimal, disimpan sebagai string oleh Drizzle (kolom numeric).
const amountSchema = z
  .number()
  .finite()
  .positive("Nominal harus lebih besar dari 0")
  .max(999_999_999_999, "Nominal terlalu besar");

const periodKeySchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format periode harus YYYY-MM");

const transactionInputSchema = z.object({
  day: z.number().int().min(1).max(31),
  description: z.string().trim().min(1, "Keterangan wajib diisi").max(500),
  type: z.enum(["debet", "kredit"]),
  amount: amountSchema,
});

// Validasi tambahan: `day` (1-31) harus benar-benar ada di bulan/tahun
// periode tersebut. Contoh yang harus ditolak: 31 Februari, 31 April,
// 30 Februari, dst. Dipanggil setelah transactionInputSchema.parse().
function assertValidDayForPeriod(periodKey: string, day: number) {
  const maxDay = getDaysInMonth(periodKey);
  if (day > maxDay) {
    throw new Error(
      `Tanggal ${day} tidak valid untuk periode ${periodKey} (bulan ini hanya punya ${maxDay} hari).`
    );
  }
}

// Ambil transaksi milik SATU periode saja, terurut per tanggal.
// Dipisah jadi helper karena dipakai baik dari getKasAppState() (initial
// load) maupun bisa dipanggil ulang kalau nanti dibutuhkan revalidasi
// per-periode.
async function fetchTransactionsForPeriod(periodKey: string) {
  const rows = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.periodKey, periodKey))
    .orderBy(asc(transactionsTable.day));

  return rows.map((t) => ({
    ...t,
    amount: parseFloat(t.amount) || 0,
  }));
}

export async function getKasAppState(periodKey?: string) {
  await requireSession();

  // 1. Ambil daftar periode. Ini tetap diambil semua sekaligus — tabel
  //    ini hanya berisi satu baris per bulan pembukuan, jadi ukurannya
  //    kecil dan wajar untuk mengisi dropdown filter periode.
  const periodsData = await db
    .select()
    .from(periodsTable)
    .orderBy(asc(periodsTable.periodKey));

  const periods = periodsData.map((p) => ({
    periodKey: p.periodKey,
    initialBalance: parseFloat(p.initialBalance) || 0,
  }));

  // 2. Transaksi TIDAK diambil untuk semua periode sekaligus — tabel ini
  //    yang berpotensi membengkak tanpa batas seiring waktu. Hanya
  //    transaksi milik SATU periode aktif yang diambil (lihat page.tsx:
  //    periode aktif ditentukan lewat query param `?period=`, dikirim
  //    lagi ke sini, bukan di-filter dari dataset penuh di client).
  //
  //    Ini aman: tiap periode independen secara finansial (initialBalance
  //    tersimpan per periode, saldo akhir dihitung hanya dari transaksi
  //    periode itu sendiri — lihat index.tsx), jadi tidak ada akumulasi
  //    lintas periode yang bisa jadi salah kalau periode lain tidak ikut
  //    dimuat.
  const parsedPeriodKey = periodKey ? periodKeySchema.safeParse(periodKey).data : undefined;
  const activePeriodKey =
    (parsedPeriodKey && periods.some((p) => p.periodKey === parsedPeriodKey)
      ? parsedPeriodKey
      : periods[0]?.periodKey) ?? null;

  const transactions = activePeriodKey
    ? await fetchTransactionsForPeriod(activePeriodKey)
    : [];

  return { periods, transactions, selectedPeriod: activePeriodKey };
}

// Tambah Periode Baru
export async function createPeriod(periodKey: string, initialBalance: number = 0) {
  await requireSession();

  const parsedKey = periodKeySchema.parse(periodKey);
  const parsedBalance = z.number().finite().min(0).parse(initialBalance);

  await db
    .insert(periodsTable)
    .values({
      periodKey: parsedKey,
      initialBalance: parsedBalance.toString(),
    })
    .onConflictDoNothing();

  revalidatePath("/");
}

// Hapus Periode beserta seluruh transaksi di dalamnya.
// FK `transactions.period_key` sudah ON DELETE CASCADE, jadi cukup
// hapus periodnya saja — transaksi ikut terhapus otomatis di DB.
export async function deletePeriodAction(periodKey: string) {
  await requireSession();

  const parsedKey = periodKeySchema.parse(periodKey);

  await db.delete(periodsTable).where(eq(periodsTable.periodKey, parsedKey));

  revalidatePath("/");
}

// Update Saldo Awal per Periode
export async function updatePeriodInitialBalance(periodKey: string, amount: number) {
  await requireSession();

  const parsedKey = periodKeySchema.parse(periodKey);
  const parsedAmount = z.number().finite().min(0).parse(amount);

  await db
    .update(periodsTable)
    .set({ initialBalance: parsedAmount.toString() })
    .where(eq(periodsTable.periodKey, parsedKey));

  revalidatePath("/");
}

// Tambah Transaksi
export async function addTransactionAction(data: {
  periodKey: string;
  day: number;
  description: string;
  type: "debet" | "kredit";
  amount: number;
}) {
  await requireSession();

  const parsedKey = periodKeySchema.parse(data.periodKey);
  const parsed = transactionInputSchema.parse(data);
  assertValidDayForPeriod(parsedKey, parsed.day);

  await db.insert(transactionsTable).values({
    periodKey: parsedKey,
    day: parsed.day,
    description: parsed.description,
    type: parsed.type,
    amount: parsed.amount.toString(),
  });

  revalidatePath("/");
}

// Update Transaksi
export async function updateTransactionAction(
  id: number,
  data: {
    day: number;
    description: string;
    type: "debet" | "kredit";
    amount: number;
  }
) {
  await requireSession();

  const parsedId = z.number().int().positive().parse(id);
  const parsed = transactionInputSchema.parse(data);

  // periodKey tidak dikirim dari client saat edit (transaksi tidak pindah
  // periode), jadi ambil dulu dari DB untuk memvalidasi `day` terhadap
  // bulan aslinya.
  const existing = await db
    .select({ periodKey: transactionsTable.periodKey })
    .from(transactionsTable)
    .where(eq(transactionsTable.id, parsedId))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("Transaksi tidak ditemukan.");
  }

  assertValidDayForPeriod(existing[0].periodKey, parsed.day);

  await db
    .update(transactionsTable)
    .set({
      day: parsed.day,
      description: parsed.description,
      type: parsed.type,
      amount: parsed.amount.toString(),
      updatedAt: new Date(),
    })
    .where(eq(transactionsTable.id, parsedId));

  revalidatePath("/");
}

// Hapus Transaksi
export async function deleteTransactionAction(id: number) {
  await requireSession();

  const parsedId = z.number().int().positive().parse(id);

  await db.delete(transactionsTable).where(eq(transactionsTable.id, parsedId));

  revalidatePath("/");
}