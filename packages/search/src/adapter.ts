import type { SearchAdapter, SearchDocument, SearchQuery, SearchResult } from './types';

/**
 * In-memory search adapter.
 *
 * Implements a simple case-insensitive substring match across title and excerpt.
 * Sufficient for development and single-process deployments.
 *
 * PRODUCTION LIMITATION:
 *  - Index is process-local and lost on restart.
 *  - Not suitable for multi-instance deployments.
 *  - For production at scale, replace with a persistent adapter
 *    (Algolia, Typesense, PostgreSQL full-text search, etc.).
 */
export class InMemorySearchAdapter implements SearchAdapter {
  private index: Map<string, SearchDocument> = new Map();

  private toIndexKey(doc: Pick<SearchDocument, 'id' | 'siteId' | 'type'>) {
    return `${doc.siteId}:${doc.type}:${doc.id}`;
  }

  async indexDocument(doc: SearchDocument): Promise<void> {
    this.index.set(this.toIndexKey(doc), doc);
  }

  async removeDocument(id: string): Promise<void> {
    for (const [key, doc] of this.index.entries()) {
      if (doc.id === id) {
        this.index.delete(key);
      }
    }
  }

  async reindex(docs: SearchDocument[]): Promise<void> {
    this.index.clear();
    for (const doc of docs) {
      this.index.set(this.toIndexKey(doc), doc);
    }
  }

  async search(query: SearchQuery): Promise<SearchResult> {
    const { q, type, page, limit } = query;

    let results: SearchDocument[] = Array.from(this.index.values());

    // Filter by content type (allowlisted)
    if (type) {
      results = results.filter((doc) => doc.type === type);
    }

    // Free-text filter: case-insensitive match against title and excerpt
    if (q && q.trim().length > 0) {
      const needle = q.trim().toLowerCase();
      results = results.filter(
        (doc) =>
          doc.title.toLowerCase().includes(needle) ||
          (doc.excerpt?.toLowerCase().includes(needle) ?? false),
      );
    }

    const total = results.length;
    const start = (page - 1) * limit;
    const docs = results.slice(start, start + limit);

    return {
      docs,
      total,
      page,
      limit,
      hasNextPage: start + docs.length < total,
    };
  }
}

/** Default singleton in-memory adapter used by the search service. */
export const defaultSearchAdapter: SearchAdapter = new InMemorySearchAdapter();
