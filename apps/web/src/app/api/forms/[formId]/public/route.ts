/**
 * GET /api/forms/[formId]/public
 *
 * Returns the public-safe projection of a form definition.
 * Only exposes fields needed for client-side rendering — no workflow actions,
 * no webhook URLs, no email recipients, no internal configuration.
 *
 * This route is public (no authentication required).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPublicFormDefinition } from '@/lib/forms/service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
): Promise<NextResponse> {
  try {
    const { formId } = await params;

    if (!formId || typeof formId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(formId)) {
      return NextResponse.json({ error: 'Invalid form id.' }, { status: 400 });
    }

    const form = await getPublicFormDefinition(formId);

    if (!form) {
      return NextResponse.json({ error: 'Form not found.' }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
