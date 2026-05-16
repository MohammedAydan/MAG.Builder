import { requireDashboardUser } from '@/lib/dashboard/guards';
import { getSearchStatus } from '@/lib/search/service';
import { SurfaceCard } from '@/components/public/surface-card';
import { ReindexButton } from './reindex-button';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  await requireDashboardUser();
  const status = await getSearchStatus();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Search</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage platform search indexing and engine status.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <SurfaceCard className="flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Engine Status</p>
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${status.healthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <p className="text-lg font-bold text-slate-950">{status.healthy ? 'Healthy' : 'Degraded'}</p>
          </div>
          <p className="text-sm text-slate-500">
            Current provider: <span className="font-semibold text-slate-900 capitalize">{status.adapter}</span>
          </p>
        </SurfaceCard>

        <SurfaceCard className="flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Actions</p>
          <ReindexButton />
        </SurfaceCard>
      </div>

      <SurfaceCard tone="tinted" className="space-y-4">
        <h2 className="text-sm font-bold text-slate-950">Search Capabilities</h2>
        <ul className="space-y-3">
          {[
            { label: 'In-process Indexing', status: 'active' },
            { label: 'Database-backed Persistence', status: status.adapter === 'database' ? 'active' : 'inactive' },
            { label: 'Fuzzy Matching', status: 'active' },
            { label: 'Site Scoping', status: 'active' },
          ].map((cap) => (
            <li key={cap.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{cap.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                cap.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {cap.status}
              </span>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
