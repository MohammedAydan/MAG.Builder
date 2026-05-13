import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const body = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${origin}/sitemap.xml`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
