// src/components/buku-kas/index.tsx
"use client";

import React, { useState, useTransition } from "react";
import { formatNumberInput, parseFormattedNumber, formatMonthName } from "@/lib/kas-utils";
import { exportKasToExcel } from "@/lib/export-excel";
import {
  addTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  createPeriod,
  deletePeriodAction,
  updatePeriodInitialBalance,
} from "@/app/actions/kas";

import { KasHeader } from "./kas-header";
import { KasPeriodFilter } from "./kas-period-filter";
import { KasSummaryCards } from "./kas-summary-cards";
import { KasTransactionForm } from "./kas-transaction-form";
import { KasDataTable, TransactionRow } from "./kas-data-table";
import { DialogAddPeriod } from "./dialog-add-period";
import { DialogEditTransaction, EditItemState } from "./dialog-edit-transaction";
import { DialogConfirmDelete } from "./dialog-confirm-delete";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

export interface PeriodItem {
  periodKey: string;
  initialBalance: number;
}

export interface TransactionItem {
  id: number;
  periodKey: string;
  day: number;
  description: string;
  type: "debet" | "kredit";
  amount: number;
}

interface BukuKasProps {
  initialPeriods: PeriodItem[];
  initialTransactions: TransactionItem[];
}

export function BukuKas({
  initialPeriods,
  initialTransactions,
}: BukuKasProps) {
  const [isPending, startTransition] = useTransition();

  // State Periode Terpilih (override manual oleh user via dropdown)
  const [selectedPeriodOverride, setSelectedPeriodOverride] = useState<string | null>(null);

  // Periode aktif = override user, jika masih ada di daftar; jika tidak
  // (mis. baru dihapus), otomatis jatuh ke periode pertama yang tersedia.
  // Dihitung langsung saat render — tidak perlu effect untuk "reset".
  const selectedPeriod =
    selectedPeriodOverride && initialPeriods.some((p) => p.periodKey === selectedPeriodOverride)
      ? selectedPeriodOverride
      : initialPeriods[0]?.periodKey || "";

  const setSelectedPeriod = (period: string) => setSelectedPeriodOverride(period);

  // Ambil saldo awal periode aktif
  const activePeriodObj = initialPeriods.find((p) => p.periodKey === selectedPeriod);
  const currentInitialBal = activePeriodObj ? activePeriodObj.initialBalance : 0;

  // Input saldo awal: state lokal (supaya bisa diketik bebas sebelum blur),
  // di-reset otomatis saat periode aktif berganti. Menggunakan pola resmi
  // React "Adjusting state when a prop changes" — setState kondisional saat
  // render, BUKAN di dalam useEffect — supaya tidak memicu render tambahan.
  const [prevSelectedPeriod, setPrevSelectedPeriod] = useState(selectedPeriod);
  const [periodBalanceStr, setPeriodBalanceStr] = useState<string>(
    formatNumberInput(currentInitialBal)
  );
  if (selectedPeriod !== prevSelectedPeriod) {
    setPrevSelectedPeriod(selectedPeriod);
    setPeriodBalanceStr(formatNumberInput(currentInitialBal));
  }

  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<EditItemState | null>(null);

  // State Modal Konfirmasi Hapus (shadcn/ui Alert Dialog)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "period" | "transaction";
    id?: number;
    periodKey?: string;
    title: string;
    description: string;
  }>({
    open: false,
    type: "period",
    title: "",
    description: "",
  });

  // Transaksi di periode terpilih
  const currentTransactions = initialTransactions
    .filter((t) => t.periodKey === selectedPeriod)
    .sort((a, b) => a.day - b.day);

  // Perhitungan Ringkasan Kas
  const totalDebet = currentTransactions
    .filter((t) => t.type === "debet")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalKredit = currentTransactions
    .filter((t) => t.type === "kredit")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoAwalBulan = parseFormattedNumber(periodBalanceStr);
  const saldoAkhirBulan = saldoAwalBulan + totalDebet - totalKredit;

  const currentSummary = {
    saldoAwal: saldoAwalBulan,
    totalDebet,
    totalKredit,
    saldoAkhir: saldoAkhirBulan,
  };

  // Hitung running saldo baris transaksi. Menggunakan reduce dengan
  // accumulator baru (bukan reassignment variabel dari outer scope)
  // supaya kompatibel dengan React Compiler.
  const tableData: TransactionRow[] = currentTransactions.reduce<TransactionRow[]>(
    (rows, tx) => {
      const prevSaldo = rows.length > 0 ? rows[rows.length - 1].runningSaldo : saldoAwalBulan;
      const runningSaldo = tx.type === "debet" ? prevSaldo + tx.amount : prevSaldo - tx.amount;
      rows.push({
        id: tx.id,
        day: tx.day,
        description: tx.description,
        type: tx.type,
        amount: tx.amount,
        runningSaldo,
      });
      return rows;
    },
    []
  );

  // Handlers CRUD
  const handleAddTransaction = (data: {
    day: number;
    description: string;
    type: "debet" | "kredit";
    amount: number;
  }) => {
    if (!selectedPeriod) {
      alert("Silakan buat periode terlebih dahulu!");
      return;
    }
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

  // Trigger Modal Hapus Transaksi (shadcn)
  const promptDeleteTransaction = (id: number) => {
    setDeleteDialog({
      open: true,
      type: "transaction",
      id,
      title: "Hapus Transaksi?",
      description: "Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.",
    });
  };

  // Trigger Modal Hapus Periode (shadcn)
  const promptDeletePeriod = (periodKeyToDelete: string) => {
    setDeleteDialog({
      open: true,
      type: "period",
      periodKey: periodKeyToDelete,
      title: "Hapus Periode Pembukuan?",
      description: `PERINGATAN: Menghapus periode "${formatMonthName(periodKeyToDelete)}" akan menghapus seluruh data transaksi di bulan tersebut. Lanjutkan?`,
    });
  };

  // Eksekusi Hapus setelah konfirmasi di modal
  const handleConfirmDelete = () => {
    if (deleteDialog.type === "period" && deleteDialog.periodKey) {
      startTransition(async () => {
        await deletePeriodAction(deleteDialog.periodKey!);
      });
    } else if (deleteDialog.type === "transaction" && deleteDialog.id) {
      startTransition(async () => {
        await deleteTransactionAction(deleteDialog.id!);
      });
    }
  };

  const handleAddPeriod = (newPeriod: string) => {
    startTransition(async () => {
      await createPeriod(newPeriod, 0);
      setSelectedPeriod(newPeriod);
      setIsPeriodOpen(false);
    });
  };

  const handlePeriodBalanceBlur = () => {
    if (!selectedPeriod) return;
    const val = parseFormattedNumber(periodBalanceStr);
    startTransition(async () => {
      await updatePeriodInitialBalance(selectedPeriod, val);
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 bg-card text-card-foreground rounded-xl sm:rounded-2xl shadow-sm border">
      {/* 1. Header & Tombol Export/Cetak */}
      <KasHeader
        onExportExcel={() => {
          if (!selectedPeriod) {
            alert("Belum ada periode yang dipilih!");
            return;
          }
          exportKasToExcel({
            periodKey: selectedPeriod,
            initialBalance: currentSummary.saldoAwal,
            transactions: tableData,
          });
        }}
        onPrint={() => window.print()}
      />

      {/* 2. Filter Periode Terkelompok & Saldo Awal Mandiri */}
      <KasPeriodFilter
        periods={initialPeriods.map((p) => p.periodKey)}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onOpenAddPeriod={() => setIsPeriodOpen(true)}
        onDeletePeriod={promptDeletePeriod}
        periodBalanceStr={periodBalanceStr}
        onPeriodBalanceChange={(val) => setPeriodBalanceStr(formatNumberInput(val))}
        onPeriodBalanceBlur={handlePeriodBalanceBlur}
      />

      {/* 3. Empty State jika belum ada periode */}
      {initialPeriods.length === 0 ? (
        <div className="text-center py-10 sm:py-16 px-4 border rounded-xl bg-muted/20 my-4 sm:my-6">
          <CalendarPlus className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">
            Belum Ada Periode Pembukuan
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-4">
            Buku kas Anda saat ini masih kosong. Silakan buat periode bulan pertama untuk mulai mencatat transaksi.
          </p>
          <Button onClick={() => setIsPeriodOpen(true)} size="sm">
            <CalendarPlus className="w-4 h-4 mr-2" /> Buat Periode Pertama
          </Button>
        </div>
      ) : (
        <>
          {/* 4. Kartu Ringkasan Keuangan (Grid 2x2 di Mobile) */}
          <KasSummaryCards summary={currentSummary} />

          {/* 5. Form Tambah Transaksi */}
          <KasTransactionForm
            periodKey={selectedPeriod}
            isPending={isPending}
            onSubmit={handleAddTransaction}
          />

          {/* 6. Data Table Transaksi */}
          <KasDataTable
            data={tableData}
            totalDebet={currentSummary.totalDebet}
            totalKredit={currentSummary.totalKredit}
            onEdit={(row) => {
              setEditItem({
                id: row.id,
                periodKey: selectedPeriod,
                day: row.day.toString(),
                description: row.description,
                type: row.type,
                amount: formatNumberInput(row.amount),
              });
              setIsEditOpen(true);
            }}
            onDelete={promptDeleteTransaction}
          />
        </>
      )}

      {/* 7. Dialog Tambah Periode */}
      <DialogAddPeriod
        open={isPeriodOpen}
        onOpenChange={setIsPeriodOpen}
        onAddPeriod={handleAddPeriod}
        isPending={isPending}
      />

      {/* 8. Dialog Edit Transaksi */}
      <DialogEditTransaction
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        item={editItem}
        setItem={setEditItem}
        onSave={handleSaveEdit}
        isPending={isPending}
      />

      {/* 9. Modal Dialog Konfirmasi Hapus (shadcn/ui) */}
      <DialogConfirmDelete
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
        title={deleteDialog.title}
        description={deleteDialog.description}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
      />
    </div>
  );
}