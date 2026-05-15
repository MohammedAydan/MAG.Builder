/**
 * GET /api/search
 *
 * Public search endpoint. Returns safe projections of published content only.
 *
 * Access control:
 *  - Anonymous users: only public-access documents are returned.
 *  - Authenticated members: public + members-only documents are returned.
 *  - Draft content is never returned.
 *  - Admin/private data is never returned.
 *
 * Query parameters (all validated and bounded via SearchQuerySchema):
 *  - q: search query string (max 200 chars)
 *  - type: content type filter (page | post)
 *  - page: pagination page (default 1)
 *  - limit: results per page (max 50, default 10)
 */
import { NextRequest, NextResponse } from 'next/server';
import { ANALYTICS_SCHEMA_VERSION, emitAnalyticsEvent } from '@/lib/analytics/service';
import { searchService } from '@/lib/search/service';
import { resolveSiteFromHeaders } from '@/lib/sites/service';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const site = await resolveSiteFromHeaders(request.headers);

  if (!site) {
    return NextResponse.json({ error: 'Site not found.' }, { status: 404 });
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const rawQuery: Record<string, unknown> = {
    q: searchParams.get('q') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  };

  // Determine if the requesting user is an authenticated member
  // Members can see members-only content; anonymous users cannot
  let isMember = false;
  try {
    const payload = await getPayload({ config: configPromise });
    // Payload reads the session cookie/token from the request
    const { user } = await payload.auth({ headers: request.headers });
    isMember = user?.collection === 'members';
  } catch {
    // Auth failure is non-fatal for search; treat as anonymous
    isMember = false;
  }

  // Execute the search with access-level enforcement
  const result = await searchService.search(rawQuery, {
    isMember,
    siteId: site.siteId,
  });

  const query = typeof rawQuery.q === 'string' ? rawQuery.q.trim() : '';
  const looksSensitive = /@|\b\d{7,}\b/.test(query);

  if (query && !looksSensitive) {
    await emitAnalyticsEvent({
      schemaVersion: ANALYTICS_SCHEMA_VERSION,
      name: 'search.queried',
      meta: {
        siteId: site.siteId,
        siteSlug: site.slug,
      },
      payload: {
        query,
        resultsCount: result.total,
        ...(typeof rawQuery.type === 'string' ? { type: rawQuery.type } : {}),
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: result.docs,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
    },
  });
}
