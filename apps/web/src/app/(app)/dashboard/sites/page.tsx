import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

interface SiteRecord {
  domains?: {
    developmentOnly?: boolean | null;
    hostname?: string | null;
    primary?: boolean | null;
  }[] | null;
  id: string | number;
  isDefault?: boolean | null;
  name: string;
  siteId: string;
  slug: string;
  status?: string | null;
}

export default async function SitesPage() {
  await requireDashboardUser();
  const payload = await getPayloadClient();

  const sitesResult = await payload.find({
    collection: 'sites',
    depth: 0,
    limit: 100,
    sort: 'name',
  });

  const sites = sitesResult.docs as unknown as SiteRecord[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Sites & Domains</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage platform site configurations and mapped domains.
        </p>
      </header>

      <div className="grid gap-6">
        {sites.map((site) => (
          <SurfaceCard key={site.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-950 truncate">{site.name}</h2>
                {site.isDefault && (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 uppercase">
                    Default
                  </span>
                )}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  site.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {site.status}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <p>ID: <code className="text-xs">{site.siteId}</code></p>
                <p>Slug: <code className="text-xs">{site.slug}</code></p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:text-right">
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Domains</p>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {site.domains && site.domains.length > 0 ? (
                  site.domains.map((domain) => (
                    <span
                      key={domain.hostname}
                      className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                        domain.primary
                          ? 'border-sky-200 bg-sky-50 text-sky-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {domain.hostname}
                      {domain.developmentOnly && ' (Dev)'}
                    </span>
                  ))
                ) : (
                  <span className="text-xs italic text-slate-400">No domains mapped</span>
                )}
              </div>
              <div className="mt-4 flex sm:justify-end">
                <a
                  href={`/dashboard/sites/${site.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                >
                  Manage
                </a>
              </div>
            </div>
          </SurfaceCard>
        ))}

        {sites.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No sites found</p>
            <p className="mt-1 text-sm text-slate-500">Sites will appear here once created via Payload Studio.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
