import { describe, expect, it } from 'vitest';
import { validateBuilderDocumentStructure } from './validation';

describe('builder document structure validation', () => {
  it('accepts a valid versioned builder document', () => {
    const result = validateBuilderDocumentStructure({
      blocks: [
        {
          id: 'hero',
          props: {
            text: 'Hello world',
          },
          type: 'core.text',
        },
      ],
      schema: 'nexpress-builder',
      version: 1,
    });

    expect(result.success).toBe(true);
  });

  it('rejects malformed documents', () => {
    const result = validateBuilderDocumentStructure({
      blocks: [
        {
          id: 'bad id',
          type: 'core.text',
        },
      ],
      schema: 'nexpress-builder',
      version: 1,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.errors[0]).toContain('Block id');
    }
  });
});
