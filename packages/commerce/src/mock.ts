import type {
  CommerceAdapter,
  CommerceCartSummary,
  CommerceCustomerRecord,
  CommerceOrderSummary,
  CommercePrice,
  CommerceProductSummary,
  MedusaCommerceRuntimeConfig,
} from './types';

export type MockCommerceSeed = Readonly<{
  carts?: readonly CommerceCartSummary[];
  customers?: readonly CommerceCustomerRecord[];
  orders?: readonly CommerceOrderSummary[];
  prices?: readonly CommercePrice[];
  products?: readonly CommerceProductSummary[];
}>;

const DEFAULT_CONFIG: MedusaCommerceRuntimeConfig = {
  backendUrl: 'http://127.0.0.1:9000',
  healthPath: '/health',
  provider: 'medusa',
  requestTimeoutMs: 5000,
};

export function createMockCommerceAdapter(seed: MockCommerceSeed = {}): CommerceAdapter {
  const carts = [...(seed.carts ?? [])];
  const customers = [...(seed.customers ?? [])];
  const orders = [...(seed.orders ?? [])];
  const prices = [...(seed.prices ?? [])];
  const products = [...(seed.products ?? [])];

  return {
    carts: {
      async create(input) {
        const cart: CommerceCartSummary = {
          currencyCode: input.currencyCode,
          ...(input.customerExternalId ? { customerExternalId: input.customerExternalId } : {}),
          externalId: `mock-cart-${carts.length + 1}`,
          itemCount: 0,
          subtotal: {
            amount: 0,
            currencyCode: input.currencyCode,
          },
        };

        carts.push(cart);
        return cart;
      },
      async getById(externalId) {
        return carts.find((entry) => entry.externalId === externalId) ?? null;
      },
    },
    async checkHealth() {
      return {
        checkedAt: new Date().toISOString(),
        endpoint: `${DEFAULT_CONFIG.backendUrl}${DEFAULT_CONFIG.healthPath}`,
        ok: true,
        provider: 'medusa',
        statusCode: 200,
      };
    },
    config: DEFAULT_CONFIG,
    customers: {
      async getByExternalId(externalId) {
        return customers.find((entry) => entry.externalId === externalId) ?? null;
      },
      async getByMemberId(memberId) {
        return customers.find((entry) => entry.memberId === memberId) ?? null;
      },
    },
    orders: {
      async getById(externalId) {
        return orders.find((entry) => entry.externalId === externalId) ?? null;
      },
      async listByCustomer(customerExternalId) {
        return orders.filter((entry) => entry.customerExternalId === customerExternalId);
      },
    },
    prices: {
      async listForProduct(productExternalId) {
        return prices.filter((entry) => entry.productExternalId === productExternalId);
      },
    },
    products: {
      async getById(externalId) {
        return products.find((entry) => entry.externalId === externalId) ?? null;
      },
      async listCatalog() {
        return products;
      },
    },
    provider: 'medusa',
  };
}
