import type {
  CommerceAdapter,
  CommerceCartSummary,
  CommerceCustomerRecord,
  CommerceOrderSummary,
  CommercePrice,
  CommerceProductSummary,
  MedusaCommerceRuntimeConfig,
} from './types';

type FetchImplementation = typeof fetch;

export class CommerceNotImplementedError extends Error {}

function createNotImplementedError(methodName: string) {
  return new CommerceNotImplementedError(
    `${methodName} is intentionally not implemented in Phase 16.`,
  );
}

function createUnsupportedOperation<TArgs extends unknown[], TResult>(methodName: string) {
  return async (..._args: TArgs): Promise<TResult> => {
    throw createNotImplementedError(methodName);
  };
}

function buildHealthEndpoint(config: MedusaCommerceRuntimeConfig) {
  return `${config.backendUrl}${config.healthPath}`;
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
      ...(config.serverToken
        ? {
            headers: {
              Authorization: `Bearer ${config.serverToken}`,
            },
          }
        : {}),
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

export function createMedusaAdapter(
  config: MedusaCommerceRuntimeConfig,
  options?: {
    fetch?: FetchImplementation;
  },
): CommerceAdapter {
  const fetchImpl = options?.fetch ?? fetch;

  return {
    carts: {
      create: createUnsupportedOperation<
        [input: { currencyCode: string; customerExternalId?: string }],
        CommerceCartSummary
      >('medusa.carts.create'),
      getById: createUnsupportedOperation<[externalId: string], CommerceCartSummary | null>(
        'medusa.carts.getById',
      ),
    },
    checkHealth: () => runHealthCheck(config, fetchImpl),
    config,
    customers: {
      getByExternalId: createUnsupportedOperation<
        [externalId: string],
        CommerceCustomerRecord | null
      >('medusa.customers.getByExternalId'),
      getByMemberId: createUnsupportedOperation<[memberId: string], CommerceCustomerRecord | null>(
        'medusa.customers.getByMemberId',
      ),
    },
    orders: {
      getById: createUnsupportedOperation<[externalId: string], CommerceOrderSummary | null>(
        'medusa.orders.getById',
      ),
      listByCustomer: createUnsupportedOperation<
        [customerExternalId: string],
        readonly CommerceOrderSummary[]
      >('medusa.orders.listByCustomer'),
    },
    prices: {
      listForProduct: createUnsupportedOperation<
        [productExternalId: string],
        readonly CommercePrice[]
      >('medusa.prices.listForProduct'),
    },
    products: {
      getById: createUnsupportedOperation<[externalId: string], CommerceProductSummary | null>(
        'medusa.products.getById',
      ),
      listCatalog: createUnsupportedOperation<[], readonly CommerceProductSummary[]>(
        'medusa.products.listCatalog',
      ),
    },
    provider: 'medusa',
  };
}
