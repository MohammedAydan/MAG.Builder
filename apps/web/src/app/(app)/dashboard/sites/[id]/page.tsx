import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteOverviewPage({ params }: PageProps) {
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{site.name}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Overview and quick actions for this site.
          </p>
        </div>
        <Link
          href="/dashboard/sites"
          className="text-sm font-medium text-sky-600 hover:text-sky-500"
        >
          &larr; Back to all sites
        </Link>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <SurfaceCard className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Domains</h3>
            <p className="mt-1 text-sm text-slate-500">
              Manage custom domains and subdomains.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href={`/dashboard/sites/${id}/domains`}
              className="text-sm font-semibold text-sky-600 hover:text-sky-500"
            >
              Manage domains &rarr;
            </Link>
          </div>
        </SurfaceCard>

        <SurfaceCard className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Settings</h3>
            <p className="mt-1 text-sm text-slate-500">
              Site-specific themes, plugins, and metadata.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href={`/dashboard/sites/${id}/settings`}
              className="text-sm font-semibold text-sky-600 hover:text-sky-500"
            >
              Edit settings &rarr;
            </Link>
          </div>
        </SurfaceCard>

        <SurfaceCard className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Team</h3>
            <p className="mt-1 text-sm text-slate-500">
              Manage site administrators and editors.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href={`/dashboard/sites/${id}/members`}
              className="text-sm font-semibold text-sky-600 hover:text-sky-500"
            >
              Manage team &rarr;
            </Link>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="p-6">
        <h3 className="text-sm font-semibold text-slate-950">Site Status</h3>
        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Slug</dt>
            <dd className="mt-1 text-sm text-slate-950 font-mono">{site.slug}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status</dt>
            <dd className="mt-1">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                site.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {site.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Default Site</dt>
            <dd className="mt-1 text-sm text-slate-950">{site.isDefault ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </SurfaceCard>
    </div>
  );
}
