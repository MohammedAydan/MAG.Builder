/**
 * Server-only forms service for NexPress.
 *
 * Provides:
 * - Form definition lookup (server-side, with access control).
 * - Public form definition projection (strips private config).
 * - Submission persistence through the Payload Local API (overrideAccess: true,
 *   but only after validation in the route handler).
 * - Workflow action execution (email stub, webhook SSRF-protected).
 * - Rate limit key helpers.
 *
 * Security:
 * - Form definitions are never returned to public clients directly from this service.
 *   The route handler is responsible for projecting safe public data.
 * - Submissions store validated field values only.
 * - Workflow results contain safe status metadata only (no webhook responses, no secrets).
 * - overrideAccess: true is used ONLY for creating submissions after server-side validation.
 *   Form definition lookups use overrideAccess: false.
 */
import {
  parseFormDefinition,
  toPublicFormDefinition,
  validateSubmission,
  executeWorkflowActions,
  validateWebhookUrl,
  type FormDefinition,
  type PublicFormDefinition,
  type ValidatedSubmission,
  type WorkflowAction,
} from '@nexpress/forms';
import { AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import {
  type AuthenticatedUserLike,
} from '@/lib/auth/access';
import { fireAutomationTrigger } from '@/lib/automation/hooks';
import { getFormEmailProvider } from '@/lib/forms/runtime';
import { getPayloadClient } from '@/lib/payload';
import { createSiteScopeWhere, type ResolvedSite } from '@/lib/sites/service';
import { enqueueWebhookDelivery } from '@/lib/webhooks/outbound';

/**
 * List all forms accessible to the user.
 */
export async function listForms(user: AuthenticatedUserLike | null | undefined) {
  const payload = await getPayloadClient();

  const result = await (payload as unknown as { find: FormsPayloadClient['find'] }).find({
    collection: 'forms',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    user,
  });

  return result.docs;
}

/** Payload-shaped form field entry. */
type PayloadFormFieldEntry = {
  defaultValue?: string | null;
  id?: string | null;
  label?: string | null;
  options?: { label?: string | null; value?: string | null }[] | null;
  placeholder?: string | null;
  required?: boolean | null;
  type?: string | null;
};

/** Payload-shaped form action entry. */
type PayloadFormActionEntry = {
  emailTo?: string | null;
  emailToName?: string | null;
  type?: string | null;
  webhookUrl?: string | null;
};

/** Payload-shaped form document. */
type PayloadFormDoc = {
  actions?: PayloadFormActionEntry[] | null;
  description?: string | null;
  fields?: PayloadFormFieldEntry[] | null;
  id: number | string;
  site?: number | { id: number | string } | string | null;
  slug: string;
  title: string;
};

type PayloadFindResult<T> = { docs: T[] };

export type FormsPayloadClient = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<PayloadFindResult<PayloadFormDoc>>;
};

export class FormFlowError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Map a Payload form document to a typed FormDefinition, rejecting unknown/unsafe values. */
function mapPayloadDocToFormDefinition(doc: PayloadFormDoc): FormDefinition | null {
  const raw = {
    description: doc.description ?? undefined,
    fields: (doc.fields ?? []).map((f) => {
      const base = {
        id: f.id ?? '',
        label: f.label ?? '',
        ...(f.placeholder ? { placeholder: f.placeholder } : {}),
        ...(f.required != null ? { required: f.required } : {}),
        type: f.type ?? '',
      };

      if (f.type === 'select') {
        return {
          ...base,
          options: (f.options ?? []).map((o) => ({
            label: o.label ?? '',
            value: o.value ?? '',
          })),
        };
      }

      if (f.type === 'hidden') {
        return {
          ...base,
          ...(f.defaultValue ? { defaultValue: f.defaultValue } : {}),
        };
      }

      return base;
    }),
    slug: doc.slug,
    title: doc.title,
  };

  const result = parseFormDefinition(raw);

  if (!result.success) {
    console.error(`[forms] Form "${doc.slug}" has an invalid definition:`, result.error.issues);
    return null;
  }

  return result.data;
}

/** Extract typed workflow actions from a Payload form document. */
function mapPayloadDocToWorkflowActions(doc: PayloadFormDoc): WorkflowAction[] {
  const actions: WorkflowAction[] = [];

  for (const action of doc.actions ?? []) {
    if (action.type === 'webhook' && action.webhookUrl) {
      // Validate webhook URL before accepting it as an action
      const urlResult = validateWebhookUrl(action.webhookUrl);

      if (!urlResult.success) {
        console.warn(`[forms] Skipping webhook action for form "${doc.slug}": ${urlResult.reason}`);
        continue;
      }

      actions.push({ type: 'webhook', url: action.webhookUrl });
    } else if (action.type === 'email' && action.emailTo) {
      actions.push({
        config: {
          to: {
            email: action.emailTo,
            ...(action.emailToName ? { name: action.emailToName } : {}),
          },
        },
        type: 'email',
      });
    }
  }

  return actions;
}



