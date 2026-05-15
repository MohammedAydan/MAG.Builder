import { describe, expect, it } from 'vitest';
import { parseRuntimeServicesConfig, redactRuntimeServicesConfig } from '@/lib/runtime-services/config';

describe('parseRuntimeServicesConfig', () => {
  it('defaults to safe fallbacks when optional vars are absent', () => {
    expect(parseRuntimeServicesConfig({})).toEqual({
      analytics: { provider: 'audit-log' },
      email: { provider: 'stub' },
      rateLimit: { provider: 'memory' },
      search: { provider: 'database' },
      webhooks: {
        backoffMs: 30000,
        deliveryMode: 'in-process',
        maxAttempts: 3,
      },
    });
  });

  it('requires resend secrets when the resend provider is selected', () => {
    expect(() =>
      parseRuntimeServicesConfig({
        NEXPRESS_EMAIL_PROVIDER: 'resend',
      }),
    ).toThrowError(/RESEND_API_KEY/);
  });

  it('redacts sensitive provider secrets', () => {
    const config = parseRuntimeServicesConfig({
      NEXPRESS_EMAIL_FROM: 'ops@example.com',
      NEXPRESS_EMAIL_PROVIDER: 'resend',
      RESEND_API_KEY: 're_secret',
    });

    expect(redactRuntimeServicesConfig(config)).toEqual({
      analytics: { provider: 'audit-log' },
      email: {
        from: 'ops@example.com',
        provider: 'resend',
      },
      rateLimit: { provider: 'memory' },
      search: { provider: 'database' },
      webhooks: {
        backoffMs: 30000,
        deliveryMode: 'in-process',
        maxAttempts: 3,
      },
    });
  });
});
