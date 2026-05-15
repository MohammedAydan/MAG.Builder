import './styles.css';
import { notFound } from 'next/navigation';
import { VisualEditor } from '@nexpress/builder-editor';
import { loadBuilderEditorPage } from '@/lib/builder/editor';
import { requireDashboardContentUser } from '@/lib/dashboard/guards';

type DashboardPageBuilderProps = Readonly<{
  params: Promise<{
    id: string;
  }>;
}>;

export const dynamic = 'force-dynamic';

export default async function DashboardPageBuilderPage({ params }: DashboardPageBuilderProps) {
  const user = await requireDashboardContentUser();
  const { id } = await params;
  const page = await loadBuilderEditorPage(id, user);

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
          Visual Builder
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {page.page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Draft changes autosave to Payload versions and stay out of public rendering until the page
          is explicitly published through future workflows.
        </p>
      </section>

      <VisualEditor
        initialData={page.editorData}
        initialWarnings={page.warnings}
        pageSlug={page.page.slug}
        pageTitle={page.page.title}
        previewHref={`/dashboard/pages/${page.page.id}/preview`}
        saveHref={`/dashboard/pages/${page.page.id}/builder/save`}
      />
    </div>
  );
}
