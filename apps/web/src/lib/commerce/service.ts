import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  CommerceConfigError,
  CommerceRequestError,
  createMedusaAdapter,
  resolveCommerceRuntimeConfig,
  type CommerceAdapter,
  type CommerceCartSummary,
  type CommerceCustomerRecord,
  type CommerceOrderSummary,
} from '@nexpress/commerce';
import { AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import type { AuthenticatedMemberLike } from '@/lib/auth/access';
import { getAuthenticatedMember } from '@/lib/members/service';
import { getPayloadClient } from '@/lib/payload';
import { hasActivePluginCapability } from '@/lib/plugins/service';
import { createSiteScopeWhere, type ResolvedSite } from '@/lib/sites/service';

const productHandleSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9-]+$/, 'Invalid product handle.');

const externalIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9:_-]+$/, 'Invalid identifier.');

const cartItemInputSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
  variantId: externalIdSchema,
});

const catalogListInputSchema = z.object({
  limit: z.number().int().min(1).max(12).optional(),
});

type PayloadFindResult<T> = {
  docs: T[];
};

type PayloadCommerceCustomerDoc = {
  email?: string | null;
  externalCustomerId: string;
  id: number | string;
  member?: number | { id: number | string } | null;
  provider: 'medusa';
  site?: number | { id: number | string } | string | null;
};

type PayloadCommerceOrderDoc = {
  createdAt?: string;
  currencyCode: string;
  externalCartId?: string | null;
  externalCustomerId?: string | null;
  externalOrderId: string;
  id: number | string;
  lineItems?:
    | {
        currencyCode?: string | null;
        productExternalId?: string | null;
        quantity?: number | null;
        title?: string | null;
        totalAmount?: number | null;
        unitAmount?: number | null;
        variantExternalId?: string | null;
      }[]
    | null;
  paymentMode: 'test';
  placedAt: string;
  site?: number | { id: number | string } | string | null;
  status: 'draft' | 'fulfilled' | 'open' | 'placed';
  totalAmount: number;
};

export type CommerceServicePayloadClient = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<PayloadFindResult<PayloadCommerceCustomerDoc | PayloadCommerceOrderDoc>>;
};

export class CommerceServiceError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'commerce-disabled'
      | 'commerce-misconfigured'
      | 'invalid-input'
      | 'not-authenticated'
      | 'not-found'
      | 'upstream-error',
    readonly status: number,
  ) {
    super(message);
  }
}

export type CommerceStorefrontStatus = 'disabled' | 'enabled' | 'misconfigured' | 'unavailable';

function createCommerceAuditActor(member: AuthenticatedMemberLike) {
  return {
    ...(member.email ? { email: member.email } : {}),
    role: null,
    source: 'user' as const,
    userId: member.id,
  };
}

function assertMemberEmail(member: AuthenticatedMemberLike) {
  if (!member.email) {
    throw new CommerceServiceError(
      'Signed-in member is missing an email address.',
      'commerce-misconfigured',
      500,
    );
  }

  return member.email;
}

function mapPayloadOrderRecord(record: PayloadCommerceOrderDoc) {
  return {
    currencyCode: record.currencyCode,
    ...(record.createdAt ? { createdAt: record.createdAt } : {}),
    ...(record.externalCartId ? { externalCartId: record.externalCartId } : {}),
    ...(record.externalCustomerId ? { externalCustomerId: record.externalCustomerId } : {}),
    externalId: record.externalOrderId,
    items: (record.lineItems ?? []).map((item) => ({
      productExternalId: String(item.productExternalId ?? ''),
      quantity: Number(item.quantity ?? 0),
      title: String(item.title ?? ''),
      total: {
        amount: Number(item.totalAmount ?? 0),
        currencyCode: String(item.currencyCode ?? record.currencyCode),
      },
      unitPrice: {
        amount: Number(item.unitAmount ?? 0),
        currencyCode: String(item.currencyCode ?? record.currencyCode),
      },
      variantExternalId: String(item.variantExternalId ?? ''),
    })),
    status: record.status,
    total: {
      amount: record.totalAmount,
      currencyCode: record.currencyCode,
    },
  } satisfies CommerceOrderSummary & { createdAt?: string };
}

function findMemberValue(record: PayloadCommerceCustomerDoc) {
  return typeof record.member === 'object' && record.member
    ? record.member.id
    : record.member;
}

async function getPayload() {
  return (await getPayloadClient()) as unknown as CommerceServicePayloadClient;
}

