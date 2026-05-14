import { describe, expect, it } from 'vitest';
import { migrateBuilderDocument } from './migrations';

describe('builder document migrations', () => {
  it('migrates the legacy v0 shape deterministically', () => {
    const result = migrateBuilderDocument({
      content: [
        {
          config: {
            text: 'Legacy title',
          },
          id: 'legacy-heading',
          kind: 'core.heading',
          items: [
            {
              config: {
                text: 'Legacy body',
              },
              id: 'legacy-text',
              kind: 'core.text',
            },
          ],
        },
      ],
      schema: 'nexpress-builder',
      version: 0,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.migrated).toBe(true);
      expect(result.document.version).toBe(1);
      expect(result.document.meta?.migratedFromVersion).toBe(0);
      expect(result.document.blocks[0]).toEqual({
        children: [
          {
            children: undefined,
            id: 'legacy-text',
            props: {
              text: 'Legacy body',
            },
            type: 'core.text',
          },
        ],
        id: 'legacy-heading',
        props: {
          text: 'Legacy title',
        },
        type: 'core.heading',
      });
    }
  });
});
