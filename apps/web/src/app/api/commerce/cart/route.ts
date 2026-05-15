import { NextResponse } from 'next/server';
import { createCommerceCartForCurrentMember, getSafeCommerceErrorMessage } from '@/lib/commerce/service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
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
