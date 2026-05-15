import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/public/section-heading';
import { SurfaceCard } from '@/components/public/surface-card';
import { getAuthenticatedMember } from '@/lib/members/service';

type SignupPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const member = await getAuthenticatedMember();

  if (member) {
    redirect('/account');
  }

  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith('/') && !params.next.startsWith('//')
      ? params.next
      : '/account';

  const errorMessages: Record<string, string> = {
    csrf: 'Your session request could not be verified. Please try again from this site.',
    invalid: 'Please check your details and try again.',
    exists: 'Unable to create an account with these details.',
    weak_password: 'Please choose a stronger password.',
    password_mismatch: 'Passwords do not match.',
    server_error: 'Something went wrong. Please try again.',
  };

  const errorMessage = params.error ? errorMessages[params.error] : null;

  return (
    <div className="mx-auto flex w-full max-w-[var(--layout-content)] flex-col gap-8 px-[var(--space-gutter)] py-[var(--space-section)]">
      <SectionHeading eyebrow="Members" title="Create account">
        Public members use a separate auth model from dashboard and admin users.
      </SectionHeading>

      <SurfaceCard className="space-y-6">
        {errorMessage ? (
          <p className="rounded-[var(--radius-card)] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </p>
        ) : null}

        <form action="/api/members/signup" className="space-y-4" method="post">
          <input name="next" type="hidden" value={nextPath} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">First name</span>
              <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" name="firstName" required type="text" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Last name</span>
              <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" name="lastName" type="text" />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Email</span>
            <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" name="email" required type="email" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Password</span>
              <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" name="password" required type="password" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Confirm password</span>
              <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" name="confirmPassword" required type="password" />
            </label>
          </div>
          <button className="rounded-[var(--radius-chip)] bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-[var(--color-surface)]" type="submit">
            Create account
          </button>
        </form>

        <p className="text-sm text-[var(--color-ink-muted)]">
          Already a member? <Link className="text-[var(--color-ink)] underline" href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link>.
        </p>
      </SurfaceCard>
    </div>
  );
}
