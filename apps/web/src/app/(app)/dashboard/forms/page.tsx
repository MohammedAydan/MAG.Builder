import Link from 'next/link';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { listForms } from '@/lib/forms/service';
import { SurfaceCard } from '@/components/public/surface-card';

export const dynamic = 'force-dynamic';

interface FormRecord {
  actions?: unknown[] | null;
  fields?: unknown[] | null;
  id: string | number;
  slug: string;
  title: string;
}

export default async function FormsPage() {
  const user = await requireDashboardUser();
  const forms = await listForms(user) as unknown as FormRecord[];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Forms</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage form definitions and view user submissions.
          </p>
        </div>
        <Link
          href="/admin/collections/forms/create"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          New Form
        </Link>
      </header>

      <div className="grid gap-6">
        {forms.map((form) => (
          <SurfaceCard key={form.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-950 truncate">{form.title}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <p>Slug: <code className="text-xs">{form.slug}</code></p>
                <p>Fields: {form.fields?.length ?? 0}</p>
                <p>Actions: {form.actions?.length ?? 0}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/dashboard/forms/${form.id}/submissions`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View Submissions
              </Link>
              <Link
                href={`/admin/collections/forms/${form.id}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </Link>
            </div>
          </SurfaceCard>
        ))}

        {forms.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No forms found</p>
            <p className="mt-1 text-sm text-slate-500">Create your first form in the Content Studio.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
