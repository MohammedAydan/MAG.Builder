export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl items-center px-6 py-16">
      <section className="grid gap-8 md:grid-cols-[1.4fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold tracking-[0.22em] text-sky-700 uppercase">
            Phase 02
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            The platform foundation is live and ready for the next phase.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            This shell keeps Server Components as the default, validates runtime environment
            input, and exposes a health endpoint without pulling in CMS, auth, commerce, or
            builder logic ahead of schedule.
          </p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Active checks</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">App Router scaffold in `apps/web`</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Typed env validation for required runtime input</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Health endpoint at `/api/health`</li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">Root workspace commands wired through Turbo</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
