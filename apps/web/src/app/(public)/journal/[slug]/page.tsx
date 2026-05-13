import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { SectionHeading } from '@/components/public/section-heading';
import { SurfaceCard } from '@/components/public/surface-card';
import {
  buildContentMetadata,
  getPublishedPostBySlug,
  getPublishedRedirectByPath,
} from '@/lib/content/public';

type PublicPostPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PublicPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {};
  }

  return buildContentMetadata(post);
}

export default async function PublicPostPage({ params }: PublicPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    const matchedRedirect = await getPublishedRedirectByPath(`/journal/${slug}`);

    if (matchedRedirect) {
      if (matchedRedirect.type === '301') {
        permanentRedirect(matchedRedirect.destinationPath);
      }

      redirect(matchedRedirect.destinationPath);
    }

    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-[var(--layout-content)] flex-col gap-8 px-[var(--space-gutter)] py-[var(--space-section)]">
      <SectionHeading
        eyebrow="Journal"
        title={post.title}
      >
        {post.excerpt || 'Published post content is now available through the first CMS foundation.'}
      </SectionHeading>

      <SurfaceCard className="space-y-6">
        <div className="flex flex-wrap gap-3 text-sm text-[var(--color-ink-muted)]">
          <span className="rounded-[var(--radius-chip)] bg-[color-mix(in_oklab,var(--color-surface-strong)_90%,transparent)] px-3 py-1.5">
            Path: /journal/{post.slug}
          </span>
          {post.publishedAt ? (
            <span className="rounded-[var(--radius-chip)] bg-[color-mix(in_oklab,var(--color-surface-strong)_90%,transparent)] px-3 py-1.5">
              Published {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>
        <div className="space-y-5 text-base leading-8 text-[var(--color-ink)]">
          {post.body
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
