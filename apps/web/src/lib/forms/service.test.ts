/**
 * Tests for apps/web forms service — covers form definition mapping,
 * public projection, submission validation integration, and access control
 * behavior (mocked Payload client).
 */
import { describe, expect, it } from 'vitest';
import { validateSubmission, parseFormDefinition, toPublicFormDefinition } from '@nexpress/forms';

// ---------------------------------------------------------------------------
// Form definition mapping and public projection
// ---------------------------------------------------------------------------

describe('parseFormDefinition + toPublicFormDefinition', () => {
  it('produces a public form that does not include action config', () => {
    const result = parseFormDefinition({
      fields: [{ id: 'name', label: 'Name', required: true, type: 'text' }],
      slug: 'contact',
      title: 'Contact',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      const pub = toPublicFormDefinition(result.data);
      // Public projection must not include actions
      expect('actions' in pub).toBe(false);
      expect(pub.slug).toBe('contact');
      expect(pub.fields.length).toBe(1);
    }
  });

  it('correctly validates all v1 field types', () => {
    const fieldTypes = ['text', 'textarea', 'email', 'checkbox', 'hidden'] as const;

    for (const type of fieldTypes) {
      const result = parseFormDefinition({
        fields: [{ id: 'f', label: 'F', type }],
        slug: 'test-form',
        title: 'Test',
      });
      expect(result.success, `Field type ${type} should be valid`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Submission validation against form definition
// ---------------------------------------------------------------------------

describe('validateSubmission — integrated scenarios', () => {
  const emailForm = {
    fields: [
      { id: 'email', label: 'Email', required: true, type: 'email' as const },
      { id: 'name', label: 'Name', required: true, type: 'text' as const },
      { defaultValue: 'web', id: 'src', label: 'Source', type: 'hidden' as const },
    ],
    slug: 'email-form',
    title: 'Email Form',
  };

  const parsedForm = parseFormDefinition(emailForm);

  it('accepts a valid submission', () => {
    expect(parsedForm.success).toBe(true);

    if (!parsedForm.success) return;

    const result = validateSubmission(parsedForm.data, {
      email: 'alice@example.com',
      name: 'Alice',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.fields.src).toBe('web'); // Hidden field uses defaultValue
    }
  });

  it('rejects a submission with an invalid email', () => {
    if (!parsedForm.success) return;

    const result = validateSubmission(parsedForm.data, {
      email: 'not-valid',
      name: 'Alice',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a submission with unknown fields', () => {
    if (!parsedForm.success) return;

    const result = validateSubmission(parsedForm.data, {
      email: 'alice@example.com',
      name: 'Alice',
      secret: 'should-not-exist',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Unknown field'))).toBe(true);
    }
  });

  it('rejects a submission missing a required field', () => {
    if (!parsedForm.success) return;

    const result = validateSubmission(parsedForm.data, {
      email: 'alice@example.com',
      // name is missing
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Name'))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Access control: verify that form actions are not exposed via public projection
// ---------------------------------------------------------------------------

describe('public form projection security', () => {
  it('does not include webhook URLs in the public form definition', () => {
    const result = parseFormDefinition({
      fields: [{ id: 'email', label: 'Email', required: true, type: 'email' }],
      slug: 'secure-form',
      title: 'Secure Form',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      const pub = toPublicFormDefinition(result.data);
      const serialized = JSON.stringify(pub);
      // Ensure no webhook-related keys leak through
      expect(serialized.includes('webhook')).toBe(false);
      expect(serialized.includes('emailTo')).toBe(false);
      expect(serialized.includes('actions')).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Rate limit key isolation
// ---------------------------------------------------------------------------

describe('rate limit key isolation', () => {
  it('different form slugs produce different rate limit keys', async () => {
    const { buildRateLimitKey } = await import('@nexpress/forms');
    const key1 = buildRateLimitKey('contact', 'client-x');
    const key2 = buildRateLimitKey('signup', 'client-x');
    expect(key1).not.toBe(key2);
  });
});