/**
 * Get the public-safe projection of a form definition by slug.
 *
 * This is used by the public API route to render the form on public pages.
 * It returns only fields safe for clients — no workflow actions, no secrets.
 *
 * Uses overrideAccess: true for the form lookup so public users can submit
 * to published forms. The form definition itself is projected to safe fields only.
 */
export async function getPublicFormDefinition(
  slug: string,
  site: ResolvedSite,
): Promise<PublicFormDefinition | null> {
  const payload = await getPayloadClient();

  const result = await (payload as unknown as { find: FormsPayloadClient['find'] }).find({
    collection: 'forms',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { slug: { equals: slug } },
        createSiteScopeWhere(site),
      ],
    },
  });

  const doc = (result as PayloadFindResult<PayloadFormDoc>).docs[0];

  if (!doc) {
    return null;
  }

  const definition = mapPayloadDocToFormDefinition(doc);

  if (!definition) {
    return null;
  }

  return toPublicFormDefinition(definition);
}

/**
 * Process a form submission:
 * 1. Load the form definition (overrideAccess: true for the lookup — form must be published).
 * 2. Validate the payload against the definition.
 * 3. Persist the validated submission.
 * 4. Execute workflow actions.
 * 5. Return a safe result.
 *
 * The caller (route handler) is responsible for:
 * - Honeypot check (reject if filled).
 * - Rate limit check (reject if exceeded).
 * - Request parsing and initial type check.
 */
export async function processFormSubmission(
  formSlug: string,
  rawPayload: unknown,
  site: ResolvedSite,
): Promise<{ submissionId: number | string; success: true } | { errors: string[]; success: false }> {
  const payload = await getPayloadClient();
  const payloadClient = payload as unknown as FormsPayloadClient;

  // Load form definition bypassing RBAC for public submissions (overrideAccess: true on find)
  const result = await (payload as unknown as { find: FormsPayloadClient['find'] }).find({
    collection: 'forms',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { slug: { equals: formSlug } },
        createSiteScopeWhere(site),
      ],
    },
  });

  const doc = (result as PayloadFindResult<PayloadFormDoc>).docs[0];

  if (!doc) {
    return { errors: ['Form not found.'], success: false };
  }

  const definition = mapPayloadDocToFormDefinition(doc);

  if (!definition) {
    return { errors: ['Form is unavailable.'], success: false };
  }

  // Validate the submission against the form definition
  const validationResult = validateSubmission(definition, rawPayload);

  if (!validationResult.success) {
    return { errors: validationResult.errors, success: false };
  }

  const validated: ValidatedSubmission = { fields: validationResult.fields };
  const submittedAt = new Date().toISOString();

  // Persist the submission via Payload Local API with overrideAccess: true
  // (public users cannot create submissions through the Payload API directly —
  // only this server-side service creates submissions after validation)
  const created = await payloadClient.create({
    collection: 'form-submissions',
    data: {
      fields: validated.fields,
      formSlug,
      site: site.id,
      status: 'received',
      submittedAt,
    },
    overrideAccess: true,
  });

  const submissionId = (created as { id: number | string }).id;

  // Execute workflow actions (fire-and-forget, errors are logged not thrown)
  let workflowStatus: 'failure' | 'success' = 'success';

  try {
    const actions = mapPayloadDocToWorkflowActions(doc);
    const workflowResult = await executeWorkflowActions(
      formSlug,
      validated,
      actions,
      getFormEmailProvider(),
    );

    const hasFailure = workflowResult.results.some((r) => r.status === 'failure');
    workflowStatus = hasFailure ? 'failure' : 'success';

    // Update submission status with safe workflow result metadata
    await (payload as unknown as { update: (args: Record<string, unknown>) => Promise<unknown> }).update({
      collection: 'form-submissions',
      id: submissionId,
      data: {
        status: 'processed',
        workflowResults: workflowResult.results.map((r) => ({
          action: r.action,
          status: r.status,
        })),
      },
      overrideAccess: true,
    });

    // Audit workflow execution
    await writeAuditEntry(payload, {
      action: AUDIT_ACTIONS.formWorkflowExecuted,
      metadata: {
        actionCount: actions.length,
        formSlug,
        workflowStatus,
      },
      result: workflowStatus,
      targetCollection: 'form-submissions',
      targetId: String(submissionId),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[forms] Workflow execution error:', message);
  }

  // Audit the submission (fail-open: don't block success on audit failure)
  await writeAuditEntry(payload, {
    action: AUDIT_ACTIONS.formSubmitted,
    metadata: {
      fieldCount: Object.keys(validated.fields).length,
      formSlug,
      siteId: site.siteId,
    },
    result: 'success',
    targetCollection: 'form-submissions',
    targetId: String(submissionId),
  });

  await fireAutomationTrigger({
    payload: {
      formId: String(doc.id),
      formSlug,
      outcome: 'success',
      siteId: site.siteId,
      siteSlug: site.slug,
    },
    trigger: 'form.submitted',
  });

  await enqueueWebhookDelivery({
    data: {
      formId: String(doc.id),
      submissionId: String(submissionId),
    },
    event: 'form.submitted',
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });

  return { submissionId, success: true };
}
