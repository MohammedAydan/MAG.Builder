import { z } from 'zod';
import type { CommerceRuntimeSelection, MedusaCommerceRuntimeConfig } from './types';

const commerceProviderSchema = z.enum(['disabled', 'medusa']).optional();

const medusaRuntimeSchema = z.object({
  MEDUSA_BACKEND_URL: z.string().trim().min(1, 'MEDUSA_BACKEND_URL is required'),
  MEDUSA_DEFAULT_REGION_ID: z.string().trim().min(1, 'MEDUSA_DEFAULT_REGION_ID is required'),
  MEDUSA_HEALTH_PATH: z.string().trim().optional(),
  MEDUSA_PUBLISHABLE_KEY: z.string().trim().min(1, 'MEDUSA_PUBLISHABLE_KEY is required'),
  MEDUSA_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().max(30000).optional(),
  MEDUSA_SERVER_TOKEN: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_MEDUSA_SERVER_TOKEN: z.string().trim().optional(),
});

export class CommerceConfigError extends Error {}

function normalizeBackendUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new CommerceConfigError('MEDUSA_BACKEND_URL must be a valid absolute URL.');
  }

  const isLocalhost = ['127.0.0.1', '::1', 'localhost'].includes(url.hostname);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new CommerceConfigError('MEDUSA_BACKEND_URL must use http or https.');
  }

  if (url.protocol === 'http:' && !isLocalhost) {
    throw new CommerceConfigError(
      'MEDUSA_BACKEND_URL must use https outside local development.',
    );
  }

  if (url.username || url.password) {
    throw new CommerceConfigError('MEDUSA_BACKEND_URL must not embed credentials.');
  }

  if (url.search || url.hash) {
    throw new CommerceConfigError('MEDUSA_BACKEND_URL must not include query strings or hashes.');
  }

  const pathname = url.pathname === '/'
    ? ''
    : url.pathname.endsWith('/')
      ? url.pathname.slice(0, -1)
      : url.pathname;

  return `${url.origin}${pathname}`;
}

function normalizeHealthPath(value: string | undefined) {
  const raw = value?.trim();

  if (!raw) {
    return '/health';
  }

  if (!raw.startsWith('/')) {
    throw new CommerceConfigError('MEDUSA_HEALTH_PATH must start with "/".');
  }

  if (raw.includes('?') || raw.includes('#')) {
    throw new CommerceConfigError('MEDUSA_HEALTH_PATH must not include query strings or hashes.');
  }

  return raw;
}

function parseMedusaRuntimeConfig(
  source: Record<string, string | undefined>,
): MedusaCommerceRuntimeConfig {
  const parsed = medusaRuntimeSchema.safeParse({
    MEDUSA_BACKEND_URL: source.MEDUSA_BACKEND_URL,
    MEDUSA_DEFAULT_REGION_ID: source.MEDUSA_DEFAULT_REGION_ID,
    MEDUSA_HEALTH_PATH: source.MEDUSA_HEALTH_PATH,
    MEDUSA_PUBLISHABLE_KEY: source.MEDUSA_PUBLISHABLE_KEY,
    MEDUSA_REQUEST_TIMEOUT_MS: source.MEDUSA_REQUEST_TIMEOUT_MS,
    MEDUSA_SERVER_TOKEN: source.MEDUSA_SERVER_TOKEN,
    NEXT_PUBLIC_MEDUSA_SERVER_TOKEN: source.NEXT_PUBLIC_MEDUSA_SERVER_TOKEN,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new CommerceConfigError(`Invalid Medusa runtime configuration: ${details}`);
  }

  if (parsed.data.NEXT_PUBLIC_MEDUSA_SERVER_TOKEN) {
    throw new CommerceConfigError(
      'NEXT_PUBLIC_MEDUSA_SERVER_TOKEN must never be set. Server tokens are server-only.',
    );
  }

  return {
    backendUrl: normalizeBackendUrl(parsed.data.MEDUSA_BACKEND_URL),
    defaultRegionId: parsed.data.MEDUSA_DEFAULT_REGION_ID,
    healthPath: normalizeHealthPath(parsed.data.MEDUSA_HEALTH_PATH),
    provider: 'medusa',
    publishableKey: parsed.data.MEDUSA_PUBLISHABLE_KEY,
    requestTimeoutMs: parsed.data.MEDUSA_REQUEST_TIMEOUT_MS ?? 5000,
    ...(parsed.data.MEDUSA_SERVER_TOKEN
      ? { serverToken: parsed.data.MEDUSA_SERVER_TOKEN }
      : {}),
  };
}

export function resolveCommerceRuntimeConfig(
  source: Record<string, string | undefined>,
): CommerceRuntimeSelection {
  const providerResult = commerceProviderSchema.safeParse(
    source.NEXPRESS_COMMERCE_PROVIDER?.trim(),
  );

  if (!providerResult.success) {
    throw new CommerceConfigError(
      `Unsupported commerce provider "${source.NEXPRESS_COMMERCE_PROVIDER ?? ''}".`,
    );
  }

  const provider = providerResult.data;

  if (!provider) {
    return {
      enabled: false,
      provider: null,
      reason: 'missing-provider',
    };
  }

  if (provider === 'disabled') {
    return {
      enabled: false,
      provider: null,
      reason: 'disabled',
    };
  }

  return {
    config: parseMedusaRuntimeConfig(source),
    enabled: true,
    provider,
  };
}
