import { describe, expect, it } from 'vitest';
import {
  contentCreateAccess,
  createPublishedOrPermissionWhere,
  mediaManageAccess,
  redirectsManageAccess,
  redirectsReadAccess,
} from '@/lib/auth/access';
import { buildSeoMetadata } from '@/lib/content/seo';
import { isSafeRedirectDestination, normalizeContentPath } from '@/lib/content/paths';
import { isSafeSlugSegment, normalizeSlugSegment } from '@/lib/content/slug';

describe('content access helpers', () => {
  const editorReq = { req: { user: { id: '1', role: 'editor' } } };
  const adminReq = { req: { user: { id: '2', role: 'admin' } } };
  const anonymousReq = { req: { user: null } };

  it('grants content writes to content-capable roles only', () => {
    expect(contentCreateAccess(editorReq as never)).toBe(true);
    expect(mediaManageAccess(editorReq as never)).toBe(true);
    expect(redirectsManageAccess(adminReq as never)).toBe(true);
    expect(redirectsManageAccess(editorReq as never)).toBe(false);
  });

  it('restricts anonymous content reads to published content and active redirects', async () => {
    expect(createPublishedOrPermissionWhere({ user: null }, 'content:read')).toEqual({
      _status: {
        equals: 'published',
      },
    });

    await expect(redirectsReadAccess(anonymousReq as never)).resolves.toEqual({
      isActive: {
        equals: true,
      },
    });
  });
});

describe('content normalization helpers', () => {
  it('normalizes safe slugs and redirect paths', () => {
    expect(normalizeSlugSegment(' Hello World! ')).toBe('hello-world');
    expect(isSafeSlugSegment('hello-world')).toBe(true);
    expect(normalizeContentPath('docs/getting-started')).toBe('/docs/getting-started');
    expect(normalizeContentPath('https://example.com/docs')).toBe('https://example.com/docs');
    expect(isSafeRedirectDestination('/docs')).toBe(true);
    expect(isSafeRedirectDestination('javascript:alert(1)')).toBe(false);
  });
});

describe('seo metadata helper', () => {
  it('builds safe metadata from seo fields with fallbacks', () => {
    const metadata = buildSeoMetadata({
      fallbackDescription: 'Fallback description',
      fallbackTitle: 'Fallback title',
      seo: {
        metaDescription: 'Custom description',
        metaTitle: 'Custom title',
        noFollow: false,
        noIndex: true,
      },
    });

    expect(metadata.title).toBe('Custom title');
    expect(metadata.description).toBe('Custom description');
    expect(metadata.robots).toEqual({
      follow: true,
      index: false,
    });
  });
});
