import type {
  CommerceCartSummary,
  CommerceCustomerRecord,
  CommerceMoney,
  CommerceOrderSummary,
  CommerceProductSummary,
  CommerceProductVariantSummary,
} from '../../types';

export function normalizeMoney(amount: number | null | undefined, currencyCode: string | null | undefined): CommerceMoney {
  return {
    amount: typeof amount === 'number' && Number.isFinite(amount) ? amount : 0,
    currencyCode: typeof currencyCode === 'string' && currencyCode.length > 0 ? currencyCode : 'usd',
  };
}

export function normalizeVariantPrice(
  variant: Record<string, unknown>,
  fallbackCurrencyCode?: string | null,
) {
  const calculatedPrice = variant.calculated_price as Record<string, unknown> | null | undefined;
  const firstPrice = Array.isArray(variant.prices)
    ? (variant.prices[0] as Record<string, unknown> | undefined)
    : undefined;

  const amount =
    (typeof calculatedPrice?.calculated_amount === 'number' ? calculatedPrice.calculated_amount : undefined)
    ?? (typeof calculatedPrice?.amount === 'number' ? calculatedPrice.amount : undefined)
    ?? (typeof firstPrice?.amount === 'number' ? firstPrice.amount : undefined)
    ?? 0;

  const currencyCode =
    (typeof calculatedPrice?.currency_code === 'string' ? calculatedPrice.currency_code : undefined)
    ?? (typeof firstPrice?.currency_code === 'string' ? firstPrice.currency_code : undefined)
    ?? fallbackCurrencyCode
    ?? 'usd';

  return normalizeMoney(amount, currencyCode);
}

export function normalizeVariant(
  variant: Record<string, unknown>,
  productExternalId: string,
  fallbackCurrencyCode?: string | null,
): CommerceProductVariantSummary | null {
  const externalId = typeof variant.id === 'string' ? variant.id : null;

  if (!externalId) {
    return null;
  }

  return {
    externalId,
    price: normalizeVariantPrice(variant, fallbackCurrencyCode),
    productExternalId,
    ...(typeof variant.sku === 'string' && variant.sku.length > 0 ? { sku: variant.sku } : {}),
    title:
      typeof variant.title === 'string' && variant.title.length > 0
        ? variant.title
        : `Variant ${externalId}`,
  };
}

export function normalizeProduct(product: Record<string, unknown>): CommerceProductSummary | null {
  const externalId = typeof product.id === 'string' ? product.id : null;

  if (!externalId) {
    return null;
  }

  const variants = (Array.isArray(product.variants) ? product.variants : [])
    .map((variant) =>
      variant && typeof variant === 'object'
        ? normalizeVariant(
            variant as Record<string, unknown>,
            externalId,
            typeof product.currency_code === 'string' ? product.currency_code : undefined,
          )
        : null,
    )
    .filter((entry): entry is CommerceProductVariantSummary => Boolean(entry));

  const priceRange = variants.length > 0
    ? {
        max: variants.reduce(
          (current, variant) =>
            (variant.price.amount > current.amount ? variant.price : current),
          variants[0]!.price,
        ),
        min: variants.reduce(
          (current, variant) =>
            (variant.price.amount < current.amount ? variant.price : current),
          variants[0]!.price,
        ),
      }
    : undefined;

  return {
    externalId,
    handle:
      typeof product.handle === 'string' && product.handle.length > 0 ? product.handle : externalId,
    isPublished:
      typeof product.status === 'string' ? product.status === 'published' : true,
    ...(priceRange ? { priceRange } : {}),
    title:
      typeof product.title === 'string' && product.title.length > 0
        ? product.title
        : `Product ${externalId}`,
    variants,
  };
}

export function normalizeCartItem(item: Record<string, unknown>, currencyCode?: string): CommerceCartSummary['items'][number] | null {
  const externalId = typeof item.id === 'string' ? item.id : null;
  const variantExternalId = typeof item.variant_id === 'string' ? item.variant_id : null;
  const productExternalId = typeof item.product_id === 'string' ? item.product_id : null;

  if (!externalId || !variantExternalId || !productExternalId) {
    return null;
  }

  const itemCurrencyCode =
    (typeof item.currency_code === 'string' ? item.currency_code : undefined)
    ?? currencyCode
    ?? 'usd';
  const quantity = typeof item.quantity === 'number' && Number.isFinite(item.quantity) ? item.quantity : 0;
  const unitAmount =
    (typeof item.unit_price === 'number' ? item.unit_price : undefined)
    ?? (typeof item.raw_unit_price === 'number' ? item.raw_unit_price : undefined)
    ?? 0;
  const totalAmount =
    (typeof item.total === 'number' ? item.total : undefined)
    ?? unitAmount * quantity;

  return {
    externalId,
    productExternalId,
    quantity,
    title:
      typeof item.title === 'string' && item.title.length > 0
        ? item.title
        : `Item ${externalId}`,
    total: normalizeMoney(totalAmount, itemCurrencyCode),
    unitPrice: normalizeMoney(unitAmount, itemCurrencyCode),
    variantExternalId,
  };
}

