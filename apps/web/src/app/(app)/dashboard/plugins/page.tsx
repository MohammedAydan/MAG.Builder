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
          Manage installed plugins and their operational states.
        </p>
      </header>

      <div className="grid gap-6">
        {plugins.map((plugin) => (
          <SurfaceCard key={plugin.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-950 truncate">{plugin.id}</h2>
                <span className="text-xs font-medium text-slate-400">v{plugin.version}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  plugin.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {plugin.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{plugin.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {plugin.modules.map((mod) => (
                  <span
                    key={mod.id}
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold tracking-wider uppercase border ${
                      plugin.enabledModules.includes(mod.id)
                        ? 'border-sky-200 bg-sky-50 text-sky-700'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {mod.id}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:w-48 sm:shrink-0 sm:items-end">
              {plugin.pendingMigrationCount > 0 && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 border border-amber-100">
                  <p className="text-[10px] font-bold tracking-wider text-amber-700 uppercase">Action Required</p>
                  <p className="mt-0.5 text-xs text-amber-600 font-medium">
                    {plugin.pendingMigrationCount} pending migrations
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  disabled
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
                >
                  Configure
                </button>
              </div>
              <p className="text-[10px] text-slate-400 italic">Manage state via Content Studio</p>
            </div>
          </SurfaceCard>
        ))}

        {plugins.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No plugins found</p>
            <p className="mt-1 text-sm text-slate-500">Plugins will appear here once discovered in the registry.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
