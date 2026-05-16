import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { SiteMembership, SiteInvitation, User } from '@/payload-types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteMembersPage({ params }: PageProps) {
  const { id } = await params;
  await requireDashboardUser();
  const payload = await getPayloadClient();

  const site = await payload.findByID({
    collection: 'sites',
    id,
    depth: 0,
  }).catch(() => null);

  if (!site) {
    notFound();
  }

  const memberships = await payload.find({
    collection: 'site-memberships',
    where: {
      site: {
        equals: id,
      },
    },
    depth: 1,
  });

  const invitations = await payload.find({
    collection: 'site-invitations',
    where: {
      site: {
        equals: id,
      },
      status: {
        equals: 'pending',
      },
    },
    depth: 0,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Team Management</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage who can access and edit <span className="font-medium text-slate-900">{site.name}</span>.
          </p>
        </div>
        <Link
          href={`/dashboard/sites/${id}`}
          className="text-sm font-medium text-sky-600 hover:text-sky-500"
        >
          &larr; Back to site overview
        </Link>
      </header>

      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Active Members</h2>
            <button className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-500">
              Invite Member
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            {memberships.docs.map((membership: SiteMembership) => {
              const user = membership.user as User;
              return (
                <SurfaceCard key={membership.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-500">
                        {user.email?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-500 capitalize">{membership.role.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-red-600 hover:text-red-500">Remove</button>
                </SurfaceCard>
              );
            })}
            {memberships.docs.length === 0 && (
              <p className="text-sm italic text-slate-500">No members assigned to this site.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-950">Pending Invitations</h2>
          <div className="mt-4 grid gap-4">
            {invitations.docs.map((invitation: SiteInvitation) => (
              <SurfaceCard key={invitation.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{invitation.email}</p>
                  <p className="text-xs text-slate-500 capitalize">Role: {invitation.role.replace('-', ' ')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 italic">Expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                  <button className="text-xs font-medium text-slate-600 hover:text-slate-900">Revoke</button>
                </div>
              </SurfaceCard>
            ))}
            {invitations.docs.length === 0 && (
              <p className="text-sm italic text-slate-500">No pending invitations.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
