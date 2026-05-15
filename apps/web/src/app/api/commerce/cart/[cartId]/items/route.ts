import { NextResponse } from 'next/server';
import { addItemToCommerceCart, getSafeCommerceErrorMessage } from '@/lib/commerce/service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  context: { params: Promise<{ cartId: string }> },
) {
  const { cartId } = await context.params;
  const body = await request.json().catch(() => ({}));

  try {
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
