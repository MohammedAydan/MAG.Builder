import { z } from 'zod';

export const WebhookEventNames = z.enum([
  'form.submitted',
  'order.created',
  'order.updated',
  'page.published',
  'page.unpublished',
]);

export type WebhookEventName = z.infer<typeof WebhookEventNames>;

export const BaseEventPayloadSchema = z.object({
  id: z.string().uuid(),
  event: WebhookEventNames,
  timestamp: z.string().datetime(),
});

export const FormSubmittedEventPayloadSchema = BaseEventPayloadSchema.extend({
  event: z.literal('form.submitted'),
  data: z.object({
    formId: z.string(),
    submissionId: z.string(),
  }),
});

export const OrderCreatedEventPayloadSchema = BaseEventPayloadSchema.extend({
  event: z.literal('order.created'),
  data: z.object({
    orderId: z.string(),
    status: z.string(),
  }),
});

export const OrderUpdatedEventPayloadSchema = BaseEventPayloadSchema.extend({
  event: z.literal('order.updated'),
  data: z.object({
    orderId: z.string(),
    status: z.string(),
  }),
});

export const PagePublishedEventPayloadSchema = BaseEventPayloadSchema.extend({
  event: z.literal('page.published'),
  data: z.object({
    pageId: z.string(),
    slug: z.string(),
  }),
});

export const PageUnpublishedEventPayloadSchema = BaseEventPayloadSchema.extend({
  event: z.literal('page.unpublished'),
  data: z.object({
    pageId: z.string(),
    slug: z.string(),
  }),
});

export const WebhookPayloadSchema = z.discriminatedUnion('event', [
  FormSubmittedEventPayloadSchema,
  OrderCreatedEventPayloadSchema,
  OrderUpdatedEventPayloadSchema,
  PagePublishedEventPayloadSchema,
  PageUnpublishedEventPayloadSchema,
]);

export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;
