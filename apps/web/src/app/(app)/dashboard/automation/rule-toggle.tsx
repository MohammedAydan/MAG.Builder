'use client';

import { useTransition } from 'react';
import { toggleRule } from './actions';

export function RuleToggle({ ruleId, enabled }: { ruleId: string; enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleRule(ruleId, !enabled);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition-colors ${
        enabled 
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      } disabled:opacity-50`}
    >
      {isPending ? 'Updating...' : (enabled ? 'Enabled' : 'Disabled')}
    </button>
  );
}
