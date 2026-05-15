import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createBuilderPageDraft, listBuilderPages } from '@/lib/builder/editor';
import { requireDashboardContentUser } from '@/lib/dashboard/guards';

export const dynamic = 'force-dynamic';

export default async function DashboardPagesPage() {
  const user = await requireDashboardContentUser();
  const pages = await listBuilderPages(user);

  async function createPageAction() {
    'use server';

    const currentUser = await requireDashboardContentUser();
    const page = await createBuilderPageDraft(currentUser);
    redirect(`/dashboard/pages/${page.id}/builder`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
              Builder
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Pages and visual builder
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              Create draft pages, open the Puck-based editor adapter, and keep public rendering on
              the NexPress builder kernel.
            </p>
          </div>

          <form action={createPageAction}>
            <button
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              Create draft page
            </button>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        {pages.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
            No pages exist yet. Create a draft page to open the visual builder.
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => (
              <article
                className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between"
                key={page.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-950">{page.title}</h2>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {page.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">/{page.slug}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Updated {new Date(page.updatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                    href={`/dashboard/pages/${page.id}/preview`}
                    target="_blank"
                  >
                    Preview draft
                  </Link>
                  <Link
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    href={`/dashboard/pages/${page.id}/builder`}
                  >
                    Open builder
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
