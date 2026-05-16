import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listThemes } from '@/lib/templates/service';
import { SurfaceCard } from '@/components/public/surface-card';
import { getPayloadClient } from '@/lib/payload';
import { ThemeSwitcher } from './theme-switcher';

export default async function ThemesPage() {
  const user = await requireDashboardUser();
  const themes = listThemes();
  const payload = await getPayloadClient();

  // Fetch sites the user can manage
  const sites = await payload.find({
    collection: 'sites',
    limit: 100,
    user,
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Themes</h1>
        <p className="mt-2 text-slate-500">
          Customize the visual identity of your sites with token-based themes.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
          {themes.map((theme) => (
            <SurfaceCard key={theme.id} className="flex flex-col h-full border-2 border-transparent hover:border-sky-100 transition-all">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-950">{theme.id}</h3>
                  <div className="flex gap-1">
                    {Object.keys(theme.tokens.colorModes.light).slice(0, 3).map((color) => (
                      <div 
                        key={color} 
                        className="h-3 w-3 rounded-full border border-slate-200" 
                        style={{ backgroundColor: (theme.tokens.colorModes.light as any)[color] }} 
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Typography</p>
                  <p className="text-sm text-slate-600 font-medium" style={{ fontFamily: theme.tokens.typography.fontFamily }}>
                    {theme.tokens.typography.fontFamily}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Preview Tokens</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-slate-50 p-2 text-[10px] text-slate-500 border border-slate-100">
                      Primary: {(theme.tokens.colorModes.light as any).primary}
                    </div>
                    <div className="rounded bg-slate-50 p-2 text-[10px] text-slate-500 border border-slate-100">
                      Surface: {(theme.tokens.colorModes.light as any).surface}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <ThemeSwitcher 
                  themeId={theme.id} 
                  sites={sites.docs.map(s => ({ id: s.siteId, name: s.name }))}
                />
              </div>
            </SurfaceCard>
          ))}
        </div>

        <aside className="space-y-6">
          <SurfaceCard tone="tinted" className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About Themes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Themes in NexPress are purely token-based. They control CSS variables for colors, typography, and spacing without altering the underlying HTML structure.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Zero-runtime CSS injection
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Light/Dark mode support
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Standardized token schema
              </li>
            </ul>
          </SurfaceCard>

          <SurfaceCard className="border-dashed border-2 bg-slate-50/50 flex flex-col items-center justify-center py-10 text-center">
            <h4 className="text-sm font-semibold text-slate-900">Custom Theme?</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-[180px]">
              Theme development tools are available in the CLI.
            </p>
            <code className="mt-3 rounded bg-white px-2 py-1 text-[10px] border border-slate-200">
              nexpress theme create
            </code>
          </SurfaceCard>
        </aside>
      </div>
    </div>
  );
}
