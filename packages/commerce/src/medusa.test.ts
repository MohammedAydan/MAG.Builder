import { describe, expect, it, vi } from 'vitest';
import {
  CommerceNotImplementedError,
  createMedusaAdapter,
} from './medusa';

const baseConfig = {
  backendUrl: 'http://127.0.0.1:9000',
  healthPath: '/health',
  provider: 'medusa' as const,
  requestTimeoutMs: 5000,
};

describe('createMedusaAdapter', () => {
  it('runs a health check without leaking config into the response', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    const adapter = createMedusaAdapter(baseConfig, {
      fetch: fetchMock as typeof fetch,
    });

    const result = await adapter.checkHealth();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:9000/health',
      expect.objectContaining({
        method: 'GET',
      }),
    );
    expect(result.ok).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeUndefined();
  });

  it('keeps phase-16 data ports intentionally stubbed', async () => {
    const adapter = createMedusaAdapter(baseConfig, {
      fetch: vi.fn() as typeof fetch,
    });

    await expect(adapter.products.listCatalog()).rejects.toBeInstanceOf(
      CommerceNotImplementedError,
    );
    await expect(adapter.carts.create({ currencyCode: 'usd' })).rejects.toBeInstanceOf(
      CommerceNotImplementedError,
    );
  });
});
