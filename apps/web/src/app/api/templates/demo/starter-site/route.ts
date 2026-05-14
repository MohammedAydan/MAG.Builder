import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import {
  importStarterDemoTemplate,
  normalizeTemplateError,
} from '@/lib/templates/service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const user = await getDashboardUser();
    const result = await importStarterDemoTemplate(user);

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizeTemplateError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
