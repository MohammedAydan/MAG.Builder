import { describe, expect, it, vi } from 'vitest';
import { InProcessWebhookDeliveryQueue } from './queue';

describe('InProcessWebhookDeliveryQueue', () => {
  it('runs the handler and returns retry metadata', async () => {
    const handler = vi.fn(async () => undefined);
    const queue = new InProcessWebhookDeliveryQueue(handler);
    const result = await queue.enqueue({
      payload: {
        data: {
          formId: 'f1',
          submissionId: 's1',
        },
        event: 'form.submitted',
        id: '11111111-1111-1111-1111-111111111111',
        timestamp: '2026-05-15T00:00:00.000Z',
      },
      retry: {
        attempt: 1,
        backoffMs: 30000,
        maxAttempts: 3,
      },
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      accepted: true,
      mode: 'in-process',
      retry: {
        attempt: 1,
        backoffMs: 30000,
        maxAttempts: 3,
      },
    });
  });
});
