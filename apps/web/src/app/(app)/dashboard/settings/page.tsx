import { requireDashboardSettingsUser } from '@/lib/dashboard/guards';

export const dynamic = 'force-dynamic';

export default async function DashboardSettingsPage() {
  await requireDashboardSettingsUser();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
          System
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Settings shell
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          This privileged page is reserved for future installation-state, security, and
          platform settings work. No mutable system settings are exposed yet in Phase 07.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-slate-900">Installation controls</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Future phases can attach install-state diagnostics and runtime configuration checks
            here without exposing secrets to client code.
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold text-slate-900">Security and roles</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Role management and privileged audit views remain out of scope for this phase, but
            this route is reserved for those system-owned controls.
          </p>
        </article>
      </section>
    </div>
  );
}
