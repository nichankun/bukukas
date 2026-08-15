// src/components/buku-kas/kas-period-filter.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { formatMonthName } from "@/lib/kas-utils";

interface KasPeriodFilterProps {
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onOpenAddPeriod: () => void;
  masterBalanceStr: string;
  onMasterBalanceChange: (val: string) => void;
  onMasterBalanceBlur: () => void;
}

export function KasPeriodFilter({
  periods,
  selectedPeriod,
  onPeriodChange,
  onOpenAddPeriod,
  masterBalanceStr,
  onMasterBalanceChange,
  onMasterBalanceBlur,
}: KasPeriodFilterProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 sm:p-4 bg-muted/40 rounded-lg border mb-6 print:hidden">
      {/* Bagian Pilih Periode Bulan */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full md:w-auto">
        <label className="text-xs sm:text-sm font-semibold text-foreground shrink-0">
          Periode Bulan:
        </label>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger className="flex-1 sm:w-45 bg-background h-9 text-sm font-medium">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p} value={p}>
                  {formatMonthName(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAddPeriod}
            className="shrink-0 h-9 text-xs sm:text-sm px-2.5 sm:px-3"
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah Periode
          </Button>
        </div>
      </div>

      {/* Bagian Saldo Awal Master */}
      <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
        <label className="text-xs font-semibold text-muted-foreground shrink-0">
          Saldo Awal Pertama (Rp):
        </label>
        <Input
          value={masterBalanceStr}
          onChange={(e) => onMasterBalanceChange(e.target.value)}
          onBlur={onMasterBalanceBlur}
          className="w-32 sm:w-36 text-right bg-background font-medium h-9 text-sm"
        />
      </div>
    </div>
  );
}