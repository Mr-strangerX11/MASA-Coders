const store = new Map();

// Accepts two calling conventions:
//   rateLimit(key, { limit, windowMs })          — object options
//   rateLimit(key, maxRequests, windowSeconds)    — positional (legacy auth routes)
export function rateLimit(key, optionsOrMax = {}, windowSeconds) {
  let limit, windowMs;

  if (typeof optionsOrMax === 'number') {
    limit    = optionsOrMax;
    windowMs = (windowSeconds ?? 60) * 1000;
  } else {
    limit    = optionsOrMax.limit    ?? 5;
    windowMs = optionsOrMax.windowMs ?? 60_000;
  }

  const now   = Date.now();
  const entry = store.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count  = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  store.set(key, entry);

  if (store.size % 500 === 0) {
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  const ok = entry.count <= limit;
  return {
    ok,
    allowed: ok,
    remaining: Math.max(0, limit - entry.count),
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
  };
}
