import { describe, expect, it } from 'vitest';
import { buildContentMetadata } from '@/lib/content/public';

describe('public content metadata', () => {
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
});
