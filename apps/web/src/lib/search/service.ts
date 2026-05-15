/**
 * Server-only search service instance for the web app.
 *
 * Phase 29 defaults to a database-backed adapter that reads published content
 * from Payload. The in-memory adapter remains available as a development
 * fallback.
 */
import { InMemorySearchAdapter, SearchService } from '@nexpress/search';
import type { SearchDocument } from '@nexpress/search';
import { getPayload } from 'payload';
import { emitAnalyticsEvent, ANALYTICS_SCHEMA_VERSION } from '@/lib/analytics/service';
import configPromise from '@/payload.config';
import { DatabaseSearchAdapter } from '@/lib/search/database-adapter';
import { getRuntimeServicesConfig } from '@/lib/runtime-services/config';
import { DEFAULT_SITE_ID } from '@/lib/sites/model';
import { extractSiteRelationshipId } from '@/lib/sites/service';

function createSearchAdapter() {
  const config = getRuntimeServicesConfig();
  return config.search.provider === 'memory'
    ? new InMemorySearchAdapter()
    : new DatabaseSearchAdapter();
}

export const searchService = new SearchService(createSearchAdapter());

/**
 * Get the current search status and provider metadata for the dashboard.
 */
export async function getSearchStatus() {
  const adapterName = getRuntimeServicesConfig().search.provider;

  return {
    adapter: adapterName,
    healthy: true,
  };
}

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
    site?: number | string | { id: number | string } | null;
  },
  type: 'page' | 'post',
): SearchDocument | null {
  // Only index published documents
  if (record._status !== 'published') return null;
  if (!record.title || !record.slug) return null;

  return {
    id: String(record.id),
    siteId: String(extractSiteRelationshipId(record.site) ?? DEFAULT_SITE_ID),
    type,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt ?? undefined,
    publishedAt: record.publishedAt ?? undefined,
    accessLevel: record.accessLevel === 'members' || record.accessLevel === 'members-only' ? 'members-only' : 'public',
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
      await searchService.removeDocument({
        id: String(id),
        siteId: String(extractSiteRelationshipId((record as Parameters<typeof buildDocFromRecord>[0]).site) ?? DEFAULT_SITE_ID),
        type,
      });
    }
  } catch {
    console.error('[search] Failed to index content item:', id, type);
  }
}

/**
 * Remove a content item from the search index (on unpublish/delete).
 */
export async function removeContentFromIndex(
  id: string,
  type?: 'page' | 'post',
  siteId?: string,
): Promise<void> {
  if (type && siteId) {
    await searchService.removeDocument({
      id: String(id),
      siteId,
      type,
    });
    return;
  }

  const payload = await getPayload({ config: configPromise });
  const collections = ['pages', 'posts'] as const;

  for (const collection of collections) {
    try {
      const record = await payload.findByID({
        collection,
        id,
        overrideAccess: true,
        depth: 0,
      });
      const doc = buildDocFromRecord(
        record as Parameters<typeof buildDocFromRecord>[0],
        collection === 'pages' ? 'page' : 'post',
      );

      if (doc) {
        await searchService.removeDocument({
          id: doc.id,
          siteId: doc.siteId,
          type: doc.type,
        });
        return;
      }
    } catch {
      continue;
    }
  }
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
    await emitAnalyticsEvent({
      schemaVersion: ANALYTICS_SCHEMA_VERSION,
      name: 'search.reindexed',
      payload: {
        documentCount: docs.length,
      },
    });
  } catch {
    console.error('[search] Failed to reindex all content.');
  }
}
