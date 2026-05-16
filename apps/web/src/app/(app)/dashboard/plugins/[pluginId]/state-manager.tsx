'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PluginModuleManifest } from '@nexpress/plugins';
import { SurfaceCard } from '@/components/public/surface-card';

interface PluginStateManagerProps {
  pluginId: string;
  initialEnabled: boolean;
  availableModules: readonly PluginModuleManifest[];
  initialEnabledModules: readonly string[];
  pendingMigrationCount: number;
}

export function PluginStateManager({
  pluginId,
  initialEnabled,
  availableModules,
  initialEnabledModules,
  pendingMigrationCount,
}: PluginStateManagerProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [selectedModules, setSelectedModules] = useState<string[]>(initialEnabledModules as string[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleModule(moduleId: string) {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plugins/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId, enabledModules: selectedModules }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update plugin state');
      }

      setEnabled(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm('Are you sure you want to deactivate this plugin? Some features may become unavailable.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plugins/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to deactivate plugin');
      }

      setEnabled(false);
      setSelectedModules([]);
      router.refresh();
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
          <h2 className="text-lg font-semibold text-slate-950">Module Configuration</h2>
          <p className="text-xs text-slate-500 mt-1">Select features to enable for this plugin.</p>
        </header>

        <div className="space-y-4">
          {availableModules.map((mod) => (
            <label 
              key={mod.id} 
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                selectedModules.includes(mod.id)
                  ? 'border-sky-200 bg-sky-50/50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedModules.includes(mod.id)}
                onChange={() => toggleModule(mod.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">{mod.name}</span>
                <span className="text-xs text-slate-500 mt-0.5">{mod.description}</span>
                <div className="flex gap-1 mt-2">
                  {mod.capabilities.map((cap) => (
                    <span key={cap} className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {cap.split(':')[1]}
                    </span>
                  ))}
                </div>
              </div>
            </label>
          ))}

          {availableModules.length === 0 && (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              This plugin has no optional modules.
            </p>
          )}

          <div className="pt-4 flex flex-col gap-3 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Saving...' : enabled ? 'Update Configuration' : 'Activate Plugin'}
            </button>
            
            {enabled && (
              <button
                onClick={handleDeactivate}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-opacity"
              >
                Deactivate
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 border border-red-100">
            <p className="text-xs font-medium text-red-800">{error}</p>
          </div>
        )}
      </SurfaceCard>

      {pendingMigrationCount > 0 && (
        <SurfaceCard tone="tinted" className="space-y-4 border-amber-200 bg-amber-50/50">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px]">!</span>
              Pending Migrations
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
              {pendingMigrationCount} Required
            </span>
          </header>
          <p className="text-xs text-amber-800 leading-relaxed">
            This plugin requires data schema updates. Please run migrations to ensure full functionality.
          </p>
          <button
            onClick={() => router.push(`/dashboard/plugins/${pluginId}/migrations`)}
            className="w-full rounded-lg bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700 transition-colors"
          >
            Review Migrations
          </button>
        </SurfaceCard>
      )}
    </div>
  );
}
