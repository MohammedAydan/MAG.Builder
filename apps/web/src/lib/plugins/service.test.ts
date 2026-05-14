import { describe, expect, it, vi } from 'vitest';
import {
  activatePluginWithPayload,
  deactivatePluginWithPayload,
  hasActivePluginCapabilityWithPayload,
  planPluginMigrationsWithPayload,
  PluginFlowError,
  runPluginMigrationWithPayload,
  type PluginServicePayloadClient,
} from '@/lib/plugins/service';
import type { AuthenticatedUserLike } from '@/lib/auth/access';

function createAdminUser(role: 'admin' | 'super-admin' = 'admin'): AuthenticatedUserLike {
  return {
    email: `${role}@example.com`,
    id: 1,
    role,
  };
}

function createPayloadMock() {
  const records = new Map<string, Record<string, unknown>>();

  return {
    create: vi.fn(async (args) => {
      const data = args.data as Record<string, unknown>;
      const id = records.size + 1;
      records.set(String(data.pluginId), {
        id,
        ...data,
      });
      return {
        id,
        ...data,
      };
    }),
    find: vi.fn(async (args) => {
      const where = args.where as Record<string, unknown> | undefined;

      if (where && 'pluginId' in where) {
        const pluginId = String((where.pluginId as { equals: string }).equals);
        const record = records.get(pluginId);
        return {
          docs: record ? [record] : [],
        };
      }

      if (where && 'and' in where) {
        const clauses = where.and as Array<Record<string, { equals: string | boolean }>>;
        const pluginId = String(clauses[0]?.pluginId?.equals);
        const enabled = clauses[1]?.enabled?.equals === true;
        const record = records.get(pluginId);

        return {
          docs: record && record.enabled === enabled ? [record] : [],
        };
      }

      return {
        docs: [...records.values()],
      };
    }),
    records,
    update: vi.fn(async (args) => {
      const existing = [...records.values()].find((record) => record.id === args.id);

      if (!existing) {
        return { id: args.id };
      }

      Object.assign(existing, args.data as Record<string, unknown>);
      return existing;
    }),
  } as unknown as PluginServicePayloadClient;
}

describe('plugin service', () => {
  it('activates a safe plugin and records pending migrations', async () => {
    const payload = createPayloadMock();

    const result = await activatePluginWithPayload(payload, {
      enabledModules: ['seo-builder-blocks'],
      pluginId: 'seo-pack',
      user: createAdminUser(),
    });

    expect(result.status).toBe('enabled');
    expect(result.enabledModules).toEqual(['seo-builder-blocks']);
    expect(result.pendingMigrations).toContain('seo-pack-baseline');
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'plugin-states',
        overrideAccess: false,
      }),
    );
  });

  it('rejects activation when dependencies are missing', async () => {
    const payload = createPayloadMock();

    await expect(
      activatePluginWithPayload(payload, {
        pluginId: 'membership-pack',
        user: createAdminUser(),
      }),
    ).rejects.toBeInstanceOf(PluginFlowError);

    expect(payload.create).not.toHaveBeenCalled();
  });

  it('deactivates plugins without deleting their migration metadata', async () => {
    const payload = createPayloadMock();

    await activatePluginWithPayload(payload, {
      pluginId: 'forms-pack',
      user: createAdminUser(),
    });

    const result = await deactivatePluginWithPayload(payload, {
      pluginId: 'forms-pack',
      user: createAdminUser(),
    });

    expect(result.status).toBe('disabled');
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'plugin-states',
        overrideAccess: false,
      }),
    );
  });

  it('plans and executes a known migration', async () => {
    const payload = createPayloadMock();
    await activatePluginWithPayload(payload, {
      pluginId: 'blog-pack',
      user: createAdminUser('super-admin'),
    });

    const plan = await planPluginMigrationsWithPayload(payload, {
      pluginId: 'blog-pack',
      user: createAdminUser('super-admin'),
    });

    expect(plan.pending).toHaveLength(1);

    const result = await runPluginMigrationWithPayload(payload, {
      migrationId: 'blog-pack-baseline',
      pluginId: 'blog-pack',
      user: createAdminUser('super-admin'),
    });

    expect(result.status).toBe('applied');
  });

  it('fails closed for disabled or missing capability states', async () => {
    const payload = createPayloadMock();

    expect(
      await hasActivePluginCapabilityWithPayload(payload, {
        capability: 'seo:metadata',
        pluginId: 'seo-pack',
      }),
    ).toBe(false);

    await activatePluginWithPayload(payload, {
      pluginId: 'seo-pack',
      user: createAdminUser(),
    });

    expect(
      await hasActivePluginCapabilityWithPayload(payload, {
        capability: 'seo:metadata',
        pluginId: 'seo-pack',
      }),
    ).toBe(true);
    expect(
      await hasActivePluginCapabilityWithPayload(payload, {
        capability: 'members:protected-routes',
        pluginId: 'seo-pack',
      }),
    ).toBe(false);
  });
});
