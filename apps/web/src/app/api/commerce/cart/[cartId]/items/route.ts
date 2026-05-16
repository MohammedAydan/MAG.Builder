import { NextResponse } from 'next/server';
import { addItemToCommerceCart, getSafeCommerceErrorMessage } from '@/lib/commerce';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: Promise<{ cartId: string }> },
) {
  const { cartId } = await context.params;

  try {
    const browserPostError = validateBrowserPostRequest(request);

    if (browserPostError) {
      return NextResponse.json({ error: browserPostError }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const cart = await addItemToCommerceCart(cartId, body);
    return NextResponse.json({ cart });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
