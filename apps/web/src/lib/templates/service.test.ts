import { starterTemplateManifest } from '@nexpress/themes';
import { describe, expect, it, vi } from 'vitest';
import {
  exportTemplateManifestWithPayload,
  importTemplateManifestWithPayload,
  importStarterDemoTemplateWithPayload,
  TemplateFlowError,
} from '@/lib/templates/service';
import type { AuthenticatedUserLike } from '@/lib/auth/access';

function createAdminUser(role: 'admin' | 'super-admin' = 'admin'): AuthenticatedUserLike {
  return {
    email: `${role}@example.com`,
    id: 1,
    role,
  };
}

function createPayloadMock() {
  const existingByCollection = new Map<string, boolean>();

  return {
    create: vi.fn(async (args) => ({ id: `${String(args.collection)}-created` })),
    find: vi.fn(async (args) => {
      if (args.limit === 1 && args.pagination === false) {
        return {
          docs: existingByCollection.get(String(args.collection))
            ? [{ id: `${String(args.collection)}-existing` }]
            : [],
        };
      }

      if (args.collection === 'pages') {
        return {
          docs: [
            {
              _status: 'published',
              body: 'Published sample page body.',
              builder: starterTemplateManifest.content.pages[0]?.builder,
              id: 10,
              slug: 'starter-demo-home',
              title: 'Starter Demo Home',
            },
          ],
        };
      }

      if (args.collection === 'posts') {
        return {
          docs: [
            {
              _status: 'published',
              body: 'Published sample post body.',
              id: 20,
              slug: 'starter-demo-post',
              title: 'Starter Demo Post',
            },
          ],
        };
      }

      if (args.collection === 'redirects') {
        return {
          docs: [
            {
              destinationPath: '/starter-demo-home',
              id: 30,
              isActive: true,
              sourcePath: '/demo',
              type: '302',
            },
          ],
        };
      }

      return {
        docs: [],
      };
    }),
    existingByCollection,
    update: vi.fn(async () => ({ id: 'updated' })),
  };
}

describe('template import/export service', () => {
  it('imports safe template manifests through a strict allowlist', async () => {
    const payload = createPayloadMock();

    const result = await importTemplateManifestWithPayload(payload, {
      manifest: starterTemplateManifest,
      user: createAdminUser(),
    });

    expect(result.manifestId).toBe(starterTemplateManifest.metadata.id);
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        data: expect.not.objectContaining({
          users: expect.anything(),
        }),
        overrideAccess: false,
      }),
    );
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        overrideAccess: false,
      }),
    );
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'redirects',
        overrideAccess: false,
      }),
    );
  });

  it('rejects unsafe template manifests before writing anything', async () => {
    const payload = createPayloadMock();

    await expect(
      importTemplateManifestWithPayload(payload, {
        manifest: {
          ...starterTemplateManifest,
          content: {
            ...starterTemplateManifest.content,
            pages: [
              {
                ...starterTemplateManifest.content.pages[0],
                body: '<script>alert(1)</script>',
              },
            ],
          },
        },
        user: createAdminUser(),
      }),
    ).rejects.toMatchObject({
      status: 400,
    });

    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
  });

  it('exports safe public content only by default', async () => {
    const payload = createPayloadMock();

    const manifest = await exportTemplateManifestWithPayload(payload, {
      label: 'Starter Export',
      user: createAdminUser(),
    });

    expect(manifest.metadata.id).toBe('starter-export');
    expect(manifest.requiredBlocks).toContain('core.section');
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        overrideAccess: false,
        where: expect.objectContaining({
          and: expect.arrayContaining([{ _status: { equals: 'published' } }]),
        }),
      }),
    );
  });

  it('rejects draft export mode for non-super-admin users', async () => {
    const payload = createPayloadMock();

    await expect(
      exportTemplateManifestWithPayload(payload, {
        includeDrafts: true,
        label: 'Draft Export',
        user: createAdminUser('admin'),
      }),
    ).rejects.toBeInstanceOf(TemplateFlowError);
  });

  it('imports the starter demo template explicitly', async () => {
    const payload = createPayloadMock();

    const result = await importStarterDemoTemplateWithPayload(
      payload,
      createAdminUser('super-admin'),
    );

    expect(result.demo).toBe(true);
    expect(result.themeId).toBe(starterTemplateManifest.theme.id);
  });
});
