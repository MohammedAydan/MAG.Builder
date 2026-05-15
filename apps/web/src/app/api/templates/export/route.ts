import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import { validateBrowserPostRequest } from '@/lib/security/browser-post';
import {
  exportTemplateManifest,
  normalizeTemplateError,
  parseTemplateExportRequest,
  parseTemplateRequestOrThrow,
} from '@/lib/templates/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const browserPostError = validateBrowserPostRequest(request);

    if (browserPostError) {
      return NextResponse.json({ error: browserPostError }, { status: 403 });
    }

    const user = await getDashboardUser();
    const input = parseTemplateRequestOrThrow(parseTemplateExportRequest(await request.json()));
    const manifest = await exportTemplateManifest({
      ...input,
      user,
    });

    return NextResponse.json(manifest);
  } catch (error) {
    const normalized = normalizeTemplateError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
