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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Buku Kas Debet / Kredit
      </h1>
      <div className="flex items-center gap-2 print:hidden">
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors border-0"
          onClick={onExportExcel}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export Excel (.xlsx)
        </Button>
        <Button
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm transition-colors border-0"
          onClick={onPrint}
        >
          <Printer className="w-4 h-4 mr-2" />
          Cetak / PDF
        </Button>
      </div>
    </div>
  );
}