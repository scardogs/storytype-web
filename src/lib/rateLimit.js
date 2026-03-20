const globalStore = globalThis.__storytypeRateLimitStore || new Map();

if (!globalThis.__storytypeRateLimitStore) {
  globalThis.__storytypeRateLimitStore = globalStore;
}

export function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.socket?.remoteAddress || "unknown";
}

export function checkRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = globalStore.get(key);

  if (!entry || entry.resetAt <= now) {
    globalStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return { allowed: true, remaining: limit - 1, retryAfterMs: windowMs };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, entry.resetAt - now),
    };
  }

  entry.count += 1;
  globalStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    retryAfterMs: Math.max(0, entry.resetAt - now),
  };
}
