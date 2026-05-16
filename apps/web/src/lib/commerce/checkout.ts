import { randomUUID } from 'node:crypto';
import {
  type CommerceAdapter,
  type CommerceCheckoutSessionSummary,
  type CommerceOrderSummary,
} from '@nexpress/commerce';
import { getAuthenticatedMember } from '@/lib/members/service';
import { type ResolvedSite } from '@/lib/sites/service';
import { AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import { normalizeCommerceError, CommerceServiceError } from './errors';
import { getCommerceAdapter } from './adapter';
import {
  parseCommerceExternalId,
  parseCheckoutSessionInput,
  parseIdempotencyKey,
} from './validation';
import {
  getPayload,
  assertMemberEmail,
  createCommerceAuditActor,
  buildHostedCheckoutUrl,
  buildLocalTestOrder,
} from './common';
import { ensureCommerceCustomerForMemberWithPayload } from './customers';
import { type CommerceServicePayloadClient, type PayloadCommerceOrderDoc } from './types';

export async function createCheckoutSessionForCurrentMember(
  input: unknown,
  idempotencyKeyInput?: string | null,
) {
  try {
    const parsed = parseCheckoutSessionInput(input);
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
    return createCheckoutSessionForCartWithDeps(
      payload,
      adapter,
      member,
      site,
      parsed.cartId,
      idempotencyKeyInput,
    );
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function createCheckoutSessionForCartWithDeps(
  payload: CommerceServicePayloadClient,
  adapter: CommerceAdapter,
  member: any,
  site: ResolvedSite,
  cartId: string,
  idempotencyKeyInput?: string | null,
) {
  const cartExternalId = parseCommerceExternalId(cartId, 'cart');
  const idempotencyKey = parseIdempotencyKey(idempotencyKeyInput);
  const customer = await ensureCommerceCustomerForMemberWithPayload(payload, adapter, member, site);
  const cart = await adapter.carts.getById(cartExternalId);

  if (!cart) {
    throw new CommerceServiceError('Cart not found.', 'not-found', 404);
  }

  if (cart.itemCount < 1) {
    throw new CommerceServiceError('Cart is empty.', 'invalid-input', 400);
  }

  const existingOrderLookup = await payload.find({
    collection: 'commerce-orders',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          externalCartId: {
            equals: cart.externalId,
          },
        },
        {
          member: {
            equals: member.id,
          },
        },
        {
          site: {
            equals: site.id,
          },
        },
      ],
    },
  });

  const existingOrder = existingOrderLookup.docs[0] as PayloadCommerceOrderDoc | undefined;
  const orderExternalId = existingOrder?.externalOrderId ?? `chk-order-${cart.externalId}-${randomUUID()}`;
  const existingPaymentSessionId = existingOrder?.paymentSessionId ?? null;
  const paymentSessionId = existingPaymentSessionId ?? `sess_${randomUUID()}`;

  if (existingOrder && existingOrder.checkoutIdempotencyKey === idempotencyKey && existingPaymentSessionId) {
    const checkoutUrl = buildHostedCheckoutUrl(existingPaymentSessionId);
    return {
      ...(checkoutUrl ? { checkoutUrl } : {}),
      currencyCode: cart.currencyCode,
      externalCartId: cart.externalId,
      externalId: existingPaymentSessionId,
      externalOrderId: existingOrder.externalOrderId,
      idempotencyKey,
      provider: adapter.provider,
      status: 'pending',
      total: cart.total,
    } satisfies CommerceCheckoutSessionSummary;
  }

  const orderData = {
    checkoutIdempotencyKey: idempotencyKey,
    currencyCode: cart.currencyCode,
    customerEmail: customer.email ?? assertMemberEmail(member),
    externalCartId: cart.externalId,
    externalCustomerId: customer.externalId,
    externalOrderId: orderExternalId,
    lineItems: cart.items.map((item) => ({
      currencyCode: item.total.currencyCode,
      productExternalId: item.productExternalId,
      quantity: item.quantity,
      title: item.title,
      totalAmount: item.total.amount,
      unitAmount: item.unitPrice.amount,
      variantExternalId: item.variantExternalId,
    })),
    member: member.id,
    paymentMode: 'production' as const,
    paymentSessionId,
    placedAt: existingOrder?.placedAt ?? new Date().toISOString(),
    provider: adapter.provider,
    site: site.id,
    status: 'payment_pending' as const,
    subtotalAmount: cart.subtotal.amount,
    totalAmount: cart.total.amount,
  };

  if (existingOrder?.id) {
    await payload.update({
      collection: 'commerce-orders',
      data: orderData,
      id: existingOrder.id,
      overrideAccess: true,
    });
  } else {
    await payload.create({
      collection: 'commerce-orders',
      data: orderData,
      overrideAccess: true,
    });
  }

  await writeAuditEntry(payload, {
    action: AUDIT_ACTIONS.commerceCheckoutSucceeded,
    actor: createCommerceAuditActor(member),
    metadata: {
      checkoutSessionId: paymentSessionId,
      externalCartId: cart.externalId,
      externalOrderId: orderExternalId,
      mode: 'production',
      provider: adapter.provider,
      siteId: site.siteId,
    },
    result: 'success',
    targetCollection: 'commerce-orders',
    targetId: orderExternalId,
  });

  const checkoutUrl = buildHostedCheckoutUrl(paymentSessionId);
  return {
    ...(checkoutUrl ? { checkoutUrl } : {}),
    currencyCode: cart.currencyCode,
    externalCartId: cart.externalId,
    externalId: paymentSessionId,
    externalOrderId: orderExternalId,
    idempotencyKey,
    provider: adapter.provider,
    status: 'pending',
    total: cart.total,
  } satisfies CommerceCheckoutSessionSummary;
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

export async function checkoutCommerceCartWithDeps(
  payload: CommerceServicePayloadClient,
  adapter: CommerceAdapter,
  member: any,
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
