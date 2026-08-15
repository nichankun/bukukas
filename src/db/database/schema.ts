// src/db/database/schema.ts
import { pgTable, serial, varchar, integer, numeric, timestamp, text, pgEnum } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", ["debet", "kredit"]);

// Pengaturan global seperti Saldo Awal Pertama
export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Daftar periode bulan (misal: "2026-01", "2026-02")
export const periodsTable = pgTable("periods", {
  id: serial("id").primaryKey(),
  periodKey: varchar("period_key", { length: 7 }).notNull().unique(), // Format: YYYY-MM
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

export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
export type Period = typeof periodsTable.$inferSelect;