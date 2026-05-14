'use client';

import { Puck, type Data as PuckData } from '@measured/puck';
import { useEffect, useRef, useState } from 'react';
import { createPuckConfig } from './config';
import type { EditorData } from './types';

type SaveStatus = 'idle' | 'saved' | 'saving' | 'unsaved';

type SaveResponse = {
  errors?: string[];
  savedAt?: string;
};

export type VisualEditorProps = Readonly<{
  initialData: EditorData;
  initialWarnings?: readonly string[];
  pageSlug: string;
  pageTitle: string;
  previewHref: string;
  saveHref: string;
}>;

const AUTOSAVE_DELAY_MS = 1200;

export function VisualEditor({
  initialData,
  initialWarnings = [],
  pageSlug,
  pageTitle,
  previewHref,
  saveHref,
}: VisualEditorProps) {
  const [currentData, setCurrentData] = useState<EditorData>(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function persistDraft(data: EditorData) {
    setSaveStatus('saving');
    setErrorMessage(null);

    const response = await fetch(saveHref, {
      body: JSON.stringify({ data }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const payload = (await response.json()) as SaveResponse;

    if (!response.ok) {
      const nextMessage = payload.errors?.[0] ?? 'Unable to save the current builder draft.';
      setSaveStatus('unsaved');
      setErrorMessage(nextMessage);
      throw new Error(nextMessage);
    }

    setLastSavedAt(payload.savedAt ?? new Date().toISOString());
    setSaveStatus('saved');
  }

  function scheduleAutosave(data: EditorData) {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      void persistDraft(data);
    }, AUTOSAVE_DELAY_MS);
  }

  function handleChange(data: PuckData) {
    const nextData = data as EditorData;
    setCurrentData(nextData);
    setSaveStatus('unsaved');
    scheduleAutosave(nextData);
  }

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (saveStatus === 'saving' || saveStatus === 'unsaved') {
        event.preventDefault();
        event.returnValue = '';
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveStatus]);

  return (
    <div className="space-y-4">
      {initialWarnings.length > 0 ? (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Editor warnings</p>
          <ul className="mt-2 list-disc pl-5">
            {initialWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </section>
      ) : null}

      <Puck
        config={createPuckConfig()}
        data={currentData as PuckData}
        headerTitle={pageTitle}
        iframe={{ enabled: false }}
        onChange={handleChange}
        overrides={{
          headerActions: () => (
            <>
              <a
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href={previewHref}
                rel="noreferrer"
                target="_blank"
              >
                Preview draft
              </a>
              <button
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saveStatus === 'saving'}
                onClick={() => {
                  if (saveTimer.current) {
                    clearTimeout(saveTimer.current);
                  }

                  void persistDraft(currentData);
                }}
                type="button"
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save draft'}
              </button>
            </>
          ),
          header: ({ actions, children }) => (
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0">
                {children}
                <p className="mt-1 text-xs text-slate-500">
                  /{pageSlug} |{' '}
                  {saveStatus === 'saved' && lastSavedAt
                    ? `Draft saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                    : saveStatus === 'unsaved'
                      ? 'Unsaved changes'
                      : 'Draft editing'}
                </p>
              </div>
              <div className="flex items-center gap-3">{actions}</div>
            </header>
          ),
        }}
        permissions={{
          delete: true,
          drag: true,
          duplicate: true,
          edit: true,
          insert: true,
        }}
      />
    </div>
  );
}
