import { describe, expect, it } from 'vitest';
import { parseInstallRuntimeConfig } from '@/lib/install/runtime-config';

describe('parseInstallRuntimeConfig', () => {
  it('returns defaults when optional phase 05 vars are omitted', () => {
    expect(
      parseInstallRuntimeConfig({
        NODE_ENV: 'test',
        PAYLOAD_SECRET: 'secret',
        DATABASE_URL: 'postgres://localhost:5432/nexpress_test',
      }),
    ).toEqual({
      NEXPRESS_INSTALLATION_MODE: 'wizard',
    });
  });

  it('accepts a valid install runtime config', () => {
    expect(
      parseInstallRuntimeConfig({
        NODE_ENV: 'production',
        PAYLOAD_SECRET: 'secret',
        DATABASE_URL: 'postgres://localhost:5432/nexpress',
        NEXPRESS_INSTALLATION_MODE: 'locked',
        NEXPRESS_DEFAULT_SITE_NAME: 'NexPress Production',
      }),
    ).toEqual({
      NEXPRESS_INSTALLATION_MODE: 'locked',
      NEXPRESS_DEFAULT_SITE_NAME: 'NexPress Production',
    });
  });

  it('fails when the install mode is invalid', () => {
    expect(() =>
      parseInstallRuntimeConfig({
        NODE_ENV: 'test',
        PAYLOAD_SECRET: 'secret',
        DATABASE_URL: 'postgres://localhost:5432/nexpress_test',
        NEXPRESS_INSTALLATION_MODE: 'enabled',
      }),
    ).toThrowError(/Invalid install runtime configuration/);
  });
});
