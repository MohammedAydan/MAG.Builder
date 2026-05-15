import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

interface IntegrationRecord {
  active?: boolean | null;
  id: string | number;
  name: string;
  provider: string;
}

export default async function IntegrationsPage() {
  await requireDashboardUser();
  const payload = await getPayloadClient();

  const integrations = await payload.find({
    collection: 'integrations',
    depth: 0,
    limit: 100,
    sort: 'name',
  });

  const docs = integrations.docs as unknown as IntegrationRecord[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Integrations</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage third-party platform integrations and configurations.
        </p>
      </header>

      <div className="grid gap-6">
        {docs.map((integration) => (
          <SurfaceCard key={integration.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-950 truncate">{integration.name}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  integration.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {integration.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <p>Provider: <span className="font-semibold text-slate-900 capitalize">{integration.provider}</span></p>
                <p>ID: <code className="text-xs">{integration.id}</code></p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                disabled
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                Configure
              </button>
            </div>
          </SurfaceCard>
        ))}

        {docs.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No integrations found</p>
            <p className="mt-1 text-sm text-slate-500">Integrations will appear here once added via Payload Studio.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
