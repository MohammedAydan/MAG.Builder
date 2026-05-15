import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockCommerceAdapter } from '@nexpress/commerce';
import {
  type CommerceServicePayloadClient,
  CommerceServiceError,
  addItemToCommerceCartWithAdapter,
  checkoutCommerceCartWithDeps,
  createCommerceCartForMemberWithDeps,
  ensureCommerceCustomerForMemberWithPayload,
  getCommerceAdapter,
  getCommerceStorefrontStatus,
  hasCommerceCatalogAccess,
  listMemberOrdersWithPayload,
} from '@/lib/commerce/service';

const hasActivePluginCapabilityMock = vi.fn();

vi.mock('@/lib/plugins/service', () => ({
  hasActivePluginCapability: (...args: Parameters<typeof hasActivePluginCapabilityMock>) =>
    hasActivePluginCapabilityMock(...args),
}));

function createPayloadMock(): CommerceServicePayloadClient & {
  create: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
} {
  const customerRecords = new Map<string, Record<string, unknown>>();
  const orderRecords = new Map<string, Record<string, unknown>>();

  return {
    create: vi.fn(async (args: Record<string, unknown>) => {
      const data = args.data as Record<string, unknown>;
      const collection = String(args.collection);

      if (collection === 'commerce-customers') {
        customerRecords.set(String(data.externalCustomerId), {
          id: customerRecords.size + 1,
          ...data,
        });
      }

      if (collection === 'commerce-orders') {
        orderRecords.set(String(data.externalOrderId), {
          createdAt: new Date().toISOString(),
          id: orderRecords.size + 1,
          ...data,
        });
      }

      return { id: `${collection}-${customerRecords.size + orderRecords.size}`, ...data };
    }),
    find: vi.fn(async (args: Record<string, unknown>) => {
      const collection = String(args.collection);
      const where = (args.where ?? {}) as Record<string, { equals?: number | string }>;

      if (collection === 'commerce-customers') {
        const memberId = String(where.member?.equals ?? '');
        const record = [...customerRecords.values()].find(
          (entry) => String(entry.member) === memberId,
        );

        return {
          docs: record ? [record] : [],
        };
      }

      if (collection === 'commerce-orders') {
        const memberId = String(where.member?.equals ?? '');
        const docs = [...orderRecords.values()].filter(
          (entry) => String(entry.member) === memberId,
        );

        return {
          docs,
        };
      }

      return { docs: [] };
    }),
  } as CommerceServicePayloadClient & {
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
  };
}

const member = {
  collection: 'members',
  email: 'member@example.com',
  firstName: 'Member',
  id: 1,
  lastName: 'User',
} as const;

describe('commerce service', () => {
  beforeEach(() => {
    hasActivePluginCapabilityMock.mockReset();
    vi.unstubAllEnvs();
  });

  it('fails closed when commerce-pack is not active', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(false);

    expect(await hasCommerceCatalogAccess()).toBe(false);
    await expect(getCommerceAdapter()).rejects.toEqual(
      expect.objectContaining({
        code: 'commerce-disabled',
      }),
    );
  });

  it('rejects invalid runtime config only after capability access is granted', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(true);
    vi.stubEnv('NEXPRESS_COMMERCE_PROVIDER', 'medusa');
    vi.stubEnv('NEXT_PUBLIC_MEDUSA_SERVER_TOKEN', 'unsafe');

    await expect(getCommerceAdapter()).rejects.toBeInstanceOf(Error);
  });

  it('returns a Medusa adapter when the capability and runtime config are present', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(true);
    vi.stubEnv('NEXPRESS_COMMERCE_PROVIDER', 'medusa');
    vi.stubEnv('MEDUSA_BACKEND_URL', 'http://127.0.0.1:9000');
    vi.stubEnv('MEDUSA_DEFAULT_REGION_ID', 'reg_test');
    vi.stubEnv('MEDUSA_PUBLISHABLE_KEY', 'pk_test_value');

    const adapter = await getCommerceAdapter();

    expect(adapter.provider).toBe('medusa');
    expect(adapter.config.backendUrl).toBe('http://127.0.0.1:9000');
  });

  it('raises a typed misconfiguration error when the provider stays disabled', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(true);
    vi.stubEnv('NEXPRESS_COMMERCE_PROVIDER', 'disabled');

    await expect(getCommerceAdapter()).rejects.toEqual(
      expect.objectContaining<Partial<CommerceServiceError>>({
        code: 'commerce-misconfigured',
        status: 503,
      }),
    );
  });

  it('reports disabled storefront status when commerce-pack is inactive', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(false);

    await expect(getCommerceStorefrontStatus()).resolves.toBe('disabled');
  });

  it('reports enabled storefront status when runtime commerce config is valid', async () => {
    hasActivePluginCapabilityMock.mockResolvedValue(true);
    vi.stubEnv('NEXPRESS_COMMERCE_PROVIDER', 'medusa');
    vi.stubEnv('MEDUSA_BACKEND_URL', 'http://127.0.0.1:9000');
    vi.stubEnv('MEDUSA_DEFAULT_REGION_ID', 'reg_test');
    vi.stubEnv('MEDUSA_PUBLISHABLE_KEY', 'pk_test_value');

    await expect(getCommerceStorefrontStatus()).resolves.toBe('enabled');
  });

  it('creates a persisted commerce customer mapping once per member', async () => {
    const payload = createPayloadMock();
    const adapter = createMockCommerceAdapter();

    const first = await ensureCommerceCustomerForMemberWithPayload(payload, adapter, member);
    const second = await ensureCommerceCustomerForMemberWithPayload(payload, adapter, member);

    expect(first.externalId).toBe(second.externalId);
    expect(payload.create).toHaveBeenCalledTimes(2);
  });

  it('creates carts for authenticated members through the customer mapping foundation', async () => {
    const payload = createPayloadMock();
    const adapter = createMockCommerceAdapter();

    const cart = await createCommerceCartForMemberWithDeps(payload, adapter, member);

    expect(cart.itemCount).toBe(0);
    expect(cart.externalId).toContain('mock-cart');
  });

  it('rejects invalid cart item input before calling the adapter', async () => {
    const adapter = createMockCommerceAdapter();

    await expect(
      addItemToCommerceCartWithAdapter(adapter, 'cart_1', {
        quantity: 0,
        variantId: 'variant_1',
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<CommerceServiceError>>({
        code: 'invalid-input',
        status: 400,
      }),
    );
  });

  it('checks out a cart in test mode and records an admin-visible order snapshot', async () => {
    const payload = createPayloadMock();
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

    const cart = await createCommerceCartForMemberWithDeps(payload, adapter, member);
    await addItemToCommerceCartWithAdapter(adapter, cart.externalId, {
      quantity: 2,
      variantId: 'variant_1',
    });
    const order = await checkoutCommerceCartWithDeps(payload, adapter, member, cart.externalId);
    const orders = await listMemberOrdersWithPayload(payload, member);

    expect(order.externalId).toContain('mock-order');
    expect(order.total.amount).toBe(5000);
    expect(orders).toHaveLength(1);
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'commerce-orders',
        overrideAccess: true,
      }),
    );
  });
});
