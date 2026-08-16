// src/components/buku-kas/dialog-confirm-delete.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DialogConfirmDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DialogConfirmDelete({
  open,
  onOpenChange,
  title = "Konfirmasi Hapus",
  description,
  onConfirm,
  isPending = false,
}: DialogConfirmDeleteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-sm sm:max-w-md rounded-2xl p-5 sm:p-6 shadow-lg border">
        <DialogHeader className="flex flex-col sm:flex-row items-start gap-3.5">
          {/* Ikon Warning Merah */}
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2 pt-3 sm:pt-4">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            className="flex-1 sm:flex-none h-9 text-xs sm:text-sm font-medium"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isPending}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}