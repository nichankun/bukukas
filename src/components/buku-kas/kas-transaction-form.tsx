// src/components/buku-kas/kas-transaction-form.tsx
"use client";

import React, { useState } from "react";
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
import { formatNumberInput, parseFormattedNumber } from "@/lib/kas-utils";
import { KasDayPicker } from "./kas-day-picker";

interface KasTransactionFormProps {
  // Periode aktif "YYYY-MM" — dipakai KasDayPicker untuk menentukan
  // bulan/tahun kalender & jumlah tanggal yang valid (mis. Februari
  // otomatis cuma sampai 28/29).
  periodKey: string;
  isPending: boolean;
  onSubmit: (data: {
    day: number;
    description: string;
    type: "debet" | "kredit";
    amount: number;
  }) => void;
}

export function KasTransactionForm({
  periodKey,
  isPending,
  onSubmit,
}: KasTransactionFormProps) {
  const [tglHari, setTglHari] = useState<number | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [jenis, setJenis] = useState<"debet" | "kredit">("debet");
  const [jumlah, setJumlah] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFormattedNumber(jumlah);

    // Tidak perlu lagi validasi range 1-31 manual: KasDayPicker hanya
    // menampilkan tanggal yang benar-benar ada di bulan periode aktif,
    // jadi kalau tglHari terisi, nilainya pasti valid.
    if (tglHari === null) {
      alert("Silakan pilih tanggal transaksi!");
      return;
    }
    if (amount <= 0) {
      alert("Masukkan nominal yang valid!");
      return;
    }

    onSubmit({ day: tglHari, description: keterangan, type: jenis, amount });
    setTglHari(null);
    setKeterangan("");
    setJumlah("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-4 bg-muted/20 rounded-xl border mb-4 sm:mb-6 print:hidden"
    >
      <div>
        <label className="text-[11px] sm:text-xs font-semibold text-muted-foreground block mb-1">
          Tanggal
        </label>
        <KasDayPicker
          periodKey={periodKey}
          value={tglHari}
          onChange={setTglHari}
        />
      </div>

      <div>
        <label className="text-[11px] sm:text-xs font-semibold text-muted-foreground block mb-1">
          Jenis
        </label>
        <Select
          value={jenis}
          onValueChange={(val: "debet" | "kredit") => setJenis(val)}
        >
          <SelectTrigger className="bg-background h-9 text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="debet">Debet (Masuk)</SelectItem>
            <SelectItem value="kredit">Kredit (Keluar)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2 md:col-span-1">
        <label className="text-[11px] sm:text-xs font-semibold text-muted-foreground block mb-1">
          Keterangan
        </label>
        <Input
          placeholder="Deskripsi transaksi"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          required
          className="bg-background h-9 text-base sm:text-sm"
        />
      </div>

      <div className="col-span-2 md:col-span-1">
        <label className="text-[11px] sm:text-xs font-semibold text-muted-foreground block mb-1">
          Jumlah (Rp)
        </label>
        <Input
          placeholder="0"
          value={jumlah}
          onChange={(e) => setJumlah(formatNumberInput(e.target.value))}
          required
          className="bg-background h-9 text-base sm:text-sm"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="col-span-full mt-0.5 h-9 text-xs sm:text-sm font-medium"
      >
        <Plus className="w-4 h-4 mr-1" /> Tambah Transaksi
      </Button>
    </form>
  );
}