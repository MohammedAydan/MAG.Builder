import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@nexpress/webhooks';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

/**
 * Placeholder for inbound integration webhook validation.
 * In a real scenario, this endpoint processes events from Medusa, Stripe, etc.
 * For Phase 20, it verifies the signature against an integration configuration.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('nexpress-signature');
    const integrationName = req.nextUrl.searchParams.get('integration');

    if (!integrationName) {
      return NextResponse.json({ error: 'Missing integration name' }, { status: 400 });
    }

    const payloadInstance = await getPayload({ config: configPromise });

    // Fetch the integration configuration
    const integrations = await payloadInstance.find({
      collection: 'integrations',
      where: {
        and: [
          { name: { equals: integrationName } },
          { active: { equals: true } },
        ],
      },
      overrideAccess: true, // internal server action
    });

    if (!integrations || !integrations.docs || integrations.docs.length === 0) {
      return NextResponse.json({ error: 'Integration not found or inactive' }, { status: 404 });
    }

    const integration = integrations.docs[0];

    // In a real system, the secret would be stored securely, e.g. in a secrets manager or encrypted.
    // For Phase 20 we'll assume there is a `webhookSecret` in the JSON config.
    // (Never expose this config to the frontend!)
    const config = (integration?.config as { webhookSecret?: string } | undefined);
    const secret = config?.webhookSecret;

    if (!secret) {
      // If no secret is configured, we can either fail closed or open.
      // Failing closed is safer.
      return NextResponse.json({ error: 'Integration missing webhook secret' }, { status: 401 });
    }

    // Verify signature
    const isValid = verifySignature(signature, secret, rawBody);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature or stale request' }, { status: 401 });
    }

    // Attempt to parse JSON safely
    try {
      JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // For Phase 20: Just acknowledge the webhook safely.
    // In the future, this would push to a queue or process the event.

    return NextResponse.json({ success: true, message: 'Webhook verified and accepted' });

  } catch (err) {
    console.error('Inbound webhook error:', err);
    // Do not expose internal error details in response
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
