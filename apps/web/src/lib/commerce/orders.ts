import { randomUUID } from 'node:crypto';
import {
  type CommerceAdapter,
  type CommerceCheckoutResult,
} from '@nexpress/commerce';
import { getAuthenticatedMember } from '@/lib/members/service';
import { type ResolvedSite } from '@/lib/sites/service';
import { AUDIT_ACTIONS, writeAuditEntry } from '@/lib/audit/service';
import { fireAutomationTrigger } from '@/lib/automation/hooks';
import { enqueueWebhookDelivery } from '@/lib/webhooks/outbound';
import { normalizeCommerceError, CommerceServiceError } from './errors';
import { getCommerceAdapter } from './adapter';
import { parsePaymentWebhookEvent } from './validation';
import {
  getPayload,
  createCommerceAuditActor,
  mapPayloadOrderRecord,
  mapPaymentEventToOrderStatus,
  isValidOrderLifecycleTransition,
} from './common';
import {
  type CommerceServicePayloadClient,
  type PayloadCommerceOrderDoc,
} from './types';
import { createSiteScopeWhere } from '@/lib/sites/service';

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

export async function listMemberOrdersWithPayload(
  payload: CommerceServicePayloadClient,
  member: any,
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

export async function processPaymentWebhook(eventInput: unknown) {
  try {
    const event = parsePaymentWebhookEvent(eventInput);
    const payload = await getPayload();
    return processPaymentWebhookWithDeps(payload, event);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function processPaymentWebhookWithDeps(
  payload: CommerceServicePayloadClient,
  event: any, // CommercePaymentWebhookEvent
) {
  const orderLookup = await payload.find({
    collection: 'commerce-orders',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          externalOrderId: {
            equals: event.orderExternalId,
          },
        },
      ],
    },
  });

  const order = orderLookup.docs[0] as PayloadCommerceOrderDoc | undefined;

  if (!order) {
    throw new CommerceServiceError('Order not found for payment webhook.', 'not-found', 404);
  }

  if (order.paymentWebhookEventId === event.eventId) {
    return {
      idempotent: true,
      orderExternalId: order.externalOrderId,
      status: order.status,
    };
  }

  const nextStatus = mapPaymentEventToOrderStatus(event.type);

  if (!isValidOrderLifecycleTransition(order.status, nextStatus)) {
    return {
      idempotent: false,
      ignored: true,
      orderExternalId: order.externalOrderId,
      status: order.status,
    };
  }

  await payload.update({
    collection: 'commerce-orders',
    data: {
      paymentSessionId: event.sessionExternalId,
      paymentWebhookEventId: event.eventId,
      paymentWebhookReceivedAt: event.timestamp,
      status: nextStatus,
    },
    id: order.id,
    overrideAccess: true,
  });

  await writeAuditEntry(payload, {
    action: AUDIT_ACTIONS.commerceOrderRecorded,
    actor: {
      role: null,
      source: 'system',
    },
    metadata: {
      eventId: event.eventId,
      externalOrderId: event.orderExternalId,
      paymentSessionId: event.sessionExternalId,
      provider: event.provider,
      webhookEvent: event.type,
    },
    result: 'success',
    targetCollection: 'commerce-orders',
    targetId: event.orderExternalId,
  });

  return {
    idempotent: false,
    orderExternalId: event.orderExternalId,
    status: nextStatus,
  };
}

export async function listAllOrders(user: any) {
  const payload = await getPayload();

  const result = await payload.find({
    collection: 'commerce-orders',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    sort: '-placedAt',
    user,
  });

  return result.docs;
}
