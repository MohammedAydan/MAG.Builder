import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import {
  activatePlugin,
  normalizePluginError,
  parsePluginActivationRequest,
  parsePluginRequestOrThrow,
} from '@/lib/plugins/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getDashboardUser();
    const input = parsePluginRequestOrThrow(
      parsePluginActivationRequest(await request.json()),
    );
    const result = await activatePlugin({
      ...(input.enabledModules ? { enabledModules: input.enabledModules } : {}),
      pluginId: input.pluginId,
      user,
    });

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizePluginError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
