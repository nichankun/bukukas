// src/db/database/schema.ts
import { pgTable, serial, varchar, integer, numeric, timestamp, text, pgEnum } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", ["debet", "kredit"]);

// Daftar periode bulan dengan saldo awal mandiri per periode
export const periodsTable = pgTable("periods", {
  id: serial("id").primaryKey(),
  periodKey: varchar("period_key", { length: 7 }).notNull().unique(), // Format: YYYY-MM
  initialBalance: numeric("initial_balance", { precision: 15, scale: 2 }).default("0").notNull(), // Saldo awal khusus periode ini
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daftar transaksi kas
export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  periodKey: varchar("period_key", { length: 7 }).notNull(),
  day: integer("day").notNull(), // Hari 1-31
  description: text("description").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(), // Nominal uang
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Period = typeof periodsTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;