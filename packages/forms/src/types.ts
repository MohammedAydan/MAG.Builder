import { z } from 'zod';

/** Allowed v1 form field types. Allowlisted — no arbitrary type accepted. */
export const FORM_FIELD_TYPES = [
  'text',
  'textarea',
  'email',
  'checkbox',
  'select',
  'hidden',
] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

/** Maximum string lengths. */
export const FORM_FIELD_LABEL_MAX = 120;
export const FORM_FIELD_PLACEHOLDER_MAX = 160;
export const FORM_FIELD_VALUE_MAX = 4000;
export const FORM_SLUG_MAX = 80;
export const FORM_TITLE_MAX = 120;
export const FORM_SELECT_OPTION_LABEL_MAX = 120;
export const FORM_SELECT_OPTION_VALUE_MAX = 80;
export const FORM_SELECT_OPTIONS_MAX = 50;
export const FORM_FIELDS_MAX = 40;
export const FORM_HIDDEN_FIELD_VALUE_MAX = 120;

const selectOptionSchema = z
  .object({
    label: z.string().min(1).max(FORM_SELECT_OPTION_LABEL_MAX),
    value: z
      .string()
      .min(1)
      .max(FORM_SELECT_OPTION_VALUE_MAX)
      .regex(/^[a-z0-9_-]+$/, 'Option value must be lowercase alphanumeric, hyphens, or underscores.'),
  })
  .strict();

const baseFieldSchema = z
  .object({
    /** Internal field identifier — must be unique within the form. */
    id: z
      .string()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9_]+$/, 'Field id must be lowercase alphanumeric or underscores.'),
    label: z.string().min(1).max(FORM_FIELD_LABEL_MAX),
    placeholder: z.string().max(FORM_FIELD_PLACEHOLDER_MAX).optional(),
    required: z.boolean().optional(),
    type: z.enum(FORM_FIELD_TYPES),
  })
  .strict();

/** Validated form field definition. */
export const formFieldSchema = z
  .discriminatedUnion('type', [
    baseFieldSchema.extend({ type: z.literal('text') }),
    baseFieldSchema.extend({ type: z.literal('textarea') }),
    baseFieldSchema.extend({ type: z.literal('email') }),
    baseFieldSchema.extend({ type: z.literal('checkbox') }),
    baseFieldSchema
      .extend({
        options: z.array(selectOptionSchema).min(1).max(FORM_SELECT_OPTIONS_MAX),
        type: z.literal('select'),
      })
      .strict(),
    /** Hidden fields are allowed but their values are set by the operator and are safe static strings. */
    baseFieldSchema
      .extend({
        defaultValue: z.string().max(FORM_HIDDEN_FIELD_VALUE_MAX).optional(),
        type: z.literal('hidden'),
      })
      .strict(),
  ]);

export type FormFieldDefinition = z.infer<typeof formFieldSchema>;

export const formDefinitionSchema = z
  .object({
    description: z.string().max(280).optional(),
    fields: z
      .array(formFieldSchema)
      .min(1, 'A form must have at least one field.')
      .max(FORM_FIELDS_MAX, `A form may not have more than ${FORM_FIELDS_MAX} fields.`),
    slug: z
      .string()
      .min(1)
      .max(FORM_SLUG_MAX)
      .regex(/^[a-z0-9-]+$/, 'Form slug must be lowercase alphanumeric or hyphens.'),
    title: z.string().min(1).max(FORM_TITLE_MAX),
  })
  .strict();

export type FormDefinition = z.infer<typeof formDefinitionSchema>;

/** Safe public representation of a form (strips sensitive config). */
export type PublicFormDefinition = Pick<FormDefinition, 'description' | 'fields' | 'slug' | 'title'>;

export function toPublicFormDefinition(form: FormDefinition): PublicFormDefinition {
  return {
    description: form.description,
    fields: form.fields,
    slug: form.slug,
    title: form.title,
  };
}

/** Parse and validate a form definition. */
export function parseFormDefinition(input: unknown) {
  return formDefinitionSchema.safeParse(input);
}
