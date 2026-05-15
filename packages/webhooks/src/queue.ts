import type { WebhookPayload } from './registry';

export type WebhookDeliveryAttemptMetadata = {
  attempt: number;
  backoffMs: number;
  maxAttempts: number;
  nextAttemptAt?: string;
};

export type WebhookDeliveryJob = {
  payload: WebhookPayload;
  retry: WebhookDeliveryAttemptMetadata;
};

export type WebhookQueueResult = {
  accepted: true;
  mode: 'in-process' | 'queued';
  retry: WebhookDeliveryAttemptMetadata;
};

export interface WebhookDeliveryQueue {
  enqueue(job: WebhookDeliveryJob): Promise<WebhookQueueResult>;
}

export class InProcessWebhookDeliveryQueue implements WebhookDeliveryQueue {
  constructor(
    private readonly handler: (job: WebhookDeliveryJob) => Promise<void>,
  ) {}

  async enqueue(job: WebhookDeliveryJob): Promise<WebhookQueueResult> {
    await this.handler(job);
    return {
      accepted: true,
      mode: 'in-process',
      retry: job.retry,
    };
  }
}
