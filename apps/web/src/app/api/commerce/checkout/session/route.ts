import { NextResponse } from 'next/server';
import {
  createCheckoutSessionForCurrentMember,
  getSafeCommerceErrorMessage,
} from '@/lib/commerce';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const browserPostError = validateBrowserPostRequest(request);

    if (browserPostError) {
      return NextResponse.json({ error: browserPostError }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const idempotencyKey = request.headers.get('idempotency-key');
    const session = await createCheckoutSessionForCurrentMember(body, idempotencyKey);

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
