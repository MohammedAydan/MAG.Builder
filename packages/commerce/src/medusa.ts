import type {
  CommerceAdapter,
  CommerceCartSummary,
  CommerceCheckoutResult,
  CommerceCustomerCreateInput,
  CommerceCustomerRecord,
  CommerceMoney,
  CommerceOrderSummary,
  CommercePrice,
  CommerceProductSummary,
  CommerceProductVariantSummary,
  MedusaCommerceRuntimeConfig,
} from './types';

type FetchImplementation = typeof fetch;

type MedusaRequestOptions = Readonly<{
  body?: Record<string, unknown>;
  method?: 'GET' | 'POST';
  requireServerToken?: boolean;
}>;

export class CommerceNotImplementedError extends Error {}

export class CommerceRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

function buildHealthEndpoint(config: MedusaCommerceRuntimeConfig) {
  return `${config.backendUrl}${config.healthPath}`;
}

function normalizeMoney(amount: number | null | undefined, currencyCode: string | null | undefined): CommerceMoney {
  return {
    amount: typeof amount === 'number' && Number.isFinite(amount) ? amount : 0,
    currencyCode: typeof currencyCode === 'string' && currencyCode.length > 0 ? currencyCode : 'usd',
  };
}

function normalizeVariantPrice(
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

function normalizeVariant(
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

function normalizeProduct(product: Record<string, unknown>): CommerceProductSummary | null {
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

function normalizeCartItem(item: Record<string, unknown>, currencyCode?: string): CommerceCartSummary['items'][number] | null {
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

function normalizeCart(cart: Record<string, unknown>): CommerceCartSummary | null {
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

function normalizeCustomer(customer: Record<string, unknown>): CommerceCustomerRecord | null {
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

function normalizeOrder(order: Record<string, unknown>): CommerceOrderSummary | null {
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

function buildHeaders(
  config: MedusaCommerceRuntimeConfig,
  options: Pick<MedusaRequestOptions, 'requireServerToken'> & { hasBody?: boolean },
) {
  const headers = new Headers();

  headers.set('x-publishable-api-key', config.publishableKey);
  headers.set('Accept', 'application/json');

  if (options.hasBody) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.requireServerToken) {
    if (!config.serverToken) {
      throw new CommerceRequestError(
        'MEDUSA_SERVER_TOKEN is required for this commerce operation.',
      );
    }

    headers.set('Authorization', `Bearer ${config.serverToken}`);
  }

  return headers;
}

async function requestMedusaJson<T>(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
  path: string,
  options: MedusaRequestOptions = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  const body = options.body ? JSON.stringify(options.body) : null;
  const headers = buildHeaders(config, {
    hasBody: Boolean(options.body),
    ...(typeof options.requireServerToken === 'boolean'
      ? { requireServerToken: options.requireServerToken }
      : {}),
  });

  try {
    const response = await fetchImpl(`${config.backendUrl}${path}`, {
      ...(body ? { body } : {}),
      headers,
      method: options.method ?? 'GET',
      signal: controller.signal,
    });

    if (response.status === 404) {
      return null;
    }

    const payload = await response.json().catch(() => undefined);

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).message === 'string'
          ? String((payload as Record<string, unknown>).message)
          : `Medusa request failed with status ${response.status}.`;

      throw new CommerceRequestError(message, response.status);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof CommerceRequestError) {
      throw error;
    }

    throw new CommerceRequestError(
      error instanceof Error ? error.message : 'Medusa request failed.',
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function runHealthCheck(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  const endpoint = buildHealthEndpoint(config);

  try {
    const response = await fetchImpl(endpoint, {
      method: 'GET',
      signal: controller.signal,
    });

    return {
      checkedAt: new Date().toISOString(),
      endpoint,
      ok: response.ok,
      provider: 'medusa' as const,
      statusCode: response.status,
      ...(response.ok ? {} : { error: `Health check failed with status ${response.status}.` }),
    };
  } catch (error) {
    return {
      checkedAt: new Date().toISOString(),
      endpoint,
      error: error instanceof Error ? error.message : 'Health check failed.',
      ok: false,
      provider: 'medusa' as const,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeCatalogResponse(payload: unknown) {
  const products: unknown[] = payload
    && typeof payload === 'object'
    && Array.isArray((payload as Record<string, unknown>).products)
      ? ((payload as Record<string, unknown>).products as unknown[])
      : [];

  return products
    .map((entry) =>
      entry && typeof entry === 'object'
        ? normalizeProduct(entry as Record<string, unknown>)
        : null,
    )
    .filter((entry): entry is CommerceProductSummary => Boolean(entry))
    .filter((entry) => entry.isPublished);
}

export function createMedusaAdapter(
  config: MedusaCommerceRuntimeConfig,
  options?: {
    fetch?: FetchImplementation;
  },
): CommerceAdapter {
  const fetchImpl = options?.fetch ?? fetch;
  const productsPort: CommerceAdapter['products'] = {
    async getByHandle(handle) {
      const payload = await requestMedusaJson<{ products?: Record<string, unknown>[] }>(
        config,
        fetchImpl,
        `/store/products?handle=${encodeURIComponent(handle)}&limit=1`,
      );

      const product = Array.isArray(payload?.products) ? payload.products[0] : undefined;
      return product ? normalizeProduct(product) : null;
    },
    async getById(externalId) {
      const payload = await requestMedusaJson<{ product?: Record<string, unknown> }>(
        config,
        fetchImpl,
        `/store/products/${encodeURIComponent(externalId)}`,
      );

      return payload?.product ? normalizeProduct(payload.product) : null;
    },
    async getVariantById(externalId) {
      const products = await productsPort.listCatalog({ limit: 100 });

      for (const product of products) {
        const variant = product.variants.find((entry) => entry.externalId === externalId);

        if (variant) {
          return variant;
        }
      }

      return null;
    },
    async listCatalog(input) {
      const limit = input?.limit ?? 24;
      const payload = await requestMedusaJson<{ products?: Record<string, unknown>[] }>(
        config,
        fetchImpl,
        `/store/products?limit=${encodeURIComponent(String(limit))}`,
      );

      return normalizeCatalogResponse(payload);
    },
  };

  const pricesPort: CommerceAdapter['prices'] = {
    async listForProduct(productExternalId) {
      const product = await productsPort.getById(productExternalId);

      if (!product) {
        return [];
      }

      return product.variants.map((variant) => ({
        amount: variant.price,
        externalId: `${variant.externalId}:list`,
        productExternalId,
        type: 'list' as const,
        variantExternalId: variant.externalId,
      }));
    },
  };

  return {
    carts: {
      async addLineItem(input) {
        const payload = await requestMedusaJson<{ cart?: Record<string, unknown> }>(
          config,
          fetchImpl,
          `/store/carts/${encodeURIComponent(input.cartExternalId)}/line-items`,
          {
            body: {
              quantity: input.quantity,
              variant_id: input.variantExternalId,
            },
            method: 'POST',
          },
        );

        const cart = payload?.cart ? normalizeCart(payload.cart) : null;

        if (!cart) {
          throw new CommerceRequestError('Medusa did not return a valid cart payload.');
        }

        return cart;
      },
      async complete(cartExternalId) {
        const payload = await requestMedusaJson<
          | { cart?: Record<string, unknown>; error?: string; type?: 'cart' }
          | { order?: Record<string, unknown>; type?: 'order' }
        >(
          config,
          fetchImpl,
          `/store/carts/${encodeURIComponent(cartExternalId)}/complete`,
          {
            method: 'POST',
          },
        );

        if (payload?.type === 'order' && payload.order) {
          const order = normalizeOrder(payload.order);

          if (!order) {
            throw new CommerceRequestError('Medusa did not return a valid order payload.');
          }

          return {
            order,
            type: 'order',
          } satisfies CommerceCheckoutResult;
        }

        if (payload && 'cart' in payload && payload.cart) {
          const cart = normalizeCart(payload.cart);

          if (!cart) {
            throw new CommerceRequestError('Medusa did not return a valid cart payload.');
          }

          return {
            cart,
            ...(typeof payload.error === 'string' ? { error: payload.error } : {}),
            type: 'cart',
          } satisfies CommerceCheckoutResult;
        }

        throw new CommerceRequestError('Medusa did not return a valid checkout payload.');
      },
      async create(input) {
        const payload = await requestMedusaJson<{ cart?: Record<string, unknown> }>(
          config,
          fetchImpl,
          '/store/carts',
          {
            body: {
              ...(input.email ? { email: input.email } : {}),
              region_id: input.regionId,
            },
            method: 'POST',
          },
        );

        const cart = payload?.cart ? normalizeCart(payload.cart) : null;

        if (!cart) {
          throw new CommerceRequestError('Medusa did not return a valid cart payload.');
        }

        return cart;
      },
      async getById(externalId) {
        const payload = await requestMedusaJson<{ cart?: Record<string, unknown> }>(
          config,
          fetchImpl,
          `/store/carts/${encodeURIComponent(externalId)}`,
        );

        return payload?.cart ? normalizeCart(payload.cart) : null;
      },
    },
    checkHealth: () => runHealthCheck(config, fetchImpl),
    config,
    customers: {
      async create(input: CommerceCustomerCreateInput) {
        const payload = await requestMedusaJson<{ customer?: Record<string, unknown> }>(
          config,
          fetchImpl,
          '/admin/customers',
          {
            body: {
              email: input.email,
              ...(input.firstName ? { first_name: input.firstName } : {}),
              ...(input.lastName ? { last_name: input.lastName } : {}),
              ...(input.memberId
                ? {
                    metadata: {
                      member_id: input.memberId,
                    },
                  }
                : {}),
            },
            method: 'POST',
            requireServerToken: true,
          },
        );

        const customer = payload?.customer ? normalizeCustomer(payload.customer) : null;

        if (!customer) {
          throw new CommerceRequestError('Medusa did not return a valid customer payload.');
        }

        return customer;
      },
      async getByExternalId(externalId) {
        const payload = await requestMedusaJson<{ customer?: Record<string, unknown> }>(
          config,
          fetchImpl,
          `/admin/customers/${encodeURIComponent(externalId)}`,
          {
            requireServerToken: true,
          },
        );

        return payload?.customer ? normalizeCustomer(payload.customer) : null;
      },
    },
    orders: {
      async getById(externalId) {
        const payload = await requestMedusaJson<{ order?: Record<string, unknown> }>(
          config,
          fetchImpl,
          `/admin/orders/${encodeURIComponent(externalId)}`,
          {
            requireServerToken: true,
          },
        );

        return payload?.order ? normalizeOrder(payload.order) : null;
      },
      async listByCustomer(customerExternalId) {
        const payload = await requestMedusaJson<{ orders?: Record<string, unknown>[] }>(
          config,
          fetchImpl,
          `/admin/orders?customer_id=${encodeURIComponent(customerExternalId)}`,
          {
            requireServerToken: true,
          },
        );

        const orders = Array.isArray(payload?.orders) ? payload.orders : [];

        return orders
          .map((order) => normalizeOrder(order))
          .filter((entry): entry is CommerceOrderSummary => Boolean(entry));
      },
    },
    prices: pricesPort,
    products: productsPort,
    provider: 'medusa',
  };
}
