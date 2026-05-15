import { z } from 'zod';
import { isSafeHref } from '../url';
import { createDefinition, renderExternalBlock, renderPlaceholder } from './utils';

const SAFE_COMMERCE_HANDLE_REGEX = /^[a-z0-9-]{1,160}$/;

const commerceHandleSchema = z
  .string()
  .max(160, 'Product handle is too long.')
  .refine(
    (value) => value === '' || SAFE_COMMERCE_HANDLE_REGEX.test(value),
    'Product handle must be lowercase alphanumeric or hyphens only.',
  );

const commerceProductGridPropsSchema = z.object({
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().default(3),
  ctaMode: z.enum(['add-to-cart', 'none']).optional().default('add-to-cart'),
  emptyMessage: z.string().max(160, 'Empty message is too long.').optional(),
  layout: z.enum(['grid', 'list']).optional().default('grid'),
  limit: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(6), z.literal(8), z.literal(12)]).optional().default(6),
  productHandles: z
    .array(
      z.object({
        handle: z
          .string()
          .min(1, 'Product handles cannot be empty.')
          .max(160, 'Product handle is too long.')
          .regex(SAFE_COMMERCE_HANDLE_REGEX, 'Product handles must be lowercase alphanumeric or hyphens only.'),
      }),
    )
    .max(12, 'Select at most 12 products.')
    .optional()
    .default([]),
  source: z.enum(['catalog', 'manual']).optional().default('catalog'),
  title: z.string().max(120, 'Grid title is too long.').optional(),
});

const commerceProductDetailPropsSchema = z.object({
  ctaMode: z.enum(['add-to-cart', 'none']).optional().default('add-to-cart'),
  handle: commerceHandleSchema.optional().default(''),
  showPrice: z.boolean().optional().default(true),
  showVariants: z.boolean().optional().default(true),
  title: z.string().max(120, 'Product detail title is too long.').optional(),
});

const commerceCartPropsSchema = z.object({
  checkoutLabel: z.string().max(80, 'Checkout label is too long.').optional(),
  emptyMessage: z.string().max(160, 'Empty message is too long.').optional(),
  loginMessage: z.string().max(160, 'Login message is too long.').optional(),
  showCheckoutAction: z.boolean().optional().default(true),
  title: z.string().max(120, 'Cart title is too long.').optional(),
});

const commerceCollectionItemSchema = z.object({
  description: z.string().max(160, 'Collection description is too long.').optional(),
  href: z
    .string()
    .min(1, 'Collection link is required.')
    .refine((value) => isSafeHref(value), 'Collection link must be a safe relative or absolute URL.'),
  label: z.string().min(1, 'Collection label is required.').max(80, 'Collection label is too long.'),
});

const commerceCollectionListPropsSchema = z.object({
  items: z.array(commerceCollectionItemSchema).max(12, 'Select at most 12 collection links.').optional().default([]),
  layout: z.enum(['cards', 'links']).optional().default('cards'),
  title: z.string().max(120, 'Collection title is too long.').optional(),
});

type CommerceProductGridProps = z.infer<typeof commerceProductGridPropsSchema>;
type CommerceProductDetailProps = z.infer<typeof commerceProductDetailPropsSchema>;
type CommerceCartProps = z.infer<typeof commerceCartPropsSchema>;
type CommerceCollectionListProps = z.infer<typeof commerceCollectionListPropsSchema>;

