'use client';

import { useState } from 'react';
import type { PublicFormDefinition } from '@nexpress/forms';

interface PublicFormClientProps {
  form: PublicFormDefinition;
  submitLabel?: string | undefined;
}

export function PublicFormClient({ form, submitLabel }: PublicFormClientProps) {
  const [status, setStatus] = useState<'error' | 'idle' | 'loading' | 'success'>('idle');
  const [errors, setErrors] = useState<string[]>([]);
  const [submissionId, setSubmissionId] = useState<string | number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrors([]);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/forms/${form.slug}/submit`, {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setSubmissionId(result.submissionId);
      } else {
        setStatus('error');
        setErrors(result.errors || ['An unexpected error occurred.']);
      }
    } catch (_err) {
      setStatus('error');
      setErrors(['Failed to submit form. Please check your connection.']);
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-[var(--radius-surface)] border border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-6 text-center">
        <h4 className="text-lg font-semibold text-[var(--color-ink)]">Thank you!</h4>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Your submission has been received.
          {submissionId ? <span className="block mt-1 opacity-50 text-xs">ID: {submissionId}</span> : null}
        </p>
        <button
          className="mt-4 text-sm font-medium text-[var(--color-accent)] hover:underline"
          onClick={() => setStatus('idle')}
          type="button"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      {errors.length > 0 ? (
        <div className="rounded-[var(--radius-surface)] bg-red-50 p-4 text-sm text-red-800">
          <ul className="list-inside list-disc space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4">
        {form.fields.map((field) => (
          <div
            key={field.id}
            className="space-y-1.5"
          >
            <label
              className="text-sm font-medium text-[var(--color-ink)]"
              htmlFor={field.id}
            >
              {field.label}
              {field.required ? <span className="ml-1 text-red-500">*</span> : null}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                className="block w-full rounded-[var(--radius-chip)] border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm placeholder-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                id={field.id}
                name={field.id}
                placeholder={field.placeholder ?? ''}
                required={field.required}
                rows={4}
              />
            ) : field.type === 'select' ? (
              <select
                className="block w-full rounded-[var(--radius-chip)] border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                id={field.id}
                name={field.id}
                required={field.required}
              >
                <option value="">Select an option...</option>
                {field.options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center gap-2">
                <input
                  className="h-4 w-4 rounded border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  id={field.id}
                  name={field.id}
                  required={field.required}
                  type="checkbox"
                />
                <span className="text-sm text-[var(--color-ink-muted)]">{field.placeholder || ''}</span>
              </div>
            ) : (
              <input
                className="block w-full rounded-[var(--radius-chip)] border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm placeholder-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                id={field.id}
                name={field.id}
                placeholder={field.placeholder ?? ''}
                required={field.required}
                type={field.type === 'email' ? 'email' : 'text'}
              />
            )}
          </div>
        ))}
      </div>

      <button
        className="w-full rounded-[var(--radius-chip)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-ink)] transition-opacity hover:opacity-90 disabled:opacity-50"
        disabled={status === 'loading'}
        type="submit"
      >
        {status === 'loading' ? 'Submitting...' : submitLabel || 'Submit'}
      </button>
    </form>
  );
}
