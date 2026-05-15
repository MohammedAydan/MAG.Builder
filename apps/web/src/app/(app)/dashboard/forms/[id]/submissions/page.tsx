import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayloadClient } from '@/lib/payload';
import { requireDashboardUser } from '@/lib/dashboard/guards';
import { SurfaceCard } from '@/components/public/surface-card';

type SubmissionsPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';

interface SubmissionRecord {
  createdAt?: string | null;
  fields: Record<string, unknown>;
  id: string | number;
  status: string;
  submittedAt: string;
  workflowResults?: {
    action: string;
    status: string;
  }[] | null;
}

export default async function FormSubmissionsPage({ params }: SubmissionsPageProps) {
  const { id } = await params;
  const user = await requireDashboardUser();
  const payload = await getPayloadClient();

  const form = await payload.findByID({
    collection: 'forms',
    id,
    depth: 0,
    overrideAccess: false,
    user,
  }).catch(() => null);

  if (!form) {
    notFound();
  }

  const submissions = await payload.find({
    collection: 'form-submissions',
    depth: 0,
    limit: 100,
    sort: '-submittedAt',
    overrideAccess: false,
    user,
    where: {
      formSlug: {
        equals: form.slug,
      },
    },
  });

  const docs = submissions.docs as unknown as SubmissionRecord[];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/forms"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Forms
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-900">{form.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Submissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Viewing up to 100 recent submissions for <code className="text-xs">{form.slug}</code>.
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {docs.map((submission) => (
          <SurfaceCard key={submission.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  submission.status === 'processed' ? 'bg-emerald-100 text-emerald-700' :
                  submission.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                }`}>
                  {submission.status}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400">ID: <code className="text-[10px]">{submission.id}</code></p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(submission.fields).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{key}</p>
                  <p className="mt-1 text-sm text-slate-900 break-words">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </p>
                </div>
              ))}
            </div>

            {submission.workflowResults && Array.isArray(submission.workflowResults) && submission.workflowResults.length > 0 && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">Workflow Actions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {submission.workflowResults.map((result, idx) => (
                    <span
                      key={idx}
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                        result.status === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-rose-100 text-rose-700'
                      }`}
                    >
                      {result.action}: {result.status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SurfaceCard>
        ))}

        {docs.length === 0 && (
          <SurfaceCard tone="tinted" className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-slate-900">No submissions yet</p>
            <p className="mt-1 text-sm text-slate-500">User submissions for this form will appear here.</p>
          </SurfaceCard>
        )}
      </div>
    </div>
  );
}
