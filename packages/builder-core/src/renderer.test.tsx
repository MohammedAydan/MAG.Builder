import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { coreBlockRegistry } from './blocks/core-blocks';
import { renderBuilderDocument, renderValidatedBuilderDocument } from './renderer';
import { validateBuilderDocument } from './validation';

describe('builder renderer', () => {
  it('renders a valid nested document in order', () => {
    const validation = validateBuilderDocument(
      {
        blocks: [
          {
            children: [
              {
                id: 'heading',
                props: {
                  align: 'left',
                  level: 2,
                  text: 'Phase 10',
                },
                type: 'core.heading',
              },
              {
                id: 'body',
                props: {
                  align: 'left',
                  size: 'md',
                  text: 'Builder kernel foundations.',
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
      },
      coreBlockRegistry,
    );

    expect(validation.success).toBe(true);

    if (validation.success) {
      const html = renderToStaticMarkup(renderValidatedBuilderDocument(validation.document));

      expect(html).toContain('Phase 10');
      expect(html).toContain('Builder kernel foundations.');
      expect(html.indexOf('Phase 10')).toBeLessThan(html.indexOf('Builder kernel foundations.'));
    }
  });

  it('renders unknown blocks as safe placeholders without crashing children', () => {
    const html = renderToStaticMarkup(
      renderBuilderDocument(
        {
          blocks: [
            {
              children: [
                {
                  id: 'child-copy',
                  props: {
                    align: 'left',
                    size: 'md',
                    text: 'Child content survives unknown wrappers.',
                    tone: 'default',
                  },
                  type: 'core.text',
                },
              ],
              id: 'unknown-wrapper',
              props: {},
              type: 'plugin.hero',
            },
          ],
          schema: 'nexpress-builder',
          version: 1,
        },
        {
          registry: coreBlockRegistry,
        },
      ),
    );

    expect(html).toContain('Unsupported block type');
    expect(html).toContain('Child content survives unknown wrappers.');
  });

  it('falls back safely when the document is invalid', () => {
    const html = renderToStaticMarkup(
      renderBuilderDocument(
        {
          blocks: 'not-an-array',
          schema: 'nexpress-builder',
          version: 1,
        },
        {
          fallback: <p>Legacy body fallback.</p>,
          registry: coreBlockRegistry,
        },
      ),
    );

    expect(html).toContain('Legacy body fallback.');
  });

  it('keeps rendering around invalid block props', () => {
    const html = renderToStaticMarkup(
      renderBuilderDocument(
        {
          blocks: [
            {
              id: 'invalid-button',
              props: {
                href: 'javascript:alert(1)',
                label: 'Unsafe',
                variant: 'primary',
              },
              type: 'core.button',
            },
            {
              id: 'safe-text',
              props: {
                align: 'left',
                size: 'md',
                text: 'Safe sibling content.',
                tone: 'default',
              },
              type: 'core.text',
            },
          ],
          schema: 'nexpress-builder',
          version: 1,
        },
        {
          registry: coreBlockRegistry,
        },
      ),
    );

    expect(html).toContain('Invalid block');
    expect(html).toContain('Safe sibling content.');
  });

  it('renders storefront collection links safely without an app callback', () => {
    const html = renderToStaticMarkup(
      renderBuilderDocument(
        {
          blocks: [
            {
              id: 'collections',
              props: {
                items: [
                  {
                    description: 'Curated storefront links stay static and safe.',
                    href: '/shop/new-arrivals',
                    label: 'New arrivals',
                  },
                ],
                layout: 'cards',
                title: 'Shop collections',
              },
              type: 'commerce.collection-list',
            },
          ],
          schema: 'nexpress-builder',
          version: 1,
        },
        {
          registry: coreBlockRegistry,
        },
      ),
    );

    expect(html).toContain('Shop collections');
    expect(html).toContain('New arrivals');
    expect(html).toContain('/shop/new-arrivals');
  });

  it('fails storefront product blocks safely when no public renderer callback is provided', () => {
    const html = renderToStaticMarkup(
      renderBuilderDocument(
        {
          blocks: [
            {
              id: 'product-grid',
              props: {
                columns: 3,
                ctaMode: 'add-to-cart',
                layout: 'grid',
                limit: 3,
                productHandles: [],
                source: 'catalog',
                title: 'Featured products',
              },
              type: 'commerce.product-grid',
            },
          ],
          schema: 'nexpress-builder',
          version: 1,
        },
        {
          registry: coreBlockRegistry,
        },
      ),
    );

    expect(html).toContain('unavailable on the public renderer');
  });
});
