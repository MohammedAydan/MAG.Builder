import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import { listAvailablePlugins, normalizePluginError } from '@/lib/plugins/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getDashboardUser();
    const result = await listAvailablePlugins(user);

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizePluginError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
