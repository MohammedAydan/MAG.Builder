import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPayloadClient: vi.fn(),
}));

vi.mock('@/lib/payload', () => ({
  getPayloadClient: mocks.getPayloadClient,
}));

import {
  buildContentMetadata,
  resolvePublishedPageAccessBySlug,
} from '@/lib/content/public';

describe('public content metadata', () => {
  beforeEach(() => {
    mocks.getPayloadClient.mockReset();
  });

  it('falls back to content fields when seo fields are missing', () => {
    const metadata = buildContentMetadata({
      excerpt: 'Summary text',
      title: 'Published page',
    });

    expect(metadata.title).toBe('Published page');
    expect(metadata.description).toBe('Summary text');
    expect(metadata.robots).toEqual({
      follow: true,
      index: true,
    });
  });

  it('redirects anonymous visitors to login for members-only published pages', async () => {
    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({
          docs: [
            {
              accessLevel: 'members',
              slug: 'members-only',
              title: 'Members Only',
            },
          ],
        }),
    };

    mocks.getPayloadClient.mockResolvedValue(payload);

    await expect(resolvePublishedPageAccessBySlug('members-only')).resolves.toEqual({
      kind: 'login-required',
      loginPath: '/login?next=%2Fmembers-only',
    });
  });

  it('allows authenticated members to resolve published protected pages', async () => {
    const payload = {
      find: vi.fn().mockResolvedValue({
        docs: [
          {
            accessLevel: 'members',
            body: 'Protected body',
            slug: 'members-only',
            title: 'Members Only',
          },
        ],
      }),
    };

    mocks.getPayloadClient.mockResolvedValue(payload);

    await expect(
      resolvePublishedPageAccessBySlug('members-only', {
        collection: 'members',
        email: 'member@example.com',
        id: '1',
      }),
    ).resolves.toEqual({
      document: {
        accessLevel: 'members',
        body: 'Protected body',
        slug: 'members-only',
        title: 'Members Only',
      },
      kind: 'granted',
    });
  });
});
