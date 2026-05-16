import { type CommerceAdapter } from '@nexpress/commerce';
import { normalizeCommerceError } from './errors';
import { getCommerceAdapter } from './adapter';
import { parseCommerceProductHandle, catalogListInputSchema } from './validation';

export async function listCatalogProducts() {
  try {
    const adapter = await getCommerceAdapter();
    return await listCatalogProductsWithAdapter(adapter);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function listCatalogProductsWithInput(input?: { limit?: number }) {
  try {
    const adapter = await getCommerceAdapter();
    const parsed = catalogListInputSchema.parse(input ?? {});
    return await adapter.products.listCatalog(parsed.limit ? { limit: parsed.limit } : undefined);
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function getCatalogProductByHandle(handle: string) {
  try {
    const adapter = await getCommerceAdapter();
    const product = await getCatalogProductByHandleWithAdapter(adapter, handle);

    if (!product) {
      const { CommerceServiceError } = await import('./errors');
      throw new CommerceServiceError('Product not found.', 'not-found', 404);
    }

    return product;
  } catch (error) {
    throw normalizeCommerceError(error);
  }
}

export async function listCatalogProductsWithAdapter(adapter: CommerceAdapter) {
  return adapter.products.listCatalog();
}

export async function getCatalogProductByHandleWithAdapter(
  adapter: CommerceAdapter,
  handle: string,
) {
  return adapter.products.getByHandle(parseCommerceProductHandle(handle));
}
