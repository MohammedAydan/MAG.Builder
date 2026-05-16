'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TemplateImporterProps {
  templateId: string;
  label: string;
  isDemo: boolean;
}

export function TemplateImporter({ templateId, label, isDemo }: TemplateImporterProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ counts: { pages: { created: number; updated: number }; posts: { created: number; updated: number }; redirects: { created: number; updated: number } } } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!confirm(`Are you sure you want to import "${label}"? This will create or update pages, posts, and redirects.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // For now, we only have the starter-site demo
      const endpoint = isDemo && templateId === 'starter-site' 
        ? '/api/templates/demo/starter-site' 
        : '/api/templates/import';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // For generic import, we would need the manifest. For demo, it's baked into the API.
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import template');
      }

      const data = await response.json();
      setResult(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
          <p className="text-xs font-bold text-emerald-800">Import Successful!</p>
          <ul className="mt-1 text-[10px] text-emerald-700 space-y-0.5">
            <li>Pages: {result.counts.pages.created} created, {result.counts.pages.updated} updated</li>
            <li>Posts: {result.counts.posts.created} created, {result.counts.posts.updated} updated</li>
            <li>Redirects: {result.counts.redirects.created} created, {result.counts.redirects.updated} updated</li>
          </ul>
        </div>
        <button 
          onClick={() => setResult(null)}
          className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white uppercase tracking-wider"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 p-2 border border-red-100">
          <p className="text-[10px] font-medium text-red-800">{error}</p>
        </div>
      )}
      
      <button
        onClick={handleImport}
        disabled={loading}
        className="w-full rounded-xl bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-50 transition-all uppercase tracking-wider"
      >
        {loading ? 'Importing...' : 'Import Template'}
      </button>
    </div>
  );
}
