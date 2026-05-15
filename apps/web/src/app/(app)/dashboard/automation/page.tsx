import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listAutomationRules } from '@/lib/automation/hooks';
import { SurfaceCard } from '@/components/public/surface-card';
import type { AutomationRule } from '@nexpress/automation';

export const dynamic = 'force-dynamic';

export default async function AutomationPage() {
  await requireDashboardUser();
  const rules = listAutomationRules();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Automation</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage platform automation rules and triggers.
        </p>
      </header>

      <section className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold">!</div>
          <div>
            <p className="text-sm font-semibold text-amber-900">In-memory Rules</p>
            <p className="text-xs text-amber-700 leading-5">
              Automation rules are currently hard-coded and run in-process. Persistence and admin-managed rules will be added in a future phase.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        {rules.map((rule: AutomationRule) => (
          <SurfaceCard key={rule.id} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-950 truncate">{rule.name}</h2>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  rule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {rule.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">ID: <code className="text-xs">{rule.id}</code></p>
              
              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Trigger</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">{rule.trigger}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Actions</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rule.actions.map((action, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
                      >
                        {action.action}
                        {'eventName' in action && ` (${action.eventName})`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                disabled
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-400 cursor-not-allowed"
              >
                Edit Rule
              </button>
            </div>
          </SurfaceCard>
        ))}

        {rules.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No automation rules</p>
            <p className="mt-1 text-sm text-slate-500">Built-in rules will appear here.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
