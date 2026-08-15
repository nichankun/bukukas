// src/app/actions/kas.ts
"use server";

import { db } from "@/db";
import { periodsTable, transactionsTable, settingsTable } from "@/db/database/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getKasAppState() {
  // 1. Ambil saldo awal master menggunakan select standar
  const [setting] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "initial_master_balance"))
    .limit(1);

  const initialMasterBalance = setting ? parseFloat(setting.value) : 94913750;

  // 2. Ambil semua periode
  let periods = await db
    .select()
    .from(periodsTable)
    .orderBy(asc(periodsTable.periodKey));

  // Seed default periode jika database masih kosong
  if (periods.length === 0) {
    await db.insert(periodsTable).values([
      { periodKey: "2026-01" },
      { periodKey: "2026-02" },
    ]);

    periods = await db
      .select()
      .from(periodsTable)
      .orderBy(asc(periodsTable.periodKey));
  }

  // 3. Ambil seluruh transaksi
  const allTransactions = await db
    .select()
    .from(transactionsTable)
    .orderBy(asc(transactionsTable.day));

  return {
    initialMasterBalance,
    periods: periods.map((p) => p.periodKey),
    transactions: allTransactions.map((t) => ({
      ...t,
      amount: parseFloat(t.amount) || 0,
    })),
  };
}

export async function updateInitialMasterBalance(amount: number) {
  await db
    .insert(settingsTable)
    .values({
      key: "initial_master_balance",
      value: amount.toString(),
    })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: {
        value: amount.toString(),
        updatedAt: new Date(),
      },
    });

  revalidatePath("/");
}

export async function createPeriod(periodKey: string) {
  await db
    .insert(periodsTable)
    .values({ periodKey })
    .onConflictDoNothing();

  revalidatePath("/");
}

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

export async function deleteTransactionAction(id: number) {
  await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, id));

  revalidatePath("/");
}