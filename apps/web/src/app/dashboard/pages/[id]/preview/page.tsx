import { notFound } from 'next/navigation';
import { SurfaceCard } from '@/components/public/surface-card';
import { SectionHeading } from '@/components/public/section-heading';
import { loadBuilderEditorPage } from '@/lib/builder/editor';
import { renderPublishedPageContent } from '@/lib/content/rendering';
import { requireDashboardContentUser } from '@/lib/dashboard/guards';

type DashboardPagePreviewProps = Readonly<{
  params: Promise<{
    id: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export default async function DashboardPagePreviewPage({ params }: DashboardPagePreviewProps) {
  const user = await requireDashboardContentUser();
  const { id } = await params;
  const page = await loadBuilderEditorPage(id, user);

  if (!page) {
    notFound();
  }

  const content = await renderPublishedPageContent(page.page);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
          Draft Preview
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {page.page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          This preview is server-protected and reads the latest draft version. Anonymous visitors
          still only receive published content on public routes.
        </p>
      </section>

      <div className="mx-auto w-full max-w-[var(--layout-wide)]">
        <SectionHeading
          eyebrow="Preview"
          title={page.page.title}
        >
          /{page.page.slug}
        </SectionHeading>

        <SurfaceCard className="mt-6 space-y-6">
          {content}
        </SurfaceCard>
      </div>
    </div>
  );
}
