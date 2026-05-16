import {
  type CommerceAdapter,
  type CommerceCartSummary,
  type CommerceCustomerRecord,
} from '@nexpress/commerce';
import { getAuthenticatedMember } from '@/lib/members/service';
import { type ResolvedSite } from '@/lib/sites/service';
import { normalizeCommerceError, CommerceServiceError } from './errors';
import { getCommerceAdapter } from './adapter';
import { parseCommerceExternalId, parseCommerceCartItemInput } from './validation';
import { getPayload, assertMemberEmail } from './common';
import { ensureCommerceCustomerForMemberWithPayload } from './customers';
import { type CommerceServicePayloadClient } from './types';

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

export async function createCommerceCartForMemberWithDeps(
  payload: CommerceServicePayloadClient,
  adapter: CommerceAdapter,
  member: { id: string | number; email?: string | null },
  site: ResolvedSite,
) {
  const customer = await ensureCommerceCustomerForMemberWithPayload(payload, adapter, member, site);
  return adapter.carts.create({
    customerExternalId: customer.externalId,
    email: customer.email ?? assertMemberEmail(member as any),
    regionId: adapter.config.defaultRegionId,
  });
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
