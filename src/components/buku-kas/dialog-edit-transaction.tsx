// src/components/buku-kas/dialog-edit-transaction.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumberInput, parseFormattedNumber } from "@/lib/kas-utils";
import { KasDayPicker } from "./kas-day-picker";

export interface EditItemState {
  id: number;
  periodKey: string;
  day: string;
  description: string;
  type: "debet" | "kredit";
  amount: string;
}

interface DialogEditTransactionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: EditItemState | null;
  setItem: React.Dispatch<React.SetStateAction<EditItemState | null>>;
  onSave: (id: number, data: { day: number; description: string; type: "debet" | "kredit"; amount: number }) => void;
  isPending: boolean;
}

export function DialogEditTransaction({
  open,
  onOpenChange,
  item,
  setItem,
  onSave,
  isPending,
}: DialogEditTransactionProps) {
  if (!item) return null;

  const handleSave = () => {
    const day = parseInt(item.day, 10);
    const amount = parseFormattedNumber(item.amount);

    // Tidak perlu lagi validasi range 1-31 manual: KasDayPicker hanya
    // menampilkan tanggal yang benar-benar ada di bulan periode transaksi
    // ini, jadi kalau item.day sudah terisi, nilainya pasti valid.
    if (isNaN(day)) {
      alert("Silakan pilih tanggal transaksi!");
      return;
    }
    if (amount <= 0) {
      alert("Masukkan nominal yang valid!");
      return;
    }

    onSave(item.id, {
      day,
      description: item.description,
      type: item.type,
      amount,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Tanggal
            </label>
            <KasDayPicker
              periodKey={item.periodKey}
              value={item.day ? parseInt(item.day, 10) : null}
              onChange={(day) => setItem({ ...item, day: day.toString() })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Keterangan
            </label>
            <Input
              value={item.description}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Jenis Transaksi
            </label>
            <Select
              value={item.type}
              onValueChange={(val: "debet" | "kredit") =>
                setItem({ ...item, type: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debet">Debet (Pemasukan)</SelectItem>
                <SelectItem value="kredit">Kredit (Pengeluaran)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Jumlah (Rp)
            </label>
            <Input
              value={item.amount}
              onChange={(e) =>
                setItem({
                  ...item,
                  amount: formatNumberInput(e.target.value),
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}