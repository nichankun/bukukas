import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="max-w-sm w-full text-center border rounded-xl bg-card p-6 shadow-sm">
        <FileQuestion className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <h2 className="text-base font-bold text-foreground mb-1">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Halaman yang Anda cari tidak tersedia.
        </p>
        <Button asChild size="sm" className="w-full">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </main>
  );
}
