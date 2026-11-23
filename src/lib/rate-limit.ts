type HitBucket = { hits: number[] };
type FailBucket = { count: number; resetAt: number };

const hits = new Map<string, HitBucket>();
const failures = new Map<string, FailBucket>();

function pruneHits(bucket: HitBucket, now: number, windowMs: number) {
  bucket.hits = bucket.hits.filter((time) => now - time < windowMs);
}

/** تعداد درخواست در یک بازه. با پر شدن سهمیه، تا پایان همان بازه رد می‌شود. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = hits.get(key) ?? { hits: [] };
  pruneHits(bucket, now, windowMs);
  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    hits.set(key, bucket);
    return {
      ok: false as const,
      retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }
  bucket.hits.push(now);
  hits.set(key, bucket);
  return { ok: true as const };
}

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function loginAttemptAllowed(key: string) {
  const row = failures.get(key);
  if (!row) return { ok: true as const };
  if (Date.now() > row.resetAt) {
    failures.delete(key);
    return { ok: true as const };
  }
  if (row.count >= LOGIN_LIMIT) {
    return {
      ok: false as const,
      retryAfterSec: Math.max(1, Math.ceil((row.resetAt - Date.now()) / 1000)),
    };
  }
  return { ok: true as const };
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  const row = failures.get(key);
  if (!row || now > row.resetAt) {
    failures.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return;
  }
  row.count += 1;
}

export function clearLoginFailures(key: string) {
  failures.delete(key);
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw = forwarded?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "";
  const ip = raw.trim();
  return ip.slice(0, 64) || "unknown";
}
