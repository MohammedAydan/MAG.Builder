/**
 * Workflow action execution engine for NexPress forms.
 *
 * Workflow actions are server-only, typed, and allowlisted.
 * Supported v1 actions:
 *   - store: Persist the submission (handled by the route/service, not here).
 *   - email: Send email notification (stub in Phase 14).
 *   - webhook: POST payload to a configured URL (with SSRF protections).
 *
 * Public users cannot configure workflows.
 * Workflow failures do not leak secrets to clients.
 * Workflow execution records safe status/result metadata only.
 */

import type { ValidatedSubmission } from './validation';
import {
  executeEmailAction,
  stubEmailProvider,
  type EmailActionConfig,
  type EmailActionResult,
  type EmailProvider,
} from './email';
import { executeWebhookAction, type WebhookExecutionResult } from './webhook';

/** Allowlisted v1 workflow action types. */
export const WORKFLOW_ACTION_TYPES = ['email', 'webhook'] as const;

export type WorkflowActionType = (typeof WORKFLOW_ACTION_TYPES)[number];

export type EmailWorkflowAction = {
  config: EmailActionConfig;
  type: 'email';
};

export type WebhookWorkflowAction = {
  /** HTTPS webhook destination URL. Validated server-side. */
  url: string;
  type: 'webhook';
};

export type WorkflowAction = EmailWorkflowAction | WebhookWorkflowAction;

export type WorkflowActionResult = {
  action: WorkflowActionType;
  result: EmailActionResult | WebhookExecutionResult;
  /** Safe status summary only — no secrets, no full payloads. */
  status: 'failure' | 'success';
};

export type WorkflowExecutionResult = {
  formSlug: string;
  results: readonly WorkflowActionResult[];
  submittedAt: string;
};

/**
 * Execute a list of workflow actions for a validated form submission.
 *
 * - Action types are allowlisted.
 * - Failures are recorded as safe status metadata; secrets are never exposed.
 * - Email actions use the stub provider in Phase 14.
 * - Webhook actions validate URLs before executing.
 */
export async function executeWorkflowActions(
  formSlug: string,
  submission: ValidatedSubmission,
  actions: readonly WorkflowAction[],
  emailProvider: EmailProvider = stubEmailProvider,
): Promise<WorkflowExecutionResult> {
  const submittedAt = new Date().toISOString();
  const results: WorkflowActionResult[] = [];

  for (const action of actions) {
    if (action.type === 'email') {
      const result = await executeEmailAction(emailProvider, action.config, {
        formSlug,
        // Safe summary: field count only. No raw user values in email metadata.
        summary: `New submission received with ${Object.keys(submission.fields).length} field(s).`,
        submittedAt,
      });

      results.push({
        action: 'email',
        result,
        status: result.sent ? 'success' : 'failure',
      });
    } else if (action.type === 'webhook') {
      const result = await executeWebhookAction(action.url, {
        fields: submission.fields,
        formSlug,
        submittedAt,
      });

      results.push({
        action: 'webhook',
        result,
        status: result.success ? 'success' : 'failure',
      });
    }
    // Unknown action types are silently dropped — fail safe, no unknown execution
  }

  return { formSlug, results, submittedAt };
}
