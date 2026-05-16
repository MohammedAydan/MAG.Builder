import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';
import {
  applyThemeToSite,
  normalizeTemplateError,
} from '@/lib/templates/service';
import { z } from 'zod';

const applyThemeSchema = z.object({
  siteId: z.string(),
  themeId: z.string(),
});

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const browserPostError = validateBrowserPostRequest(request);

    if (browserPostError) {
      return NextResponse.json({ error: browserPostError }, { status: 403 });
    }

    const user = await getDashboardUser();
    const body = await request.json();
    const { siteId, themeId } = applyThemeSchema.parse(body);

    const result = await applyThemeToSite({
      siteId,
      themeId,
      user,
    });

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizeTemplateError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
