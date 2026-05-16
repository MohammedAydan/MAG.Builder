import { NextResponse } from 'next/server';
import { createCommerceCartForCurrentMember, getSafeCommerceErrorMessage } from '@/lib/commerce';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const browserPostError = validateBrowserPostRequest(request);

    if (browserPostError) {
      return NextResponse.json({ error: browserPostError }, { status: 403 });
    }

    const cart = await createCommerceCartForCurrentMember();
    return NextResponse.json({ cart }, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
