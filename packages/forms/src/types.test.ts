import { describe, expect, it } from 'vitest';
import { parseFormDefinition, type FormDefinition } from './types';

const minimalForm: FormDefinition = {
  fields: [{ id: 'name', label: 'Name', required: true, type: 'text' }],
  slug: 'contact',
  title: 'Contact',
};

describe('parseFormDefinition', () => {
  it('accepts a minimal valid form definition', () => {
    const result = parseFormDefinition(minimalForm);
    expect(result.success).toBe(true);
  });

  it('accepts a full form with all field types', () => {
    const result = parseFormDefinition({
      description: 'A full form',
      fields: [
        { id: 'name', label: 'Name', required: true, type: 'text' },
        { id: 'message', label: 'Message', type: 'textarea' },
        { id: 'email', label: 'Email', required: true, type: 'email' },
        { id: 'subscribe', label: 'Subscribe', type: 'checkbox' },
        {
          id: 'topic',
          label: 'Topic',
          options: [
            { label: 'General', value: 'general' },
            { label: 'Support', value: 'support' },
          ],
          type: 'select',
        },
        { defaultValue: 'website', id: 'source', label: 'Source', type: 'hidden' },
      ],
      slug: 'contact-us',
      title: 'Contact Us',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty fields array', () => {
    const result = parseFormDefinition({ ...minimalForm, fields: [] });
    expect(result.success).toBe(false);
  });

  it('rejects a slug with uppercase letters', () => {
    const result = parseFormDefinition({ ...minimalForm, slug: 'My-Form' });
    expect(result.success).toBe(false);
  });

  it('rejects a slug with spaces', () => {
    const result = parseFormDefinition({ ...minimalForm, slug: 'my form' });
    expect(result.success).toBe(false);
  });

  it('rejects a field ID with uppercase letters', () => {
    const result = parseFormDefinition({
      ...minimalForm,
      fields: [{ id: 'MyField', label: 'Name', type: 'text' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a select field with no options', () => {
    const result = parseFormDefinition({
      ...minimalForm,
      fields: [{ id: 'topic', label: 'Topic', options: [], type: 'select' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown field types', () => {
    const result = parseFormDefinition({
      ...minimalForm,
      fields: [{ id: 'f', label: 'F', type: 'file' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects extra unknown top-level keys (strict)', () => {
    const result = parseFormDefinition({ ...minimalForm, customProp: 'x' });
    expect(result.success).toBe(false);
  });
});
