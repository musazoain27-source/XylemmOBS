import 'server-only';

// A lightweight, dependency-free sliding-window limiter. It is
// per-serverless-instance, not globally distributed, so treat it as a
// speed bump layered on top of Supabase Auth's own built-in brute
// force protection (Supabase locks out an account after repeated
// failed password attempts regardless of this limiter). If you expect
// serious abuse, swap this for Upstash Redis or Vercel's Edge Config —
// the interface below is intentionally small so that's a drop-in
// replacement.

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 8;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - bucket.windowStart) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Periodically prune old buckets so this doesn't grow unbounded on a
// long-lived instance.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.windowStart > WINDOW_MS) buckets.delete(key);
  }
}, WINDOW_MS).unref?.();
