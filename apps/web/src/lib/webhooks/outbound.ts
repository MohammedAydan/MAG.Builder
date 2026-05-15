import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { generateSignature, isSafeWebhookUrl, type WebhookPayload } from '@nexpress/webhooks';

/**
 * Deliver a webhook payload to active subscriptions matching the event.
 * Note: In a production environment, this should queue the job (e.g. using bullmq or pg-boss).
 * For Phase 20, this is a synchronous delivery foundation.
 */
export async function deliverWebhook(payload: WebhookPayload) {
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
          errorMessage: 'Unsafe webhook URL rejected',
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
      // Truncate response body to avoid storing massive payloads
      const rawBody = await response.text().catch(() => '');
      const responseBody = rawBody.length > 1000 ? rawBody.substring(0, 1000) + '...' : rawBody;

      await payloadInstance.create({
        collection: 'webhook-deliveries',
        data: {
          subscription: sub.id,
          event: payload.event,
          payload: payload,
          status,
          statusCode: response.status,
          responseBody,
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
          errorMessage: err instanceof Error ? err.message : 'Unknown network error',
        },
        overrideAccess: true,
      });
    }
  }
}
