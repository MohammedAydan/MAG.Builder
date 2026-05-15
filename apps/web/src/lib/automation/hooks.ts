/**
 * Server-only automation hooks wired to the AutomationEngine.
 *
 * Phase 22 implements synchronous, in-process automation only.
 *
 * PRODUCTION LIMITATION:
 *  - No background queue or scheduler.
 *  - Actions run synchronously in the same request/hook.
 *  - For reliability at scale, route through a job queue (Phase 25+).
 *
 * Action handlers registered here:
 *  - analytics.emit_event → delegates to analyticsService.capture
 *  - search.enqueue_reindex → delegates to indexContentItem
 */
import { AutomationEngine, AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS } from '@nexpress/automation';
import type { AutomationRule, AutomationTriggerPayload } from '@nexpress/automation';
import { analyticsService } from '@/lib/analytics/service';
import { ANALYTICS_SCHEMA_VERSION } from '@nexpress/analytics';
import { indexContentItem, removeContentFromIndex } from '@/lib/search/service';
import { writeAuditEntry } from '@/lib/audit/service';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export const automationEngine = new AutomationEngine();

// ---------------------------------------------------------------------------
// Register action handlers
// ---------------------------------------------------------------------------

/**
 * analytics.emit_event — emits a typed analytics event.
 * Does not bypass RBAC, does not access env/secrets/DB directly.
 */
automationEngine.registerActionHandler('analytics.emit_event', async (config, triggerPayload) => {
  if (config.action !== 'analytics.emit_event') {
    return { action: config.action, status: 'failure', message: 'Unexpected action type' };
  }

  // Map trigger payload to an analytics event — safe projection only
  const eventName = config.eventName;
  const payload = buildAnalyticsPayloadFromTrigger(eventName, triggerPayload);

  if (!payload) {
    return { action: config.action, status: 'skipped', message: 'No payload mapping for trigger' };
  }

  const accepted = await analyticsService.capture({
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    name: eventName as 'form.submitted' | 'content.viewed' | 'commerce.order_created',
    payload: payload as Parameters<typeof analyticsService.capture>[0] extends { payload: infer P } ? P : never,
  });

  return {
    action: config.action,
    status: accepted ? 'success' : 'failure',
    message: accepted ? 'Event emitted' : 'Event rejected by analytics service',
  };
});

/**
 * search.enqueue_reindex — triggers a search index update for a content item.
 * Only works for content.published and content.unpublished triggers.
 */
automationEngine.registerActionHandler('search.enqueue_reindex', async (config, triggerPayload) => {
  if (config.action !== 'search.enqueue_reindex') {
    return { action: config.action, status: 'failure', message: 'Unexpected action type' };
  }

  if (triggerPayload.trigger === 'content.published') {
    await indexContentItem(
      triggerPayload.payload.contentId,
      triggerPayload.payload.contentType,
    );
    return { action: config.action, status: 'success', message: 'Index updated' };
  }

  if (triggerPayload.trigger === 'content.unpublished') {
    await removeContentFromIndex(triggerPayload.payload.contentId);
    return { action: config.action, status: 'success', message: 'Document removed from index' };
  }

  return {
    action: config.action,
    status: 'skipped',
    message: 'search.enqueue_reindex only applies to content triggers',
  };
});

// ---------------------------------------------------------------------------
// Hook entry points — called from API routes / Payload hooks
// ---------------------------------------------------------------------------

/**
 * Fire all matching enabled rules for a given trigger.
 * Writes audit entries for execution.
 * Fails silently — must never block application flow.
 */
export async function fireAutomationTrigger(
  triggerPayload: AutomationTriggerPayload,
): Promise<void> {
  try {
    // Load active rules from the in-memory default registry for Phase 22.
    // A real implementation would load from the Payload automation-rules collection.
    const rules = getDefaultRules(triggerPayload.trigger);

    for (const rule of rules) {
      try {
        const result = await automationEngine.execute(rule, triggerPayload);

        // Audit automation execution (non-blocking)
        try {
          const payload = await getPayload({ config: configPromise });
          await writeAuditEntry(payload, {
            action: 'automation.rule.executed',
            actor: { source: 'system' },
            result: result.overallStatus === 'failure' ? 'failure' : 'success',
            metadata: {
              ruleId: result.ruleId,
              trigger: result.trigger,
              overallStatus: result.overallStatus,
              actionCount: result.results.length,
            },
          });
        } catch {
          // Audit is fail-open
        }
      } catch {
        // Individual rule failures do not block other rules
      }
    }
  } catch {
    console.error('[automation] Failed to fire trigger:', triggerPayload.trigger);
  }
}

// ---------------------------------------------------------------------------
// Built-in rules (Phase 22 — no Payload collection yet for rule persistence)
// ---------------------------------------------------------------------------

/**
 * Default built-in automation rules for Phase 22.
 * These are static; a future phase will load rules from the
 * automation-rules Payload collection.
 *
 * PRODUCTION LIMITATION:
 *  - Rules are hard-coded; no admin UI for rule management yet.
 *  - Persisted rule management is deferred to a future phase.
 */
const BUILT_IN_RULES: AutomationRule[] = [
  {
    id: 'builtin-form-analytics',
    name: 'Emit analytics event on form submission',
    trigger: 'form.submitted',
    actions: [{ action: 'analytics.emit_event', eventName: 'form.submitted' }],
    enabled: true,
  },
  {
    id: 'builtin-content-search-index',
    name: 'Update search index on content publish',
    trigger: 'content.published',
    actions: [{ action: 'search.enqueue_reindex' }],
    enabled: true,
  },
  {
    id: 'builtin-content-unpublish-remove',
    name: 'Remove from search index on content unpublish',
    trigger: 'content.unpublished',
    actions: [{ action: 'search.enqueue_reindex' }],
    enabled: true,
  },
  {
    id: 'builtin-order-analytics',
    name: 'Emit analytics event on order created',
    trigger: 'commerce.order_created',
    actions: [{ action: 'analytics.emit_event', eventName: 'commerce.order_created' }],
    enabled: true,
  },
];

function getDefaultRules(trigger: string): AutomationRule[] {
  return BUILT_IN_RULES.filter((r) => r.trigger === trigger && r.enabled);
}

// ---------------------------------------------------------------------------
// Helper: map trigger payload to analytics event payload
// ---------------------------------------------------------------------------

function buildAnalyticsPayloadFromTrigger(
  eventName: string,
  triggerPayload: AutomationTriggerPayload,
): Record<string, unknown> | null {
  if (eventName === 'form.submitted' && triggerPayload.trigger === 'form.submitted') {
    return {
      formId: triggerPayload.payload.formId,
      formSlug: triggerPayload.payload.formSlug,
      outcome: triggerPayload.payload.outcome,
    };
  }

  if (eventName === 'content.viewed' && triggerPayload.trigger === 'content.published') {
    return {
      contentType: triggerPayload.payload.contentType,
      contentId: triggerPayload.payload.contentId,
      slug: triggerPayload.payload.slug,
    };
  }

  if (eventName === 'commerce.order_created' && triggerPayload.trigger === 'commerce.order_created') {
    return {
      orderRef: triggerPayload.payload.orderRef,
      currency: triggerPayload.payload.currency,
      itemCount: triggerPayload.payload.itemCount,
    };
  }

  return null;
}

// Re-export trigger/action constants for callers
export { AUTOMATION_TRIGGERS, AUTOMATION_ACTIONS };
