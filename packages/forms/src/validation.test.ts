import { describe, expect, it } from 'vitest';
import { validateSubmission } from './validation';
import type { FormDefinition } from './types';

const contactForm: FormDefinition = {
  fields: [
    { id: 'name', label: 'Name', required: true, type: 'text' },
    { id: 'email', label: 'Email', required: true, type: 'email' },
    { id: 'message', label: 'Message', type: 'textarea' },
    { id: 'subscribe', label: 'Subscribe', type: 'checkbox' },
    {
      id: 'topic',
      label: 'Topic',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Support', value: 'support' },
      ],
      required: true,
      type: 'select',
    },
    { defaultValue: 'website', id: 'source', label: 'Source', type: 'hidden' },
  ],
  slug: 'contact',
  title: 'Contact',
};

describe('validateSubmission', () => {
  it('accepts a valid complete submission', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      message: 'Hello!',
      name: 'Alice',
      subscribe: true,
      topic: 'general',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.fields.name).toBe('Alice');
      expect(result.fields.email).toBe('user@example.com');
      expect(result.fields.topic).toBe('general');
      expect(result.fields.subscribe).toBe(true);
      // Hidden field uses defaultValue, ignoring any client value
      expect(result.fields.source).toBe('website');
    }
  });

  it('rejects a missing required text field', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      topic: 'general',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Name'))).toBe(true);
    }
  });

  it('rejects an invalid email format', () => {
    const result = validateSubmission(contactForm, {
      email: 'not-an-email',
      name: 'Alice',
      topic: 'general',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('valid email'))).toBe(true);
    }
  });

  it('rejects a select value not in options', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      name: 'Alice',
      topic: 'hacking',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('allowed options'))).toBe(true);
    }
  });

  it('rejects unknown fields', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      name: 'Alice',
      topic: 'general',
      unknownField: 'x',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('Unknown field'))).toBe(true);
    }
  });

  it('ignores client-provided value for hidden fields', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      name: 'Alice',
      // source is a hidden field — client should not send it, but if they do it is ignored
      topic: 'general',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.fields.source).toBe('website');
    }
  });

  it('sanitizes string input with control characters', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      name: 'Alice\x00\x01\x07',
      topic: 'general',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.fields.name).toBe('Alice');
    }
  });

  it('accepts checkbox as string "true"', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      name: 'Alice',
      subscribe: 'true',
      topic: 'general',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.fields.subscribe).toBe(true);
    }
  });

  it('rejects a non-object payload', () => {
    const result = validateSubmission(contactForm, 'not-an-object');
    expect(result.success).toBe(false);
  });

  it('rejects an array payload', () => {
    const result = validateSubmission(contactForm, []);
    expect(result.success).toBe(false);
  });

  it('rejects a submission with too many fields', () => {
    const bigPayload: Record<string, string> = {};
    for (let i = 0; i < 50; i++) {
      bigPayload[`field_${i}`] = 'x';
    }
    const result = validateSubmission(contactForm, bigPayload);
    expect(result.success).toBe(false);
  });

  it('rejects text exceeding max length', () => {
    const result = validateSubmission(contactForm, {
      email: 'user@example.com',
      message: 'x'.repeat(5000),
      name: 'Alice',
      topic: 'general',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some((e) => e.includes('too long'))).toBe(true);
    }
  });
});