function normalizeCommerceError(error: unknown) {
  if (error instanceof CommerceServiceError) {
    return error;
  }

  if (error instanceof CommerceConfigError) {
    return new CommerceServiceError(error.message, 'commerce-misconfigured', 503);
  }

  if (error instanceof CommerceRequestError) {
    return new CommerceServiceError(
      'Commerce provider request failed.',
      'upstream-error',
      error.status ?? 502,
    );
  }

  if (error instanceof Error) {
    return new CommerceServiceError(error.message, 'upstream-error', 500);
  }

  return new CommerceServiceError('Commerce request failed.', 'upstream-error', 500);
}

function buildLocalTestOrder(cart: CommerceCartSummary): CommerceOrderSummary {
  return {
    currencyCode: cart.currencyCode,
    ...(cart.customerExternalId ? { customerExternalId: cart.customerExternalId } : {}),
    externalCartId: cart.externalId,
    externalId: `test-order-${cart.externalId}-${randomUUID()}`,
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
}

export function parseCommerceProductHandle(input: string) {
  const result = productHandleSchema.safeParse(input);

  if (!result.success) {
    throw new CommerceServiceError('Invalid product handle.', 'invalid-input', 400);
  }

  return result.data;
}

export function parseCommerceExternalId(input: string, label: 'cart' | 'variant') {
  const result = externalIdSchema.safeParse(input);

  if (!result.success) {
    throw new CommerceServiceError(`Invalid ${label} identifier.`, 'invalid-input', 400);
  }

  return result.data;
}

export function parseCommerceCartItemInput(input: unknown) {
  const result = cartItemInputSchema.safeParse(input);

  if (!result.success) {
    throw new CommerceServiceError(
      result.error.issues[0]?.message ?? 'Invalid cart item input.',
      'invalid-input',
      400,
    );
  }

  return result.data;
}

export async function hasCommerceCatalogAccess() {
  return hasActivePluginCapability({
    capability: 'commerce:catalog',
    pluginId: 'commerce-pack',
  });
}

export async function getCommerceAdapter(): Promise<CommerceAdapter> {
  const hasCapability = await hasCommerceCatalogAccess();

  if (!hasCapability) {
    throw new CommerceServiceError(
      'Commerce is disabled because commerce-pack is not active.',
      'commerce-disabled',
      503,
    );
  }

  const runtimeConfig = resolveCommerceRuntimeConfig(
    process.env as Record<string, string | undefined>,
  );

  if (!runtimeConfig.enabled) {
    throw new CommerceServiceError(
      'Commerce is not configured for this installation.',
      'commerce-misconfigured',
      503,
    );
  }

  switch (runtimeConfig.provider) {
    case 'medusa':
      return createMedusaAdapter(runtimeConfig.config);
    default:
      throw new CommerceServiceError(
        'Commerce provider selection is invalid.',
        'commerce-misconfigured',
        500,
      );
  }
}

export async function getCommerceHealthSnapshot() {
  try {
    const adapter = await getCommerceAdapter();
    return await adapter.checkHealth();
  } catch (error) {
    if (error instanceof CommerceServiceError) {
      return {
        checkedAt: new Date().toISOString(),
        endpoint: 'not-configured',
        error: error.message,
        ok: false,
        provider: 'medusa' as const,
      };
    }

    if (error instanceof CommerceConfigError) {
      return {
        checkedAt: new Date().toISOString(),
        endpoint: 'invalid-config',
        error: error.message,
        ok: false,
        provider: 'medusa' as const,
      };
    }

    return {
      checkedAt: new Date().toISOString(),
      endpoint: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown commerce error.',
      ok: false,
      provider: 'medusa' as const,
    };
  }
}

export async function listCatalogProductsWithAdapter(adapter: CommerceAdapter) {
  return adapter.products.listCatalog();
}

export async function getCatalogProductByHandleWithAdapter(
  adapter: CommerceAdapter,
  handle: string,
) {
  return adapter.products.getByHandle(parseCommerceProductHandle(handle));
}

export async function ensureCommerceCustomerForMemberWithPayload(
  payload: CommerceServicePayloadClient,
  adapter: CommerceAdapter,
  member: AuthenticatedMemberLike,
  site: ResolvedSite,
) {
  const existing = await payload.find({
    collection: 'commerce-customers',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          member: {
            equals: member.id,
          },
        },
        createSiteScopeWhere(site),
      ],
    },
  });

  const record = existing.docs[0] as PayloadCommerceCustomerDoc | undefined;

  if (record) {
    return {
      ...(record.email ? { email: record.email } : {}),
      externalId: record.externalCustomerId,
      memberId: String(findMemberValue(record) ?? member.id),
    } satisfies CommerceCustomerRecord;
  }

  const created = await adapter.customers.create({
    email: assertMemberEmail(member),
    ...(member.firstName ? { firstName: member.firstName } : {}),
    ...(member.lastName ? { lastName: member.lastName } : {}),
    memberId: String(member.id),
  });

  await payload.create({
    collection: 'commerce-customers',
      data: {
        email: created.email ?? assertMemberEmail(member),
        externalCustomerId: created.externalId,
        member: member.id,
        provider: adapter.provider,
        site: site.id,
      },
      overrideAccess: true,
    });

  await writeAuditEntry(payload, {
    action: AUDIT_ACTIONS.commerceCustomerMapped,
    actor: createCommerceAuditActor(member),
    metadata: {
      externalCustomerId: created.externalId,
      provider: adapter.provider,
      siteId: site.siteId,
    },
    result: 'success',
    targetCollection: 'commerce-customers',
    targetId: created.externalId,
  });

  return created;
}

