// src/components/buku-kas/kas-period-filter.tsx
"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { formatMonthName } from "@/lib/kas-utils";

interface KasPeriodFilterProps {
  periods: string[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onOpenAddPeriod: () => void;
  onDeletePeriod: (period: string) => void;
  periodBalanceStr: string;
  onPeriodBalanceChange: (val: string) => void;
  onPeriodBalanceBlur: () => void;
}

export function KasPeriodFilter({
  periods,
  selectedPeriod,
  onPeriodChange,
  onOpenAddPeriod,
  onDeletePeriod,
  periodBalanceStr,
  onPeriodBalanceChange,
  onPeriodBalanceBlur,
}: KasPeriodFilterProps) {
  const periodsByYear = useMemo(() => {
    const sorted = [...periods].sort();
    return sorted.reduce((acc, p) => {
      const year = p.split("-")[0];
      if (!acc[year]) acc[year] = [];
      acc[year].push(p);
      return acc;
    }, {} as Record<string, string[]>);
  }, [periods]);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 sm:p-4 bg-muted/40 rounded-xl border mb-4 sm:mb-6 print:hidden">
      {/* Bagian Pemilihan Periode */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 w-full md:w-auto">
        <label className="text-xs sm:text-sm font-semibold text-foreground shrink-0 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          Periode Bulan:
        </label>

        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {periods.length > 0 ? (
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="flex-1 sm:w-47.5 bg-background h-9 text-xs sm:text-sm font-medium">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                sideOffset={6}
                className="max-h-75 min-w-56"
              >
                {Object.entries(periodsByYear).map(([year, pList]) => (
                  <SelectGroup key={year}>
                    <SelectLabel className="sticky top-0 z-10 -mx-1 px-3 py-1.5 text-[11px] font-bold text-primary bg-popover/95 backdrop-blur-sm border-b border-border/50">
                      Tahun {year}
                    </SelectLabel>
                    {pList.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="pl-4 py-1.5 text-xs sm:text-sm cursor-pointer data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                      >
                        {formatMonthName(p)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-xs text-muted-foreground italic px-1">
              Belum ada periode
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAddPeriod}
            className="shrink-0 h-9 text-xs sm:text-sm px-2.5 sm:px-3 font-medium"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
          </Button>

          {selectedPeriod && (
            <Button
              variant="ghost"
              size="icon"
              title={`Hapus periode ${formatMonthName(selectedPeriod)}`}
              onClick={() => onDeletePeriod(selectedPeriod)}
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Bagian Input Saldo Awal */}
      {selectedPeriod && (
        <div className="flex items-center justify-between sm:justify-start gap-2 pt-2.5 md:pt-0 border-t md:border-t-0 border-border/60">
          <label className="text-xs font-semibold text-muted-foreground shrink-0">
            Saldo Awal:
          </label>
          <Input
            value={periodBalanceStr}
            onChange={(e) => onPeriodBalanceChange(e.target.value)}
            onBlur={onPeriodBalanceBlur}
            placeholder="0"
            className="w-32 sm:w-36 text-right bg-background font-bold text-sky-600 dark:text-sky-400 h-9 text-base sm:text-sm"
          />
        </div>
      )}
    </div>
  );
}