import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import {
  listMarketplacePackages,
  normalizeMarketplaceError,
} from '@/lib/marketplace/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getDashboardUser();
    const result = await listMarketplacePackages(user);

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizeMarketplaceError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
