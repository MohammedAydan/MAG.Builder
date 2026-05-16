import { NextResponse } from 'next/server';
import { getCatalogProductByHandle, getSafeCommerceErrorMessage } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ handle: string }> },
) {
  const { handle } = await context.params;

  try {
    const product = await getCatalogProductByHandle(handle);
    return NextResponse.json({ product });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
