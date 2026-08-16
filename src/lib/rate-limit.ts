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

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
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
