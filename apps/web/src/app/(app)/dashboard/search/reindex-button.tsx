'use client';

import { useState, useTransition } from 'react';
import { triggerReindex } from './actions';

export function ReindexButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleReindex = () => {
    setStatus('idle');
    startTransition(async () => {
      const result = await triggerReindex();
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleReindex}
        disabled={isPending}
        className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Reindexing...' : 'Full Reindex'}
      </button>
      {status === 'success' && (
        <p className="text-[10px] text-emerald-600 text-center font-medium">Reindex completed successfully.</p>
      )}
      {status === 'error' && (
        <p className="text-[10px] text-rose-600 text-center font-medium">Reindex failed. Check logs.</p>
      )}
    </div>
  );
}
