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

interface KasTransactionFormProps {
  isPending: boolean;
  onSubmit: (data: {
    day: number;
    description: string;
    type: "debet" | "kredit";
    amount: number;
  }) => void;
}

export function KasTransactionForm({
  isPending,
  onSubmit,
}: KasTransactionFormProps) {
  const [tglHari, setTglHari] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [jenis, setJenis] = useState<"debet" | "kredit">("debet");
  const [jumlah, setJumlah] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseInt(tglHari, 10);
    const amount = parseFormattedNumber(jumlah);

    if (isNaN(day) || day < 1 || day > 31) {
      alert("Masukkan tanggal (hari) antara 1 sampai 31!");
      return;
    }
    if (amount <= 0) {
      alert("Masukkan nominal yang valid!");
      return;
    }

    onSubmit({ day, description: keterangan, type: jenis, amount });
    setTglHari("");
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
          Tanggal (1-31)
        </label>
        <Input
          type="number"
          min={1}
          max={31}
          placeholder="Misal: 15"
          value={tglHari}
          onChange={(e) => setTglHari(e.target.value)}
          required
          className="bg-background h-9 text-base sm:text-sm"
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