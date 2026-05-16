import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { type CommercePaymentWebhookEvent } from '@nexpress/commerce';
import { CommerceServiceError } from './errors';

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

const checkoutSessionInputSchema = z.object({
  cartId: externalIdSchema,
});

const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(120)
  .regex(/^[A-Za-z0-9:_-]+$/, 'Invalid idempotency key.');

const paymentWebhookInputSchema = z.object({
  eventId: externalIdSchema,
  orderExternalId: externalIdSchema,
  provider: z.literal('medusa'),
  sessionExternalId: externalIdSchema,
  timestamp: z.string().datetime({ offset: true }),
  type: z.enum([
    'payment.authorized',
    'payment.captured',
    'payment.failed',
    'payment.expired',
  ]),
});

export const catalogListInputSchema = z.object({
  limit: z.number().int().min(1).max(12).optional(),
});

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

export function parseCheckoutSessionInput(input: unknown) {
  const result = checkoutSessionInputSchema.safeParse(input);

  if (!result.success) {
    throw new CommerceServiceError(
      result.error.issues[0]?.message ?? 'Invalid checkout session input.',
      'invalid-input',
      400,
    );
  }

  return result.data;
}

export function parseIdempotencyKey(input: string | null | undefined) {
  const value = input?.trim();

  if (!value) {
    return `checkout-${randomUUID()}`;
  }

  const result = idempotencyKeySchema.safeParse(value);

  if (!result.success) {
    throw new CommerceServiceError('Invalid idempotency key.', 'invalid-input', 400);
  }

  return result.data;
}

export function parsePaymentWebhookEvent(input: unknown): CommercePaymentWebhookEvent {
  const result = paymentWebhookInputSchema.safeParse(input);

  if (!result.success) {
    throw new CommerceServiceError(
      result.error.issues[0]?.message ?? 'Invalid payment webhook payload.',
      'invalid-input',
      400,
    );
  }

  return result.data;
}
