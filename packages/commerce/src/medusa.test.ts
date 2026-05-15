import { describe, expect, it, vi } from 'vitest';
import {
  CommerceRequestError,
  createMedusaAdapter,
} from './medusa';

const baseConfig = {
  backendUrl: 'http://127.0.0.1:9000',
  defaultRegionId: 'reg_test',
  healthPath: '/health',
  provider: 'medusa' as const,
  publishableKey: 'pk_test_value',
  requestTimeoutMs: 5000,
  serverToken: 'server-token',
};

describe('createMedusaAdapter', () => {
  it('runs a health check without leaking config into the response', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    const adapter = createMedusaAdapter(baseConfig, {
      fetch: fetchMock as typeof fetch,
    });

    const result = await adapter.checkHealth();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:9000/health',
      expect.objectContaining({
        method: 'GET',
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeUndefined();
  });

  it('normalizes product and cart responses from Medusa routes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            products: [
              {
                handle: 'starter-product',
                id: 'prod_1',
                status: 'published',
                title: 'Starter Product',
                variants: [
                  {
                    calculated_price: {
                      calculated_amount: 2500,
                      currency_code: 'usd',
                    },
                    id: 'variant_1',
                    title: 'Starter Variant',
                  },
                ],
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            cart: {
              currency_code: 'usd',
              id: 'cart_1',
              items: [
                {
                  id: 'item_1',
                  product_id: 'prod_1',
                  quantity: 2,
                  title: 'Starter Variant',
                  total: 5000,
                  unit_price: 2500,
                  variant_id: 'variant_1',
                },
              ],
              subtotal: 5000,
              total: 5000,
            },
          }),
          { status: 200 },
        ),
      );

    const adapter = createMedusaAdapter(baseConfig, {
      fetch: fetchMock as typeof fetch,
    });

    const products = await adapter.products.listCatalog();
    const cart = await adapter.carts.getById('cart_1');

    expect(products[0]?.variants[0]?.externalId).toBe('variant_1');
    expect(cart?.itemCount).toBe(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://127.0.0.1:9000/store/products?limit=24',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it('uses the publishable key for store routes and the server token for admin customer creation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            customer: {
              email: 'member@example.com',
              id: 'cust_1',
              metadata: {
                member_id: 'member-1',
              },
            },
          }),
          { status: 200 },
        ),
      );

    const adapter = createMedusaAdapter(baseConfig, {
      fetch: fetchMock as typeof fetch,
    });

    const customer = await adapter.customers.create({
      email: 'member@example.com',
      memberId: 'member-1',
    });

    expect(customer.externalId).toBe('cust_1');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Headers;
    expect(headers.get('x-publishable-api-key')).toBe('pk_test_value');
    expect(headers.get('Authorization')).toBe('Bearer server-token');
  });

  it('throws a safe request error when Medusa returns an invalid response', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }));
    const adapter = createMedusaAdapter(baseConfig, {
      fetch: fetchMock as typeof fetch,
    });

    await expect(adapter.carts.create({ regionId: 'reg_test' })).rejects.toBeInstanceOf(
      CommerceRequestError,
    );
  });
});
