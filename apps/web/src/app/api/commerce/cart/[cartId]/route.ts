import { NextResponse } from 'next/server';
import { getCommerceCart, getSafeCommerceErrorMessage } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ cartId: string }> },
) {
  const { cartId } = await context.params;

  try {
    const cart = await getCommerceCart(cartId);
    return NextResponse.json({ cart });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