export function normalizeCart(cart: Record<string, unknown>): CommerceCartSummary | null {
  const externalId = typeof cart.id === 'string' ? cart.id : null;

  if (!externalId) {
    return null;
  }

  const currencyCode =
    (typeof cart.currency_code === 'string' ? cart.currency_code : undefined)
    ?? ((cart.region as Record<string, unknown> | undefined)?.currency_code as string | undefined)
    ?? 'usd';
  const items = (Array.isArray(cart.items) ? cart.items : [])
    .map((item) =>
      item && typeof item === 'object'
        ? normalizeCartItem(item as Record<string, unknown>, currencyCode)
        : null,
    )
    .filter((entry): entry is CommerceCartSummary['items'][number] => Boolean(entry));
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotalAmount =
    (typeof cart.subtotal === 'number' ? cart.subtotal : undefined)
    ?? items.reduce((total, item) => total + item.total.amount, 0);
  const totalAmount =
    (typeof cart.total === 'number' ? cart.total : undefined)
    ?? subtotalAmount;

  return {
    currencyCode,
    ...(typeof cart.customer_id === 'string' && cart.customer_id.length > 0
      ? { customerExternalId: cart.customer_id }
      : {}),
    externalId,
    itemCount,
    items,
    subtotal: normalizeMoney(subtotalAmount, currencyCode),
    total: normalizeMoney(totalAmount, currencyCode),
  };
}

export function normalizeCustomer(customer: Record<string, unknown>): CommerceCustomerRecord | null {
  const externalId = typeof customer.id === 'string' ? customer.id : null;

  if (!externalId) {
    return null;
  }

  return {
    ...(typeof customer.email === 'string' && customer.email.length > 0 ? { email: customer.email } : {}),
    externalId,
    ...(typeof customer.first_name === 'string' && customer.first_name.length > 0
      ? { firstName: customer.first_name }
      : {}),
    ...(typeof customer.last_name === 'string' && customer.last_name.length > 0
      ? { lastName: customer.last_name }
      : {}),
    ...(typeof customer.metadata === 'object'
      && customer.metadata
      && typeof (customer.metadata as Record<string, unknown>).member_id === 'string'
      ? { memberId: (customer.metadata as Record<string, string>).member_id }
      : {}),
  };
}

export function normalizeOrder(order: Record<string, unknown>): CommerceOrderSummary | null {
  const externalId = typeof order.id === 'string' ? order.id : null;

  if (!externalId) {
    return null;
  }

  const currencyCode = typeof order.currency_code === 'string' ? order.currency_code : 'usd';
  const items = (Array.isArray(order.items) ? order.items : [])
    .map((item) =>
      item && typeof item === 'object'
        ? normalizeCartItem(item as Record<string, unknown>, currencyCode)
        : null,
    )
    .filter((entry): entry is CommerceCartSummary['items'][number] => Boolean(entry))
    .map((item) => ({
      productExternalId: item.productExternalId,
      quantity: item.quantity,
      title: item.title,
      total: item.total,
      unitPrice: item.unitPrice,
      variantExternalId: item.variantExternalId,
    }));

  return {
    currencyCode,
    ...(typeof order.customer_id === 'string' && order.customer_id.length > 0
      ? { customerExternalId: order.customer_id }
      : {}),
    ...(typeof order.cart_id === 'string' && order.cart_id.length > 0
      ? { externalCartId: order.cart_id }
      : {}),
    externalId,
    items,
    status:
      typeof order.status === 'string' && ['draft', 'fulfilled', 'open', 'placed'].includes(order.status)
        ? (order.status as CommerceOrderSummary['status'])
        : 'placed',
    total: normalizeMoney(
      typeof order.total === 'number' ? order.total : 0,
      currencyCode,
    ),
  };
}