export async function createCommerceCartForMemberWithDeps(
  payload: CommerceServicePayloadClient,
  adapter: CommerceAdapter,
  member: AuthenticatedMemberLike,
  site: ResolvedSite,
) {
  const customer = await ensureCommerceCustomerForMemberWithPayload(payload, adapter, member, site);

  return adapter.carts.create({
    customerExternalId: customer.externalId,
    email: customer.email ?? assertMemberEmail(member),
    regionId: adapter.config.defaultRegionId,
  });
}

export async function addItemToCommerceCartWithAdapter(
  adapter: CommerceAdapter,
  cartId: string,
  input: unknown,
) {
  const parsed = parseCommerceCartItemInput(input);
  const cartExternalId = parseCommerceExternalId(cartId, 'cart');
  const variantExternalId = parseCommerceExternalId(parsed.variantId, 'variant');
  const variant = await adapter.products.getVariantById(variantExternalId);

  if (!variant) {
    throw new CommerceServiceError('Variant not found.', 'not-found', 404);
  }

  return adapter.carts.addLineItem({
    cartExternalId,
    quantity: parsed.quantity,
    variantExternalId: variant.externalId,
  });
}

export async function checkoutCommerceCartWithDeps(
  payload: CommerceServicePayloadClient,
  adapter: CommerceAdapter,
  member: AuthenticatedMemberLike,
  site: ResolvedSite,
  cartId: string,
) {
  const cartExternalId = parseCommerceExternalId(cartId, 'cart');
  const customer = await ensureCommerceCustomerForMemberWithPayload(payload, adapter, member, site);
  const cart = await adapter.carts.getById(cartExternalId);

  if (!cart) {
    throw new CommerceServiceError('Cart not found.', 'not-found', 404);
  }

  if (cart.itemCount < 1) {
    throw new CommerceServiceError('Cart is empty.', 'invalid-input', 400);
  }

  let order: CommerceOrderSummary | null = null;

  try {
    const result = await adapter.carts.complete(cartExternalId);
    order = result.type === 'order' ? result.order : buildLocalTestOrder(cart);
  } catch {
    order = buildLocalTestOrder(cart);
  }

  await payload.create({
    collection: 'commerce-orders',
    data: {
      currencyCode: order.currencyCode,
      customerEmail: customer.email ?? assertMemberEmail(member),
      externalCartId: order.externalCartId ?? cart.externalId,
      externalCustomerId: customer.externalId,
      externalOrderId: order.externalId,
      lineItems: order.items.map((item) => ({
        currencyCode: item.total.currencyCode,
        productExternalId: item.productExternalId,
        quantity: item.quantity,
        title: item.title,
        totalAmount: item.total.amount,
        unitAmount: item.unitPrice.amount,
        variantExternalId: item.variantExternalId,
      })),
      member: member.id,
      paymentMode: 'test',
      placedAt: new Date().toISOString(),
      provider: adapter.provider,
      site: site.id,
      status: order.status,
      subtotalAmount: cart.subtotal.amount,
      totalAmount: order.total.amount,
    },
    overrideAccess: true,
  });

  await writeAuditEntry(payload, {
    action: AUDIT_ACTIONS.commerceOrderRecorded,
    actor: createCommerceAuditActor(member),
    metadata: {
      externalCartId: order.externalCartId ?? cart.externalId,
      externalOrderId: order.externalId,
      itemCount: order.items.length,
      mode: 'test',
      provider: adapter.provider,
      siteId: site.siteId,
      totalAmount: order.total.amount,
    },
    result: 'success',
    targetCollection: 'commerce-orders',
    targetId: order.externalId,
  });

  await writeAuditEntry(payload, {
    action: AUDIT_ACTIONS.commerceCheckoutSucceeded,
    actor: createCommerceAuditActor(member),
    metadata: {
      externalCartId: order.externalCartId ?? cart.externalId,
      externalOrderId: order.externalId,
      mode: 'test',
      siteId: site.siteId,
    },
    result: 'success',
    targetCollection: 'commerce-orders',
    targetId: order.externalId,
  });

  return order;
}

