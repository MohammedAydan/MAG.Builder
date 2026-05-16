import type {
  CommerceAdapter,
  CommerceCheckoutResult,
  MedusaCommerceRuntimeConfig,
} from '../../types';
import { normalizeCart, normalizeOrder } from '../common/normalizers';
import { requestMedusaJson, type FetchImplementation } from '../client';
import { CommerceRequestError } from '../common/errors';

export function createCartPort(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
): CommerceAdapter['carts'] {
  return {
    async addLineItem(input) {
      const payload = await requestMedusaJson<{ cart?: Record<string, unknown> }>(
        config,
        fetchImpl,
        `/store/carts/${encodeURIComponent(input.cartExternalId)}/line-items`,
        {
          body: {
            quantity: input.quantity,
            variant_id: input.variantExternalId,
          },
          method: 'POST',
        },
      );

      const cart = payload?.cart ? normalizeCart(payload.cart) : null;

      if (!cart) {
        throw new CommerceRequestError('Medusa did not return a valid cart payload.');
      }

      return cart;
    },
    async complete(cartExternalId) {
      const payload = await requestMedusaJson<
        | { cart?: Record<string, unknown>; error?: string; type?: 'cart' }
        | { order?: Record<string, unknown>; type?: 'order' }
      >(
        config,
        fetchImpl,
        `/store/carts/${encodeURIComponent(cartExternalId)}/complete`,
        {
          method: 'POST',
        },
      );

      if (payload?.type === 'order' && payload.order) {
        const order = normalizeOrder(payload.order);

        if (!order) {
          throw new CommerceRequestError('Medusa did not return a valid order payload.');
        }

        return {
          order,
          type: 'order',
        } satisfies CommerceCheckoutResult;
      }

      if (payload && 'cart' in payload && payload.cart) {
        const cart = normalizeCart(payload.cart);

        if (!cart) {
          throw new CommerceRequestError('Medusa did not return a valid cart payload.');
        }

        return {
          cart,
          ...(typeof payload.error === 'string' ? { error: payload.error } : {}),
          type: 'cart',
        } satisfies CommerceCheckoutResult;
      }

      throw new CommerceRequestError('Medusa did not return a valid checkout payload.');
    },
    async create(input) {
      const payload = await requestMedusaJson<{ cart?: Record<string, unknown> }>(
        config,
        fetchImpl,
        '/store/carts',
        {
          body: {
            ...(input.email ? { email: input.email } : {}),
            region_id: input.regionId,
          },
          method: 'POST',
        },
      );

      const cart = payload?.cart ? normalizeCart(payload.cart) : null;

      if (!cart) {
        throw new CommerceRequestError('Medusa did not return a valid cart payload.');
      }

      return cart;
    },
    async getById(externalId) {
      const payload = await requestMedusaJson<{ cart?: Record<string, unknown> }>(
        config,
        fetchImpl,
        `/store/carts/${encodeURIComponent(externalId)}`,
      );

      return payload?.cart ? normalizeCart(payload.cart) : null;
    },
  };
}
