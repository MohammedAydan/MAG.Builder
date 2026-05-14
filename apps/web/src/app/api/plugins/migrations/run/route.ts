import { NextResponse } from 'next/server';
import { getDashboardUser } from '@/lib/dashboard/session';
import {
  normalizePluginError,
  parsePluginMigrationRunRequest,
  parsePluginRequestOrThrow,
  runPluginMigration,
} from '@/lib/plugins/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getDashboardUser();
    const input = parsePluginRequestOrThrow(
      parsePluginMigrationRunRequest(await request.json()),
    );
    const result = await runPluginMigration({
      ...(input.allowDestructive !== undefined
        ? { allowDestructive: input.allowDestructive }
        : {}),
      migrationId: input.migrationId,
      pluginId: input.pluginId,
      user,
    });

    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizePluginError(error);
    return NextResponse.json({ error: normalized.message }, { status: normalized.status });
  }
}
