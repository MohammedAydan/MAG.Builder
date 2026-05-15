import type { SearchAdapter, SearchDocument, SearchQuery, SearchResult } from './types';
import { SearchQuerySchema } from './types';

/**
 * SearchService wraps a SearchAdapter and enforces:
 *  - Input validation (Zod)
 *  - Access-level filtering (public vs members-only)
 *  - Fail-safe behaviour (returns empty result on adapter error)
 *
 * Access-level semantics:
 *  - Anonymous users (isMember = false) see only `accessLevel: 'public'` docs.
 *  - Authenticated members (isMember = true) see public AND members-only docs.
 *  - Admin users are handled server-side; this service is for public endpoints.
 */
export class SearchService {
  constructor(private readonly adapter: SearchAdapter) {}

  /**
   * Execute a search query with access-level enforcement.
   *
   * @param rawQuery - Unvalidated query input (from request params, etc.)
   * @param isMember - Whether the requesting user is an authenticated member
   * @returns A bounded, safe SearchResult
   */
  async search(rawQuery: Record<string, unknown>, isMember: boolean): Promise<SearchResult> {
    // Validate and parse the incoming query
    const parsed = SearchQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return { docs: [], total: 0, page: 1, limit: 10, hasNextPage: false };
    }

    const query: SearchQuery = parsed.data;

    let result: SearchResult;
    try {
      result = await this.adapter.search(query);
    } catch {
      // Fail safely: return empty result when adapter is unavailable
      return { docs: [], total: 0, page: query.page, limit: query.limit, hasNextPage: false };
    }

    // Enforce access-level filtering
    // Anonymous users only see public documents; members see all published docs
    const filteredDocs = isMember
      ? result.docs
      : result.docs.filter((doc) => doc.accessLevel === 'public');

    return {
      ...result,
      docs: filteredDocs,
      total: filteredDocs.length,
    };
  }

  /**
   * Index a published document.
   * Fails silently — search indexing must not block content publishing.
   */
  async indexDocument(doc: SearchDocument): Promise<void> {
    try {
      await this.adapter.indexDocument(doc);
    } catch {
      console.error('[search] Failed to index document:', doc.id);
    }
  }

  /**
   * Remove a document from the index (on unpublish/delete).
   * Fails silently.
   */
  async removeDocument(id: string): Promise<void> {
    try {
      await this.adapter.removeDocument(id);
    } catch {
      console.error('[search] Failed to remove document:', id);
    }
  }

  /**
   * Full reindex. Used for bootstrapping or reindex-on-demand.
   * Fails silently.
   */
  async reindex(docs: SearchDocument[]): Promise<void> {
    try {
      await this.adapter.reindex(docs);
    } catch {
      console.error('[search] Failed to reindex documents.');
    }
  }
}
