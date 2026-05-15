import type { ReactElement, ReactNode } from 'react';
import { coreBlockRegistry, type BuilderBlockRegistry, type BuilderKnownBlock, type BuilderRenderContext, type JsonObject } from '@nexpress/builder-core';
import type { Config, Slot } from '@measured/puck';

type SectionProps = {
  background: 'none' | 'strong' | 'surface';
  content?: Slot;
  gap: 'lg' | 'md' | 'sm';
  paddingY: 'lg' | 'md' | 'none' | 'sm';
  width: 'content' | 'full' | 'wide';
};

type HeadingProps = {
  align: 'center' | 'left' | 'right';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

type TextProps = {
  align: 'center' | 'left' | 'right';
  size: 'lg' | 'md' | 'sm';
  text: string;
  tone: 'default' | 'muted';
};

type ImageProps = {
  alt: string;
  aspectRatio: 'auto' | 'landscape' | 'portrait' | 'square';
  caption?: string;
  src: string;
};

type ButtonProps = {
  href: string;
  label: string;
  variant: 'ghost' | 'primary' | 'secondary';
};

type CommerceHandleInput = {
  handle: string;
};

type CommerceProductGridProps = {
  columns: 2 | 3 | 4;
  ctaMode: 'add-to-cart' | 'none';
  emptyMessage?: string;
  layout: 'grid' | 'list';
  limit: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  productHandles: CommerceHandleInput[];
  source: 'catalog' | 'manual';
  title?: string;
};

type CommerceProductDetailProps = {
  ctaMode: 'add-to-cart' | 'none';
  handle: string;
  showPrice: boolean;
  showVariants: boolean;
  title?: string;
};

type CommerceCartProps = {
  checkoutLabel?: string;
  emptyMessage?: string;
  loginMessage?: string;
  showCheckoutAction: boolean;
  title?: string;
};

type CommerceCollectionItemProps = {
  description?: string;
  href: string;
  label: string;
};

type CommerceCollectionListProps = {
  items: CommerceCollectionItemProps[];
  layout: 'cards' | 'links';
  title?: string;
};

export type NexpressEditorComponents = {
  'commerce.cart': CommerceCartProps;
  'commerce.collection-list': CommerceCollectionListProps;
  'commerce.product-detail': CommerceProductDetailProps;
  'commerce.product-grid': CommerceProductGridProps;
  'core.button': ButtonProps;
  'core.heading': HeadingProps;
  'core.image': ImageProps;
  'core.section': SectionProps;
  'core.text': TextProps;
};

function getDefinition(registry: BuilderBlockRegistry, type: keyof NexpressEditorComponents) {
  const definition = registry.get(type);

  if (!definition) {
    throw new Error(`Missing builder block definition for "${type}".`);
  }

  return definition;
}

function renderDefinition(
  type: keyof NexpressEditorComponents,
  id: string,
  props: JsonObject,
  children: ReactNode,
  registry: BuilderBlockRegistry,
) {
  const definition = getDefinition(registry, type);
  const context: BuilderRenderContext = {
    surface: 'admin',
  };
  const block: BuilderKnownBlock = {
    children: [],
    definition,
    id,
    kind: 'known',
    props,
    type,
  };

  return definition.render({
    block,
    children,
    context,
    props,
  });
}

export function createPuckConfig(registry: BuilderBlockRegistry = coreBlockRegistry): Config<NexpressEditorComponents> {
  return {
    categories: {
      actions: {
        components: ['core.button'],
        title: 'Actions',
      },
      commerce: {
        components: ['commerce.product-grid', 'commerce.product-detail', 'commerce.cart', 'commerce.collection-list'],
        title: 'Commerce',
      },
      layout: {
        components: ['core.section'],
        title: 'Layout',
      },
      media: {
        components: ['core.image'],
        title: 'Media',
      },
      typography: {
        components: ['core.heading', 'core.text'],
        title: 'Typography',
      },
    },
    components: {
      'commerce.cart': {
        defaultProps: {
          checkoutLabel: 'Checkout',
          emptyMessage: 'Your cart is empty.',
          loginMessage: 'Sign in to manage your cart.',
          showCheckoutAction: true,
          title: 'Cart',
          ...(getDefinition(registry, 'commerce.cart').defaultProps ?? {}),
        },
        fields: {
          checkoutLabel: {
            type: 'text',
          },
          emptyMessage: {
            type: 'text',
          },
          loginMessage: {
            type: 'text',
          },
          showCheckoutAction: {
            type: 'radio',
            options: [
              { label: 'Show checkout', value: true },
              { label: 'Hide checkout', value: false },
            ],
          },
          title: {
            type: 'text',
          },
        },
        label: 'Cart',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'commerce.cart',
            id,
            {
              ...(props.checkoutLabel ? { checkoutLabel: props.checkoutLabel } : {}),
              ...(props.emptyMessage ? { emptyMessage: props.emptyMessage } : {}),
              ...(props.loginMessage ? { loginMessage: props.loginMessage } : {}),
              showCheckoutAction: props.showCheckoutAction,
              ...(props.title ? { title: props.title } : {}),
            },
            null,
            registry,
          )}</>
        ),
      },
      'commerce.collection-list': {
        defaultProps: {
          items: [
            {
              description: 'Link to a featured collection or curated storefront landing page.',
              href: '/shop',
              label: 'Featured collection',
            },
          ],
          layout: 'cards',
          title: 'Shop collections',
          ...(getDefinition(registry, 'commerce.collection-list').defaultProps ?? {}),
        },
        fields: {
          items: {
            arrayFields: {
              description: {
                type: 'textarea',
              },
              href: {
                type: 'text',
              },
              label: {
                type: 'text',
              },
            },
            defaultItemProps: {
              description: '',
              href: '/shop',
              label: 'Collection',
            },
            getItemSummary: (item) => item.label || item.href,
            max: 12,
            type: 'array',
          },
          layout: {
            options: [
              { label: 'Cards', value: 'cards' },
              { label: 'Links', value: 'links' },
            ],
            type: 'select',
          },
          title: {
            type: 'text',
          },
        },
        label: 'Collection List',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'commerce.collection-list',
            id,
            {
              items: props.items ?? [],
              layout: props.layout,
              ...(props.title ? { title: props.title } : {}),
            },
            null,
            registry,
          )}</>
        ),
      },
      'commerce.product-detail': {
        defaultProps: {
          ctaMode: 'add-to-cart',
          handle: '',
          showPrice: true,
          showVariants: true,
          title: 'Product details',
          ...(getDefinition(registry, 'commerce.product-detail').defaultProps ?? {}),
        },
        fields: {
          ctaMode: {
            options: [
              { label: 'Add to cart', value: 'add-to-cart' },
              { label: 'No CTA', value: 'none' },
            ],
            type: 'select',
          },
          handle: {
            type: 'text',
          },
          showPrice: {
            options: [
              { label: 'Show price', value: true },
              { label: 'Hide price', value: false },
            ],
            type: 'radio',
          },
          showVariants: {
            options: [
              { label: 'Show variants', value: true },
              { label: 'Hide variants', value: false },
            ],
            type: 'radio',
          },
          title: {
            type: 'text',
          },
        },
        label: 'Product Detail',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'commerce.product-detail',
            id,
            {
              ctaMode: props.ctaMode,
              handle: props.handle,
              showPrice: props.showPrice,
              showVariants: props.showVariants,
              ...(props.title ? { title: props.title } : {}),
            },
            null,
            registry,
          )}</>
        ),
      },
      'commerce.product-grid': {
        defaultProps: {
          columns: 3,
          ctaMode: 'add-to-cart',
          emptyMessage: 'No products are available yet.',
          layout: 'grid',
          limit: 6,
          productHandles: [],
          source: 'catalog',
          title: 'Featured products',
          ...(getDefinition(registry, 'commerce.product-grid').defaultProps ?? {}),
        },
        fields: {
          columns: {
            options: [
              { label: '2 columns', value: 2 },
              { label: '3 columns', value: 3 },
              { label: '4 columns', value: 4 },
            ],
            type: 'select',
          },
          ctaMode: {
            options: [
              { label: 'Add to cart', value: 'add-to-cart' },
              { label: 'No CTA', value: 'none' },
            ],
            type: 'select',
          },
          emptyMessage: {
            type: 'text',
          },
          layout: {
            options: [
              { label: 'Grid', value: 'grid' },
              { label: 'List', value: 'list' },
            ],
            type: 'select',
          },
          limit: {
            options: [1, 2, 3, 4, 6, 8, 12].map((value) => ({
              label: `${value}`,
              value,
            })),
            type: 'select',
          },
          productHandles: {
            arrayFields: {
              handle: {
                type: 'text',
              },
            },
            defaultItemProps: {
              handle: '',
            },
            getItemSummary: (item, index) => item.handle || `Product ${index ?? 0}`,
            max: 12,
            type: 'array',
          },
          source: {
            options: [
              { label: 'Catalog', value: 'catalog' },
              { label: 'Manual', value: 'manual' },
            ],
            type: 'select',
          },
          title: {
            type: 'text',
          },
        },
        label: 'Product Grid',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'commerce.product-grid',
            id,
            {
              columns: props.columns,
              ctaMode: props.ctaMode,
              ...(props.emptyMessage ? { emptyMessage: props.emptyMessage } : {}),
              layout: props.layout,
              limit: props.limit,
              productHandles: props.productHandles ?? [],
              source: props.source,
              ...(props.title ? { title: props.title } : {}),
            },
            null,
            registry,
          )}</>
        ),
      },
      'core.button': {
        defaultProps: {
          ...(getDefinition(registry, 'core.button').defaultProps ?? {}),
          href: '/contact',
          label: 'Get started',
          variant: 'primary',
        },
        fields: {
          href: {
            type: 'text',
          },
          label: {
            type: 'text',
          },
          variant: {
            options: [
              { label: 'Primary', value: 'primary' },
              { label: 'Secondary', value: 'secondary' },
              { label: 'Ghost', value: 'ghost' },
            ],
            type: 'select',
          },
        },
        label: 'Button',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.button',
            id,
            {
              href: props.href,
              label: props.label,
              variant: props.variant,
            },
            null,
            registry,
          )}</>
        ),
      },
      'core.heading': {
        defaultProps: {
          align: 'left',
          level: 2,
          text: 'Heading',
          ...(getDefinition(registry, 'core.heading').defaultProps ?? {}),
        },
        fields: {
          align: {
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ],
            type: 'radio',
          },
          level: {
            options: [1, 2, 3, 4, 5, 6].map((value) => ({
              label: `H${value}`,
              value,
            })),
            type: 'select',
          },
          text: {
            type: 'text',
          },
        },
        label: 'Heading',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.heading',
            id,
            {
              align: props.align,
              level: props.level,
              text: props.text,
            },
            null,
            registry,
          )}</>
        ),
      },
      'core.image': {
        defaultProps: {
          alt: 'Image description',
          aspectRatio: 'landscape',
          src: '/media/placeholder.jpg',
          ...(getDefinition(registry, 'core.image').defaultProps ?? {}),
        },
        fields: {
          alt: {
            type: 'text',
          },
          aspectRatio: {
            options: [
              { label: 'Auto', value: 'auto' },
              { label: 'Landscape', value: 'landscape' },
              { label: 'Portrait', value: 'portrait' },
              { label: 'Square', value: 'square' },
            ],
            type: 'select',
          },
          caption: {
            type: 'textarea',
          },
          src: {
            type: 'text',
          },
        },
        label: 'Image',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.image',
            id,
            {
              alt: props.alt,
              ...(props.caption ? { caption: props.caption } : {}),
              aspectRatio: props.aspectRatio,
              src: props.src,
            },
            null,
            registry,
          )}</>
        ),
      },
      'core.section': {
        defaultProps: {
          content: [],
          background: 'none',
          gap: 'md',
          paddingY: 'md',
          width: 'content',
        },
        fields: {
          background: {
            options: [
              { label: 'None', value: 'none' },
              { label: 'Surface', value: 'surface' },
              { label: 'Strong', value: 'strong' },
            ],
            type: 'select',
          },
          content: {
            allow: [
              'core.heading',
              'core.text',
              'core.image',
              'core.button',
              'core.section',
              'commerce.product-grid',
              'commerce.product-detail',
              'commerce.cart',
              'commerce.collection-list',
            ],
            type: 'slot',
          },
          gap: {
            options: [
              { label: 'Small', value: 'sm' },
              { label: 'Medium', value: 'md' },
              { label: 'Large', value: 'lg' },
            ],
            type: 'select',
          },
          paddingY: {
            options: [
              { label: 'None', value: 'none' },
              { label: 'Small', value: 'sm' },
              { label: 'Medium', value: 'md' },
              { label: 'Large', value: 'lg' },
            ],
            type: 'select',
          },
          width: {
            options: [
              { label: 'Content', value: 'content' },
              { label: 'Wide', value: 'wide' },
              { label: 'Full', value: 'full' },
            ],
            type: 'select',
          },
        },
        label: 'Section',
        render: ({ content: Content, id, ...props }) => (
          <>{renderDefinition(
            'core.section',
            id,
            {
              background: props.background,
              gap: props.gap,
              paddingY: props.paddingY,
              width: props.width,
            },
            Content ? <Content /> : null,
            registry,
          )}</>
        ),
      },
      'core.text': {
        defaultProps: {
          align: 'left',
          size: 'md',
          text: 'Text block',
          tone: 'default',
          ...(getDefinition(registry, 'core.text').defaultProps ?? {}),
        },
        fields: {
          align: {
            options: [
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ],
            type: 'radio',
          },
          size: {
            options: [
              { label: 'Small', value: 'sm' },
              { label: 'Medium', value: 'md' },
              { label: 'Large', value: 'lg' },
            ],
            type: 'select',
          },
          text: {
            type: 'textarea',
          },
          tone: {
            options: [
              { label: 'Default', value: 'default' },
              { label: 'Muted', value: 'muted' },
            ],
            type: 'select',
          },
        },
        label: 'Text',
        render: ({ id, ...props }) => (
          <>{renderDefinition(
            'core.text',
            id,
            {
              align: props.align,
              size: props.size,
              text: props.text,
              tone: props.tone,
            },
            null,
            registry,
          )}</>
        ),
      },
    },
    root: {
      render: ({ children }): ReactElement => (
        <div className="min-h-full bg-[var(--color-canvas)] py-6">
          {children}
        </div>
      ),
    },
  };
}
