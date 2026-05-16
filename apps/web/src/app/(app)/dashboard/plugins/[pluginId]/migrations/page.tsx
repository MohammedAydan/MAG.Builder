import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { getPlugin, planPluginMigrationsForPlugin } from '@/lib/plugins/service';
import { MigrationRunner } from './migration-runner';

interface MigrationsPageProps {
  params: Promise<{
    pluginId: string;
  }>;
}

export default async function PluginMigrationsPage({ params }: MigrationsPageProps) {
  const { pluginId } = await params;
  const user = await requireDashboardUser();
  const plugin = await getPlugin(pluginId, user);

  if (!plugin) {
    return notFound();
  }

  const migrationPlan = await planPluginMigrationsForPlugin({
    pluginId: plugin.id,
    user,
  });

  return (
    <div className="space-y-8">
      <nav>
        <Link 
          href={`/dashboard/plugins/${plugin.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <span>&larr;</span> Back to {plugin.id}
        </Link>
      </nav>

      <div className="max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Plugin Migrations</h1>
          <p className="mt-2 text-slate-500">
            Review and execute schema updates for <span className="font-semibold text-slate-900">{plugin.id}</span>.
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl bg-sky-50 p-6 border border-sky-100">
            <h3 className="text-sm font-bold text-sky-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white text-[10px]">i</span>
              Safe Migration Model
            </h3>
            <p className="mt-2 text-sm text-sky-800 leading-relaxed">
              NexPress migrations are versioned schema updates. &quot;Applied&quot; migrations are persisted in your plugin state.
              Pending migrations should be executed in order to ensure the plugin works correctly with the current platform version.
            </p>
          </section>

          <MigrationRunner 
            pluginId={plugin.id}
            initialPlan={migrationPlan}
          />
        </div>
      </div>
    </div>
  );
}
