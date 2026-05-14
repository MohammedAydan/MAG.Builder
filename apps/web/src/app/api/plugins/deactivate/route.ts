import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import {
  deactivatePlugin,
  normalizePluginError,
  parsePluginDeactivationRequest,
  parsePluginRequestOrThrow,
} from '@/lib/plugins/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getDashboardUser();
    const input = parsePluginRequestOrThrow(
      parsePluginDeactivationRequest(await request.json()),
    );
    const result = await deactivatePlugin({
      pluginId: input.pluginId,
      user,
    });

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizePluginError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
