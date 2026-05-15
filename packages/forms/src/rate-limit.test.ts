import { describe, expect, it, vi } from 'vitest';
import { InMemoryRateLimitStore, createRateLimiter } from './rate-limit';

describe('createRateLimiter', () => {
  it('uses the configured async store and blocks after the limit', async () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter(
      {
        maxRequests: 2,
        windowMs: 1000,
      },
      new InMemoryRateLimitStore(),
    );

    await expect(limiter.check('contact:anon')).resolves.toEqual({ allowed: true });
    await expect(limiter.check('contact:anon')).resolves.toEqual({ allowed: true });
    await expect(limiter.check('contact:anon')).resolves.toMatchObject({ allowed: false });
    vi.useRealTimers();
  });
});
