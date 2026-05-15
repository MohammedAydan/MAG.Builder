import { describe, expect, it } from 'vitest';
import { coreBlockRegistry } from './blocks/core-blocks';
import { validateBuilderDocument, validateBuilderDocumentStructure } from './validation';

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

  it('rejects unsafe storefront commerce props', () => {
    const result = validateBuilderDocument(
      {
        blocks: [
          {
            id: 'product-detail',
            props: {
              ctaMode: 'add-to-cart',
              handle: 'bad handle',
              showPrice: true,
              showVariants: true,
              title: 'Unsafe product',
            },
            type: 'commerce.product-detail',
          },
        ],
        schema: 'nexpress-builder',
        version: 1,
      },
      coreBlockRegistry,
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.document.blocks[0]?.kind).toBe('invalid');
    }
  });
});
