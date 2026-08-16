// src/components/buku-kas/kas-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Printer } from "lucide-react";

interface KasHeaderProps {
  onExportExcel: () => void;
  onPrint: () => void;
}

export function KasHeader({ onExportExcel, onPrint }: KasHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
        Buku Kas Debet / Kredit
      </h1>
      
      {/* Tombol Aksi: Full width 50:50 di mobile, auto di desktop */}
      <div className="flex items-center gap-2 w-full sm:w-auto print:hidden">
        <Button
          size="sm"
          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm h-9 shadow-sm transition-colors border-0"
          onClick={onExportExcel}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
          Export Excel
        </Button>
        <Button
          size="sm"
          className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm h-9 shadow-sm transition-colors border-0"
          onClick={onPrint}
        >
          <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
          Cetak / PDF
        </Button>
      </div>
    </div>
  );
}