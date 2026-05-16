import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { getPlugin } from '@/lib/plugins/service';
import { PluginStateManager } from './state-manager';

interface PluginPageProps {
  params: Promise<{
    pluginId: string;
  }>;
}

export default async function PluginPage({ params }: PluginPageProps) {
  const { pluginId } = await params;
  const user = await requireDashboardUser();
  const plugin = await getPlugin(pluginId, user);

  if (!plugin) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <nav>
        <Link 
          href="/dashboard/plugins" 
          className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <span>&larr;</span> Back to Plugins
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 text-2xl font-bold">
                {plugin.id.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">{plugin.id}</h1>
                <p className="text-slate-500 font-medium">Version: {plugin.version}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                plugin.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {plugin.enabled ? 'Active' : 'Disabled'}
              </span>
              {plugin.pendingMigrationCount > 0 && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  {plugin.pendingMigrationCount} Pending Migrations
                </span>
              )}
            </div>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-950">About</h2>
            <p className="text-slate-600 leading-relaxed max-w-2xl text-lg">
              {plugin.description}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-950">Capabilities</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {plugin.capabilities.map((cap) => (
                <div key={cap} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                  <span className="text-sm font-medium text-slate-700">{cap}</span>
                </div>
              ))}
              {plugin.capabilities.length === 0 && (
                <p className="text-sm text-slate-400 italic">No declared capabilities.</p>
              )}
            </div>
          </section>

          {plugin.dependencies.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-950">Dependencies</h2>
              <div className="flex flex-wrap gap-2">
                {plugin.dependencies.map((dep) => (
                  <div key={dep.pluginId} className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white">
                    <span className="font-semibold text-slate-900">{dep.pluginId}</span>
                    <span className="text-slate-400 ml-2">{dep.versionRange || '*'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="w-full lg:w-96">
          <PluginStateManager 
            pluginId={plugin.id}
            initialEnabled={plugin.enabled}
            availableModules={plugin.modules}
            initialEnabledModules={plugin.enabledModules}
            pendingMigrationCount={plugin.pendingMigrationCount}
          />
        </aside>
      </div>
    </div>
  );
}
