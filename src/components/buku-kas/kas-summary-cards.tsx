// src/components/buku-kas/kas-summary-cards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/kas-utils";

interface KasSummaryCardsProps {
  summary: {
    saldoAwal: number;
    totalDebet: number;
    totalKredit: number;
    saldoAkhir: number;
  };
}

export function KasSummaryCards({ summary }: KasSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
      {/* Saldo Awal (Biru) */}
      <Card className="bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/70 dark:border-sky-900/50 shadow-2xs">
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
            Saldo Awal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-sm sm:text-xl font-bold text-sky-600 dark:text-sky-400 truncate">
            {formatRupiah(summary.saldoAwal)}
          </div>
        </CardContent>
      </Card>

      {/* Total Debet (Hijau) */}
      <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/50 shadow-2xs">
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Total Debet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-sm sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {formatRupiah(summary.totalDebet)}
          </div>
        </CardContent>
      </Card>

      {/* Total Kredit (Merah) */}
      <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/50 shadow-2xs">
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
          <CardTitle className="text-[10px] sm:text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
            Total Kredit
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-sm sm:text-xl font-bold text-rose-600 dark:text-rose-400 truncate">
            {formatRupiah(summary.totalKredit)}
          </div>
        </CardContent>
      </Card>

      {/* Saldo Akhir (Indigo / Merah) */}
      <Card
        className={`shadow-2xs ${
          summary.saldoAkhir < 0
            ? "bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-900/60"
            : "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-900/50"
        }`}
      >
        <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
          <CardTitle
            className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate ${
              summary.saldoAkhir < 0
                ? "text-red-700 dark:text-red-400"
                : "text-indigo-700 dark:text-indigo-400"
            }`}
          >
            Saldo Akhir
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div
            className={`text-sm sm:text-xl font-bold truncate ${
              summary.saldoAkhir < 0
                ? "text-red-600 dark:text-red-400"
                : "text-indigo-600 dark:text-indigo-400"
            }`}
          >
            {formatRupiah(summary.saldoAkhir)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}