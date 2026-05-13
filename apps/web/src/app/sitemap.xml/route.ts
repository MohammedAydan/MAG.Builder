import type { NextRequest } from 'next/server';
import { getPublishedSitemapEntries } from '@/lib/content/public';

export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const entries = await getPublishedSitemapEntries();
  const urls = [
    {
      lastModified: null,
      path: '/',
    },
    ...entries,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (entry) => `  <url>\n    <loc>${escapeXml(`${origin}${entry.path}`)}</loc>${
        entry.lastModified ? `\n    <lastmod>${escapeXml(new Date(entry.lastModified).toISOString())}</lastmod>` : ''
      }\n  </url>`,
    )
    .join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
