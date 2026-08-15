// src/components/buku-kas/dialog-add-period.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DialogAddPeriodProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPeriod: (periodKey: string) => void;
  isPending: boolean;
}

export function DialogAddPeriod({
  open,
  onOpenChange,
  onAddPeriod,
  isPending,
}: DialogAddPeriodProps) {
  const [newPeriodInput, setNewPeriodInput] = useState("2026-03");

  const handleAdd = () => {
    if (newPeriodInput) {
      onAddPeriod(newPeriodInput);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-sm sm:max-w-md rounded-xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold">
            Tambah Periode Bulan Baru
          </DialogTitle>
        </DialogHeader>
        <div className="py-3 sm:py-4">
          <label className="text-xs sm:text-sm font-medium text-foreground block mb-1.5">
            Pilih Bulan & Tahun
          </label>
          <Input
            type="month"
            value={newPeriodInput}
            onChange={(e) => setNewPeriodInput(e.target.value)}
            className="h-10 text-sm bg-background"
          />
        </div>
        <DialogFooter className="flex-row justify-end gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-9 text-sm"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            className="flex-1 sm:flex-none h-9 text-sm"
            onClick={handleAdd}
            disabled={isPending}
          >
            Tambah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}