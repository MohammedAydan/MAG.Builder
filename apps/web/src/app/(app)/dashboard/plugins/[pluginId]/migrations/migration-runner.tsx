'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PluginMigrationPlan } from '@nexpress/plugins';
import { SurfaceCard } from '@/components/public/surface-card';

interface MigrationRunnerProps {
  pluginId: string;
  initialPlan: PluginMigrationPlan;
}

export function MigrationRunner({ pluginId, initialPlan }: MigrationRunnerProps) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRunMigration(migrationId: string) {
    setRunningId(migrationId);
    setError(null);

    try {
      const response = await fetch('/api/plugins/migrations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId, migrationId, allowDestructive: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to execute migration');
      }

      // Refresh the plan
      const planResponse = await fetch(`/api/plugins/migrations/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId }),
      });
      if (planResponse.ok) {
        const nextPlan = await planResponse.json();
        setPlan(nextPlan);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRunningId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {plan.steps.map((step) => (
          <SurfaceCard 
            key={step.definition.id} 
            className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
              step.status === 'applied' ? 'bg-slate-50/50' : 'bg-white shadow-md'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">v{step.definition.version}</span>
                <h4 className="font-semibold text-slate-900">{step.definition.name}</h4>
                {step.definition.destructive && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 uppercase">
                    Destructive
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">{step.definition.description}</p>
              {step.executedAt && (
                <p className="mt-2 text-[10px] text-slate-400">
                  Applied on {new Date(step.executedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 sm:shrink-0">
              {step.status === 'applied' ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="h-5 w-5 flex items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold">✓</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Applied</span>
                </div>
              ) : (
                <button
                  onClick={() => handleRunMigration(step.definition.id)}
                  disabled={runningId !== null}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
                >
                  {runningId === step.definition.id ? 'Running...' : 'Run Migration'}
                </button>
              )}
            </div>
          </SurfaceCard>
        ))}

        {plan.steps.length === 0 && (
          <SurfaceCard tone="tinted" className="py-12 text-center">
            <p className="text-sm text-slate-500">No migrations defined for this plugin.</p>
          </SurfaceCard>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {plan.pending.length === 0 && plan.steps.length > 0 && (
        <div className="rounded-xl bg-emerald-50 p-6 border border-emerald-100 flex items-center gap-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold">
            ✓
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900">Up to date</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              All migrations have been successfully applied. Your plugin is ready to use.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
