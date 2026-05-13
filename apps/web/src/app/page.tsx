import { getInstallStatus } from '@/lib/install/service';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const status = await getInstallStatus();

  if (status.kind === 'not-installed' || status.kind === 'setup-disabled') {
    redirect('/install');
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl items-center px-6 py-16">
      <section className="grid gap-8 md:grid-cols-[1.4fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold tracking-[0.22em] text-sky-700 uppercase">
            Phase 05
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            NexPress is installed and ready for the next platform layers.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            The runtime configuration is validated on the server, installation state is locked,
            and first-run bootstrap is no longer available once the initial admin exists.
          </p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Active checks</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Server-only installation state check</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">First-run setup blocked after initial install</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Typed runtime validation without static build breakage</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Health endpoint and Payload foundation remain intact</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
