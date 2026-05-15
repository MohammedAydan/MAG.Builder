import { describe, expect, it } from 'vitest';
import {
  CommerceConfigError,
  resolveCommerceRuntimeConfig,
} from './config';

describe('resolveCommerceRuntimeConfig', () => {
  it('returns disabled when no commerce provider is configured', () => {
    expect(resolveCommerceRuntimeConfig({})).toEqual({
      enabled: false,
      provider: null,
      reason: 'missing-provider',
    });
  });

  it('parses a valid Medusa configuration lazily', () => {
    const result = resolveCommerceRuntimeConfig({
      MEDUSA_BACKEND_URL: 'http://127.0.0.1:9000/',
      MEDUSA_DEFAULT_REGION_ID: 'reg_test',
      MEDUSA_PUBLISHABLE_KEY: 'pk_test_value',
      MEDUSA_REQUEST_TIMEOUT_MS: '7000',
      NEXPRESS_COMMERCE_PROVIDER: 'medusa',
    });

    expect(result.enabled).toBe(true);

    if (result.enabled) {
      expect(result.config).toEqual({
        backendUrl: 'http://127.0.0.1:9000',
        defaultRegionId: 'reg_test',
        healthPath: '/health',
        provider: 'medusa',
        publishableKey: 'pk_test_value',
        requestTimeoutMs: 7000,
      });
    }
  });

  it('rejects unsafe public server token exposure', () => {
    expect(() =>
      resolveCommerceRuntimeConfig({
        MEDUSA_BACKEND_URL: 'http://127.0.0.1:9000',
        MEDUSA_DEFAULT_REGION_ID: 'reg_test',
        MEDUSA_PUBLISHABLE_KEY: 'pk_test_value',
        NEXT_PUBLIC_MEDUSA_SERVER_TOKEN: 'leak',
        NEXPRESS_COMMERCE_PROVIDER: 'medusa',
      }),
    ).toThrowError(CommerceConfigError);
  });

  it('rejects insecure remote http backends', () => {
    expect(() =>
      resolveCommerceRuntimeConfig({
        MEDUSA_BACKEND_URL: 'http://example.com:9000',
        MEDUSA_DEFAULT_REGION_ID: 'reg_test',
        MEDUSA_PUBLISHABLE_KEY: 'pk_test_value',
        NEXPRESS_COMMERCE_PROVIDER: 'medusa',
      }),
    ).toThrowError(/https outside local development/);
  });

  it('rejects unsupported providers', () => {
    expect(() =>
      resolveCommerceRuntimeConfig({
        NEXPRESS_COMMERCE_PROVIDER: 'shopify',
      }),
    ).toThrowError(/Unsupported commerce provider/);
  });
});
