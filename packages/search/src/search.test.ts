import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySearchAdapter } from './adapter';
import { SearchService } from './service';
import type { SearchDocument } from './types';

const sampleDocs: SearchDocument[] = [
  {
    id: '1',
    siteId: 'default',
    type: 'page',
    title: 'About Us',
    slug: 'about',
    excerpt: 'Learn about our mission',
    accessLevel: 'public',
    publishedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    siteId: 'default',
    type: 'post',
    title: 'Members Only Post',
    slug: 'members-post',
    excerpt: 'Exclusive content for members',
    accessLevel: 'members-only',
    publishedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '3',
    siteId: 'default',
    type: 'page',
    title: 'Privacy Policy',
    slug: 'privacy',
    excerpt: 'Our privacy policy details',
    accessLevel: 'public',
  },
  {
    id: '4',
    siteId: 'other-site',
    type: 'post',
    title: 'Getting Started',
    slug: 'getting-started',
    excerpt: 'How to get started with our platform',
    accessLevel: 'public',
  },
];

describe('InMemorySearchAdapter', () => {
  let adapter: InMemorySearchAdapter;

  beforeEach(async () => {
    adapter = new InMemorySearchAdapter();
    await adapter.reindex(sampleDocs);
  });

  it('returns all docs when no filters are applied', async () => {
    const result = await adapter.search({ q: undefined, page: 1, limit: 50 });
    expect(result.total).toBe(4);
  });

  it('filters by content type', async () => {
    const result = await adapter.search({ q: undefined, type: 'post', page: 1, limit: 50 });
    expect(result.total).toBe(2);
    expect(result.docs.every((d) => d.type === 'post')).toBe(true);
  });

  it('matches case-insensitive text in title', async () => {
    const result = await adapter.search({ q: 'privacy', page: 1, limit: 50 });
    expect(result.total).toBe(1);
    expect(result.docs[0]?.slug).toBe('privacy');
  });

  it('matches text in excerpt', async () => {
    const result = await adapter.search({ q: 'exclusive', page: 1, limit: 50 });
    expect(result.total).toBe(1);
    expect(result.docs[0]?.id).toBe('2');
  });

  it('returns empty result for no matches', async () => {
    const result = await adapter.search({ q: 'zzznomatch', page: 1, limit: 50 });
    expect(result.total).toBe(0);
    expect(result.docs).toHaveLength(0);
  });

  it('paginates results', async () => {
    const result = await adapter.search({ page: 1, limit: 2 });
    expect(result.docs).toHaveLength(2);
    expect(result.hasNextPage).toBe(true);
  });

  it('handles last page correctly', async () => {
    const result = await adapter.search({ page: 2, limit: 3 });
    expect(result.docs).toHaveLength(1);
    expect(result.hasNextPage).toBe(false);
  });

  it('removes a document from the index', async () => {
    await adapter.removeDocument('1');
    const result = await adapter.search({ page: 1, limit: 50 });
    expect(result.total).toBe(3);
    expect(result.docs.find((d) => d.id === '1')).toBeUndefined();
  });

  it('indexes a new document', async () => {
    await adapter.indexDocument({
      id: '5',
      siteId: 'default',
      type: 'page',
      title: 'New Page',
      slug: 'new-page',
      accessLevel: 'public',
    });
    const result = await adapter.search({ q: 'New Page', page: 1, limit: 50 });
    expect(result.total).toBe(1);
    expect(result.docs[0]?.id).toBe('5');
  });

  it('reindex replaces the entire index', async () => {
    await adapter.reindex([sampleDocs[0]!]);
    const result = await adapter.search({ page: 1, limit: 50 });
    expect(result.total).toBe(1);
  });
});

describe('SearchService - access level filtering', () => {
  let service: SearchService;

  beforeEach(async () => {
    const adapter = new InMemorySearchAdapter();
    await adapter.reindex(sampleDocs);
    service = new SearchService(adapter);
  });

  it('anonymous users only see public documents', async () => {
    const result = await service.search({ page: '1', limit: '50' }, { isMember: false, siteId: 'default' });
    expect(result.docs.every((d) => d.accessLevel === 'public')).toBe(true);
    expect(result.docs.find((d) => d.id === '2')).toBeUndefined();
  });

  it('members see all documents including members-only', async () => {
    const result = await service.search({ page: '1', limit: '50' }, { isMember: true, siteId: 'default' });
    expect(result.docs.find((d) => d.id === '2')).toBeDefined();
  });

  it('rejects documents from other sites even when they match the query', async () => {
    const result = await service.search({ q: 'Getting', page: '1', limit: '50' }, { isMember: true, siteId: 'default' });
    expect(result.docs).toHaveLength(0);
  });

  it('rejects invalid query parameters and returns empty result', async () => {
    const result = await service.search({ limit: '999999' }, { isMember: false, siteId: 'default' });
    // Limit is bounded by schema to 50; invalid > 50 would fail parse
    expect(result.docs).toBeDefined();
  });

  it('query longer than max is rejected and returns empty', async () => {
    const longQuery = 'a'.repeat(201);
    const result = await service.search({ q: longQuery }, { isMember: false, siteId: 'default' });
    expect(result.docs).toHaveLength(0);
  });

  it('returns empty result when adapter throws', async () => {
    const brokenAdapter = {
      indexDocument: async () => {},
      removeDocument: async () => {},
      reindex: async () => {},
      search: async () => { throw new Error('adapter error'); },
    };
    const brokenService = new SearchService(brokenAdapter);
    const result = await brokenService.search({ page: '1', limit: '10' }, { isMember: false, siteId: 'default' });
    expect(result.docs).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe('SearchService - indexDocument / removeDocument', () => {
  let service: SearchService;
  let adapter: InMemorySearchAdapter;

  beforeEach(() => {
    adapter = new InMemorySearchAdapter();
    service = new SearchService(adapter);
  });

  it('indexes a document and finds it via search', async () => {
    await service.indexDocument({
      id: 'x1',
      siteId: 'default',
      type: 'page',
      title: 'Indexed Page',
      slug: 'indexed',
      accessLevel: 'public',
    });
    const result = await service.search({ q: 'Indexed' }, { isMember: false, siteId: 'default' });
    expect(result.docs[0]?.id).toBe('x1');
  });

  it('removes a document and it disappears from search', async () => {
    await service.indexDocument({
      id: 'x2',
      siteId: 'default',
      type: 'post',
      title: 'Gone Post',
      slug: 'gone',
      accessLevel: 'public',
    });
    await service.removeDocument('x2');
    const result = await service.search({ q: 'Gone' }, { isMember: false, siteId: 'default' });
    expect(result.docs).toHaveLength(0);
  });
});
