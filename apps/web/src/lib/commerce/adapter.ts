import {
  createMedusaAdapter,
  resolveCommerceRuntimeConfig,
  type CommerceAdapter,
} from '@nexpress/commerce';
import { hasActivePluginCapability } from '@/lib/plugins/service';
import { CommerceServiceError } from './errors';
import { type CommerceStorefrontStatus } from './types';

export async function hasCommerceCatalogAccess() {
  return hasActivePluginCapability({
    capability: 'commerce:catalog',
    pluginId: 'commerce-pack',
  });
}

export async function getCommerceAdapter(): Promise<CommerceAdapter> {
  const hasCapability = await hasCommerceCatalogAccess();

  if (!hasCapability) {
    throw new CommerceServiceError(
      'Commerce is disabled because commerce-pack is not active.',
      'commerce-disabled',
      503,
    );
  }

  const runtimeConfig = resolveCommerceRuntimeConfig(
    process.env as Record<string, string | undefined>,
  );

  if (!runtimeConfig.enabled) {
    throw new CommerceServiceError(
      'Commerce is not configured for this installation.',
      'commerce-misconfigured',
      503,
    );
  }

  switch (runtimeConfig.provider) {
    case 'medusa':
      return createMedusaAdapter(runtimeConfig.config);
    default:
      throw new CommerceServiceError(
        'Commerce provider selection is invalid.',
        'commerce-misconfigured',
        500,
      );
  }
}

export async function getCommerceHealthSnapshot() {
  try {
    const adapter = await getCommerceAdapter();
    return await adapter.checkHealth();
  } catch (error) {
    if (error instanceof CommerceServiceError) {
      return {
        checkedAt: new Date().toISOString(),
        endpoint: 'not-configured',
        error: error.message,
        ok: false,
        provider: 'medusa' as const,
      };
    }

    // Fallback for unexpected errors
    return {
      checkedAt: new Date().toISOString(),
      endpoint: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown commerce error.',
      ok: false,
      provider: 'medusa' as const,
    };
  }
}

export async function getCommerceStorefrontStatus(): Promise<CommerceStorefrontStatus> {
  try {
    await getCommerceAdapter();
    return 'enabled';
  } catch (error) {
    const { code } = error instanceof CommerceServiceError ? error : { code: 'unknown' };

    if (code === 'commerce-disabled') {
      return 'disabled';
    }

    if (code === 'commerce-misconfigured') {
      return 'misconfigured';
    }

    return 'unavailable';
  }
}
