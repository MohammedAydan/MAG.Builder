import type { ComponentConfig } from '@measured/puck';
import { coreBlockRegistry, type BuilderBlockRegistry } from '@nexpress/builder-core';
import { getDefinition, renderDefinition } from './utils';

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

export type CommerceComponents = {
  'commerce.cart': CommerceCartProps;
  'commerce.collection-list': CommerceCollectionListProps;
  'commerce.product-detail': CommerceProductDetailProps;
  'commerce.product-grid': CommerceProductGridProps;
};

export function createCommerceConfig(registry: BuilderBlockRegistry = coreBlockRegistry): any {
  return {
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
          options: [
            { label: 'Show checkout', value: true },
            { label: 'Hide checkout', value: false },
          ],
          type: 'radio',
        },
        title: {
          type: 'text',
        },
      },
      label: 'Cart',
      render: ({ id, ...props }: { id: string } & CommerceCartProps) => (
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
          getItemSummary: (item: any) => item.label || item.href,
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
      render: ({ id, ...props }: { id: string } & CommerceCollectionListProps) => (
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
      render: ({ id, ...props }: { id: string } & CommerceProductDetailProps) => (
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
          getItemSummary: (item: any, index: any) => item.handle || `Product ${index ?? 0}`,
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
      render: ({ id, ...props }: { id: string } & CommerceProductGridProps) => (
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
  };
}
