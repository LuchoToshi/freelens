/**
 * Per-instance in-memory rate limiter: a per-key window, plus a hard global
 * cap across all keys in the same window. The per-key cap is only as good as
 * identity resolution (one instance, resets on cold start); the global cap
 * bounds total spend on an unauthenticated LLM endpoint even if identity
 * resolution has a gap nobody has found yet.
 */
export function createRateLimiter({
  windowMs,
  maxPerKey,
  maxTotal,
}: {
  windowMs: number;
  maxPerKey: number;
  maxTotal: number;
}) {
  const hits = new Map<string, number[]>();
  let globalHits: number[] = [];

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    globalHits = globalHits.filter((t) => now - t < windowMs);
    if (globalHits.length >= maxTotal) return true;

    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 10_000) hits.clear();
    if (recent.length > maxPerKey) return true;

    globalHits.push(now);
    return false;
  };
}
