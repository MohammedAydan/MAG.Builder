/**
 * Server-only search service instance for the web app.
 *
 * The singleton InMemorySearchAdapter is used in Phase 22.
 * Replace with a persistent adapter (Algolia, Typesense, pgfts, etc.)
 * by swapping the adapter argument here — callers do not change.
 *
 * PRODUCTION LIMITATION:
 *  - Index is process-local and lost on restart.
 *  - Not suitable for multi-instance deployments.
 */
import { SearchService, defaultSearchAdapter } from '@nexpress/search';
import type { SearchDocument } from '@nexpress/search';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export const searchService = new SearchService(defaultSearchAdapter);

// ---------------------------------------------------------------------------
// Indexing helpers — called from content hooks / automation
// ---------------------------------------------------------------------------

/**
 * Build a safe SearchDocument projection from a Payload page/post record.
 * Never includes secrets, IDs that could identify internal state,
 * or private member data.
 */
function buildDocFromRecord(
  record: {
    id: string | number;
    title?: string | null;
    slug?: string | null;
    excerpt?: string | null;
    publishedAt?: string | null;
    accessLevel?: string | null;
    _status?: string | null;
  },
  type: 'page' | 'post',
): SearchDocument | null {
  // Only index published documents
  if (record._status !== 'published') return null;
  if (!record.title || !record.slug) return null;

  return {
    id: String(record.id),
    type,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt ?? undefined,
    publishedAt: record.publishedAt ?? undefined,
    accessLevel: record.accessLevel === 'members-only' ? 'members-only' : 'public',
  };
}

/**
 * Index a single published page or post into the search index.
 * Called on content.published automation events.
 * Fails silently — must not block content publishing.
 */
export async function indexContentItem(
  id: string,
  type: 'page' | 'post',
): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise });
    const collection = type === 'page' ? 'pages' : 'posts';
    const record = await payload.findByID({
      collection,
      id,
      overrideAccess: true, // server-side indexer — already validated content is published
      depth: 0,
    });

    const doc = buildDocFromRecord(record as Parameters<typeof buildDocFromRecord>[0], type);
    if (doc) {
      await searchService.indexDocument(doc);
    } else {
      // Not published or missing required fields — remove from index
      await searchService.removeDocument(String(id));
    }
  } catch {
    console.error('[search] Failed to index content item:', id, type);
  }
}

/**
 * Remove a content item from the search index (on unpublish/delete).
 */
export async function removeContentFromIndex(id: string): Promise<void> {
  await searchService.removeDocument(id);
}

/**
 * Full reindex of all published pages and posts.
 * Admin-only operation.
 */
export async function reindexAllContent(): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise });

    const [pages, posts] = await Promise.all([
      payload.find({
        collection: 'pages',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        overrideAccess: true, // system reindex — all published content
        depth: 0,
      }),
      payload.find({
        collection: 'posts',
        where: { _status: { equals: 'published' } },
        limit: 1000,
        overrideAccess: true,
        depth: 0,
      }),
    ]);

    const docs: SearchDocument[] = [];
    for (const record of pages.docs) {
      const doc = buildDocFromRecord(record as Parameters<typeof buildDocFromRecord>[0], 'page');
      if (doc) docs.push(doc);
    }
    for (const record of posts.docs) {
      const doc = buildDocFromRecord(record as Parameters<typeof buildDocFromRecord>[0], 'post');
      if (doc) docs.push(doc);
    }

    await searchService.reindex(docs);
  } catch {
    console.error('[search] Failed to reindex all content.');
  }
}
