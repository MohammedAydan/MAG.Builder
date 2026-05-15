export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
  reset(key: string): void;
}

/**
 * Creates a simple in-memory rate limiter.
 * Note: In a multi-process/multi-instance environment, this will not be shared.
 * For production with multiple instances, use a Redis-backed rate limiter.
 */
export function createRateLimiter(options: RateLimitOptions): RateLimiter {
  const store = new Map<string, { count: number; resetAt: number }>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const record = store.get(key);

      if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return {
          allowed: true,
          remaining: options.maxRequests - 1,
          resetAt: now + options.windowMs,
        };
      }

      if (record.count >= options.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: record.resetAt,
        };
      }

      record.count += 1;
      return {
        allowed: true,
        remaining: options.maxRequests - record.count,
        resetAt: record.resetAt,
      };
    },

    reset(key: string): void {
      store.delete(key);
    },
  };
}

/**
 * Helper to build consistent rate limit keys.
 */
export function buildRateLimitKey(prefix: string, identifier: string): string {
  return `${prefix}:${identifier}`;
}
