import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { getMarketplacePackage } from '@/lib/marketplace/service';
import { SurfaceCard } from '@/components/public/surface-card';
import { MarketplacePlanCreator } from './plan-creator';

interface PackagePageProps {
  params: Promise<{
    packageId: string;
  }>;
}

export default async function MarketplacePackagePage({ params }: PackagePageProps) {
  const { packageId } = await params;
  const user = await requireDashboardUser();
  const pkg = await getMarketplacePackage(packageId, user);

  if (!pkg) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <nav>
        <Link 
          href="/dashboard/marketplace" 
          className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
        >
          <span>&larr;</span> Back to Marketplace
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <header className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 text-2xl font-bold">
                {pkg.name.slice(0, 1)}
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">{pkg.name}</h1>
                <p className="text-slate-500 font-medium">ID: {pkg.id}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
                {pkg.type}
              </span>
              {pkg.installed && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Installed (v{pkg.installedVersion})
                </span>
              )}
              {pkg.enabled === true && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-950">Description</h2>
            <p className="text-slate-600 leading-relaxed max-w-2xl">
              {pkg.description}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-950">Available Channels</h2>
            <div className="flex gap-4">
              {pkg.channels.map((channel) => (
                <div key={channel} className="flex flex-col p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex-1">
                  <span className="text-sm font-bold text-slate-900 capitalize">{channel}</span>
                  <span className="text-xs text-slate-500 mt-1">
                    {channel === 'stable' ? 'Recommended for production sites.' : 'For testing and early feedback.'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-amber-50 p-6 border border-amber-100">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px]">!</span>
              Security & Installation Model
            </h3>
            <p className="mt-2 text-sm text-amber-800 leading-relaxed">
              NexPress uses a safe build-time plugin model. In this preview phase, the marketplace only supports generating "Dry-run Plans". 
              These plans simulate the changes needed but do not execute any filesystem operations or runtime code loading.
            </p>
          </section>
        </div>

        <aside className="w-full lg:w-96">
          <MarketplacePlanCreator 
            packageId={pkg.id} 
            installed={pkg.installed} 
            enabled={pkg.enabled} 
            channels={pkg.channels}
          />
        </aside>
      </div>
    </div>
  );
}
