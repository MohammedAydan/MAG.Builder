import { describe, expect, it } from 'vitest';
import { createMockCommerceAdapter } from './mock';

describe('createMockCommerceAdapter', () => {
  it('serves deterministic seeded contract data', async () => {
    const adapter = createMockCommerceAdapter({
      customers: [
        {
          email: 'member@example.com',
          externalId: 'cust_1',
          memberId: 'member-1',
        },
      ],
      orders: [
        {
          currencyCode: 'usd',
          customerExternalId: 'cust_1',
          externalId: 'ord_1',
          status: 'open',
          total: {
            amount: 2500,
            currencyCode: 'usd',
          },
        },
      ],
      prices: [
        {
          amount: {
            amount: 2500,
            currencyCode: 'usd',
          },
          externalId: 'price_1',
          productExternalId: 'prod_1',
          type: 'list',
        },
      ],
      products: [
        {
          externalId: 'prod_1',
          handle: 'starter-product',
          isPublished: true,
          title: 'Starter Product',
        },
      ],
    });

    expect(await adapter.products.listCatalog()).toHaveLength(1);
    expect(await adapter.prices.listForProduct('prod_1')).toHaveLength(1);
    expect(await adapter.customers.getByMemberId('member-1')).toEqual(
      expect.objectContaining({ externalId: 'cust_1' }),
    );
    expect(await adapter.orders.listByCustomer('cust_1')).toHaveLength(1);
  });

  it('creates carts without external services', async () => {
    const adapter = createMockCommerceAdapter();
    const cart = await adapter.carts.create({
      currencyCode: 'usd',
    });

    expect(cart.externalId).toBe('mock-cart-1');
    expect(await adapter.carts.getById('mock-cart-1')).toEqual(cart);
  });
});
