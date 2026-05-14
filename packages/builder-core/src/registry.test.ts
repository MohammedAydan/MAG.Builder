import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createBlockRegistry } from './registry';

describe('block registry', () => {
  it('rejects duplicate block types', () => {
    expect(() =>
      createBlockRegistry([
        {
          displayName: 'One',
          propsSchema: z.object({}),
          render: () => null,
          type: 'duplicate.block',
        },
        {
          displayName: 'Two',
          propsSchema: z.object({}),
          render: () => null,
          type: 'duplicate.block',
        },
      ]),
    ).toThrow(/Duplicate builder block type/);
  });

  it('rejects invalid default props', () => {
    expect(() =>
      createBlockRegistry([
        {
          defaultProps: {
            href: '/safe',
          },
          displayName: 'Broken',
          propsSchema: z.object({
            href: z.string().url(),
          }),
          render: () => null,
          type: 'broken.button',
        },
      ]),
    ).toThrow(/invalid defaultProps/);
  });
});
