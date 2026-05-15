import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listTemplates } from '@/lib/templates/service';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  await requireDashboardUser();
  const templates = listTemplates();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Templates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Discover and import starter content templates.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <SurfaceCard key={template.metadata.id} className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-xl font-bold mb-4">
                {template.metadata.label.slice(0, 1)}
              </div>
              
              <h2 className="text-lg font-semibold text-slate-950">{template.metadata.label}</h2>
              <p className="mt-1 text-xs text-slate-400 font-mono">v{template.version}</p>
              <p className="mt-3 text-sm text-slate-500 leading-6">
                {template.metadata.description}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Pages</span>
                  <span className="font-mono">{template.content.pages.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Posts</span>
                  <span className="font-mono">{template.content.posts.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Theme</span>
                  <span className="font-mono">{template.theme.id}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Local Template</span>
              <button
                disabled
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </SurfaceCard>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full">
            <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-slate-900">No templates found</p>
              <p className="mt-1 text-sm text-slate-500">No local templates available.</p>
            </SurfaceCard>
          </div>
        )}
      </div>

      <section className="rounded-2xl bg-sky-50 p-4 border border-sky-100">
        <p className="text-[10px] text-sky-400 uppercase font-bold tracking-[0.1em]">Future Scope</p>
        <p className="mt-1 text-xs text-sky-700 leading-5">
          Templates can be imported and exported to serialize site content. Direct import from this dashboard will be enabled in a future update.
        </p>
      </section>
    </div>
  );
}
