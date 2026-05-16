import { StorefrontAddToCart } from '@/components/commerce/storefront-add-to-cart';
import { StorefrontCart } from '@/components/commerce/storefront-cart';
import {
  CommerceServiceError,
  getCatalogProductByHandle,
  getCommerceStorefrontStatus,
  listCatalogProductsWithInput,
} from '@/lib/commerce';
import type { CommerceProductSummary } from '@nexpress/commerce';

export type CommerceProductGridProps = {
  columns: 2 | 3 | 4;
  ctaMode: 'add-to-cart' | 'none';
  emptyMessage?: string;
  layout: 'grid' | 'list';
  limit: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  productHandles: {
    handle: string;
  }[];
  source: 'catalog' | 'manual';
  title?: string;
};

export type CommerceProductDetailProps = {
  ctaMode: 'add-to-cart' | 'none';
  handle: string;
  showPrice: boolean;
  showVariants: boolean;
  title?: string;
};

export type CommerceCartProps = {
  checkoutLabel?: string;
  emptyMessage?: string;
  loginMessage?: string;
  showCheckoutAction: boolean;
  title?: string;
};

type StorefrontProduct = {
  handle: string;
  priceLabel: string;
  title: string;
  variants: {
    externalId: string;
    priceLabel: string;
    title: string;
  }[];
};

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    currency: currencyCode.toUpperCase(),
    style: 'currency',
  }).format(amount / 100);
}

function toStorefrontProduct(product: CommerceProductSummary): StorefrontProduct {
  const primaryPrice = product.priceRange?.min ?? product.variants[0]?.price;

  return {
    handle: product.handle,
    priceLabel: primaryPrice ? formatMoney(primaryPrice.amount, primaryPrice.currencyCode) : 'Unavailable',
    title: product.title,
    variants: product.variants.map((variant) => ({
      externalId: variant.externalId,
      priceLabel: formatMoney(variant.price.amount, variant.price.currencyCode),
      title: variant.title,
    })),
  };
}

async function getManualProducts(handles: { handle: string }[]) {
  const products = await Promise.all(handles.map(({ handle }) => getCatalogProductByHandle(handle)));
  return products.filter(Boolean);
}

function renderStorefrontError(message: string, title?: string) {
  return (
    <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5 text-sm text-[var(--color-ink-muted)]">
      {title ? <p className="mb-2 text-sm font-semibold text-[var(--color-ink)]">{title}</p> : null}
      <p>{message}</p>
    </div>
  );
}

async function loadProductGridData(props: CommerceProductGridProps) {
  try {
    const status = await getCommerceStorefrontStatus();

    if (status !== 'enabled') {
      return {
        kind: 'error' as const,
        message: 'Commerce products are unavailable for this storefront right now.',
      };
    }

    const products = props.source === 'manual'
      ? await getManualProducts(props.productHandles)
      : await listCatalogProductsWithInput({ limit: props.limit });

    const storefrontProducts = products.slice(0, props.limit).map((product) => toStorefrontProduct(product));

    if (storefrontProducts.length === 0) {
      return {
        kind: 'error' as const,
        message: props.emptyMessage ?? 'No products are available yet.',
      };
    }

    return {
      kind: 'ready' as const,
      products: storefrontProducts,
      status,
    };
  } catch (error) {
    if (error instanceof CommerceServiceError && error.code === 'not-found') {
      return {
        kind: 'error' as const,
        message: props.emptyMessage ?? 'No products are available yet.',
      };
    }

    return {
      kind: 'error' as const,
      message: 'Commerce products could not be loaded safely.',
    };
  }
}

export async function StorefrontProductGridBlock({ props }: { props: CommerceProductGridProps }) {
  const result = await loadProductGridData(props);

  if (result.kind === 'error') {
    return renderStorefrontError(result.message, props.title);
  }

  const layoutClass = props.layout === 'grid'
    ? props.columns === 2
      ? 'grid gap-5 md:grid-cols-2'
      : props.columns === 4
        ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-4'
        : 'grid gap-5 md:grid-cols-2 xl:grid-cols-3'
    : 'space-y-4';

  return (
    <div className="space-y-6">
      {props.title ? <h3 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{props.title}</h3> : null}
      <div className={layoutClass}>
        {result.products.map((product) => (
          <article
            key={product.handle}
            className="rounded-[var(--radius-surface)] border border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-5"
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] text-[var(--color-ink-muted)] uppercase">
                  {product.handle}
                </p>
                <h4 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">{product.title}</h4>
              </div>
              <p className="text-base font-semibold text-[var(--color-ink)]">{product.priceLabel}</p>
              <StorefrontAddToCart
                commerceStatus={result.status}
                ctaMode={props.ctaMode}
                productTitle={product.title}
                variants={product.variants}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

async function loadProductDetailData(props: CommerceProductDetailProps) {
  try {
    const status = await getCommerceStorefrontStatus();

    if (status !== 'enabled') {
      return {
        kind: 'error' as const,
        message: 'This product is unavailable for this storefront right now.',
      };
    }

    const product = await getCatalogProductByHandle(props.handle);

    return {
      kind: 'ready' as const,
      product: toStorefrontProduct(product),
      status,
    };
  } catch (error) {
    if (error instanceof CommerceServiceError && error.code === 'not-found') {
      return {
        kind: 'error' as const,
        message: 'The selected product could not be found.',
      };
    }

    return {
      kind: 'error' as const,
      message: 'This product could not be loaded safely.',
    };
  }
}

export async function StorefrontProductDetailBlock({ props }: { props: CommerceProductDetailProps }) {
  const result = await loadProductDetailData(props);

  if (result.kind === 'error') {
    return renderStorefrontError(result.message, props.title);
  }

  return (
    <article className="rounded-[var(--radius-surface)] border border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] p-6">
      <div className="space-y-4">
        {props.title ? <p className="text-sm font-medium tracking-[0.18em] text-[var(--color-ink-muted)] uppercase">{props.title}</p> : null}
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-[var(--color-ink-muted)] uppercase">{result.product.handle}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{result.product.title}</h3>
        </div>
        {props.showPrice ? <p className="text-lg font-semibold text-[var(--color-ink)]">{result.product.priceLabel}</p> : null}
        {props.showVariants && result.product.variants.length > 1 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            {result.product.variants.length} variants available
          </p>
        ) : null}
        <StorefrontAddToCart
          commerceStatus={result.status}
          ctaMode={props.ctaMode}
          productTitle={result.product.title}
          variants={result.product.variants}
        />
      </div>
    </article>
  );
}

export async function StorefrontCartBlock({ props }: { props: CommerceCartProps }) {
  const status = await getCommerceStorefrontStatus();

  return (
    <StorefrontCart
      checkoutLabel={props.checkoutLabel ?? 'Checkout'}
      commerceStatus={status}
      emptyMessage={props.emptyMessage ?? 'Your cart is empty.'}
      loginMessage={props.loginMessage ?? 'Sign in to manage your cart.'}
      showCheckoutAction={props.showCheckoutAction}
      {...(props.title ? { title: props.title } : {})}
    />
  );
}
