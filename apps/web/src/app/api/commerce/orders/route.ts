import { NextResponse } from 'next/server';
import { getSafeCommerceErrorMessage, listMemberOrders } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await listMemberOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
