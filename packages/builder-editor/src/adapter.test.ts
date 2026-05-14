import { describe, expect, it } from 'vitest';
import { coreBlockRegistry } from '@nexpress/builder-core';
import { builderDocumentToEditorData, editorDataToBuilderDocument } from './adapter';

describe('builder editor adapter', () => {
  it('converts a nested builder document into editor data', () => {
    const result = builderDocumentToEditorData(
      {
        blocks: [
          {
            children: [
              {
                id: 'heading',
                props: {
                  align: 'left',
                  level: 2,
                  text: 'Adapter heading',
                },
                type: 'core.heading',
              },
            ],
            id: 'section',
            props: {
              background: 'none',
              gap: 'md',
              paddingY: 'md',
              width: 'content',
            },
            type: 'core.section',
          },
        ],
        schema: 'nexpress-builder',
        version: 1,
      },
      coreBlockRegistry,
    );

    expect(result.warnings).toEqual([]);
    expect(result.data.content[0]).toEqual({
      props: {
        background: 'none',
        content: [
          {
            props: {
              align: 'left',
              id: 'heading',
              level: 2,
              text: 'Adapter heading',
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
    });
  });

  it('converts editor data back into a builder document and preserves ids', () => {
    const result = editorDataToBuilderDocument(
      {
        content: [
          {
            props: {
              background: 'surface',
              content: [
                {
                  props: {
                    align: 'left',
                    id: 'copy',
                    size: 'md',
                    text: 'Nested copy',
                    tone: 'default',
                  },
                  type: 'core.text',
                },
              ],
              gap: 'md',
              id: 'section',
              paddingY: 'sm',
              width: 'content',
            },
            type: 'core.section',
          },
        ],
        root: {},
      },
      coreBlockRegistry,
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.document).toEqual({
        blocks: [
          {
            children: [
              {
                id: 'copy',
                props: {
                  align: 'left',
                  size: 'md',
                  text: 'Nested copy',
                  tone: 'default',
                },
                type: 'core.text',
              },
            ],
            id: 'section',
            props: {
              background: 'surface',
              gap: 'md',
              paddingY: 'sm',
              width: 'content',
            },
            type: 'core.section',
          },
        ],
        schema: 'nexpress-builder',
        version: 1,
      });
    }
  });

  it('drops unsupported blocks when opening the editor instead of crashing', () => {
    const result = builderDocumentToEditorData(
      {
        blocks: [
          {
            id: 'plugin-block',
            props: {},
            type: 'plugin.hero',
          },
        ],
        schema: 'nexpress-builder',
        version: 1,
      },
      coreBlockRegistry,
    );

    expect(result.data.content).toEqual([]);
    expect(result.warnings[0]).toContain('Dropped unsupported builder block');
  });
});