export const commerceDefinitions = [
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      columns: 3,
      ctaMode: 'add-to-cart',
      emptyMessage: 'No products are available yet.',
      layout: 'grid',
      limit: 6,
      productHandles: [],
      source: 'catalog',
      title: 'Featured products',
    },
    displayName: 'Product Grid',
    propsSchema: commerceProductGridPropsSchema,
    render: ({ block, context, props }) => {
      const gridProps = props as CommerceProductGridProps;

      if (gridProps.source === 'manual' && gridProps.productHandles.length === 0) {
        return renderPlaceholder(
          'Select one or more product handles to render this product grid.',
          gridProps.title,
        );
      }

      return renderExternalBlock(
        block,
        context,
        props as any,
        <div className="space-y-4 rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{gridProps.title || 'Product grid'}</p>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {gridProps.source === 'catalog'
                  ? `Catalog feed, limit ${gridProps.limit}.`
                  : `${gridProps.productHandles.length} selected products.`}
              </p>
            </div>
            <span className="rounded-[var(--radius-chip)] bg-white px-3 py-1 text-xs font-medium text-[var(--color-ink-muted)]">
              {gridProps.layout} / {gridProps.columns} cols
            </span>
          </div>
          <div className={gridProps.layout === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
            {Array.from({ length: Math.min(gridProps.limit, 3) }).map((_, index) => (
              <div
                key={`product-grid-preview-${index + 1}`}
                className="rounded-[var(--radius-surface)] border border-[var(--color-border-strong)] bg-white p-4"
              >
                <p className="text-sm font-semibold text-[var(--color-ink)]">Commerce product preview</p>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Live product data loads on the public site.</p>
              </div>
            ))}
          </div>
        </div>,
        'This storefront commerce block is unavailable on the public renderer.',
      );
    },
    type: 'commerce.product-grid',
  }),
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      ctaMode: 'add-to-cart',
      handle: '',
      showPrice: true,
      showVariants: true,
      title: 'Product details',
    },
    displayName: 'Product Detail',
    propsSchema: commerceProductDetailPropsSchema,
    render: ({ block, context, props }) => {
      const detailProps = props as CommerceProductDetailProps;

      if (!detailProps.handle) {
        return renderPlaceholder('Select a product handle to render this product detail block.', detailProps.title);
      }

      return renderExternalBlock(
        block,
        context,
        props as any,
        <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5">
          <p className="text-sm font-semibold text-[var(--color-ink)]">{detailProps.title || 'Product detail'}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Handle: {detailProps.handle}</p>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Live product pricing and variant data load on the public site.
          </p>
        </div>,
        'This storefront commerce block is unavailable on the public renderer.',
      );
    },
    type: 'commerce.product-detail',
  }),
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      checkoutLabel: 'Checkout',
      emptyMessage: 'Your cart is empty.',
      loginMessage: 'Sign in to manage your cart.',
      showCheckoutAction: true,
      title: 'Cart',
    },
    displayName: 'Cart',
    propsSchema: commerceCartPropsSchema,
    render: ({ block, context, props }) => {
      const cartProps = props as CommerceCartProps;

      return renderExternalBlock(
        block,
        context,
        props as any,
        <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5">
          <p className="text-sm font-semibold text-[var(--color-ink)]">{cartProps.title || 'Cart'}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Cart totals and checkout state load from NexPress-owned APIs on the public site.
          </p>
        </div>,
        'This storefront commerce block is unavailable on the public renderer.',
      );
    },
    type: 'commerce.cart',
  }),
  createDefinition({
    availability: {
      admin: true,
      public: true,
    },
    defaultProps: {
      items: [],
      layout: 'cards',
      title: 'Shop collections',
    },
    displayName: 'Collection List',
    propsSchema: commerceCollectionListPropsSchema,
    render: ({ props }) => {
      const collectionProps = props as CommerceCollectionListProps;

      if (collectionProps.items.length === 0) {
        return renderPlaceholder('Add one or more collection links to render this block.', collectionProps.title);
      }

      return (
        <div className="space-y-5">
          {collectionProps.title ? (
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{collectionProps.title}</h3>
          ) : null}
          <div className={collectionProps.layout === 'cards' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-3'}>
            {collectionProps.items.map((item) => (
              <a
                key={`${item.href}:${item.label}`}
                className={[
                  collectionProps.layout === 'cards'
                    ? 'rounded-[var(--radius-surface)] border border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5 transition-colors hover:bg-[var(--color-surface-strong)]'
                    : 'flex items-start justify-between rounded-[var(--radius-surface)] border border-transparent px-1 py-2 hover:border-[var(--color-border-strong)]',
                  'block',
                ].join(' ')}
                href={item.href}
              >
                <span className="block">
                  <span className="block text-base font-semibold text-[var(--color-ink)]">{item.label}</span>
                  {item.description ? (
                    <span className="mt-2 block text-sm leading-6 text-[var(--color-ink-muted)]">{item.description}</span>
                  ) : null}
                </span>
              </a>
            ))}
          </div>
        </div>
      );
    },
    type: 'commerce.collection-list',
  }),
] as const;
