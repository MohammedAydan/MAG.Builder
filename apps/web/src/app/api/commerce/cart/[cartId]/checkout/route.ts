import { NextResponse } from 'next/server';
import { checkoutCommerceCart, getSafeCommerceErrorMessage } from '@/lib/commerce/service';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  context: { params: Promise<{ cartId: string }> },
) {
  const { cartId } = await context.params;

  try {
    const order = await checkoutCommerceCart(cartId);
    return NextResponse.json({ mode: 'test', order });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
