import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import {
  createMarketplacePlanForPackage,
  normalizeMarketplaceError,
  parseMarketplacePlanRequest,
  parseMarketplaceRequestOrThrow,
} from '@/lib/marketplace/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getDashboardUser();
    const body = await request.json();
    const input = parseMarketplaceRequestOrThrow(parseMarketplacePlanRequest(body));
    const result = await createMarketplacePlanForPackage({
      action: input.action,
      ...(input.channel ? { channel: input.channel } : {}),
      packageId: input.packageId,
      user,
    });

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizeMarketplaceError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
