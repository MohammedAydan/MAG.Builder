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

const NAV_GROUPS = [
  'content',
  'commerce',
  'members-sites',
  'forms',
  'automation',
  'integrations',
  'marketplace',
  'system',
] as const;

function getGroupLabel(group: (typeof NAV_GROUPS)[number]): string {
  switch (group) {
    case 'content':
      return 'Content';
    case 'commerce':
      return 'Commerce';
    case 'members-sites':
      return 'Members & Sites';
    case 'forms':
      return 'Forms';
    case 'automation':
      return 'Automation';
    case 'integrations':
      return 'Integrations';
    case 'marketplace':
      return 'Marketplace';
    case 'system':
      return 'System';
    default:
      return group;
  }
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await requireDashboardUser();
  const navigation = getDashboardNavigation(user);
  const role = getUserRole(user);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-24 self-start rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-sky-700 uppercase">
              NexPress Admin
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-950 truncate">
              {user.email ?? 'Authenticated user'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {role ? getRoleLabel(role) : 'Authenticated'}
            </p>
          </div>

          <nav className="mt-5 space-y-6">
            {NAV_GROUPS.map((group) => {
              const items = navigation.filter((item) => item.group === group);

              if (items.length === 0) {
                return null;
              }

              return (
                <div key={group}>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    {getGroupLabel(group)}
                  </p>
                  <div className="mt-3 space-y-1">
                    {items.map((item) => {
                      const Content = (
                        <>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{item.description}</p>
                        </>
                      );

                      const className = "block rounded-xl border border-transparent bg-slate-50/50 px-3 py-2 transition hover:border-slate-200 hover:bg-white";

                      return item.kind === 'internal' ? (
                        <Link className={className} href={item.href} key={item.href}>
                          {Content}
                        </Link>
                      ) : (
                        <a className={className} href={item.href} key={item.href}>
                          {Content}
                        </a>
                      );
                    })}
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
