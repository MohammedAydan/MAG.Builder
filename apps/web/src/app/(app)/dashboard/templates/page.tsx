import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listTemplates } from '@/lib/templates/service';
import { SurfaceCard } from '@/components/public/surface-card';
import { TemplateImporter } from './template-importer';

export default async function TemplatesPage() {
  await requireDashboardUser();
  const templates = listTemplates();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Templates</h1>
        <p className="mt-2 text-slate-500">
          Browse and import starter sites, page templates, and content blueprints.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <SurfaceCard key={template.metadata.id} className="flex flex-col h-full">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                  {template.metadata.demo ? 'Demo Site' : 'Template'}
                </span>
                <span className="text-xs font-mono text-slate-400">v{template.version}</span>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-950">{template.metadata.label}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {template.metadata.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {template.content.pages.length} Pages
                </span>
                <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {template.content.posts.length} Posts
                </span>
                <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  Theme: {template.theme.id}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <TemplateImporter 
                templateId={template.metadata.id} 
                label={template.metadata.label}
                isDemo={!!template.metadata.demo}
              />
            </div>
          </SurfaceCard>
        ))}

        <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center border-dashed border-2 py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <span className="text-2xl">+</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Custom Templates</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-[200px]">
            Upload your own template manifest or export from an existing site.
          </p>
          <button className="mt-4 text-xs font-bold text-sky-600 hover:text-sky-500 uppercase tracking-wider">
            Coming Soon
          </button>
        </SurfaceCard>
      </div>
    </div>
  );
}
