// src/app/page.tsx
import { getKasAppState } from "./actions/kas";
import { BukuKas } from "@/components/buku-kas";

export const revalidate = 0;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const data = await getKasAppState(period);

  return (
    <main className="min-h-screen bg-background py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <BukuKas
          initialPeriods={data.periods}
          initialTransactions={data.transactions}
          initialSelectedPeriod={data.selectedPeriod}
        />
      </div>
    </main>
  );
}