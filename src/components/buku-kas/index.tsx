// src/components/buku-kas/index.tsx
"use client";

import React, { useState, useTransition } from "react";
import { formatNumberInput, parseFormattedNumber } from "@/lib/kas-utils";
import { exportKasToExcel } from "@/lib/export-excel";
import {
  addTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  createPeriod,
  updateInitialMasterBalance,
} from "@/app/actions/kas";

import { KasHeader } from "./kas-header";
import { KasPeriodFilter } from "./kas-period-filter";
import { KasSummaryCards } from "./kas-summary-cards";
import { KasTransactionForm } from "./kas-transaction-form";
import { KasDataTable, TransactionRow } from "./kas-data-table";
import { DialogAddPeriod } from "./dialog-add-period";
import { DialogEditTransaction, EditItemState } from "./dialog-edit-transaction";

interface TransactionItem {
  id: number;
  periodKey: string;
  day: number;
  description: string;
  type: "debet" | "kredit";
  amount: number;
}

interface BukuKasProps {
  initialMasterBalance: number;
  initialPeriods: string[];
  initialTransactions: TransactionItem[];
}

export function BukuKas({
  initialMasterBalance,
  initialPeriods,
  initialTransactions,
}: BukuKasProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    initialPeriods[0] || "2026-01"
  );
  const [masterBalanceStr, setMasterBalanceStr] = useState<string>(
    formatNumberInput(initialMasterBalance)
  );

  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<EditItemState | null>(null);

  // Perhitungan Saldo Berantai
  const sortedPeriods = [...initialPeriods].sort();
  const masterBalVal = parseFormattedNumber(masterBalanceStr);

  let runningBalance = masterBalVal;
  const monthBalances: Record<
    string,
    { saldoAwal: number; totalDebet: number; totalKredit: number; saldoAkhir: number }
  > = {};

  sortedPeriods.forEach((m) => {
    const startBal = runningBalance;
    const mTx = initialTransactions.filter((t) => t.periodKey === m);
    const mDebet = mTx
      .filter((t) => t.type === "debet")
      .reduce((sum, t) => sum + t.amount, 0);
    const mKredit = mTx
      .filter((t) => t.type === "kredit")
      .reduce((sum, t) => sum + t.amount, 0);
    runningBalance = startBal + mDebet - mKredit;

    monthBalances[m] = {
      saldoAwal: startBal,
      totalDebet: mDebet,
      totalKredit: mKredit,
      saldoAkhir: runningBalance,
    };
  });

  const currentSummary = monthBalances[selectedPeriod] || {
    saldoAwal: runningBalance,
    totalDebet: 0,
    totalKredit: 0,
    saldoAkhir: runningBalance,
  };

  // Data Tabel & Running Saldo Baris
  let currentRunning = currentSummary.saldoAwal;
  const tableData: TransactionRow[] = initialTransactions
    .filter((t) => t.periodKey === selectedPeriod)
    .sort((a, b) => a.day - b.day)
    .map((tx) => {
      currentRunning += tx.type === "debet" ? tx.amount : -tx.amount;
      return {
        id: tx.id,
        day: tx.day,
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        runningSaldo: currentRunning,
      };
    });

  // Handlers CRUD
  const handleAddTransaction = (data: {
    day: number;
    description: string;
    type: "debet" | "kredit";
    amount: number;
  }) => {
    startTransition(async () => {
      await addTransactionAction({ ...data, periodKey: selectedPeriod });
    });
  };

  const handleSaveEdit = (
    id: number,
    data: { day: number; description: string; type: "debet" | "kredit"; amount: number }
  ) => {
    startTransition(async () => {
      await updateTransactionAction(id, data);
      setIsEditOpen(false);
      setEditItem(null);
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      startTransition(async () => {
        await deleteTransactionAction(id);
      });
    }
  };

  const handleAddPeriod = (newPeriod: string) => {
    startTransition(async () => {
      await createPeriod(newPeriod);
      setSelectedPeriod(newPeriod);
      setIsPeriodOpen(false);
    });
  };

  const handleMasterBalanceBlur = () => {
    const val = parseFormattedNumber(masterBalanceStr);
    startTransition(async () => {
      await updateInitialMasterBalance(val);
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-card text-card-foreground rounded-xl shadow-sm border">
      {/* 1. Header */}
      <KasHeader
        onExportExcel={() =>
          exportKasToExcel({
            periodKey: selectedPeriod,
            initialBalance: currentSummary.saldoAwal,
            transactions: tableData,
          })
        }
        onPrint={() => window.print()}
      />

      {/* 2. Filter Periode & Saldo Awal */}
      <KasPeriodFilter
        periods={sortedPeriods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onOpenAddPeriod={() => setIsPeriodOpen(true)}
        masterBalanceStr={masterBalanceStr}
        onMasterBalanceChange={(val) => setMasterBalanceStr(formatNumberInput(val))}
        onMasterBalanceBlur={handleMasterBalanceBlur}
      />

      {/* 3. Kartu Ringkasan */}
      <KasSummaryCards summary={currentSummary} />

      {/* 4. Form Tambah Transaksi */}
      <KasTransactionForm
        isPending={isPending}
        onSubmit={handleAddTransaction}
      />

      {/* 5. Data Table Transaksi */}
      <KasDataTable
        data={tableData}
        totalDebet={currentSummary.totalDebet}
        totalKredit={currentSummary.totalKredit}
        onEdit={(row) => {
          setEditItem({
            id: row.id,
            day: row.day.toString(),
            description: row.description,
            type: row.type,
            amount: formatNumberInput(row.amount),
          });
          setIsEditOpen(true);
        }}
        onDelete={handleDelete}
      />

      {/* 6. Dialog Tambah Periode */}
      <DialogAddPeriod
        open={isPeriodOpen}
        onOpenChange={setIsPeriodOpen}
        onAddPeriod={handleAddPeriod}
        isPending={isPending}
      />

      {/* 7. Dialog Edit Transaksi */}
      <DialogEditTransaction
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        item={editItem}
        setItem={setEditItem}
        onSave={handleSaveEdit}
        isPending={isPending}
      />
    </div>
  );
}