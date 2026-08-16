// src/app/actions/kas.ts
"use server";

import { db } from "@/db";
import { periodsTable, transactionsTable } from "@/db/database/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getKasAppState() {
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
  await db
    .insert(periodsTable)
    .values({
      periodKey,
      initialBalance: initialBalance.toString(),
    })
    .onConflictDoNothing();

  revalidatePath("/");
}

// Hapus Periode beserta seluruh transaksi di dalamnya
export async function deletePeriodAction(periodKey: string) {
  // 1. Hapus transaksi yang berada di periode tersebut
  await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.periodKey, periodKey));

  // 2. Hapus periode dari database
  await db
    .delete(periodsTable)
    .where(eq(periodsTable.periodKey, periodKey));

  revalidatePath("/");
}

// Update Saldo Awal per Periode
export async function updatePeriodInitialBalance(periodKey: string, amount: number) {
  await db
    .update(periodsTable)
    .set({ initialBalance: amount.toString() })
    .where(eq(periodsTable.periodKey, periodKey));

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
  await db.insert(transactionsTable).values({
    periodKey: data.periodKey,
    day: data.day,
    description: data.description,
    type: data.type,
    amount: data.amount.toString(),
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
  await db
    .update(transactionsTable)
    .set({
      day: data.day,
      description: data.description,
      type: data.type,
      amount: data.amount.toString(),
      updatedAt: new Date(),
    })
    .where(eq(transactionsTable.id, id));

  revalidatePath("/");
}

// Hapus Transaksi
export async function deleteTransactionAction(id: number) {
  await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, id));

  revalidatePath("/");
}