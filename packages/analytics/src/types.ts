import { z } from 'zod';

// ---------------------------------------------------------------------------
// Analytics event schema — typed, versioned, allowlisted
// ---------------------------------------------------------------------------

/**
 * All analytics event names must be declared here.
 * Adding new event names requires updating this allowlist.
 *
 * Privacy rules:
 *  - No passwords, secrets, tokens, API keys
 *  - No raw form submission payloads
 *  - No card/payment data
 *  - No private member/admin data (email, phone, address)
 *  - IP addresses are omitted from events (minimization)
 *  - User agent length is bounded to 500 chars
 *  - Referrers are length-bounded and may be omitted
 */
export const ANALYTICS_EVENT_NAMES = [
  'page.viewed',
  'content.viewed',
  'content.published',
  'search.queried',
  'search.reindexed',
  'form.submitted',
  'member.registered',
  'member.logged_in',
  'commerce.product_viewed',
  'commerce.cart_updated',
  'commerce.order_created',
  'automation.executed',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const ANALYTICS_SCHEMA_VERSION = '1';

// ---------------------------------------------------------------------------
// Shared metadata embedded in every event (safe, bounded)
// ---------------------------------------------------------------------------

const SafeSessionMetaSchema = z.object({
  siteId: z.string().max(128).optional(),
  siteSlug: z.string().max(128).optional(),
  /**
   * Opaque session token — must be a non-identifying token, not a user ID.
   * Callers must hash or anonymize this before passing it in.
   */
  sessionId: z.string().max(128).optional(),
  /**
   * User agent string, length-limited to prevent abuse.
   * Never include sensitive headers.
   */
  userAgent: z.string().max(500).optional(),
  /**
   * Referrer URL, length-limited.
   * Must not contain query parameters with sensitive data.
   */
  referrer: z.string().max(500).optional(),
  /**
   * Page path (no query string if it may contain tokens/passwords).
   * Callers must strip sensitive query params before passing.
   */
  pagePath: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Per-event payload schemas
// ---------------------------------------------------------------------------

const PageViewedPayloadSchema = z.object({
  slug: z.string().max(200),
  title: z.string().max(500).optional(),
});

const ContentViewedPayloadSchema = z.object({
  contentType: z.enum(['page', 'post']),
  contentId: z.string().max(128),
  slug: z.string().max(200),
  accessLevel: z.enum(['public', 'members-only']).optional(),
});

const ContentPublishedPayloadSchema = z.object({
  contentType: z.enum(['page', 'post']),
  contentId: z.string().max(128),
  slug: z.string().max(200),
  title: z.string().max(500),
  accessLevel: z.enum(['public', 'members-only']).optional(),
});

const SearchQueriedPayloadSchema = z.object({
  /**
   * The search query — length limited.
   * Must not include search terms that are themselves PII (email, phone).
   * The caller is responsible for not forwarding PII queries.
   */
  query: z.string().max(200),
  resultsCount: z.number().int().min(0),
  type: z.string().max(50).optional(),
});

const SearchReindexedPayloadSchema = z.object({
  documentCount: z.number().int().min(0),
});

const FormSubmittedPayloadSchema = z.object({
  formId: z.string().max(128),
  formSlug: z.string().max(200).optional(),
  /**
   * Only the outcome (success/failure), never the submission data.
   */
  outcome: z.enum(['success', 'failure', 'rate_limited']),
});

const MemberRegisteredPayloadSchema = z.object({
  /**
   * A non-identifying member token — must NOT be the member's email or ID.
   * Pass an opaque token derived from the member identity if needed.
   */
  memberToken: z.string().max(128).optional(),
});

const MemberLoggedInPayloadSchema = z.object({
  memberToken: z.string().max(128).optional(),
});

const ProductViewedPayloadSchema = z.object({
  productHandle: z.string().max(200),
  productTitle: z.string().max(500).optional(),
});

const CartUpdatedPayloadSchema = z.object({
  action: z.enum(['add', 'remove', 'update']),
  variantId: z.string().max(128).optional(),
  quantity: z.number().int().min(0).optional(),
});

const OrderCreatedPayloadSchema = z.object({
  /**
   * Opaque order reference — not the full order object.
   * Must not include customer PII, payment data, or line-item prices.
   */
  orderRef: z.string().max(128),
  currency: z.string().max(10).optional(),
  itemCount: z.number().int().min(0).optional(),
});

const AutomationExecutedPayloadSchema = z.object({
  ruleId: z.string().max(128),
  status: z.string().max(50),
});

// ---------------------------------------------------------------------------
// Union event schema (typed discriminated union)
// ---------------------------------------------------------------------------

export const AnalyticsEventSchema = z.discriminatedUnion('name', [
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('page.viewed'),
    payload: PageViewedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('content.viewed'),
    payload: ContentViewedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('content.published'),
    payload: ContentPublishedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('search.queried'),
    payload: SearchQueriedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('search.reindexed'),
    payload: SearchReindexedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('form.submitted'),
    payload: FormSubmittedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('member.registered'),
    payload: MemberRegisteredPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('member.logged_in'),
    payload: MemberLoggedInPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('commerce.product_viewed'),
    payload: ProductViewedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('commerce.cart_updated'),
    payload: CartUpdatedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('commerce.order_created'),
    payload: OrderCreatedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
  z.object({
    schemaVersion: z.literal(ANALYTICS_SCHEMA_VERSION),
    name: z.literal('automation.executed'),
    payload: AutomationExecutedPayloadSchema,
    meta: SafeSessionMetaSchema.optional(),
  }),
]);

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// ---------------------------------------------------------------------------
// Stored analytics event (enriched with server-assigned timestamps)
// ---------------------------------------------------------------------------

export interface StoredAnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  schemaVersion: string;
  payload: Record<string, unknown>;
  meta: Record<string, unknown>;
  /** ISO 8601 timestamp assigned server-side */
  occurredAt: string;
}

export interface AnalyticsAggregateOptions {
  since?: string;
  siteId?: string;
}

// ---------------------------------------------------------------------------
// Analytics adapter interface — replaceable
// ---------------------------------------------------------------------------

/**
 * AnalyticsAdapter is the contractual boundary for analytics storage.
 * Phase 22 ships an in-memory/no-op adapter.  Future phases may use
 * PostHog, Plausible, or a custom DB table without changing callers.
 *
 * Production limitation (no-op adapter):
 *  - Events are not persisted between restarts.
 *  - Aggregate queries return empty data.
 *  - Replace with a persistent adapter for production.
 */
export interface AnalyticsAdapter {
  /** Capture a validated event. Must not throw. */
  capture(event: StoredAnalyticsEvent): Promise<void>;

  /**
   * Get aggregated event counts by name.
   * Admin-only. Must never return raw event data.
   */
  getAggregateCounts(options?: AnalyticsAggregateOptions): Promise<Record<string, number>>;
}

// ---------------------------------------------------------------------------
// Sensitive field detection — used by server-side validation
// ---------------------------------------------------------------------------

const SENSITIVE_FIELD_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /auth/i,
  /credit[_-]?card/i,
  /card[_-]?number/i,
  /cvv/i,
  /ssn/i,
  /social[_-]?security/i,
  /webhook[_-]?secret/i,
  /payload[_-]?secret/i,
  /database[_-]?url/i,
];

/**
 * Detect if an object contains any sensitive keys.
 * Used to reject events that may inadvertently carry secrets.
 */
export function hasSensitiveFields(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).some((key) =>
    SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key)),
  );
}
