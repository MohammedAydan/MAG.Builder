import type { SearchAdapter, SearchDocument, SearchQuery, SearchResult } from '@nexpress/search';
import { getPayloadClient } from '@/lib/payload';
import { DEFAULT_SITE_ID } from '@/lib/sites/model';
import { extractSiteRelationshipId } from '@/lib/sites/service';

type SearchPayloadRecord = {
  _status?: string | null;
  accessLevel?: string | null;
  excerpt?: string | null;
  id: number | string;
  publishedAt?: string | null;
  site?: number | string | { id: number | string } | null;
  slug?: string | null;
  title?: string | null;
};

type SearchPayloadClient = {
  find: <T>(args: Record<string, unknown>) => Promise<{ docs: T[] }>;
};

function matchesQuery(doc: SearchDocument, query: SearchQuery) {
  const needle = query.q?.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return (
    doc.title.toLowerCase().includes(needle) ||
    doc.slug.toLowerCase().includes(needle) ||
    (doc.excerpt?.toLowerCase().includes(needle) ?? false)
  );
}

function toSearchDocument(
  record: SearchPayloadRecord,
  type: 'page' | 'post',
): SearchDocument | null {
  if (record._status !== 'published' || !record.title || !record.slug) {
    return null;
  }

  return {
    accessLevel:
      record.accessLevel === 'members' || record.accessLevel === 'members-only'
        ? 'members-only'
        : 'public',
    excerpt: record.excerpt ?? undefined,
    id: String(record.id),
    publishedAt: record.publishedAt ?? undefined,
    siteId: String(extractSiteRelationshipId(record.site) ?? DEFAULT_SITE_ID),
    slug: record.slug,
    title: record.title,
    type,
  };
}

async function getSearchPayload() {
  return (await getPayloadClient()) as unknown as SearchPayloadClient;
}

export class DatabaseSearchAdapter implements SearchAdapter {
  async indexDocument(doc: SearchDocument): Promise<void> {
    void doc;
  }

  async removeDocument(doc: Pick<SearchDocument, 'id' | 'siteId' | 'type'>): Promise<void> {
    void doc;
  }

  async reindex(docs: SearchDocument[]): Promise<void> {
    void docs;
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const payload = await getSearchPayload();
    const siteId = query.siteId;
    const collections = query.type ? [query.type] : (['page', 'post'] as const);

    const records = await Promise.all(
      collections.map(async (type) => {
        const collection = type === 'page' ? 'pages' : 'posts';
        const result = await payload.find<SearchPayloadRecord>({
          collection,
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          pagination: false,
          where: {
            _status: {
              equals: 'published',
            },
          },
        });

        return result.docs
          .map((record) => toSearchDocument(record, type))
          .filter((doc): doc is SearchDocument => Boolean(doc))
          .filter((doc) => !siteId || doc.siteId === siteId)
          .filter((doc) => matchesQuery(doc, query));
      }),
    );

    const docs = records
      .flat()
      .sort((left, right) => (right.publishedAt ?? '').localeCompare(left.publishedAt ?? ''));
    const total = docs.length;
    const start = (query.page - 1) * query.limit;
    const pageDocs = docs.slice(start, start + query.limit);

    return {
      docs: pageDocs,
      hasNextPage: start + pageDocs.length < total,
      limit: query.limit,
      page: query.page,
      total,
    };
  }
}
