import type {
  CommerceAdapter,
  CommerceCartSummary,
  CommerceCheckoutResult,
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
  defaultRegionId: 'reg_test',
  healthPath: '/health',
  provider: 'medusa',
  publishableKey: 'pk_test_mock',
  requestTimeoutMs: 5000,
  serverToken: 'mock-server-token',
};

export function createMockCommerceAdapter(seed: MockCommerceSeed = {}): CommerceAdapter {
  const carts = [...(seed.carts ?? [])];
  const customers = [...(seed.customers ?? [])];
  const orders = [...(seed.orders ?? [])];
  const prices = [...(seed.prices ?? [])];
  const products = [...(seed.products ?? [])];

  return {
    carts: {
      async addLineItem(input) {
        const cart = carts.find((entry) => entry.externalId === input.cartExternalId);

        if (!cart) {
          return Promise.reject(new Error('Cart not found.'));
        }

        const variant = products
          .flatMap((product) => product.variants)
          .find((entry) => entry.externalId === input.variantExternalId);

        if (!variant) {
          return Promise.reject(new Error('Variant not found.'));
        }

        const newItem = {
          externalId: `${cart.externalId}-item-${cart.items.length + 1}`,
          productExternalId: variant.productExternalId,
          quantity: input.quantity,
          title: variant.title,
          total: {
            amount: variant.price.amount * input.quantity,
            currencyCode: variant.price.currencyCode,
          },
          unitPrice: variant.price,
          variantExternalId: variant.externalId,
        };

        const nextCart = {
          ...cart,
          itemCount: cart.itemCount + input.quantity,
          items: [...cart.items, newItem],
          subtotal: {
            amount: cart.subtotal.amount + newItem.total.amount,
            currencyCode: cart.subtotal.currencyCode,
          },
          total: {
            amount: cart.total.amount + newItem.total.amount,
            currencyCode: cart.total.currencyCode,
          },
        } satisfies CommerceCartSummary;

        carts.splice(carts.indexOf(cart), 1, nextCart);
        return nextCart;
      },
      async complete(cartExternalId) {
        const cart = carts.find((entry) => entry.externalId === cartExternalId);

        if (!cart) {
          return {
            cart: {
              currencyCode: 'usd',
              externalId: cartExternalId,
              itemCount: 0,
              items: [],
              subtotal: { amount: 0, currencyCode: 'usd' },
              total: { amount: 0, currencyCode: 'usd' },
            },
            error: 'Cart not found.',
            type: 'cart',
          } satisfies CommerceCheckoutResult;
        }

        const order: CommerceOrderSummary = {
          currencyCode: cart.currencyCode,
          ...(cart.customerExternalId ? { customerExternalId: cart.customerExternalId } : {}),
          externalCartId: cart.externalId,
          externalId: `mock-order-${orders.length + 1}`,
          items: cart.items.map((item) => ({
            productExternalId: item.productExternalId,
            quantity: item.quantity,
            title: item.title,
            total: item.total,
            unitPrice: item.unitPrice,
            variantExternalId: item.variantExternalId,
          })),
          status: 'placed',
          total: cart.total,
        };

        orders.push(order);

        return {
          order,
          type: 'order',
        } satisfies CommerceCheckoutResult;
      },
      async create(input) {
        const cart: CommerceCartSummary = {
          currencyCode: 'usd',
          ...(input.customerExternalId ? { customerExternalId: input.customerExternalId } : {}),
          externalId: `mock-cart-${carts.length + 1}`,
          itemCount: 0,
          items: [],
          subtotal: {
            amount: 0,
            currencyCode: 'usd',
          },
          total: {
            amount: 0,
            currencyCode: 'usd',
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
      async create(input) {
        const customer: CommerceCustomerRecord = {
          email: input.email,
          externalId: `mock-customer-${customers.length + 1}`,
          ...(input.firstName ? { firstName: input.firstName } : {}),
          ...(input.lastName ? { lastName: input.lastName } : {}),
          ...(input.memberId ? { memberId: input.memberId } : {}),
        };

        customers.push(customer);
        return customer;
      },
      async getByExternalId(externalId) {
        return customers.find((entry) => entry.externalId === externalId) ?? null;
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
        const productPrices = prices.filter((entry) => entry.productExternalId === productExternalId);

        if (productPrices.length > 0) {
          return productPrices;
        }

        const product = products.find((entry) => entry.externalId === productExternalId);

        return (product?.variants ?? []).map((variant) => ({
          amount: variant.price,
          externalId: `${variant.externalId}:list`,
          productExternalId,
          type: 'list' as const,
          variantExternalId: variant.externalId,
        }));
      },
    },
    products: {
      async getByHandle(handle) {
        return products.find((entry) => entry.handle === handle) ?? null;
      },
      async getById(externalId) {
        return products.find((entry) => entry.externalId === externalId) ?? null;
      },
      async getVariantById(externalId) {
        return products
          .flatMap((product) => product.variants)
          .find((entry) => entry.externalId === externalId) ?? null;
      },
      async listCatalog() {
        return products;
      },
    },
    provider: 'medusa',
  };
}
