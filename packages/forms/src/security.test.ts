import { describe, expect, it } from 'vitest';
import { validateWebhookUrl } from './webhook';
import { createRateLimiter, buildRateLimitKey } from './rate-limit';

// ---------------------------------------------------------------------------
// Webhook URL validation tests
// ---------------------------------------------------------------------------

describe('validateWebhookUrl', () => {
  it('accepts a valid https URL', () => {
    const result = validateWebhookUrl('https://hooks.example.com/form');
    expect(result.success).toBe(true);
  });

  it('rejects http:// scheme', () => {
    const result = validateWebhookUrl('http://hooks.example.com/form');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toMatch(/https/);
    }
  });

  it('rejects javascript: scheme', () => {
    const result = validateWebhookUrl('javascript:alert(1)');
    expect(result.success).toBe(false);
  });

  it('rejects data: scheme', () => {
    const result = validateWebhookUrl('data:text/html,<h1>hi</h1>');
    expect(result.success).toBe(false);
  });

  it('rejects file: scheme', () => {
    const result = validateWebhookUrl('file:///etc/passwd');
    expect(result.success).toBe(false);
  });

  it('rejects localhost', () => {
    const result = validateWebhookUrl('https://localhost/hook');
    expect(result.success).toBe(false);
  });

  it('rejects 127.0.0.1', () => {
    const result = validateWebhookUrl('https://127.0.0.1/hook');
    expect(result.success).toBe(false);
  });

  it('rejects 10.x.x.x private IP', () => {
    const result = validateWebhookUrl('https://10.0.0.1/hook');
    expect(result.success).toBe(false);
  });

  it('rejects 192.168.x.x private IP', () => {
    const result = validateWebhookUrl('https://192.168.1.1/hook');
    expect(result.success).toBe(false);
  });

  it('rejects 172.16.x.x private IP', () => {
    const result = validateWebhookUrl('https://172.16.0.1/hook');
    expect(result.success).toBe(false);
  });

  it('rejects 169.254.x.x link-local', () => {
    const result = validateWebhookUrl('https://169.254.169.254/latest/meta-data');
    expect(result.success).toBe(false);
  });

  it('rejects AWS metadata service address', () => {
    const result = validateWebhookUrl('https://169.254.169.254/');
    expect(result.success).toBe(false);
  });

  it('rejects GCP metadata hostname', () => {
    const result = validateWebhookUrl('https://metadata.google.internal/');
    expect(result.success).toBe(false);
  });

  it('rejects a completely invalid URL string', () => {
    const result = validateWebhookUrl('not-a-url');
    expect(result.success).toBe(false);
  });

  it('rejects an empty string', () => {
    const result = validateWebhookUrl('');
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rate limiter tests
// ---------------------------------------------------------------------------

describe('createRateLimiter', () => {
  it('allows requests within the limit', async () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });
    expect((await limiter.check('key1')).allowed).toBe(true);
    expect((await limiter.check('key1')).allowed).toBe(true);
    expect((await limiter.check('key1')).allowed).toBe(true);
  });

  it('blocks requests exceeding the limit', async () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });
    await limiter.check('key2');
    await limiter.check('key2');
    const result = await limiter.check('key2');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it('tracks different keys independently', async () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect((await limiter.check('keyA')).allowed).toBe(true);
    expect((await limiter.check('keyA')).allowed).toBe(false);
    // Different key should still be allowed
    expect((await limiter.check('keyB')).allowed).toBe(true);
  });
});

describe('buildRateLimitKey', () => {
  it('produces a stable key for the same inputs', () => {
    const key1 = buildRateLimitKey('contact', 'id-abc');
    const key2 = buildRateLimitKey('contact', 'id-abc');
    expect(key1).toBe(key2);
  });

  it('produces different keys for different form slugs', () => {
    const key1 = buildRateLimitKey('contact', 'id-abc');
    const key2 = buildRateLimitKey('signup', 'id-abc');
    expect(key1).not.toBe(key2);
  });
});
