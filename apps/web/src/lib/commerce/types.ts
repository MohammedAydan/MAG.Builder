import { type CommerceOrderLifecycleStatus } from '@nexpress/commerce';

export type PayloadFindResult<T> = {
  docs: T[];
};

export type PayloadCommerceCustomerDoc = {
  email?: string | null;
  externalCustomerId: string;
  id: number | string;
  member?: number | { id: number | string } | null;
  provider: 'medusa';
  site?: number | { id: number | string } | string | null;
};

export type PayloadCommerceOrderDoc = {
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
  paymentMode: 'production' | 'test';
  paymentSessionId?: string | null;
  paymentWebhookEventId?: string | null;
  paymentWebhookReceivedAt?: string | null;
  checkoutIdempotencyKey?: string | null;
  placedAt: string;
  site?: number | { id: number | string } | string | null;
  status: CommerceOrderLifecycleStatus;
  totalAmount: number;
};

export type CommerceServicePayloadClient = {
  create: (args: Record<string, unknown>) => Promise<unknown>;
  find: (args: Record<string, unknown>) => Promise<PayloadFindResult<PayloadCommerceCustomerDoc | PayloadCommerceOrderDoc>>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

export type CommerceStorefrontStatus = 'disabled' | 'enabled' | 'misconfigured' | 'unavailable';