export async function listMemberOrdersWithPayload(
  payload: CommerceServicePayloadClient,
  member: AuthenticatedMemberLike,
  site: ResolvedSite,
) {
  const result = await payload.find({
    collection: 'commerce-orders',
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          member: {
            equals: member.id,
          },
        },
        createSiteScopeWhere(site),
      ],
    },
  });

  return result.docs
    .map((record) => mapPayloadOrderRecord(record as PayloadCommerceOrderDoc))
    .sort((left, right) => right.externalId.localeCompare(left.externalId));
}

export async function listCatalogProducts() {
  try {
    const adapter = await getCommerceAdapter();
    return await listCatalogProductsWithAdapter(adapter);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function listCatalogProductsWithInput(input?: { limit?: number }) {
  try {
    const adapter = await getCommerceAdapter();
    const parsed = catalogListInputSchema.parse(input ?? {});
    return await adapter.products.listCatalog(parsed.limit ? { limit: parsed.limit } : undefined);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function getCatalogProductByHandle(handle: string) {
  try {
    const adapter = await getCommerceAdapter();
    const product = await getCatalogProductByHandleWithAdapter(adapter, handle);

    if (!product) {
      throw new CommerceServiceError('Product not found.', 'not-found', 404);
    }

    return product;
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function createCommerceCartForCurrentMember() {
  try {
    const member = await getAuthenticatedMember();

    if (!member) {
      throw new CommerceServiceError('You must be signed in.', 'not-authenticated', 401);
    }

    if (!member.siteId) {
      throw new CommerceServiceError('This member is not assigned to a site.', 'not-authenticated', 403);
    }

    const site = {
      id: member.siteId,
      isDefault: false,
      name: 'Member site',
      primaryHostname: null,
      siteId: String(member.siteId),
      slug: String(member.siteId),
    } satisfies ResolvedSite;
    const [payload, adapter] = await Promise.all([getPayload(), getCommerceAdapter()]);
    return createCommerceCartForMemberWithDeps(payload, adapter, member, site);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function getCommerceCart(cartId: string) {
  try {
    const adapter = await getCommerceAdapter();
    const cart = await adapter.carts.getById(parseCommerceExternalId(cartId, 'cart'));

    if (!cart) {
      throw new CommerceServiceError('Cart not found.', 'not-found', 404);
    }

    return cart;
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function addItemToCommerceCart(cartId: string, input: unknown) {
  try {
    const member = await getAuthenticatedMember();

    if (!member) {
      throw new CommerceServiceError('You must be signed in.', 'not-authenticated', 401);
    }

    const adapter = await getCommerceAdapter();
    return addItemToCommerceCartWithAdapter(adapter, cartId, input);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function checkoutCommerceCart(cartId: string) {
  try {
    const member = await getAuthenticatedMember();

    if (!member) {
      throw new CommerceServiceError('You must be signed in.', 'not-authenticated', 401);
    }

    if (!member.siteId) {
      throw new CommerceServiceError('This member is not assigned to a site.', 'not-authenticated', 403);
    }

    const site = {
      id: member.siteId,
      isDefault: false,
      name: 'Member site',
      primaryHostname: null,
      siteId: String(member.siteId),
      slug: String(member.siteId),
    } satisfies ResolvedSite;
    const [payload, adapter] = await Promise.all([getPayload(), getCommerceAdapter()]);
    return checkoutCommerceCartWithDeps(payload, adapter, member, site, cartId);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function listMemberOrders() {
  try {
    const member = await getAuthenticatedMember();

    if (!member) {
      throw new CommerceServiceError('You must be signed in.', 'not-authenticated', 401);
    }

    if (!member.siteId) {
      throw new CommerceServiceError('This member is not assigned to a site.', 'not-authenticated', 403);
    }

    const site = {
      id: member.siteId,
      isDefault: false,
      name: 'Member site',
      primaryHostname: null,
      siteId: String(member.siteId),
      slug: String(member.siteId),
    } satisfies ResolvedSite;
    const payload = await getPayload();
    return listMemberOrdersWithPayload(payload, member, site);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export function getSafeCommerceErrorMessage(error: unknown) {
  return normalizeCommerceError(error).message;
}

export async function getCommerceStorefrontStatus(): Promise<CommerceStorefrontStatus> {
  try {
    await getCommerceAdapter();
    return 'enabled';
  } catch (error) {
    const normalized = normalizeCommerceError(error);

    if (normalized.code === 'commerce-disabled') {
      return 'disabled';
    }

    if (normalized.code === 'commerce-misconfigured') {
      return 'misconfigured';
    }

    return 'unavailable';
  }
}
