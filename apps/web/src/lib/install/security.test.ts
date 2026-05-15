import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/install/service', () => ({
  InstallFlowError: class InstallFlowError extends Error {
    constructor(
      message: string,
      readonly code: string,
      readonly status: number,
    ) {
      super(message);
    }
  },
}));

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
