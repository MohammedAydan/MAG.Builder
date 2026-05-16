import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteSettingsPage({ params }: PageProps) {
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Site Settings</h1>
          <p className="mt-2 text-sm text-slate-500">
            Configure <span className="font-medium text-slate-900">{site.name}</span> themes and plugins.
          </p>
        </div>
        <Link
          href={`/dashboard/sites/${id}`}
          className="text-sm font-medium text-sky-600 hover:text-sky-500"
        >
          &larr; Back to site overview
        </Link>
      </header>

      <div className="space-y-6">
        <SurfaceCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-950">General Info</h3>
          <p className="text-sm text-slate-500">Public identity and slug.</p>
          
          <div className="mt-6 space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700">Site Name</label>
              <input 
                type="text" 
                defaultValue={site.name} 
                className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Site Slug</label>
              <input 
                type="text" 
                disabled 
                defaultValue={site.slug} 
                className="mt-1 block w-full rounded-md border-0 py-1.5 text-slate-900 bg-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 sm:text-sm sm:leading-6"
              />
              <p className="mt-1 text-xs text-slate-500 italic">Slug cannot be changed after creation.</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-950">Theme</h3>
          <p className="text-sm text-slate-500">Active theme for this tenant.</p>
          
          <div className="mt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded bg-slate-200" />
              <div>
                <p className="text-sm font-medium text-slate-950">
                  {site.settings?.themeId || 'Default Corporate Theme'}
                </p>
                <button className="mt-1 text-sm font-medium text-sky-600 hover:text-sky-500">
                  Change theme
                </button>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <h3 className="text-lg font-semibold text-slate-950">Plugins</h3>
          <p className="text-sm text-slate-500">Enabled modules for this site.</p>
          
          <div className="mt-6 space-y-4">
            {['Blog Pack', 'Commerce Pack', 'Forms Pack'].map((plugin) => (
              <div key={plugin} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-900">{plugin}</span>
                </div>
                <button className="text-sm font-medium text-slate-400 cursor-not-allowed" disabled>
                  Managed by Global Admin
                </button>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <div className="flex justify-end">
          <button className="rounded-md bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
