/**
 * Rate limiter — Redis-backed when REDIS_URL is set, in-memory fallback otherwise.
 * Calling conventions (both supported):
 *   rateLimit(key, { limit, windowMs })       — options object
 *   rateLimit(key, maxRequests, windowSecs)   — positional
 */

let redis = null;

function getRedis() {
  if (redis) return redis;
  if (!process.env.REDIS_URL) return null;
  try {
    const { default: Redis } = require('ioredis');
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout:       2000,
      lazyConnect:          true,
      enableOfflineQueue:   false,
    });
    redis.on('error', () => { redis = null; }); // reset on connection failure
    return redis;
  } catch {
    return null;
  }
}

// ── In-memory fallback ────────────────────────────────────────────────────────

const memStore = new Map();

function memRateLimit(key, limit, windowMs) {
  const now   = Date.now();
  let   entry = memStore.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  entry.count += 1;
  memStore.set(key, entry);

  // Prune expired entries every 1 000 writes
  if (memStore.size % 1_000 === 0) {
    for (const [k, v] of memStore) {
      if (now > v.resetAt) memStore.delete(k);
    }
  }

  const ok = entry.count <= limit;
  return { ok, allowed: ok, remaining: Math.max(0, limit - entry.count), resetIn: Math.ceil((entry.resetAt - now) / 1000) };
}

// ── Redis backend (sliding window via INCR + EXPIRE) ─────────────────────────

async function redisRateLimit(key, limit, windowMs) {
  const r      = getRedis();
  if (!r) return null; // signal to fall back

  const rKey   = `rl:${key}`;
  const winSec = Math.ceil(windowMs / 1000);

  try {
    const [count] = await r
      .multi()
      .incr(rKey)
      .expire(rKey, winSec, 'NX') // set TTL only on first write
      .exec();

    const current = count[1];
    const ok      = current <= limit;
    return { ok, allowed: ok, remaining: Math.max(0, limit - current), resetIn: winSec };
  } catch {
    return null; // fall through to in-memory
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function rateLimit(key, optionsOrMax = {}, windowSeconds) {
  let limit, windowMs;

  if (typeof optionsOrMax === 'number') {
    limit    = optionsOrMax;
    windowMs = (windowSeconds ?? 60) * 1_000;
  } else {
    limit    = optionsOrMax.limit    ?? 5;
    windowMs = optionsOrMax.windowMs ?? 60_000;
  }

  const redisResult = await redisRateLimit(key, limit, windowMs);
  if (redisResult) return redisResult;

  return memRateLimit(key, limit, windowMs);
}
