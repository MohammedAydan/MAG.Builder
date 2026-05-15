/**
 * In-memory rate limiter for form submission endpoints.
 *
 * KNOWN LIMITATION: This rate limiter is process-local and in-memory.
 * It does not share state across multiple Node.js processes or server
 * instances. In a multi-process or edge deployment, a distributed rate
 * limit store (e.g., Redis) is required. This implementation provides a
 * reasonable baseline for single-process deployments only.
 *
 * Personal data avoidance: The rate limiter uses a key (e.g., hashed or
 * truncated identifier) rather than raw IP addresses. Callers should
 * supply a non-identifying or minimized key where possible.
 */

export type RateLimitConfig = {
  /** Maximum number of requests allowed in the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
};

export type RateLimitResult =
  | { allowed: false; retryAfterMs: number }
  | { allowed: true };

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

export interface RateLimitStore {
  check(key: string, config: RateLimitConfig): Promise<RateLimitResult>;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60_000, // 1 minute
};

/**
 * Create a rate limiter instance.
 *
 * @param config - Rate limit configuration.
 * @returns A function that checks whether a key is within limits.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly store = new Map<string, RateLimitEntry>();

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();

    // Periodic cleanup to prevent unbounded memory growth
    if (this.store.size > 10_000) {
      this.cleanup(config, now);
    }

    const entry = this.store.get(key);

    if (!entry || now - entry.windowStart > config.windowMs) {
      this.store.set(key, { count: 1, windowStart: now });
      return { allowed: true };
    }

    if (entry.count >= config.maxRequests) {
      const retryAfterMs = config.windowMs - (now - entry.windowStart);
      return { allowed: false, retryAfterMs };
    }

    entry.count += 1;
    return { allowed: true };
  }

  private cleanup(config: RateLimitConfig, now: number) {
    for (const [key, entry] of this.store) {
      if (now - entry.windowStart > config.windowMs) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Redis/Valkey-compatible placeholder contract.
 *
 * Phase 29 avoids taking a hard dependency on a specific Redis client.
 * Applications can implement this interface with their preferred client and
 * pass it to `createRateLimiter`.
 */
export interface DistributedRateLimitStore extends RateLimitStore {
  readonly kind: 'redis-compatible';
}

export function createRateLimiter(
  config: RateLimitConfig = DEFAULT_CONFIG,
  store: RateLimitStore = new InMemoryRateLimitStore(),
) {
  return {
    check(key: string) {
      return store.check(key, config);
    },
  };
}

/** Default rate limiter: 5 submissions per form per minute. */
export const defaultFormRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
});

/**
 * Build a rate limit key from a form slug and a client identifier.
 *
 * The identifier should be a minimized/hashed representation, not a raw IP.
 * If no identifier is available, use a constant so the limiter falls back to
 * per-form global limits.
 */
export function buildRateLimitKey(formSlug: string, identifier: string): string {
  return `form:${formSlug}:${identifier}`;
}
