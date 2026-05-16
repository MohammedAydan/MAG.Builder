import type {
  CommerceAdapter,
  CommerceProductSummary,
  MedusaCommerceRuntimeConfig,
} from '../../types';
import { normalizeProduct } from '../common/normalizers';
import { requestMedusaJson, type FetchImplementation } from '../client';

export function normalizeCatalogResponse(payload: unknown) {
  const products: unknown[] = payload
    && typeof payload === 'object'
    && Array.isArray((payload as Record<string, unknown>).products)
      ? ((payload as Record<string, unknown>).products as unknown[])
      : [];

  return products
    .map((entry) =>
      entry && typeof entry === 'object'
        ? normalizeProduct(entry as Record<string, unknown>)
        : null,
    )
    .filter((entry): entry is CommerceProductSummary => Boolean(entry))
    .filter((entry) => entry.isPublished);
}

export function createCatalogPort(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
): Pick<CommerceAdapter, 'products' | 'prices'> {
  const products: CommerceAdapter['products'] = {
    async getByHandle(handle) {
      const payload = await requestMedusaJson<{ products?: Record<string, unknown>[] }>(
        config,
        fetchImpl,
        `/store/products?handle=${encodeURIComponent(handle)}&limit=1`,
      );

      const product = Array.isArray(payload?.products) ? payload.products[0] : undefined;
      return product ? normalizeProduct(product) : null;
    },
    async getById(externalId) {
      const payload = await requestMedusaJson<{ product?: Record<string, unknown> }>(
        config,
        fetchImpl,
        `/store/products/${encodeURIComponent(externalId)}`,
      );

      return payload?.product ? normalizeProduct(payload.product) : null;
    },
    async getVariantById(externalId) {
      const productsList = await products.listCatalog({ limit: 100 });

      for (const product of productsList) {
        const variant = product.variants.find((entry) => entry.externalId === externalId);

        if (variant) {
          return variant;
        }
      }

      return null;
    },
    async listCatalog(input) {
      const limit = input?.limit ?? 24;
      const payload = await requestMedusaJson<{ products?: Record<string, unknown>[] }>(
        config,
        fetchImpl,
        `/store/products?limit=${encodeURIComponent(String(limit))}`,
      );

      return normalizeCatalogResponse(payload);
    },
  };

  const prices: CommerceAdapter['prices'] = {
    async listForProduct(productExternalId) {
      const product = await products.getById(productExternalId);

      if (!product) {
        return [];
      }

      return product.variants.map((variant) => ({
        amount: variant.price,
        externalId: `${variant.externalId}:list`,
        productExternalId,
        type: 'list' as const,
        variantExternalId: variant.externalId,
      }));
    },
  };

  return { prices, products };
}
