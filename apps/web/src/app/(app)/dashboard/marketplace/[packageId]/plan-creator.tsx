'use client';

import { useState } from 'react';
import type { MarketplacePlanAction, MarketplacePlanResult, UpdateChannel } from '@nexpress/marketplace';
import { SurfaceCard } from '@/components/public/surface-card';

interface PlanCreatorProps {
  packageId: string;
  installed?: boolean;
  enabled?: boolean;
  channels: readonly UpdateChannel[];
}

export function MarketplacePlanCreator({ packageId, installed, enabled, channels }: PlanCreatorProps) {
  const [action, setAction] = useState<MarketplacePlanAction>(installed ? 'update' : 'install');
  const [channel, setChannel] = useState<UpdateChannel>('stable');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MarketplacePlanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGeneratePlan() {
    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch('/api/marketplace/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, channel, packageId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate plan');
      }

      const result = await response.json();
      setPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SurfaceCard tone="strong" className="space-y-6">
        <header>
          <h2 className="text-lg font-semibold text-slate-950">Management</h2>
          <p className="text-xs text-slate-500 mt-1">Configure and simulate package changes.</p>
        </header>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as MarketplacePlanAction)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {!installed && <option value="install">Install Package</option>}
              {installed && (
                <>
                  <option value="update">Update Version</option>
                  {!enabled && <option value="enable">Enable Plugin</option>}
                  {enabled && <option value="disable">Disable Plugin</option>}
                </>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as UpdateChannel)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {channels.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Generating...' : 'Generate Dry-run Plan'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-100">
            <p className="text-xs font-medium text-red-800">{error}</p>
          </div>
        )}
      </SurfaceCard>

      {plan && (
        <SurfaceCard tone="default" className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <header className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Dry-run Plan</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              plan.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 
              plan.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {plan.status}
            </span>
          </header>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Target Version</span>
              <span className="text-sm font-semibold text-slate-700">{plan.targetVersion || 'N/A'}</span>
            </div>

            {plan.steps.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Execution Steps</span>
                <ul className="space-y-1.5">
                  {plan.steps.map((step, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-slate-300 font-mono">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(plan.compatibility.errors.length > 0 || plan.compatibility.warnings.length > 0) && (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Compatibility</span>
                {plan.compatibility.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-red-600" />
                    {err}
                  </p>
                ))}
                {plan.compatibility.warnings.map((warn, i) => (
                  <p key={i} className="text-xs text-amber-600 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-amber-600" />
                    {warn}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-sky-50 p-3 border border-sky-100 mt-2">
            <p className="text-[10px] text-sky-800 leading-relaxed font-medium">
              Simulation only. No actual changes will be made to your platform files or database during this phase.
            </p>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
