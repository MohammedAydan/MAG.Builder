import { z } from 'zod';

// ---------------------------------------------------------------------------
// Automation trigger allowlist
// ---------------------------------------------------------------------------

/**
 * Allowed automation triggers — explicit, bounded, and safe.
 *
 * Forbidden triggers (never add):
 *  - shell.exec, database.query, filesystem.*, http.fetch.arbitrary,
 *    payment.*, checkout.*, admin.role.grant, user.impersonate,
 *    plugin.install.remote, package.install, env.read, secrets.read, code.eval
 */
export const AUTOMATION_TRIGGERS = [
  'form.submitted',
  'content.published',
  'content.unpublished',
  'commerce.order_created',
] as const;

export type AutomationTrigger = (typeof AUTOMATION_TRIGGERS)[number];

// ---------------------------------------------------------------------------
// Automation action allowlist
// ---------------------------------------------------------------------------

/**
 * Allowed automation actions — explicit, bounded, and safe.
 *
 * Actions must:
 *  - Be server-side only
 *  - Not bypass RBAC
 *  - Not allow arbitrary code or HTTP
 *  - Not access env/secrets/filesystem/database directly
 *
 * Phase 22 implements synchronous/in-process execution only.
 *
 * PRODUCTION LIMITATION:
 *  - No background queue or scheduler.
 *  - Actions run synchronously in the same request/hook.
 *  - For reliability at scale, route through a job queue (Phase 25+).
 */
export const AUTOMATION_ACTIONS = [
  'analytics.emit_event',
  'search.enqueue_reindex',
] as const;

export type AutomationAction = (typeof AUTOMATION_ACTIONS)[number];

// ---------------------------------------------------------------------------
// Trigger payload schemas (validated, bounded)
// ---------------------------------------------------------------------------

export const FormSubmittedTriggerPayloadSchema = z.object({
  formId: z.string().max(128),
  formSlug: z.string().max(200).optional(),
  outcome: z.enum(['success', 'failure', 'rate_limited']),
  siteId: z.string().max(128).optional(),
  siteSlug: z.string().max(128).optional(),
});

export const ContentPublishedTriggerPayloadSchema = z.object({
  contentType: z.enum(['page', 'post']),
  contentId: z.string().max(128),
  slug: z.string().max(200),
  siteId: z.string().max(128).optional(),
  siteSlug: z.string().max(128).optional(),
  title: z.string().max(500),
  accessLevel: z.enum(['public', 'members-only']).optional(),
});

export const ContentUnpublishedTriggerPayloadSchema = z.object({
  contentType: z.enum(['page', 'post']),
  contentId: z.string().max(128),
  siteId: z.string().max(128).optional(),
});

export const CommerceOrderCreatedTriggerPayloadSchema = z.object({
  orderRef: z.string().max(128),
  currency: z.string().max(10).optional(),
  itemCount: z.number().int().min(0).optional(),
  siteId: z.string().max(128).optional(),
  siteSlug: z.string().max(128).optional(),
});

// Discriminated union for all trigger payloads
export const AutomationTriggerPayloadSchema = z.discriminatedUnion('trigger', [
  z.object({
    trigger: z.literal('form.submitted'),
    payload: FormSubmittedTriggerPayloadSchema,
  }),
  z.object({
    trigger: z.literal('content.published'),
    payload: ContentPublishedTriggerPayloadSchema,
  }),
  z.object({
    trigger: z.literal('content.unpublished'),
    payload: ContentUnpublishedTriggerPayloadSchema,
  }),
  z.object({
    trigger: z.literal('commerce.order_created'),
    payload: CommerceOrderCreatedTriggerPayloadSchema,
  }),
]);

export type AutomationTriggerPayload = z.infer<typeof AutomationTriggerPayloadSchema>;

// ---------------------------------------------------------------------------
// Action config schemas
// ---------------------------------------------------------------------------

export const AnalyticsEmitEventActionConfigSchema = z.object({
  action: z.literal('analytics.emit_event'),
  /** Must be a valid analytics event name; validated at execution time */
  eventName: z.string().max(100),
});

export const SearchEnqueueReindexActionConfigSchema = z.object({
  action: z.literal('search.enqueue_reindex'),
});

export const AutomationActionConfigSchema = z.discriminatedUnion('action', [
  AnalyticsEmitEventActionConfigSchema,
  SearchEnqueueReindexActionConfigSchema,
]);

export type AutomationActionConfig = z.infer<typeof AutomationActionConfigSchema>;

// ---------------------------------------------------------------------------
// Automation rule schema
// ---------------------------------------------------------------------------

export const AutomationRuleSchema = z.object({
  id: z.string().max(128),
  name: z.string().max(200),
  /** Trigger that fires this rule */
  trigger: z.enum(AUTOMATION_TRIGGERS),
  /** Actions to execute (ordered) */
  actions: z.array(AutomationActionConfigSchema).min(1).max(5),
  enabled: z.boolean().default(true),
});

export type AutomationRule = z.infer<typeof AutomationRuleSchema>;

// ---------------------------------------------------------------------------
// Execution result — safe metadata only; no secret leakage
// ---------------------------------------------------------------------------

export interface AutomationActionResult {
  action: AutomationAction;
  status: 'success' | 'failure' | 'skipped';
  /** Human-readable message — must not include secrets or sensitive data */
  message?: string;
}

export interface AutomationExecutionResult {
  ruleId: string;
  trigger: AutomationTrigger;
  executedAt: string;
  results: AutomationActionResult[];
  overallStatus: 'success' | 'partial' | 'failure';
}
