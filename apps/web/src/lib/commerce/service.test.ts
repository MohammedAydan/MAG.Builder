import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommerceServiceError,
  getCommerceAdapter,
  hasCommerceCatalogAccess,
} from '@/lib/commerce/service';

const hasActivePluginCapabilityMock = vi.fn();

vi.mock('@/lib/plugins/service', () => ({
  hasActivePluginCapability: (...args: Parameters<typeof hasActivePluginCapabilityMock>) =>
    hasActivePluginCapabilityMock(...args),
}));

describe('commerce service', () => {
  beforeEach(() => {
    hasActivePluginCapabilityMock.mockReset();
    vi.unstubAllEnvs();
  });

  it('fails closed when commerce-pack is not active', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(false);

    expect(await hasCommerceCatalogAccess()).toBe(false);
    await expect(getCommerceAdapter()).rejects.toEqual(
      expect.objectContaining({
        code: 'commerce-disabled',
      }),
    );
  });

  it('rejects invalid runtime config only after capability access is granted', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(true);
    vi.stubEnv('NEXPRESS_COMMERCE_PROVIDER', 'medusa');
    vi.stubEnv('NEXT_PUBLIC_MEDUSA_SERVER_TOKEN', 'unsafe');

    await expect(getCommerceAdapter()).rejects.toBeInstanceOf(Error);
  });

  it('returns a Medusa adapter when the capability and runtime config are present', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(true);
    vi.stubEnv('NEXPRESS_COMMERCE_PROVIDER', 'medusa');
    vi.stubEnv('MEDUSA_BACKEND_URL', 'http://127.0.0.1:9000');

    const adapter = await getCommerceAdapter();

    expect(adapter.provider).toBe('medusa');
    expect(adapter.config.backendUrl).toBe('http://127.0.0.1:9000');
  });

  it('raises a typed misconfiguration error when the provider stays disabled', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(true);
    vi.stubEnv('NEXPRESS_COMMERCE_PROVIDER', 'disabled');

    await expect(getCommerceAdapter()).rejects.toEqual(
      expect.objectContaining<Partial<CommerceServiceError>>({
        code: 'commerce-misconfigured',
        status: 503,
      }),
    );
  });
});
