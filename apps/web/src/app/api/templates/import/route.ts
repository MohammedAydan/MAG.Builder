import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import {
  importTemplateManifest,
  normalizeTemplateError,
  parseTemplateImportRequest,
  parseTemplateRequestOrThrow,
} from '@/lib/templates/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getDashboardUser();
    const input = parseTemplateRequestOrThrow(parseTemplateImportRequest(await request.json()));
    const result = await importTemplateManifest({
      manifest: input.manifest,
      user,
    });

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizeTemplateError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
