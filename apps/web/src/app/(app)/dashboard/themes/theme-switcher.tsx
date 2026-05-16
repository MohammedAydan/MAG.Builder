'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ThemeSwitcherProps {
  themeId: string;
  sites: Array<{ id: string; name: string }>;
}

export function ThemeSwitcher({ themeId, sites }: ThemeSwitcherProps) {
  const router = useRouter();
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!selectedSiteId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/themes/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: selectedSiteId, themeId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to apply theme');
      }

      setSuccess(true);
      router.refresh();
      
      // Reset success message after 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (sites.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic">No sites available to apply this theme.</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Site</label>
        <select
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-sky-500 focus:ring-sky-500 disabled:opacity-50"
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.id})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-[10px] font-semibold text-red-600">{error}</p>
      )}

      <button
        onClick={handleApply}
        disabled={loading || !selectedSiteId}
        className={`w-full rounded-xl py-3 text-sm font-bold text-white transition-all uppercase tracking-wider ${
          success 
            ? 'bg-emerald-500' 
            : 'bg-slate-900 hover:bg-slate-800 disabled:opacity-50'
        }`}
      >
        {loading ? 'Applying...' : success ? 'Applied ✓' : 'Apply Theme'}
      </button>
    </div>
  );
}
