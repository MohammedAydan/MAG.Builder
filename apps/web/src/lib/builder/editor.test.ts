import { describe, expect, it } from 'vitest';
import { convertEditorDataToDraftDocument, parseBuilderSaveRequest } from '@/lib/builder/editor';

describe('builder editor save helpers', () => {
  it('rejects malformed save payloads before persistence', () => {
    const result = parseBuilderSaveRequest({
      data: {
        content: 'invalid',
        root: {},
      },
    });

    expect(result.success).toBe(false);
  });

  it('converts valid editor data into a builder-core document', () => {
    const result = convertEditorDataToDraftDocument({
      content: [
        {
          props: {
            background: 'none',
            content: [
              {
                props: {
                  align: 'left',
                  id: 'heading',
                  level: 2,
                  text: 'Draft heading',
                },
                type: 'core.heading',
              },
            ],
            gap: 'md',
            id: 'section',
            paddingY: 'md',
            width: 'content',
          },
          type: 'core.section',
        },
      ],
      root: {},
    });

    expect(result.success).toBe(true);
  });

  it('fails safely when the editor data produces invalid builder props', () => {
    const result = convertEditorDataToDraftDocument({
      content: [
        {
          props: {
            href: 'javascript:alert(1)',
            id: 'button',
            label: 'Unsafe',
            variant: 'primary',
          },
          type: 'core.button',
        },
      ],
      root: {},
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('Button link');
    }
  });
});
