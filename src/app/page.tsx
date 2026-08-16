// src/app/page.tsx
import { getKasAppState } from "./actions/kas";
import { BukuKas } from "@/components/buku-kas";

export const revalidate = 0;

export default async function Page() {
  const data = await getKasAppState();

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <BukuKas
        initialPeriods={data.periods}
        initialTransactions={data.transactions}
      />
    </main>
  );
}