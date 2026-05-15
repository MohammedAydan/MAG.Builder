/**
 * GET /api/analytics/summary
 *
 * Returns aggregated analytics event counts. Admin-only endpoint.
 *
 * Security:
 *  - Requires analytics:admin or analytics:read permission.
 *  - Never returns raw event data or PII.
 *  - Returns only aggregated counts by event name.
 */
import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics/service';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { hasPermission } from '@/lib/auth/access';
import type { AuthenticatedUserLike } from '@/lib/auth/access';
import { resolveSiteFromHeaders } from '@/lib/sites/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Enforce admin authentication
  let user: AuthenticatedUserLike | null = null;
  try {
    const payload = await getPayload({ config: configPromise });
    const auth = await payload.auth({ headers: request.headers });
    user = auth.user as AuthenticatedUserLike | null;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(user, 'analytics:read') && !hasPermission(user, 'analytics:admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Optional `since` param (ISO 8601 date)
  const since = request.nextUrl.searchParams.get('since') ?? undefined;
  const scope = request.nextUrl.searchParams.get('scope');
  const site = await resolveSiteFromHeaders(request.headers);

  if (!site && scope !== 'global') {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  const allowGlobal = scope === 'global' && hasPermission(user, 'analytics:admin');

  const counts = await analyticsService.getAggregateCounts({
    ...(since ? { since } : {}),
    ...(allowGlobal ? {} : site?.siteId ? { siteId: site.siteId } : {}),
  });

  return NextResponse.json({
    success: true,
    data: counts,
    meta: {
      scope: allowGlobal ? 'global' : 'site',
      since: since ?? null,
      siteId: allowGlobal ? null : site?.siteId ?? null,
    },
  });
}
