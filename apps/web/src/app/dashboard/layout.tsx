import type { ReactNode } from 'react';
import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { getDashboardNavigation } from '@/lib/dashboard/navigation';
import { getUserRole } from '@/lib/auth/access';
import { getRoleLabel } from '@/lib/auth/roles';

type DashboardLayoutProps = Readonly<{
  children: ReactNode;
}>;

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await requireDashboardUser();
  const navigation = getDashboardNavigation(user);
  const role = getUserRole(user);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-sky-700 uppercase">
              NexPress Admin
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950">
              {user.email ?? 'Authenticated user'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {role ? getRoleLabel(role) : 'Authenticated'}
            </p>
          </div>

          <nav className="mt-5 space-y-6">
            {(['core', 'operations'] as const).map((group) => {
              const items = navigation.filter((item) => item.group === group);

              if (items.length === 0) {
                return null;
              }

              return (
                <div key={group}>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    {group === 'core' ? 'Core' : 'Operations'}
                  </p>
                  <div className="mt-3 space-y-2">
                    {items.map((item) =>
                      item.kind === 'internal' ? (
                        <Link
                          className="block rounded-2xl border border-transparent bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
                          href={item.href}
                          key={item.href}
                        >
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                        </Link>
                      ) : (
                        <a
                          className="block rounded-2xl border border-transparent bg-slate-50 px-4 py-3 transition hover:border-slate-200 hover:bg-white"
                          href={item.href}
                          key={item.href}
                        >
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                        </a>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
