import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { SectionHeading } from '@/components/public/section-heading';
import { SurfaceCard } from '@/components/public/surface-card';
import {
  buildContentMetadata,
  getPublishedRedirectByPath,
  resolvePublishedPageAccessBySlug,
} from '@/lib/content/public';
import { renderPublishedPageContent } from '@/lib/content/rendering';
import { getAuthenticatedMember } from '@/lib/members/service';

type PublicContentPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PublicContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await resolvePublishedPageAccessBySlug(slug);

  if (page.kind !== 'granted') {
    return {};
  }

  return buildContentMetadata(page.document);
}

export default async function PublicContentPage({ params }: PublicContentPageProps) {
  const { slug } = await params;
  const member = await getAuthenticatedMember();
  const pageResult = await resolvePublishedPageAccessBySlug(slug, member);

  if (pageResult.kind === 'login-required') {
    redirect(pageResult.loginPath);
  }

  if (pageResult.kind !== 'granted') {
    const matchedRedirect = await getPublishedRedirectByPath(`/${slug}`);

    if (matchedRedirect) {
      if (matchedRedirect.type === '301') {
        permanentRedirect(matchedRedirect.destinationPath);
      }

      redirect(matchedRedirect.destinationPath);
    }

    notFound();
  }

  const page = pageResult.document;

  return (
    <div className="mx-auto flex w-full max-w-[var(--layout-content)] flex-col gap-8 px-[var(--space-gutter)] py-[var(--space-section)]">
      <SectionHeading
        eyebrow="Page"
        title={page.title}
      >
        {page.excerpt || 'Published page content is now resolved from the CMS foundation.'}
      </SectionHeading>

      <SurfaceCard className="space-y-6">
        <div className="flex flex-wrap gap-3 text-sm text-[var(--color-ink-muted)]">
          <span className="rounded-[var(--radius-chip)] bg-[color-mix(in_oklab,var(--color-surface-strong)_90%,transparent)] px-3 py-1.5">
            Slug: /{page.slug}
          </span>
          {page.publishedAt ? (
            <span className="rounded-[var(--radius-chip)] bg-[color-mix(in_oklab,var(--color-surface-strong)_90%,transparent)] px-3 py-1.5">
              Published {new Date(page.publishedAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>
        {renderPublishedPageContent(page)}
      </SurfaceCard>
    </div>
  );
}
