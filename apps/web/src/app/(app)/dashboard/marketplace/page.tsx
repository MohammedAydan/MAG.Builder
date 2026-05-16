import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listMarketplacePackages } from '@/lib/marketplace/service';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

export default async function MarketplacePage() {
  const user = await requireDashboardUser();
  const packages = await listMarketplacePackages(user);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Marketplace</h1>
        <p className="mt-2 text-sm text-slate-500">
          Discover and manage ecosystem modules for your NexPress platform.
        </p>
      </header>

      <section className="rounded-2xl bg-sky-50 p-4 border border-sky-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-lg">!</div>
          <div>
            <p className="text-sm font-semibold text-sky-900">Dry-run Preview</p>
            <p className="text-xs text-sky-700 leading-5">
              The marketplace currently operates in dry-run mode. Package installation and updates are simulated and do not execute filesystem changes in this phase.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <SurfaceCard key={pkg.id} className="flex flex-col h-full hover:border-slate-300 transition-colors">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 text-xl font-bold">
                  {pkg.name.slice(0, 1)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {pkg.installed && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                      Installed
                    </span>
                  )}
                  {pkg.enabled === true && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                      Active
                    </span>
                  )}
                </div>
              </div>
              
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{pkg.name}</h2>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {pkg.installed ? `Installed: v${pkg.installedVersion}` : `Latest: v${pkg.latestVersion}`}
              </p>
              <p className="mt-3 text-sm text-slate-500 line-clamp-3 leading-relaxed">
                {pkg.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Type</span>
                <span className="text-xs font-semibold text-slate-700 capitalize">{pkg.type}</span>
              </div>
              <Link
                href={`/dashboard/marketplace/${pkg.id}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                {pkg.installed ? 'Manage' : 'View Details'}
              </Link>
            </div>
          </SurfaceCard>
        ))}

        {packages.length === 0 && (
          <div className="col-span-full">
            <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <span className="text-slate-400 text-2xl">?</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">No packages found</p>
              <p className="mt-1 text-sm text-slate-500">The marketplace catalog is currently empty.</p>
            </SurfaceCard>
          </div>
        )}
      </div>
    </div>
  );
}
