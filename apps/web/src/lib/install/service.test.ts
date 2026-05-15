import { INSTALLATION_STATE_KEY, InstallationState } from '@/collections/InstallationState';
import { Users } from '@/collections/Users';
import { vi } from 'vitest';

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

import {
  type InstallInput,
  getInstallStatusFromPayload,
  installSystemWithPayload,
} from '@/lib/install/service';
import { describe, expect, it } from 'vitest';

const runtimeConfig = {
  NEXPRESS_INSTALLATION_MODE: 'wizard' as const,
  NEXPRESS_DEFAULT_SITE_NAME: 'NexPress Test',
};

function createPayloadMock({
  installationDocs = [],
  userDocs = [],
}: {
  installationDocs?: Array<Record<string, unknown>>;
  userDocs?: Array<Record<string, unknown>>;
}) : Parameters<typeof getInstallStatusFromPayload>[0] {
  return {
    create: vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === InstallationState.slug) {
        return {
          id: 'installation-state-id',
        };
      }

      if (collection === Users.slug) {
        return {
          id: 'user-id',
        };
      }

      return {
        id: 'audit-log-id',
      };
    }),
    find: vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === InstallationState.slug) {
        return {
          docs: installationDocs,
          totalDocs: installationDocs.length,
        };
      }

      if (collection === Users.slug) {
        return {
          docs: userDocs,
          totalDocs: userDocs.length,
        };
      }

      throw new Error(`Unexpected collection: ${collection}`);
    }),
  } as unknown as Parameters<typeof getInstallStatusFromPayload>[0];
}

describe('getInstallStatusFromPayload', () => {
  it('reports not-installed when there is no installation record or user', async () => {
    const payload = createPayloadMock({});

    await expect(getInstallStatusFromPayload(payload, runtimeConfig)).resolves.toEqual({
      defaultSiteName: 'NexPress Test',
      installationMode: 'wizard',
      kind: 'not-installed',
    });
  });

  it('treats an installation record as installed', async () => {
    const payload = createPayloadMock({
      installationDocs: [
        {
          adminEmail: 'admin@example.com',
          installedAt: '2026-05-13T00:00:00.000Z',
          siteName: 'NexPress',
        },
      ],
    });

    await expect(getInstallStatusFromPayload(payload, runtimeConfig)).resolves.toEqual({
      adminEmail: 'admin@example.com',
      installedAt: '2026-05-13T00:00:00.000Z',
      kind: 'installed',
      siteName: 'NexPress',
      source: 'installation-record',
    });
  });

  it('blocks the wizard when an admin user already exists', async () => {
    const payload = createPayloadMock({
      userDocs: [{ id: '1', email: 'admin@example.com' }],
    });

    await expect(getInstallStatusFromPayload(payload, runtimeConfig)).resolves.toEqual({
      kind: 'installed',
      source: 'existing-user',
    });
  });
});

describe('installSystemWithPayload', () => {
  const input: InstallInput = {
    adminEmail: 'admin@example.com',
    adminPassword: 'StrongPassword!2',
    confirmPassword: 'StrongPassword!2',
    siteName: 'NexPress',
  };

  it('creates the first admin and installation state with overrideAccess', async () => {
    const payload = createPayloadMock({});

    await installSystemWithPayload(payload, runtimeConfig, input);

    expect(payload.create).toHaveBeenCalledTimes(4);
    expect(payload.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: Users.slug,
        data: {
          email: 'admin@example.com',
          password: 'StrongPassword!2',
          role: 'super-admin',
        },
        overrideAccess: true,
      }),
    );
    expect(payload.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: InstallationState.slug,
        data: expect.objectContaining({
          adminEmail: 'admin@example.com',
          key: INSTALLATION_STATE_KEY,
          siteName: 'NexPress',
          status: 'installed',
        }),
        overrideAccess: true,
      }),
    );
    expect(payload.create).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        collection: 'sites',
        data: expect.objectContaining({
          isDefault: true,
          name: 'NexPress',
          siteId: 'default',
          slug: 'default',
          status: 'active',
        }),
        overrideAccess: true,
      }),
    );
    expect(payload.create).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        collection: 'audit-logs',
        data: expect.objectContaining({
          action: 'system.install.completed',
          actorEmail: 'admin@example.com',
          actorRole: 'super-admin',
          result: 'success',
        }),
        overrideAccess: true,
      }),
    );
  });

  it('rejects a reinstall attempt', async () => {
    const payload = createPayloadMock({
      userDocs: [{ id: '1', email: 'admin@example.com' }],
    });

    await expect(installSystemWithPayload(payload, runtimeConfig, input)).rejects.toMatchObject({
      code: 'already-installed',
      status: 409,
    });
  });
});
