// src/app/actions/kas.ts
"use server";

import { db } from "@/db";
import { periodsTable, transactionsTable } from "@/db/database/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/require-session";

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

export async function getKasAppState() {
  await requireSession();

  // 1. Ambil semua periode (Murni dari database tanpa auto-seed)
  const periodsData = await db
    .select()
    .from(periodsTable)
    .orderBy(asc(periodsTable.periodKey));

  // 2. Ambil seluruh transaksi
  const allTransactions = await db
    .select()
    .from(transactionsTable)
    .orderBy(asc(transactionsTable.day));

  return {
    periods: periodsData.map((p) => ({
      periodKey: p.periodKey,
      initialBalance: parseFloat(p.initialBalance) || 0,
    })),
    transactions: allTransactions.map((t) => ({
      ...t,
      amount: parseFloat(t.amount) || 0,
    })),
  };
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
