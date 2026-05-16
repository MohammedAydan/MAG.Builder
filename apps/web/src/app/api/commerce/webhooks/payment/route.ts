import { NextResponse } from 'next/server';
import { verifySignature } from '@nexpress/webhooks';
import { getSafeCommerceErrorMessage, processPaymentWebhook } from '@/lib/commerce/service';

export const dynamic = 'force-dynamic';

function getPaymentWebhookSecret() {
  const secret = process.env.NEXPRESS_COMMERCE_PAYMENT_WEBHOOK_SECRET?.trim();

  if (!secret) {
    throw new Error('Payment webhook secret is not configured.');
  }

  return secret;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('nexpress-signature');
    const secret = getPaymentWebhookSecret();

    if (!verifySignature(signature, secret, rawBody)) {
      return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as unknown;
    const result = await processPaymentWebhook(payload);
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
