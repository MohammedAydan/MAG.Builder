import { describe, it, expect } from 'vitest';
import { createRateLimiter } from './rate-limit';

describe('Rate Limiter', () => {
  it('should allow requests under the limit', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
    const res1 = limiter.check('test-ip');
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = limiter.check('test-ip');
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);

    const res3 = limiter.check('test-ip');
    expect(res3.allowed).toBe(false);
    expect(res3.remaining).toBe(0);
  });

  it('should reset after windowMs', async () => {
    const limiter = createRateLimiter({ windowMs: 100, maxRequests: 1 });
    const res1 = limiter.check('test-ip-2');
    expect(res1.allowed).toBe(true);
    
    const res2 = limiter.check('test-ip-2');
    expect(res2.allowed).toBe(false);

    // wait for reset
    await new Promise((r) => setTimeout(r, 110));

    const res3 = limiter.check('test-ip-2');
    expect(res3.allowed).toBe(true);
  });
});
