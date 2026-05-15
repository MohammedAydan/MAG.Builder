import { describe, expect, it, vi } from 'vitest';
import {
  createMarketplacePlanWithPayload,
  listMarketplacePackagesWithPayload,
  MarketplaceFlowError,
} from './service';
import type { AuthenticatedUserLike } from '@/lib/auth/access';

function createPayloadStub(pluginStates: { enabled?: boolean; pluginId: string; pluginVersion: string }[] = []) {
  return {
    create: vi.fn(async () => ({})),
    find: vi.fn(async () => ({
      docs: pluginStates,
    })),
  };
}

const adminUser: AuthenticatedUserLike = {
  email: 'admin@example.com',
  id: '1',
  role: 'admin',
};

describe('marketplace service', () => {
  it('lists the safe local catalog with installed plugin status', async () => {
    const payload = createPayloadStub([
      {
        enabled: true,
        pluginId: 'blog-pack',
        pluginVersion: '0.1.0',
      },
    ]);

    const result = await listMarketplacePackagesWithPayload(payload, adminUser);
    const blogPackage = result.find((entry) => entry.id === 'plugin-blog-pack');

    expect(blogPackage?.installed).toBe(true);
    expect(blogPackage?.enabled).toBe(true);
    expect(blogPackage?.installedVersion).toBe('0.1.0');
  });

  it('creates a dry-run marketplace update plan and audits it', async () => {
    const payload = createPayloadStub([
      {
        enabled: true,
        pluginId: 'blog-pack',
        pluginVersion: '0.1.0',
      },
    ]);

    const plan = await createMarketplacePlanWithPayload(payload, {
      action: 'update',
      packageId: 'plugin-blog-pack',
      user: adminUser,
    });

    expect(plan.dryRun).toBe(true);
    expect(plan.status).toBe('ready');
    expect(plan.targetVersion).toBe('0.1.1');
    expect(payload.create).toHaveBeenCalledTimes(1);
  });

  it('rejects users without marketplace read access', async () => {
    const payload = createPayloadStub();

    await expect(
      listMarketplacePackagesWithPayload(payload, {
        id: '2',
        role: 'editor',
      }),
    ).rejects.toBeInstanceOf(MarketplaceFlowError);
  });
});
