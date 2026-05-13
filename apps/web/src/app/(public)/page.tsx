import { redirect } from 'next/navigation';
import { SectionHeading } from '@/components/public/section-heading';
import { SurfaceCard } from '@/components/public/surface-card';
import {
  PUBLIC_FOUNDATION_CARDS,
  PUBLIC_HIGHLIGHTS,
  PUBLIC_OPERATING_PRINCIPLES,
  PUBLIC_STATUS_STRIP,
} from '@/lib/public-shell/content';
import { getInstallStatus } from '@/lib/install/service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const status = await getInstallStatus();

  if (status.kind === 'not-installed' || status.kind === 'setup-disabled') {
    redirect('/install');
  }

  return (
    <div className="mx-auto flex w-full max-w-[var(--layout-wide)] flex-col px-[var(--space-gutter)] pb-[var(--space-section)]">
      <section className="grid gap-8 border-b public-grid-line py-[var(--space-section)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)] lg:items-end">
        <div className="space-y-6">
          <p className="public-kicker">Public Foundation</p>
          <h1 className="public-heading max-w-5xl text-[var(--type-hero)] text-[var(--color-ink)]">
            A calm public shell with a real CMS content foundation behind it.
          </h1>
          <p className="max-w-[var(--type-measure)] text-base leading-8 text-[var(--color-ink-muted)] sm:text-lg">
            NexPress now supports Pages, Posts, Media, Redirects, and SEO metadata as safe
            CMS primitives, while the public renderer stays separate from admin and editor
            surfaces.
          </p>
        </div>

        <SurfaceCard className="space-y-4" tone="strong">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-muted)]">
            Current state
          </p>
          <div className="space-y-3">
            {PUBLIC_STATUS_STRIP.map((item) => (
              <div
                className="public-grid-line rounded-[var(--radius-lg)] border bg-[color-mix(in_oklab,var(--color-surface)_82%,transparent)] px-4 py-3 text-sm leading-6 text-[var(--color-ink)]"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="grid gap-4 py-8 md:grid-cols-3" id="platform">
        {PUBLIC_HIGHLIGHTS.map((item) => (
          <SurfaceCard className="space-y-3" key={item.title} tone="tinted">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{item.title}</p>
            <p className="text-sm leading-7 text-[var(--color-ink-muted)]">{item.description}</p>
          </SurfaceCard>
        ))}
      </section>

      <section className="space-y-6 border-y public-grid-line py-[var(--space-section)]" id="foundations">
        <SectionHeading
          align="split"
          eyebrow="Foundation"
          title="Theme variables now define the public visual contract."
        >
          The system is intentionally light-first today, but the token shape already supports a
          future dark mode and theme preset layer without baking one-off values into components
          as published content starts flowing through the public app.
        </SectionHeading>

        <div className="grid gap-4 lg:grid-cols-3">
          {PUBLIC_FOUNDATION_CARDS.map((card) => (
            <SurfaceCard className="space-y-4" key={card.title}>
              <p className="public-kicker">{card.label}</p>
              <p className="text-xl font-semibold text-[var(--color-ink)]">{card.title}</p>
              <p className="text-sm leading-7 text-[var(--color-ink-muted)]">{card.description}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section className="grid gap-8 py-[var(--space-section)] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]" id="security">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Security"
            title="The public shell adds presentation, not privilege."
          >
            It does not fetch private collections, does not expose runtime secrets, and does not
            relax the install, RBAC, or audit guarantees already established in earlier phases.
          </SectionHeading>

          <div className="grid gap-3">
            {PUBLIC_OPERATING_PRINCIPLES.map((item) => (
              <div
                className="public-grid-line rounded-[var(--radius-lg)] border bg-[color-mix(in_oklab,var(--color-surface)_90%,transparent)] px-4 py-4 text-sm leading-7 text-[var(--color-ink)]"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <SurfaceCard className="space-y-5 lg:mt-10" tone="strong">
          <div className="space-y-3">
            <p className="public-kicker">Ready for later phases</p>
            <p className="text-2xl font-semibold text-[var(--color-ink)]">
              This shell is minimal on purpose.
            </p>
          </div>
          <p className="text-sm leading-7 text-[var(--color-ink-muted)]">
            The visual builder, themes, templates, and commerce systems still stay out of scope
            here. Phase 09 adds only the first CMS, media, redirects, and SEO foundations those
            later systems will inherit.
          </p>
          <div className="public-grid-line rounded-[var(--radius-lg)] border bg-[color-mix(in_oklab,var(--color-accent-soft)_72%,var(--color-surface))] px-4 py-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Scope discipline</p>
            <p className="mt-2 text-sm leading-7 text-[var(--color-ink-muted)]">
              The homepage remains static and production-safe instead of pre-implementing later CMS,
              commerce, or visual-builder behavior.
            </p>
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
