import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';
import {
  importStarterDemoTemplate,
  normalizeTemplateError,
} from '@/lib/templates/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const browserPostError = validateBrowserPostRequest(request);

    if (browserPostError) {
      return NextResponse.json({ error: browserPostError }, { status: 403 });
    }

    const user = await getDashboardUser();
    const result = await importStarterDemoTemplate(user);

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizeTemplateError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
