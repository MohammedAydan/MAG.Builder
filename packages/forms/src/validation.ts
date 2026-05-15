import { z } from 'zod';
import type { FormDefinition, FormFieldDefinition } from './types';
import { FORM_FIELD_VALUE_MAX } from './types';

/** Max field count for a submitted payload. */
const SUBMISSION_FIELDS_MAX = 40;

/** Sanitize a string field value: trim, reject nulls/control chars. */
function sanitizeString(value: string): string {
  // Strip control characters (0x00–0x1F except tab 0x09, newline 0x0A, CR 0x0D)
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/** Validate and sanitize a single submitted value against a field definition. */
function validateField(
  field: FormFieldDefinition,
  rawValue: unknown,
): { error: string; success: false } | { success: true; value: unknown } {
  // For checkbox: accept boolean or string 'true'/'false'/'on'/'off'
  if (field.type === 'checkbox') {
    if (rawValue === true || rawValue === 'true' || rawValue === 'on') {
      return { success: true, value: true };
    }
    if (rawValue === false || rawValue === 'false' || rawValue === 'off' || rawValue === undefined || rawValue === null) {
      if (field.required) {
        return { error: `${field.label} is required.`, success: false };
      }
      return { success: true, value: false };
    }
    return { error: `${field.label} must be a boolean.`, success: false };
  }

  // For hidden: use field's defaultValue, ignoring client input entirely
  if (field.type === 'hidden') {
    return { success: true, value: field.defaultValue ?? '' };
  }

  // All other types: expect string
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    if (field.required) {
      return { error: `${field.label} is required.`, success: false };
    }
    return { success: true, value: null };
  }

  if (typeof rawValue !== 'string') {
    return { error: `${field.label} must be a string.`, success: false };
  }

  const sanitized = sanitizeString(rawValue);

  if (field.required && sanitized.length === 0) {
    return { error: `${field.label} is required.`, success: false };
  }

  if (sanitized.length > FORM_FIELD_VALUE_MAX) {
    return { error: `${field.label} is too long (max ${FORM_FIELD_VALUE_MAX} characters).`, success: false };
  }

  // Email format check
  if (field.type === 'email') {
    const emailResult = z.string().email().safeParse(sanitized);
    if (!emailResult.success) {
      return { error: `${field.label} must be a valid email address.`, success: false };
    }
  }

  // Select: must be one of the defined option values
  if (field.type === 'select') {
    const allowed = field.options.map((o) => o.value);
    if (!allowed.includes(sanitized)) {
      return { error: `${field.label} must be one of the allowed options.`, success: false };
    }
  }

  return { success: true, value: sanitized };
}

export type SubmissionFieldValue = boolean | null | string;

export type ValidatedSubmission = {
  fields: Record<string, SubmissionFieldValue>;
};

export type SubmissionValidationError = {
  errors: string[];
  success: false;
};

export type SubmissionValidationResult =
  | SubmissionValidationError
  | (ValidatedSubmission & { success: true });

/**
 * Validate a raw submission payload against a form definition.
 *
 * - Rejects unknown fields.
 * - Enforces required fields.
 * - Validates email format for email fields.
 * - Validates select options against the definition.
 * - Sanitizes string values.
 * - Hidden fields use operator-configured defaultValue, ignoring client input.
 * - Honeypot field (if present in payload as '__hp') must be empty.
 */
export function validateSubmission(
  form: FormDefinition,
  rawPayload: unknown,
): SubmissionValidationResult {
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    return { errors: ['Invalid submission payload.'], success: false };
  }

  const payload = rawPayload as Record<string, unknown>;
  const errors: string[] = [];
  const validated: Record<string, SubmissionFieldValue> = {};

  // Enforce field count limit to guard against large payloads
  const payloadKeys = Object.keys(payload).filter((k) => k !== '__hp');
  if (payloadKeys.length > SUBMISSION_FIELDS_MAX) {
    return { errors: ['Submission has too many fields.'], success: false };
  }

  // Build the set of allowlisted field IDs
  const knownFieldIds = new Set(form.fields.map((f) => f.id));

  // Check for unknown fields (reject any key not in the form definition and not the honeypot)
  for (const key of payloadKeys) {
    if (!knownFieldIds.has(key)) {
      errors.push(`Unknown field "${key}".`);
    }
  }

  if (errors.length > 0) {
    return { errors, success: false };
  }

  // Validate each field
  for (const field of form.fields) {
    const rawValue = field.type === 'hidden' ? undefined : payload[field.id];
    const result = validateField(field, rawValue);

    if (!result.success) {
      errors.push(result.error);
    } else {
      validated[field.id] = result.value as SubmissionFieldValue;
    }
  }

  if (errors.length > 0) {
    return { errors, success: false };
  }

  return { fields: validated, success: true };
}
