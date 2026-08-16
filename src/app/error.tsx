"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke console/observability server, jangan tampilkan detail ke user.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="max-w-sm w-full text-center border rounded-xl bg-card p-6 shadow-sm">
        <AlertTriangle className="w-10 h-10 mx-auto text-destructive mb-3" />
        <h2 className="text-base font-bold text-foreground mb-1">
          Terjadi Kesalahan
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Maaf, ada masalah saat memuat data. Silakan coba lagi.
        </p>
        <Button onClick={() => reset()} size="sm" className="w-full">
          <RotateCw className="w-3.5 h-3.5 mr-2" /> Coba Lagi
        </Button>
      </div>
    </main>
  );
}
