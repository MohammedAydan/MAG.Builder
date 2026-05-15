import { NextResponse } from 'next/server';
import { getSafeCommerceErrorMessage, listCatalogProducts } from '@/lib/commerce/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await listCatalogProducts();
    return NextResponse.json({ products });
  } catch (error) {
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { error: getSafeCommerceErrorMessage(error) },
      { status },
    );
  }
}
