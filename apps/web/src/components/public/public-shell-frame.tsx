import Link from 'next/link';
import type { ReactNode } from 'react';
import { getPublicThemeVariables } from '@/lib/design-system/tokens';
import { PUBLIC_ACTION_LINKS, PUBLIC_NAV_ITEMS } from '@/lib/public-shell/navigation';

type PublicShellFrameProps = Readonly<{
  children: ReactNode;
}>;

export function PublicShellFrame({ children }: PublicShellFrameProps) {
  return (
    <div className="public-shell" style={getPublicThemeVariables()}>
      <header className="border-b public-grid-line">
        <div className="mx-auto flex w-full max-w-[var(--layout-wide)] flex-col gap-5 px-[var(--space-gutter)] py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Link className="inline-flex items-center gap-3" href="/">
              <span className="public-kicker">NexPress</span>
              <span className="text-sm text-[var(--color-ink-muted)]">
                Content, media, and public shell foundation
              </span>
            </Link>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <nav aria-label="Public sections" className="flex flex-wrap gap-3 text-sm text-[var(--color-ink-muted)]">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <a
                  className="rounded-[var(--radius-chip)] px-3 py-2 transition hover:bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] hover:text-[var(--color-ink)]"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-wrap gap-3">
              {PUBLIC_ACTION_LINKS.map((item) => (
                <Link
                  className={
                    item.style === 'primary'
                      ? 'rounded-[var(--radius-chip)] bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-[var(--color-surface)] transition hover:bg-[color-mix(in_oklab,var(--color-ink)_90%,var(--color-accent))]'
                      : 'public-grid-line rounded-[var(--radius-chip)] border bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[color-mix(in_oklab,var(--color-surface-strong)_88%,transparent)]'
                  }
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t public-grid-line">
        <div className="mx-auto flex w-full max-w-[var(--layout-wide)] flex-col gap-4 px-[var(--space-gutter)] py-8 text-sm text-[var(--color-ink-muted)] md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="public-kicker">Phase 08</p>
            <p>Public shell, semantic tokens, and CMS-ready content foundations.</p>
          </div>
          <p className="max-w-xl">
            This surface remains public-safe while published pages, posts, media, redirects, and
            SEO metadata are added server-first behind Payload access control.
          </p>
        </div>
      </footer>
    </div>
  );
}
