import type {
  CommerceAdapter,
  MedusaCommerceRuntimeConfig,
} from '../../types';
import { normalizeCustomer } from '../common/normalizers';
import { requestMedusaJson, type FetchImplementation } from '../client';
import { CommerceRequestError } from '../common/errors';

export function createCustomersPort(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
): CommerceAdapter['customers'] {
  return {
    async create(input) {
      const payload = await requestMedusaJson<{ customer?: Record<string, unknown> }>(
        config,
        fetchImpl,
        '/admin/customers',
        {
          body: {
            email: input.email,
            ...(input.firstName ? { first_name: input.firstName } : {}),
            ...(input.lastName ? { last_name: input.lastName } : {}),
            ...(input.memberId
              ? {
                  metadata: {
                    member_id: input.memberId,
                  },
                }
              : {}),
          },
          method: 'POST',
          requireServerToken: true,
        },
      );

      const customer = payload?.customer ? normalizeCustomer(payload.customer) : null;

      if (!customer) {
        throw new CommerceRequestError('Medusa did not return a valid customer payload.');
      }

      return customer;
    },
    async getByExternalId(externalId) {
      const payload = await requestMedusaJson<{ customer?: Record<string, unknown> }>(
        config,
        fetchImpl,
        `/admin/customers/${encodeURIComponent(externalId)}`,
        {
          requireServerToken: true,
        },
      );

      return payload?.customer ? normalizeCustomer(payload.customer) : null;
    },
  };
}
