import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function mapDashboardPathToAdmin(pathname: string): string {
  const routes: Array<[RegExp, (match: RegExpExecArray) => string]> = [
    [/^\/dashboard\/?$/, () => '/admin'],
    [/^\/dashboard\/pages\/?$/, () => '/admin/collections/pages'],
    [/^\/dashboard\/pages\/([^/]+)\/builder\/?$/, (m) => `/admin/collections/pages/${m[1]}`],
    [/^\/dashboard\/commerce\/orders\/?$/, () => '/admin/collections/commerce-orders'],
    [/^\/dashboard\/commerce\/customers\/?$/, () => '/admin/collections/commerce-customers'],
    [/^\/dashboard\/forms\/?$/, () => '/admin/collections/forms'],
    [/^\/dashboard\/integrations\/?$/, () => '/admin/collections/integrations'],
    [/^\/dashboard\/sites\/?$/, () => '/admin/collections/sites'],
    [/^\/dashboard\/webhooks\/?$/, () => '/admin/collections/webhook-subscriptions'],
    [/^\/dashboard\/automation\/?$/, () => '/admin/collections/automation-rules'],
    [/^\/dashboard\/search\/?$/, () => '/admin/collections/search-index'],
  ];

  for (const [pattern, resolver] of routes) {
    const match = pattern.exec(pathname);

    if (match) {
      return resolver(match);
    }
  }

  return '/admin';
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Preserve non-GET/HEAD methods for legacy action/route handlers until fully migrated.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return NextResponse.next();
  }

  const target = new URL(mapDashboardPathToAdmin(pathname), request.url);

  if (search) {
    target.search = search;
  }

  return NextResponse.redirect(target, 307);
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
