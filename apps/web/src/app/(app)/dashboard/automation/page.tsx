import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { RuleToggle } from './rule-toggle';
import { getSelectedSiteId } from '@/lib/sites/service';

export const dynamic = 'force-dynamic';

export default async function AutomationPage() {
  await requireDashboardUser();
  const siteId = await getSelectedSiteId();
  const cms = await getPayload({ config: configPromise });

  const rules = await cms.find({
    collection: 'automation-rules',
    where: {
      siteId: { equals: siteId },
    },
    limit: 100,
    overrideAccess: true,
    depth: 0,
  });

  const executions = await cms.find({
    collection: 'automation-executions',
    where: {
      siteId: { equals: siteId },
    },
    limit: 5,
    sort: '-startedAt',
    overrideAccess: true,
    depth: 1, // To get rule name
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Automation</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage platform automation rules and triggers.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6">
            {rules.docs.map((rule) => (
              <SurfaceCard key={rule.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-950 truncate">{rule.name}</h2>
                    <RuleToggle ruleId={String(rule.id)} enabled={!!rule.enabled} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{rule.description}</p>
                  
                  <div className="mt-4 flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Trigger</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{rule.trigger}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Actions</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(rule.actions || []).map((action: { type: string }, idx: number) => (
                          <span
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
                          >
                            {action.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            ))}

            {rules.docs.length === 0 && (
              <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-slate-900">No automation rules</p>
                <p className="mt-1 text-sm text-slate-500">Create rules in the Payload admin for now.</p>
              </SurfaceCard>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="space-y-4">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-widest">Recent Executions</h3>
            <div className="space-y-4">
              {executions.docs.map((ex) => (
                <div key={ex.id} className="text-sm border-l-2 border-slate-100 pl-3 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 truncate">
                      {typeof ex.rule === 'object' ? ex.rule.name : 'Rule'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      ex.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {ex.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(ex.startedAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {executions.docs.length === 0 && (
                <p className="text-xs text-slate-400 italic">No recent executions.</p>
              )}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
