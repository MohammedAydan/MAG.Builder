import type {
  CommerceAdapter,
  CommerceOrderSummary,
  MedusaCommerceRuntimeConfig,
} from '../../types';
import { normalizeOrder } from '../common/normalizers';
import { requestMedusaJson, type FetchImplementation } from '../client';

export function createOrdersPort(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
): CommerceAdapter['orders'] {
  return {
    async getById(externalId) {
      const payload = await requestMedusaJson<{ order?: Record<string, unknown> }>(
        config,
        fetchImpl,
        `/admin/orders/${encodeURIComponent(externalId)}`,
        {
          requireServerToken: true,
        },
      );

      return payload?.order ? normalizeOrder(payload.order) : null;
    },
    async listByCustomer(customerExternalId) {
      const payload = await requestMedusaJson<{ orders?: Record<string, unknown>[] }>(
        config,
        fetchImpl,
        `/admin/orders?customer_id=${encodeURIComponent(customerExternalId)}`,
        {
          requireServerToken: true,
        },
      );

      const orders = Array.isArray(payload?.orders) ? payload.orders : [];

      return orders
        .map((order) => normalizeOrder(order))
        .filter((entry): entry is CommerceOrderSummary => Boolean(entry));
    },
  };
}
