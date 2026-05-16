import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteDomainsPage({ params }: PageProps) {
  const { id } = await params;
  await requireDashboardUser();
  const payload = await getPayloadClient();

  const site = await payload.findByID({
    collection: 'sites',
    id,
    depth: 0,
  }).catch(() => null);

  if (!site) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Domains</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage custom domains for <span className="font-medium text-slate-900">{site.name}</span>.
          </p>
        </div>
        <Link
          href={`/dashboard/sites/${id}`}
          className="text-sm font-medium text-sky-600 hover:text-sky-500"
        >
          &larr; Back to site overview
        </Link>
      </header>

      <div className="space-y-4">
        {site.domains && site.domains.length > 0 ? (
          site.domains.map((domain, index) => (
            <SurfaceCard key={domain.hostname || index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">{domain.hostname}</h3>
                    {domain.primary && (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 uppercase">
                        Primary
                      </span>
                    )}
                    {domain.developmentOnly && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                        Dev Only
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${
                        domain.verificationStatus === 'verified' ? 'bg-emerald-500' : 
                        domain.verificationStatus === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      <span className="text-sm text-slate-500 capitalize">
                        {domain.verificationStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {domain.verificationStatus !== 'verified' && !domain.developmentOnly && (
                  <button className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                    Verify Now
                  </button>
                )}
              </div>

              {domain.verificationToken && domain.verificationStatus !== 'verified' && (
                <div className="mt-6 rounded-md bg-slate-50 p-4 ring-1 ring-inset ring-slate-200">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Verification Steps</h4>
                  <p className="mt-2 text-sm text-slate-600">
                    To verify this domain, add the following TXT record to your DNS provider:
                  </p>
                  <div className="mt-3 flex items-center justify-between rounded bg-white px-3 py-2 ring-1 ring-inset ring-slate-200">
                    <code className="text-xs text-slate-900 font-mono">
                      nexpress-site-verification={domain.verificationToken}
                    </code>
                    <button className="text-xs font-medium text-sky-600 hover:text-sky-500">Copy</button>
                  </div>
                </div>
              )}
            </SurfaceCard>
          ))
        ) : (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No domains mapped</p>
            <p className="mt-1 text-sm text-slate-500">Add a custom domain to get started.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
