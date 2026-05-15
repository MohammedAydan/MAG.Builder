import { z } from 'zod';
import { createDefinition, renderExternalBlock, renderPlaceholder } from './utils';

/** Safe form slug pattern: must match the slug format enforced by @nexpress/forms. */
const SAFE_FORM_SLUG_REGEX = /^[a-z0-9-]{1,80}$/;

const formPropsSchema = z.object({
  /**
   * Reference to a form definition by its slug.
   * Empty string means no form is selected (renders a placeholder).
   * When set, must match [a-z0-9-]+ pattern.
   */
  formSlug: z
    .string()
    .max(80, 'Form slug is too long.')
    .refine(
      (value) => value === '' || SAFE_FORM_SLUG_REGEX.test(value),
      'Form slug must be lowercase alphanumeric or hyphens only.',
    )
    .optional()
    .default(''),
  /** Optional submit button label override. */
  submitLabel: z.string().max(80).optional(),
  /** Optional heading displayed above the form. */
  title: z.string().max(120).optional(),
});

type FormProps = z.infer<typeof formPropsSchema>;

export const formDefinitions = [
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      formSlug: '',
      submitLabel: 'Submit',
      title: '',
    },
    displayName: 'Form',
    propsSchema: formPropsSchema,
    render: ({ block, context, props }) => {
      const formProps = props as FormProps;

      /**
       * Public renderer: delegates to external renderer (e.g. apps/web PublicForm).
       * If no external renderer is provided or fails, falls back to the noscript placeholder.
       *
       * If formSlug is empty (e.g., a new block in the editor with no slug set),
       * render a placeholder and nothing interactive.
       */
      if (!formProps.formSlug) {
        return renderPlaceholder('No form selected. Set a form slug in the editor.');
      }

      return renderExternalBlock(
        block,
        context,
        props as any,
        <div
          className="w-full rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5"
          data-block="core.form"
          data-form-slug={formProps.formSlug}
          data-submit-label={formProps.submitLabel ?? 'Submit'}
          data-title={formProps.title ?? ''}
        >
          {formProps.title ? (
            <h3 className="mb-4 text-xl font-semibold text-[var(--color-ink)]">{formProps.title}</h3>
          ) : null}
          <p className="text-sm text-[var(--color-ink-muted)]">
            Form "{formProps.formSlug}" preview. Actual form will be rendered on the public site.
          </p>
        </div>,
        'This form requires JavaScript to be enabled.'
      );
    },
    type: 'core.form',
  }),
] as const;
