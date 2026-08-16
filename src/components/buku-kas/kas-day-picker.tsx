// src/components/buku-kas/kas-day-picker.tsx
"use client";

import * as React from "react";
import { IconCalendar } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getDaysInMonth, formatMonthName } from "@/lib/kas-utils";

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface KasDayPickerProps {
  // Periode aktif "YYYY-MM" — menentukan bulan & tahun kalender.
  // Bulan/tahun TIDAK bisa diganti dari komponen ini, hanya ditampilkan.
  periodKey: string;
  value: number | null;
  onChange: (day: number) => void;
  disabled?: boolean;
  className?: string;
}

export function KasDayPicker({
  periodKey,
  value,
  onChange,
  disabled,
  className,
}: KasDayPickerProps) {
  const [open, setOpen] = React.useState(false);

  const isValidPeriod = /^\d{4}-(0[1-9]|1[0-2])$/.test(periodKey || "");
  const daysInMonth = isValidPeriod ? getDaysInMonth(periodKey) : 31;

  const [yearStr, monthStr] = (periodKey || "").split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx0 = parseInt(monthStr, 10) - 1; // 0-based untuk Date()

  // Hari-dalam-minggu (0 = Minggu) untuk tanggal 1 bulan ini — dipakai
  // supaya grid kalender mulai dari kolom yang benar, bukan selalu dari
  // kolom pertama.
  const firstDayOfWeek = isValidPeriod
    ? new Date(year, monthIdx0, 1).getDay()
    : 0;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const monthLabel = isValidPeriod ? formatMonthName(periodKey) : "";
  const triggerLabel = value ? `${value} ${monthLabel}` : "Pilih tanggal";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || !isValidPeriod}
          className={cn(
            "w-full justify-start gap-2 bg-background font-normal h-9 text-base sm:text-sm",
            !value && "text-muted-foreground",
            className
          )}
        >
          <IconCalendar className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </PopoverTrigger>

      {/* PopoverContent bawaan shadcn sudah "flex flex-col gap-2.5 p-2.5" —
          jadi 2 children di bawah (header bulan & grid tanggal) otomatis
          tersusun vertikal dengan jarak yang konsisten, tidak perlu
          margin manual tambahan. */}
      <PopoverContent className="w-64" align="start">
        {/* Header bulan & tahun — teks biasa (tidak bisa diklik/diganti)
            karena sudah ditentukan oleh periode pembukuan yang aktif. */}
        <div className="text-center text-sm font-semibold text-foreground select-none">
          {monthLabel}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {NAMA_HARI.map((hari) => (
            <div
              key={hari}
              className="h-6 flex items-center justify-center text-[10px] font-medium text-muted-foreground select-none"
            >
              {hari}
            </div>
          ))}

          {leadingBlanks.map((i) => (
            <div key={`blank-${i}`} />
          ))}

          {days.map((day) => {
            const isSelected = value === day;
            return (
              <div key={day} className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onChange(day);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-8 w-8 rounded-full text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    isSelected &&
                      "bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}