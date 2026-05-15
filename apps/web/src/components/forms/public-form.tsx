import { fetchPublicForm } from '@/lib/forms/rendering';
import type { ResolvedSite } from '@/lib/sites/service';
import { PublicFormClient } from './public-form-client';

interface PublicFormProps {
  formSlug: string;
  site: ResolvedSite;
  submitLabel?: string | undefined;
  title?: string | undefined;
}

export async function PublicForm({ formSlug, site, submitLabel, title }: PublicFormProps) {
  const form = await fetchPublicForm(formSlug, site);

  if (!form) {
    return (
      <div className="rounded-[var(--radius-surface)] border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{`Form "${formSlug}" could not be found or is not available.`}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title || form.title ? (
        <h3 className="mb-6 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          {title || form.title}
        </h3>
      ) : null}
      
      {form.description ? (
        <p className="mb-8 text-sm text-[var(--color-ink-muted)]">
          {form.description}
        </p>
      ) : null}

      <PublicFormClient form={form} submitLabel={submitLabel} />
    </div>
  );
}
