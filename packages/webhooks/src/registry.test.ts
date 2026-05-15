import { WebhookPayloadSchema, WebhookEventNames } from './registry';
import { describe, expect, it } from 'vitest';

describe('Webhook Registry', () => {
  it('validates a valid form.submitted payload', () => {
    const payload = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      event: 'form.submitted',
      timestamp: new Date().toISOString(),
      data: {
        formId: 'form_123',
        submissionId: 'sub_123',
      },
    };
    
    expect(WebhookPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects invalid payloads missing required fields', () => {
    const payload = {
      event: 'form.submitted',
      data: {
        formId: 'form_123',
      },
    };
    
    expect(WebhookPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it('rejects unknown events', () => {
    const payload = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      event: 'unknown.event',
      timestamp: new Date().toISOString(),
      data: {},
    };
    
    expect(WebhookPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it('contains expected event names', () => {
    expect(WebhookEventNames.options).toContain('form.submitted');
    expect(WebhookEventNames.options).toContain('order.created');
  });
});
