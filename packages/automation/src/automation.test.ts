import { describe, it, expect } from 'vitest';
import {
  AutomationTriggerPayloadSchema,
  AutomationRuleSchema,
  AUTOMATION_TRIGGERS,
  AUTOMATION_ACTIONS,
} from './types';
import { AutomationEngine } from './engine';
import type { AutomationRule } from './types';

// ---------------------------------------------------------------------------
// Type/schema validation tests
// ---------------------------------------------------------------------------

describe('AutomationTriggerPayloadSchema - valid payloads', () => {
  it('accepts form.submitted trigger', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'form.submitted',
      payload: { formId: 'f1', outcome: 'success' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts content.published trigger', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'content.published',
      payload: { contentType: 'page', contentId: 'p1', slug: 'home', title: 'Home' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts content.unpublished trigger', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'content.unpublished',
      payload: { contentType: 'post', contentId: 'p2' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts commerce.order_created trigger', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'commerce.order_created',
      payload: { orderRef: 'ord_abc', currency: 'USD', itemCount: 2 },
    });
    expect(result.success).toBe(true);
  });
});

describe('AutomationTriggerPayloadSchema - rejection of unsafe triggers', () => {
  it('rejects shell.exec trigger', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'shell.exec',
      payload: { command: 'rm -rf /' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects database.query trigger', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'database.query',
      payload: { sql: 'SELECT * FROM users' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects env.read trigger', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'env.read',
      payload: { key: 'PAYLOAD_SECRET' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required payload fields', () => {
    const result = AutomationTriggerPayloadSchema.safeParse({
      trigger: 'form.submitted',
      payload: {},
    });
    expect(result.success).toBe(false);
  });
});

describe('AutomationRuleSchema', () => {
  it('accepts a valid rule with analytics action', () => {
    const result = AutomationRuleSchema.safeParse({
      id: 'rule-1',
      name: 'Track form submissions',
      trigger: 'form.submitted',
      actions: [{ action: 'analytics.emit_event', eventName: 'form.submitted' }],
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid rule with search reindex action', () => {
    const result = AutomationRuleSchema.safeParse({
      id: 'rule-2',
      name: 'Reindex on publish',
      trigger: 'content.published',
      actions: [{ action: 'search.enqueue_reindex' }],
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a rule with forbidden action', () => {
    const result = AutomationRuleSchema.safeParse({
      id: 'rule-3',
      name: 'Bad rule',
      trigger: 'form.submitted',
      actions: [{ action: 'shell.exec', command: 'rm -rf /' }],
      enabled: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a rule with no actions', () => {
    const result = AutomationRuleSchema.safeParse({
      id: 'rule-4',
      name: 'Empty rule',
      trigger: 'form.submitted',
      actions: [],
      enabled: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a rule with forbidden trigger', () => {
    const result = AutomationRuleSchema.safeParse({
      id: 'rule-5',
      name: 'Bad trigger',
      trigger: 'payment.charge',
      actions: [{ action: 'analytics.emit_event', eventName: 'test' }],
      enabled: true,
    });
    expect(result.success).toBe(false);
  });
});

describe('AutomationEngine - execution', () => {
  const validRule: AutomationRule = {
    id: 'rule-1',
    name: 'Track form submissions',
    trigger: 'form.submitted',
    actions: [{ action: 'analytics.emit_event', eventName: 'form.submitted' }],
    enabled: true,
  };

  const validTriggerPayload = {
    trigger: 'form.submitted' as const,
    payload: { formId: 'f1', outcome: 'success' as const },
  };

  it('executes a valid rule and returns success', async () => {
    const engine = new AutomationEngine();
    engine.registerActionHandler('analytics.emit_event', async (config) => ({
      action: config.action,
      status: 'success',
      message: 'Event emitted',
    }));

    const result = await engine.execute(validRule, validTriggerPayload);
    expect(result.overallStatus).toBe('success');
    expect(result.results[0]?.status).toBe('success');
  });

  it('skips actions when rule is disabled', async () => {
    const engine = new AutomationEngine();
    const disabledRule: AutomationRule = { ...validRule, enabled: false };

    const result = await engine.execute(disabledRule, validTriggerPayload);
    expect(result.overallStatus).toBe('success');
    expect(result.results[0]?.status).toBe('skipped');
  });

  it('returns failure when trigger payload is invalid', async () => {
    const engine = new AutomationEngine();
    const result = await engine.execute(validRule, { trigger: 'shell.exec', payload: {} });
    expect(result.overallStatus).toBe('failure');
    expect(result.results).toHaveLength(0);
  });

  it('returns skipped when no handler is registered', async () => {
    const engine = new AutomationEngine();
    const result = await engine.execute(validRule, validTriggerPayload);
    expect(result.results[0]?.status).toBe('skipped');
  });

  it('handles action handler throwing without leaking details', async () => {
    const engine = new AutomationEngine();
    engine.registerActionHandler('analytics.emit_event', async () => {
      throw new Error('Internal DB connection lost — secret_key=abc');
    });

    const result = await engine.execute(validRule, validTriggerPayload);
    expect(result.results[0]?.status).toBe('failure');
    // Must not expose internal error message
    expect(result.results[0]?.message).not.toContain('secret_key');
    expect(result.results[0]?.message).toBe('Action failed unexpectedly');
  });

  it('correctly reports partial status when some actions succeed and some fail', async () => {
    const engine = new AutomationEngine();
    const mixedRule: AutomationRule = {
      id: 'mixed',
      name: 'Mixed',
      trigger: 'content.published',
      actions: [
        { action: 'analytics.emit_event', eventName: 'content.published' },
        { action: 'search.enqueue_reindex' },
      ],
      enabled: true,
    };

    engine.registerActionHandler('analytics.emit_event', async (config) => ({
      action: config.action,
      status: 'success',
    }));
    engine.registerActionHandler('search.enqueue_reindex', async () => {
      throw new Error('adapter unavailable');
    });

    const result = await engine.execute(mixedRule, {
      trigger: 'content.published',
      payload: { contentType: 'page', contentId: 'p1', slug: 'home', title: 'Home' },
    });

    expect(result.overallStatus).toBe('partial');
  });
});

// ---------------------------------------------------------------------------
// Allowlist integrity test
// ---------------------------------------------------------------------------

describe('Allowlist integrity', () => {
  it('AUTOMATION_TRIGGERS contains only expected values', () => {
    expect(AUTOMATION_TRIGGERS).toContain('form.submitted');
    expect(AUTOMATION_TRIGGERS).toContain('content.published');
    expect(AUTOMATION_TRIGGERS).not.toContain('shell.exec');
    expect(AUTOMATION_TRIGGERS).not.toContain('database.query');
  });

  it('AUTOMATION_ACTIONS contains only expected values', () => {
    expect(AUTOMATION_ACTIONS).toContain('analytics.emit_event');
    expect(AUTOMATION_ACTIONS).toContain('search.enqueue_reindex');
    expect(AUTOMATION_ACTIONS).not.toContain('shell.exec');
    expect(AUTOMATION_ACTIONS).not.toContain('payment.charge');
    expect(AUTOMATION_ACTIONS).not.toContain('code.eval');
  });
});
