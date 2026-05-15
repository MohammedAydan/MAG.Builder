import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listThemes } from '@/lib/templates/service';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

export default async function ThemesPage() {
  await requireDashboardUser();
  const themes = listThemes();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Themes</h1>
        <p className="mt-2 text-sm text-slate-500">
          Browse and manage platform design systems and themes.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          // Attempt to find primary color from light mode tokens
          const lightMode = theme.tokens.colorModes.light;
          const primaryColor = lightMode.primary || '#3b82f6';
          const bgColor = lightMode.background || '#ffffff';
          const textColor = lightMode.text || '#0f172a';

          return (
            <SurfaceCard key={theme.id} className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex h-32 w-full rounded-xl mb-4 overflow-hidden border border-slate-100" style={{ backgroundColor: bgColor }}>
                   <div className="p-4 space-y-2">
                      <div className="h-4 w-2/3 rounded" style={{ backgroundColor: primaryColor }}></div>
                      <div className="h-3 w-1/2 rounded opacity-50" style={{ backgroundColor: textColor }}></div>
                      <div className="flex gap-1 mt-4">
                         <div className="h-6 w-6 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                         <div className="h-6 w-6 rounded-full opacity-50" style={{ backgroundColor: primaryColor }}></div>
                      </div>
                   </div>
                </div>
                
                <h2 className="text-lg font-semibold text-slate-950">{theme.label}</h2>
                <p className="mt-1 text-xs text-slate-400 font-mono">ID: {theme.id}</p>
                {theme.description && (
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">{theme.description}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                 <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">System Theme</span>
                <button
                  disabled
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </SurfaceCard>
          );
        })}

        {themes.length === 0 && (
          <div className="col-span-full">
            <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-slate-900">No themes found</p>
              <p className="mt-1 text-sm text-slate-500">Local theme registry is empty.</p>
            </SurfaceCard>
          </div>
        )}
      </div>

      <section className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em]">Site Settings</p>
        <p className="mt-1 text-xs text-slate-500 leading-5">
          Themes are assigned at the Site level. To change a site&apos;s theme, visit the <Link href="/dashboard/sites" className="text-sky-600 font-semibold hover:underline">Sites</Link> configuration.
        </p>
      </section>
    </div>
  );
}
