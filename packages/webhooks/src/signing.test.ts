import { generateSignature, verifySignature } from './signing';
import { describe, expect, it } from 'vitest';

describe('Webhook Signing', () => {
  const secret = 'test_secret_123';
  const payload = JSON.stringify({ event: 'test.event', data: { id: 1 } });

  it('generates a verifiable signature', () => {
    const header = generateSignature({ secret, payload });
    expect(verifySignature(header, secret, payload)).toBe(true);
  });

  it('rejects invalid signature', () => {
    const header = generateSignature({ secret, payload });
    const invalidPayload = JSON.stringify({ event: 'test.event', data: { id: 2 } });
    expect(verifySignature(header, secret, invalidPayload)).toBe(false);
  });

  it('rejects invalid secret', () => {
    const header = generateSignature({ secret, payload });
    expect(verifySignature(header, 'wrong_secret', payload)).toBe(false);
  });

  it('rejects stale timestamp', () => {
    const staleTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
    const header = generateSignature({ secret, payload, timestamp: staleTimestamp });
    expect(verifySignature(header, secret, payload)).toBe(false);
  });

  it('rejects malformed header', () => {
    expect(verifySignature('malformed_header', secret, payload)).toBe(false);
    expect(verifySignature('t=abc,v1=def', secret, payload)).toBe(false);
    expect(verifySignature(null, secret, payload)).toBe(false);
    expect(verifySignature('', secret, payload)).toBe(false);
  });
});
