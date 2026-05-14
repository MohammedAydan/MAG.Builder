import { requireDashboardUser } from '@/lib/dashboard/guards';
import { getDashboardNavigation } from '@/lib/dashboard/navigation';

export const dynamic = 'force-dynamic';

const futureModuleCards = [
  {
    description: 'Draft pages now open into the visual builder adapter while public rendering stays on the builder kernel.',
    title: 'Visual Builder',
  },
  {
    description: 'Future module activation, plugin boundaries, and operational controls will anchor here.',
    title: 'Platform Modules',
  },
  {
    description: 'System configuration and privileged diagnostics will expand from the settings shell.',
    title: 'System Settings',
  },
] as const;

export default async function DashboardHomePage() {
  const user = await requireDashboardUser();
  const navigation = getDashboardNavigation(user);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
          Phase 11
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Dashboard shell with visual editing
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          This dashboard remains separate from Payload admin. It now hosts the first authenticated
          visual page editing flow while keeping validation, save permissions, and public rendering
          on the server-owned NexPress kernel.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Access model
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">Server-first</p>
          <p className="mt-2 text-sm text-slate-500">
            Route access is enforced before the dashboard UI renders.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Visible modules
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{navigation.length}</p>
          <p className="mt-2 text-sm text-slate-500">
            Navigation items are filtered by centralized permissions.
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Payload admin
          </p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">Preserved</p>
          <p className="mt-2 text-sm text-slate-500">
            Content Studio still routes to the existing `/admin` surface.
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Future modules
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Dashboard placeholders</h2>
          </div>
          <p className="text-sm text-slate-500">
            Structure exists now; full module pages stay out of scope until later phases.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {futureModuleCards.map((card) => (
            <article
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
              key={card.title}
            >
              <p className="text-sm font-semibold text-slate-900">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
