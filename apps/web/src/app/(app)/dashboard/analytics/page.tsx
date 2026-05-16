import { requireDashboardUser } from '@/lib/dashboard/guards';
import { analyticsService } from '@/lib/analytics/service';
import { SurfaceCard } from '@/components/public/surface-card';
import { getSelectedSiteId } from '@/lib/sites/service';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  await requireDashboardUser();
  const siteId = await getSelectedSiteId();
  
  // Fetch summaries for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const summary = await analyticsService.getAggregateCounts({
    siteId,
    since: thirtyDaysAgo.toISOString(),
  });

  const totalEvents = Object.values(summary).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Analytics</h1>
        <p className="mt-2 text-sm text-slate-500">
          Aggregate summary of platform events and activity for the last 30 days.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SurfaceCard className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">30d Events</p>
          <p className="text-3xl font-bold text-slate-950">{totalEvents.toLocaleString()}</p>
        </SurfaceCard>
        
        <SurfaceCard className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Storage</p>
          <p className="text-xl font-bold text-slate-950">Persistent DB</p>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-6">
        <h2 className="text-sm font-bold text-slate-950 uppercase tracking-widest">Event Breakdown</h2>
        
        <div className="space-y-4">
          {Object.entries(summary).sort((a, b) => b[1] - a[1]).map(([name, count]) => {
            const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
            
            return (
              <div key={name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{name}</span>
                  <span className="text-slate-500 font-mono">{count.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {Object.keys(summary).length === 0 && (
            <p className="text-sm text-slate-500 italic text-center py-8">
              No analytics events captured in the last 30 days.
            </p>
          )}
        </div>
      </SurfaceCard>

      <section className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.1em]">Note</p>
        <p className="mt-1 text-xs text-slate-500 leading-5">
          Analytics are now persisted in the primary database. IP addresses are not stored. Event data is site-isolated and only accessible to site administrators.
        </p>
      </section>
    </div>
  );
}
