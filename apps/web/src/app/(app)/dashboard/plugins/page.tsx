import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listAvailablePlugins } from '@/lib/plugins/service';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

export default async function PluginsPage() {
  const user = await requireDashboardUser();
  const plugins = await listAvailablePlugins(user);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Plugins</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage local modules, activate features, and handle schema migrations.
        </p>
      </header>

      <div className="grid gap-6">
        {plugins.map((plugin) => (
          <SurfaceCard key={plugin.id} className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between hover:border-slate-300 transition-colors">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold">
                  {plugin.id.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950 truncate">{plugin.id}</h2>
                    <span className="text-xs font-medium text-slate-400">v{plugin.version}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      plugin.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {plugin.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {plugin.pendingMigrationCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                        {plugin.pendingMigrationCount} Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                {plugin.description}
              </p>
            </div>

            <div className="flex items-center gap-3 sm:shrink-0">
              <Link
                href={`/dashboard/plugins/${plugin.id}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                Manage
              </Link>
            </div>
          </SurfaceCard>
        ))}

        {plugins.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-slate-400 text-2xl">?</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">No plugins found</p>
            <p className="mt-1 text-sm text-slate-500">Discoverable plugins will appear here.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
