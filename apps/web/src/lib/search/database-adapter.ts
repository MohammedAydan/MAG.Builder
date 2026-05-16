import type { SearchAdapter, SearchDocument, SearchQuery, SearchResult } from '@nexpress/search';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export class DatabaseSearchAdapter implements SearchAdapter {
  async indexDocument(doc: SearchDocument): Promise<void> {
    const payload = await getPayload({ config: configPromise });
    
    // Upsert the document into the search-index collection
    const existing = await payload.find({
      collection: 'search-index',
      where: {
        and: [
          { siteId: { equals: doc.siteId } },
          { type: { equals: doc.type } },
          { documentId: { equals: doc.id } },
        ],
      },
      limit: 1,
      overrideAccess: true,
      depth: 0,
    });

    if (existing.docs.length > 0 && existing.docs[0]) {
      await payload.update({
        collection: 'search-index',
        id: existing.docs[0].id,
        data: {
          title: doc.title,
          excerpt: doc.excerpt ?? null,
          slug: doc.slug,
          status: 'published',
          lastIndexedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: 'search-index',
        data: {
          siteId: doc.siteId as unknown as number, // Cast to proper siteId type (number | Site)
          type: doc.type,
          documentId: doc.id,
          title: doc.title,
          excerpt: doc.excerpt ?? null,
          slug: doc.slug,
          status: 'published',
          lastIndexedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      });
    }
  }

  async removeDocument(doc: Pick<SearchDocument, 'id' | 'siteId' | 'type'>): Promise<void> {
    const payload = await getPayload({ config: configPromise });
    await payload.delete({
      collection: 'search-index',
      where: {
        and: [
          { siteId: { equals: doc.siteId } },
          { type: { equals: doc.type } },
          { documentId: { equals: doc.id } },
        ],
      },
      overrideAccess: true,
    });
  }

  async reindex(docs: SearchDocument[]): Promise<void> {
    const payload = await getPayload({ config: configPromise });
    
    // For a full reindex, we might want to clear first or just batch upsert.
    // Given the scale, clearing for the specific types provided is safer.
    const types = Array.from(new Set(docs.map(d => d.type)));
    const siteIds = Array.from(new Set(docs.map(d => d.siteId)));

    if (types.length > 0 && siteIds.length > 0) {
      await payload.delete({
        collection: 'search-index',
        where: {
          and: [
            { siteId: { in: siteIds } },
            { type: { in: types } },
          ],
        },
        overrideAccess: true,
      });
    }

    // Batch create
    for (const doc of docs) {
      await this.indexDocument(doc);
    }
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const payload = await getPayload({ config: configPromise });
    
    const conditions: Record<string, unknown>[] = [];

    if (query.siteId) {
      conditions.push({ siteId: { equals: query.siteId } });
    }

    if (query.type) {
      conditions.push({ type: { equals: query.type } });
    }

    if (query.q) {
      conditions.push({
        or: [
          { title: { contains: query.q } },
          { excerpt: { contains: query.q } },
          { slug: { contains: query.q } },
        ],
      });
    }

    const result = await payload.find({
      collection: 'search-index',
      ...(conditions.length > 0 ? { where: { and: conditions as any } } : {}),
      limit: query.limit,
      page: query.page,
      overrideAccess: true,
      depth: 0,
      sort: '-lastIndexedAt',
    });

    return {
      docs: result.docs.map(d => ({
        id: d.documentId as string,
        siteId: String(typeof d.siteId === 'object' && d.siteId !== null ? d.siteId.id : d.siteId),
        type: d.type as 'page' | 'post',
        title: d.title as string,
        slug: d.slug as string,
        excerpt: d.excerpt as string | undefined,
        accessLevel: 'public', // Defaulting to public for index-based search for now
      })),
      total: result.totalDocs,
      page: result.page || 1,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
    };
  }
}
