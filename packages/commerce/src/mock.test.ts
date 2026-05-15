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
          externalCartId: 'cart_1',
          externalId: 'ord_1',
          items: [],
          status: 'placed',
          total: {
            amount: 2500,
            currencyCode: 'usd',
          },
        },
      ],
      products: [
        {
          externalId: 'prod_1',
          handle: 'starter-product',
          isPublished: true,
          title: 'Starter Product',
          variants: [
            {
              externalId: 'variant_1',
              price: {
                amount: 2500,
                currencyCode: 'usd',
              },
              productExternalId: 'prod_1',
              title: 'Starter Variant',
            },
          ],
        },
      ],
    });

    expect(await adapter.products.listCatalog()).toHaveLength(1);
    expect(await adapter.products.getVariantById('variant_1')).toEqual(
      expect.objectContaining({ externalId: 'variant_1' }),
    );
    expect(await adapter.prices.listForProduct('prod_1')).toHaveLength(1);
    expect(await adapter.customers.getByExternalId('cust_1')).toEqual(
      expect.objectContaining({ externalId: 'cust_1' }),
    );
    expect(await adapter.orders.listByCustomer('cust_1')).toHaveLength(1);
  });

  it('creates carts, adds items, and completes checkout in test mode', async () => {
    const adapter = createMockCommerceAdapter({
      products: [
        {
          externalId: 'prod_1',
          handle: 'starter-product',
          isPublished: true,
          title: 'Starter Product',
          variants: [
            {
              externalId: 'variant_1',
              price: {
                amount: 2500,
                currencyCode: 'usd',
              },
              productExternalId: 'prod_1',
              title: 'Starter Variant',
            },
          ],
        },
      ],
    });

    const cart = await adapter.carts.create({
      regionId: 'reg_test',
    });

    const updated = await adapter.carts.addLineItem({
      cartExternalId: cart.externalId,
      quantity: 2,
      variantExternalId: 'variant_1',
    });
    const checkout = await adapter.carts.complete(updated.externalId);

    expect(updated.itemCount).toBe(2);
    expect(updated.total.amount).toBe(5000);
    expect(checkout.type).toBe('order');
  });
});
