import type {
  AutomationRule,
  AutomationTriggerPayload,
  AutomationActionResult,
  AutomationExecutionResult,
  AutomationActionConfig,
} from './types';
import { AutomationTriggerPayloadSchema } from './types';

// ---------------------------------------------------------------------------
// Action handler function type
// ---------------------------------------------------------------------------

export type ActionHandler = (
  config: AutomationActionConfig,
  triggerPayload: AutomationTriggerPayload,
) => Promise<AutomationActionResult>;

// ---------------------------------------------------------------------------
// AutomationEngine — executes allowlisted rules safely
// ---------------------------------------------------------------------------

/**
 * AutomationEngine runs automation rules on a fire-and-forget basis.
 *
 * Security properties:
 *  - No arbitrary code execution
 *  - No direct DB/filesystem/env access
 *  - No RBAC bypass
 *  - Action handlers are registered at startup (not runtime-user-defined)
 *  - Trigger payloads are fully validated before execution
 *  - Execution results contain only safe status metadata
 *
 * PRODUCTION LIMITATION:
 *  - Execution is synchronous and in-process.
 *  - No retry or backoff.
 *  - For production reliability, replace with a job queue (Phase 25+).
 */
export class AutomationEngine {
  private actionHandlers: Map<string, ActionHandler> = new Map();

  /**
   * Register a handler for an allowlisted action name.
   * Handlers are server-only and registered at app startup.
   */
  registerActionHandler(actionName: string, handler: ActionHandler): void {
    this.actionHandlers.set(actionName, handler);
  }

  /**
   * Execute a rule in response to a trigger event.
   *
   * @param rule - The automation rule to execute
   * @param rawTriggerPayload - Unvalidated trigger payload input
   * @returns Execution result with safe status metadata
   */
  async execute(
    rule: AutomationRule,
    rawTriggerPayload: unknown,
  ): Promise<AutomationExecutionResult> {
    // Step 1: Validate trigger payload
    const parsed = AutomationTriggerPayloadSchema.safeParse(rawTriggerPayload);
    if (!parsed.success) {
      return {
        ruleId: rule.id,
        trigger: rule.trigger,
        executedAt: new Date().toISOString(),
        results: [],
        overallStatus: 'failure',
      };
    }

    // Step 2: Verify trigger matches rule expectation
    if (parsed.data.trigger !== rule.trigger) {
      return {
        ruleId: rule.id,
        trigger: rule.trigger,
        executedAt: new Date().toISOString(),
        results: [],
        overallStatus: 'failure',
      };
    }

    // Step 3: Skip disabled rules
    if (!rule.enabled) {
      return {
        ruleId: rule.id,
        trigger: rule.trigger,
        executedAt: new Date().toISOString(),
        results: rule.actions.map((a) => ({
          action: a.action,
          status: 'skipped' as const,
          message: 'Rule is disabled',
        })),
        overallStatus: 'success',
      };
    }

    // Step 4: Execute each action in order
    const results: AutomationActionResult[] = [];
    for (const actionConfig of rule.actions) {
      const handler = this.actionHandlers.get(actionConfig.action);
      if (!handler) {
        results.push({
          action: actionConfig.action,
          status: 'skipped',
          message: `No handler registered for action: ${actionConfig.action}`,
        });
        continue;
      }

      try {
        const result = await handler(actionConfig, parsed.data);
        results.push(result);
      } catch {
        // Fail safely — never expose internal error details
        results.push({
          action: actionConfig.action,
          status: 'failure',
          message: 'Action failed unexpectedly',
        });
      }
    }

    // Step 5: Compute overall status
    const hasSuccess = results.some((r) => r.status === 'success');
    const hasFailure = results.some((r) => r.status === 'failure');
    const overallStatus = hasFailure && hasSuccess
      ? 'partial'
      : hasFailure
        ? 'failure'
        : 'success';

    return {
      ruleId: rule.id,
      trigger: rule.trigger,
      executedAt: new Date().toISOString(),
      results,
      overallStatus,
    };
  }
}

export const defaultAutomationEngine = new AutomationEngine();
