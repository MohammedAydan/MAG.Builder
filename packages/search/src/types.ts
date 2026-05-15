import { z } from 'zod';

// ---------------------------------------------------------------------------
// Searchable document — safe projection only, no secrets or private data
// ---------------------------------------------------------------------------

/**
 * A searchable document is a safe public projection of published content.
 * It must never include:
 *  - passwords, secrets, tokens
 *  - private member data
 *  - audit log entries
 *  - form submission payloads
 *  - commerce customer/order PII
 *  - webhook secrets
 *  - installation state
 *  - plugin state internals
 */
export const SearchDocumentSchema = z.object({
  /** Stable document ID */
  id: z.string(),
  /** Stable site identifier used for tenant isolation */
  siteId: z.string(),
  /** Content type discriminator */
  type: z.enum(['page', 'post']),
  /** Display title */
  title: z.string(),
  /** URL slug */
  slug: z.string(),
  /** Short excerpt for search results (truncated, safe) */
  excerpt: z.string().optional(),
  /** ISO 8601 publish date */
  publishedAt: z.string().optional(),
  /**
   * Access level — public documents are visible to anonymous users;
   * members-only documents require member authentication.
   */
  accessLevel: z.enum(['public', 'members-only']).default('public'),
});

export type SearchDocument = z.infer<typeof SearchDocumentSchema>;

// ---------------------------------------------------------------------------
// Search query contract — allowlisted filters, bounded pagination
// ---------------------------------------------------------------------------

export const SEARCH_MAX_QUERY_LENGTH = 200;
export const SEARCH_MAX_LIMIT = 50;
export const SEARCH_DEFAULT_LIMIT = 10;
export const SEARCH_ALLOWED_TYPES = ['page', 'post'] as const;

export const SearchQuerySchema = z.object({
  /** Free-text search query — length limited to prevent abuse */
  q: z.string().max(SEARCH_MAX_QUERY_LENGTH).optional(),
  /** Filter by content type — allowlisted enum */
  type: z.enum(SEARCH_ALLOWED_TYPES).optional(),
  /**
   * Pagination page (1-indexed).
   * Limited server-side; unbounded pagination is not allowed.
   */
  page: z.coerce.number().int().min(1).default(1),
  /** Results per page — bounded to SEARCH_MAX_LIMIT */
  limit: z.coerce.number().int().min(1).max(SEARCH_MAX_LIMIT).default(SEARCH_DEFAULT_LIMIT),
  /** Internal site scoping hint used by persistent adapters. */
  siteId: z.string().max(128).optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export interface SearchAudienceContext {
  isMember: boolean;
  siteId: string;
}

// ---------------------------------------------------------------------------
// Search result
// ---------------------------------------------------------------------------

export interface SearchResult {
  docs: SearchDocument[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

// ---------------------------------------------------------------------------
// Search adapter interface — replaceable without changing callers
// ---------------------------------------------------------------------------

/**
 * SearchAdapter is the contractual boundary for all search implementations.
 * Phase 22 ships an in-memory adapter.  Future phases may substitute an
 * Algolia, Typesense, or pgvector adapter without changing the API surface.
 *
 * Production limitation (in-memory adapter):
 *  - Index is process-local and lost on restart.
 *  - Not suitable for multi-instance deployments.
 *  - Intended for development and single-instance use only.
 *  - Replace with a persistent external adapter for production at scale.
 */
export interface SearchAdapter {
  /**
   * Index or re-index a single document.
   * Called on content publish/update events.
   * Must not throw; failures should be logged and swallowed.
   */
  indexDocument(doc: SearchDocument): Promise<void>;

  /**
   * Remove a document from the index.
   * Called on content unpublish/delete events.
   */
  removeDocument(doc: Pick<SearchDocument, 'id' | 'siteId' | 'type'>): Promise<void>;

  /**
   * Execute a safe, bounded search query.
   * Access-level filtering is enforced by the caller (search service),
   * not the adapter itself.
   */
  search(query: SearchQuery): Promise<SearchResult>;

  /**
   * Replace the entire index (used for full reindex operations).
   * Must be idempotent.
   */
  reindex(docs: SearchDocument[]): Promise<void>;
}
