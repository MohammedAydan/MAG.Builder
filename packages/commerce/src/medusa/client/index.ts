import type {
  MedusaCommerceRuntimeConfig,
  CommerceHealthCheckResult,
} from '../../types';
import { CommerceRequestError } from '../common/errors';

export type FetchImplementation = typeof fetch;

export type MedusaRequestOptions = Readonly<{
  body?: Record<string, unknown>;
  method?: 'GET' | 'POST';
  requireServerToken?: boolean;
}>;

function buildHeaders(
  config: MedusaCommerceRuntimeConfig,
  options: Pick<MedusaRequestOptions, 'requireServerToken'> & { hasBody?: boolean },
) {
  const headers = new Headers();

  headers.set('x-publishable-api-key', config.publishableKey);
  headers.set('Accept', 'application/json');

  if (options.hasBody) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.requireServerToken) {
    if (!config.serverToken) {
      throw new CommerceRequestError(
        'MEDUSA_SERVER_TOKEN is required for this commerce operation.',
      );
    }

    headers.set('Authorization', `Bearer ${config.serverToken}`);
  }

  return headers;
}

export async function requestMedusaJson<T>(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
  path: string,
  options: MedusaRequestOptions = {},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  const body = options.body ? JSON.stringify(options.body) : null;
  const headers = buildHeaders(config, {
    hasBody: Boolean(options.body),
    ...(typeof options.requireServerToken === 'boolean'
      ? { requireServerToken: options.requireServerToken }
      : {}),
  });

  try {
    const response = await fetchImpl(`${config.backendUrl}${path}`, {
      ...(body ? { body } : {}),
      headers,
      method: options.method ?? 'GET',
      signal: controller.signal,
    });

    if (response.status === 404) {
      return null;
    }

    const payload = await response.json().catch(() => undefined);

    if (!response.ok) {
      const message =
        payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).message === 'string'
          ? String((payload as Record<string, unknown>).message)
          : `Medusa request failed with status ${response.status}.`;

      throw new CommerceRequestError(message, response.status);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof CommerceRequestError) {
      throw error;
    }

    throw new CommerceRequestError(
      error instanceof Error ? error.message : 'Medusa request failed.',
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function runHealthCheck(
  config: MedusaCommerceRuntimeConfig,
  fetchImpl: FetchImplementation,
): Promise<CommerceHealthCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  const endpoint = `${config.backendUrl}${config.healthPath}`;

  try {
    const response = await fetchImpl(endpoint, {
      method: 'GET',
      signal: controller.signal,
    });

    return {
      checkedAt: new Date().toISOString(),
      endpoint,
      ok: response.ok,
      provider: 'medusa' as const,
      statusCode: response.status,
      ...(response.ok ? {} : { error: `Health check failed with status ${response.status}.` }),
    };
  } catch (error) {
    return {
      checkedAt: new Date().toISOString(),
      endpoint,
      error: error instanceof Error ? error.message : 'Health check failed.',
      ok: false,
      provider: 'medusa' as const,
    };
  } finally {
    clearTimeout(timeout);
  }
}
