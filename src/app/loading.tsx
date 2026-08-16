import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Memuat data...
      </div>
    </main>
  );
}
