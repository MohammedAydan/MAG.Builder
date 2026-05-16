import { randomUUID } from 'node:crypto';
import {
  type CommerceCartSummary,
  type CommerceOrderSummary,
  type CommerceOrderLifecycleStatus,
  type CommercePaymentWebhookEvent,
} from '@nexpress/commerce';
import { type AuthenticatedMemberLike } from '@/lib/auth/access';
import { getPayloadClient } from '@/lib/payload';
import { CommerceServiceError } from './errors';
import {
  type PayloadCommerceOrderDoc,
  type PayloadCommerceCustomerDoc,
  type CommerceServicePayloadClient,
} from './types';

export function createCommerceAuditActor(member: AuthenticatedMemberLike) {
  return {
    ...(member.email ? { email: member.email } : {}),
    role: null,
    source: 'user' as const,
    userId: member.id,
  };
}

export function assertMemberEmail(member: AuthenticatedMemberLike) {
  if (!member.email) {
    throw new CommerceServiceError(
      'Signed-in member is missing an email address.',
      'commerce-misconfigured',
      500,
    );
  }

  return member.email;
}

export function mapPayloadOrderRecord(record: PayloadCommerceOrderDoc) {
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

export function findMemberValue(record: PayloadCommerceCustomerDoc) {
  return typeof record.member === 'object' && record.member
    ? record.member.id
    : record.member;
}

export async function getPayload() {
  return (await getPayloadClient()) as unknown as CommerceServicePayloadClient;
}

export function buildLocalTestOrder(cart: CommerceCartSummary): CommerceOrderSummary {
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

export function mapPaymentEventToOrderStatus(
  eventType: CommercePaymentWebhookEvent['type'],
): CommerceOrderLifecycleStatus {
  switch (eventType) {
    case 'payment.authorized':
      return 'payment_authorized';
    case 'payment.captured':
      return 'placed';
    case 'payment.failed':
      return 'payment_failed';
    case 'payment.expired':
      return 'open';
    default:
      return 'payment_pending';
  }
}

export function isValidOrderLifecycleTransition(
  current: CommerceOrderLifecycleStatus,
  next: CommerceOrderLifecycleStatus,
) {
  if (current === next) {
    return true;
  }

  const transitions: Record<CommerceOrderLifecycleStatus, readonly CommerceOrderLifecycleStatus[]> = {
    draft: ['open', 'payment_pending'],
    fulfilled: [],
    open: ['payment_pending'],
    payment_authorized: ['placed', 'payment_failed'],
    payment_failed: ['open', 'payment_pending'],
    payment_pending: ['payment_authorized', 'payment_failed', 'open', 'placed'],
    placed: ['fulfilled'],
  };

  return transitions[current].includes(next);
}

export function buildHostedCheckoutUrl(sessionId: string) {
  const base = process.env.NEXPRESS_COMMERCE_CHECKOUT_BASE_URL?.trim();

  if (!base) {
    return undefined;
  }

  try {
    const url = new URL(base);
    url.searchParams.set('session', sessionId);
    return url.toString();
  } catch {
    return undefined;
  }
}
