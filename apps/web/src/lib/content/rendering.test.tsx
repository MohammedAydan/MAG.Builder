import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { renderPublishedPageContent } from '@/lib/content/rendering';

describe('published page rendering', () => {
  it('renders the builder document when it validates', () => {
    const html = renderToStaticMarkup(
      renderPublishedPageContent({
        body: 'Legacy body',
        builder: {
          blocks: [
            {
              children: [
                {
                  id: 'heading',
                  props: {
                    align: 'left',
                    level: 2,
                    text: 'Builder page',
                  },
                  type: 'core.heading',
                },
              ],
              id: 'section',
              props: {
                background: 'none',
                gap: 'md',
                paddingY: 'sm',
                width: 'content',
              },
              type: 'core.section',
            },
          ],
          schema: 'nexpress-builder',
          version: 1,
        },
      }),
    );

    expect(html).toContain('Builder page');
    expect(html).not.toContain('Legacy body');
  });

  it('falls back to the legacy body when builder JSON is invalid', () => {
    const html = renderToStaticMarkup(
      renderPublishedPageContent({
        body: 'Legacy fallback survives.',
        builder: {
          blocks: 'broken',
          schema: 'nexpress-builder',
          version: 1,
        },
      }),
    );

    expect(html).toContain('Legacy fallback survives.');
  });

  it('renders safe placeholders for unknown blocks instead of crashing', () => {
    const html = renderToStaticMarkup(
      renderPublishedPageContent({
        body: 'Legacy body',
        builder: {
          blocks: [
            {
              children: [
                {
                  id: 'body',
                  props: {
                    align: 'left',
                    size: 'md',
                    text: 'Known child content.',
                    tone: 'default',
                  },
                  type: 'core.text',
                },
              ],
              id: 'plugin-wrapper',
              props: {},
              type: 'plugin.card',
            },
          ],
          schema: 'nexpress-builder',
          version: 1,
        },
      }),
    );

    expect(html).toContain('Unsupported block type');
    expect(html).toContain('Known child content.');
  });
});
