import { SectionHeading } from '@/components/public/section-heading';
import { SurfaceCard } from '@/components/public/surface-card';
import { requireAuthenticatedMember } from '@/lib/members/service';

type AccountPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const member = await requireAuthenticatedMember('/account');
  const params = await searchParams;
  const errorMessages: Record<string, string> = {
    auth_required: 'Please sign in again to continue.',
    csrf: 'Your session request could not be verified. Please try again from this site.',
    invalid: 'Please review your profile details and try again.',
    server_error: 'Something went wrong. Please try again.',
  };
  const successMessages: Record<string, string> = {
    profile_updated: 'Profile updated.',
  };
  const errorMessage = params.error ? errorMessages[params.error] : null;
  const successMessage = params.success ? successMessages[params.success] : null;

  return (
    <div className="mx-auto flex w-full max-w-[var(--layout-content)] flex-col gap-8 px-[var(--space-gutter)] py-[var(--space-section)]">
      <SectionHeading eyebrow="Account" title={`Welcome back, ${member.firstName ?? 'member'}`}>
        This route is protected server-side and uses the separate member session cookie.
      </SectionHeading>

      <SurfaceCard className="space-y-6">
        {errorMessage ? (
          <p className="rounded-[var(--radius-card)] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="rounded-[var(--radius-card)] border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </p>
        ) : null}

        <div className="space-y-1 text-sm text-[var(--color-ink-muted)]">
          <p>Signed in as {member.email}</p>
          <p>Dashboard and Payload admin access remain controlled by the separate `users` collection.</p>
        </div>

        <form action="/api/members/profile" className="space-y-4" method="post">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">First name</span>
              <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" defaultValue={member.firstName ?? ''} name="firstName" required type="text" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Last name</span>
              <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" defaultValue={member.lastName ?? ''} name="lastName" type="text" />
            </label>
          </div>
          <button className="rounded-[var(--radius-chip)] bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-[var(--color-surface)]" type="submit">
            Save profile
          </button>
        </form>

        <form action="/api/members/logout" method="post">
          <button className="rounded-[var(--radius-chip)] border border-white/10 px-4 py-3 text-sm font-semibold text-[var(--color-ink)]" type="submit">
            Sign out
          </button>
        </form>
      </SurfaceCard>
    </div>
  );
}
