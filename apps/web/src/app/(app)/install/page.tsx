import { getInstallStatus } from '@/lib/install/service';
import { buildEnv } from '@/lib/env';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type InstallPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function readErrorMessage(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function InstallPage({ searchParams }: InstallPageProps) {
  const status = await getInstallStatus();

  if (status.kind === 'installed') {
    redirect('/');
  }

  const resolvedSearchParams = await searchParams;
  const errorMessage = readErrorMessage(resolvedSearchParams.error);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl items-center px-6 py-16">
      <section className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-6">
          <p className="text-sm font-semibold tracking-[0.22em] text-sky-700 uppercase">
            Phase 05
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Install NexPress with a server-first bootstrap flow.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            The first-run setup creates the initial admin account and writes a locked
            installation record on the server. No secrets or runtime config values are exposed
            back to the client.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                Runtime mode
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-900">{buildEnv.NODE_ENV}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                Setup state
              </p>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {status.kind === 'setup-disabled' ? 'Locked' : 'Ready'}
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="rounded-2xl bg-white/70 px-4 py-3 backdrop-blur">
              Setup stops once an installation record or admin user already exists.
            </li>
            <li className="rounded-2xl bg-white/70 px-4 py-3 backdrop-blur">
              Admin passwords must be at least 12 characters and include mixed character types.
            </li>
            <li className="rounded-2xl bg-white/70 px-4 py-3 backdrop-blur">
              Production secret validation still happens only on runtime code paths.
            </li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          {status.kind === 'runtime-unavailable' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-950">Setup unavailable</h2>
              <p className="text-sm leading-6 text-slate-600">
                The server runtime configuration or database connection is not ready. Configure
                the deployment secrets and database access, then reload this page.
              </p>
            </div>
          ) : status.kind === 'setup-disabled' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-950">Setup locked</h2>
              <p className="text-sm leading-6 text-slate-600">
                Installation is disabled by server configuration. Set
                `NEXPRESS_INSTALLATION_MODE=wizard` to allow the first-run bootstrap flow.
              </p>
            </div>
          ) : (
            <form action="/api/install" className="space-y-5" method="post">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-950">Create the first admin</h2>
                <p className="text-sm leading-6 text-slate-600">
                  This form posts directly to a server route. After success, the wizard is
                  permanently blocked until the database is reset intentionally.
                </p>
              </div>

              {errorMessage ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </p>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Site name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400"
                  defaultValue={status.defaultSiteName ?? 'NexPress'}
                  maxLength={80}
                  name="siteName"
                  required
                  type="text"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Admin email</span>
                <input
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400"
                  name="adminEmail"
                  required
                  type="email"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Admin password</span>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400"
                  minLength={12}
                  name="adminPassword"
                  required
                  type="password"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Confirm password</span>
                <input
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-400"
                  minLength={12}
                  name="confirmPassword"
                  required
                  type="password"
                />
              </label>

              <button
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="submit"
              >
                Finish installation
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
