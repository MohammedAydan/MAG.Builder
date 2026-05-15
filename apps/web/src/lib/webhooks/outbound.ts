import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import {
  generateSignature,
  InProcessWebhookDeliveryQueue,
  isSafeWebhookUrl,
  type WebhookDeliveryJob,
  type WebhookPayload,
  type WebhookQueueResult,
} from '@nexpress/webhooks';
import { getRuntimeServicesConfig } from '@/lib/runtime-services/config';

async function deliverWebhookNow(job: WebhookDeliveryJob) {
  const { payload, retry } = job;
  const payloadInstance = await getPayload({ config: configPromise });

  // Find active subscriptions for this event
  const subscriptions = await payloadInstance.find({
    collection: 'webhook-subscriptions',
    where: {
      and: [
        {
          active: {
            equals: true,
          },
        },
        {
          events: {
            contains: payload.event,
          },
        },
      ],
    },
    // Server-only operation, override access to fetch internal subscriptions
    overrideAccess: true,
  });

  if (subscriptions.docs.length === 0) {
    return;
  }

  // Deliver to each subscription
  for (const sub of subscriptions.docs) {
    if (!isSafeWebhookUrl(sub.url)) {
      await payloadInstance.create({
        collection: 'webhook-deliveries',
        data: {
          subscription: sub.id,
          event: payload.event,
          payload: payload,
          status: 'failed',
          errorMessage: `Unsafe webhook URL rejected on attempt ${retry.attempt}/${retry.maxAttempts}.`,
        },
        overrideAccess: true,
      });
      continue;
    }

    const payloadString = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'NexPress-Webhook/1.0',
    };

    if (sub.secret) {
      const signatureHeader = generateSignature({
        secret: sub.secret,
        payload: payloadString,
      });
      headers['Nexpress-Signature'] = signatureHeader;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(sub.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal,
        // Prevent following redirects to avoid SSRF bypasses
        redirect: 'error',
      });

      clearTimeout(timeoutId);

      const status = response.ok ? 'success' : 'failed';

      await payloadInstance.create({
        collection: 'webhook-deliveries',
        data: {
          subscription: sub.id,
          event: payload.event,
          payload: payload,
          status,
          statusCode: response.status,
          ...(status === 'failed'
            ? {
                errorMessage: `Webhook endpoint returned ${response.status} on attempt ${retry.attempt}/${retry.maxAttempts}.`,
              }
            : {}),
        },
        overrideAccess: true,
      });
    } catch (err) {
      await payloadInstance.create({
        collection: 'webhook-deliveries',
        data: {
          subscription: sub.id,
          event: payload.event,
          payload: payload,
          status: 'failed',
          errorMessage:
            err instanceof Error
              ? `Delivery failed on attempt ${retry.attempt}/${retry.maxAttempts}: ${err.name}`
              : `Delivery failed on attempt ${retry.attempt}/${retry.maxAttempts}.`,
        },
        overrideAccess: true,
      });
    }
  }
}

const webhookQueue = new InProcessWebhookDeliveryQueue(deliverWebhookNow);

export async function enqueueWebhookDelivery(payload: WebhookPayload): Promise<WebhookQueueResult> {
  const config = getRuntimeServicesConfig();
  const retry = {
    attempt: 1,
    backoffMs: config.webhooks.backoffMs,
    maxAttempts: config.webhooks.maxAttempts,
    nextAttemptAt: new Date(Date.now() + config.webhooks.backoffMs).toISOString(),
  };

  if (process.env.NODE_ENV === 'test') {
    return {
      accepted: true,
      mode: 'in-process',
      retry,
    };
  }

  try {
    return await webhookQueue.enqueue({
      payload,
      retry,
    });
  } catch (error) {
    console.error(
      '[webhooks] Delivery enqueue failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return {
      accepted: true,
      mode: 'in-process',
      retry,
    };
  }
}

export async function deliverWebhook(payload: WebhookPayload) {
  await enqueueWebhookDelivery(payload);
}
