import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/public/section-heading';
import { SurfaceCard } from '@/components/public/surface-card';
import { getAuthenticatedMember } from '@/lib/members/service';

type LoginPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const member = await getAuthenticatedMember();

  if (member) {
    redirect('/account');
  }

  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith('/') && !params.next.startsWith('//')
      ? params.next
      : '/account';

  return (
    <div className="mx-auto flex w-full max-w-[var(--layout-content)] flex-col gap-8 px-[var(--space-gutter)] py-[var(--space-section)]">
      <SectionHeading eyebrow="Members" title="Sign in">
        Protected public content is available through the separate member session boundary.
      </SectionHeading>

      <SurfaceCard className="space-y-6">
        {params.error ? (
          <p className="rounded-[var(--radius-card)] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {params.error}
          </p>
        ) : null}

        <form action="/api/members/login" className="space-y-4" method="post">
          <input name="next" type="hidden" value={nextPath} />
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Email</span>
            <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" name="email" required type="email" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Password</span>
            <input className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-black/10 px-4 py-3" name="password" required type="password" />
          </label>
          <button className="rounded-[var(--radius-chip)] bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-[var(--color-surface)]" type="submit">
            Sign in
          </button>
        </form>

        <p className="text-sm text-[var(--color-ink-muted)]">
          Need an account? <Link className="text-[var(--color-ink)] underline" href={`/signup?next=${encodeURIComponent(nextPath)}`}>Create one</Link>.
        </p>
      </SurfaceCard>
    </div>
  );
}
