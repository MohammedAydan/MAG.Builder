import type {
  CommerceAdapter,
  MedusaCommerceRuntimeConfig,
} from '../types';
import { runHealthCheck, type FetchImplementation } from './client';
import { createCatalogPort } from './catalog';
import { createCartPort } from './cart';
import { createCustomersPort } from './customers';
import { createOrdersPort } from './orders';

export * from './common/errors';

export function createMedusaAdapter(
  config: MedusaCommerceRuntimeConfig,
  options?: {
    fetch?: FetchImplementation;
  },
): CommerceAdapter {
  const fetchImpl = options?.fetch ?? fetch;
  const { prices, products } = createCatalogPort(config, fetchImpl);

  return {
    carts: createCartPort(config, fetchImpl),
    checkHealth: () => runHealthCheck(config, fetchImpl),
    config,
    customers: createCustomersPort(config, fetchImpl),
    orders: createOrdersPort(config, fetchImpl),
    prices,
    products,
    provider: 'medusa',
  };
}
