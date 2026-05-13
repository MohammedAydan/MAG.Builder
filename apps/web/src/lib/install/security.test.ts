import { describe, expect, it } from 'vitest';
import { assertSameOriginInstallRequest } from '@/lib/install/security';

describe('assertSameOriginInstallRequest', () => {
  it('allows same-origin install requests', () => {
    const request = new Request('https://example.com/api/install', {
      headers: {
        origin: 'https://example.com',
      },
      method: 'POST',
    });

    expect(() => assertSameOriginInstallRequest(request)).not.toThrow();
  });

  it('blocks cross-site install requests', () => {
    const request = new Request('https://example.com/api/install', {
      headers: {
        origin: 'https://attacker.example',
      },
      method: 'POST',
    });

    expect(() => assertSameOriginInstallRequest(request)).toThrowError(
      /Cross-site install attempts are blocked/,
    );
  });
});
