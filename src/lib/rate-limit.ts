// src/lib/rate-limit.ts
//
// Rate limiter sederhana berbasis memory untuk membatasi percobaan
// login per identifier (mis. alamat IP). Cukup untuk deployment
// single-instance (mis. VPS kecil / self-host). Untuk deployment
// multi-instance/serverless, ganti dengan store terpusat (Redis, dsb).

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 menit
const MAX_ATTEMPTS = 5;

// Bucket punya identifier yang sudah kedaluwarsa TAPI masih dipakai lagi
// otomatis di-reset di bawah (lihat `!bucket || bucket.resetAt <= now`).
// Yang jadi masalah adalah identifier yang berhenti dipakai sama sekali
// (mis. IP lama saat TRUST_PROXY_HEADERS=true) — entry-nya tidak pernah
// dihapus dan `buckets` bertumbuh terus selama proses hidup (memory leak
// perlahan). Untuk mode default (TRUST_PROXY_HEADERS=false) ini tidak
// masalah karena hanya ada satu key ("global"), tapi tetap disapu untuk
// kasus lain.
//
// Sweep dilakukan lazy & dibatasi jaraknya (bukan setInterval), supaya:
// - tidak menjalankan O(n) scan di setiap request,
// - tidak membuat proses "tetap menyala" karena timer aktif — penting
//   untuk runtime serverless yang membekukan/menutup instance saat idle.
const SWEEP_INTERVAL_MS = 5 * 60_000; // 5 menit
let lastSweepAt = 0;

function sweepExpiredBuckets(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  sweepExpiredBuckets(now);

  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function resetRateLimit(identifier: string) {
  buckets.delete(identifier);
}