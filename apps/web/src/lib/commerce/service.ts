import {
  CommerceConfigError,
  createMedusaAdapter,
  resolveCommerceRuntimeConfig,
  type CommerceAdapter,
} from '@nexpress/commerce';
import { hasActivePluginCapability } from '@/lib/plugins/service';

export class CommerceServiceError extends Error {
  constructor(
    message: string,
    readonly code: 'commerce-disabled' | 'commerce-misconfigured',
    readonly status: number,
  ) {
    super(message);
  }
}

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

    if (error instanceof CommerceConfigError) {
      return {
        checkedAt: new Date().toISOString(),
        endpoint: 'invalid-config',
        error: error.message,
        ok: false,
        provider: 'medusa' as const,
      };
    }

    return {
      checkedAt: new Date().toISOString(),
      endpoint: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown commerce error.',
      ok: false,
      provider: 'medusa' as const,
    };
  }
}
