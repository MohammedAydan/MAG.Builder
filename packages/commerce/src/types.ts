export const COMMERCE_PROVIDER_IDS = ['medusa'] as const;

export type CommerceProviderId = (typeof COMMERCE_PROVIDER_IDS)[number];

export type CommerceMoney = Readonly<{
  amount: number;
  currencyCode: string;
}>;

export type CommerceProductSummary = Readonly<{
  externalId: string;
  handle: string;
  isPublished: boolean;
  priceRange?: Readonly<{
    max: CommerceMoney;
    min: CommerceMoney;
  }>;
  title: string;
}>;

export type CommercePrice = Readonly<{
  amount: CommerceMoney;
  externalId: string;
  productExternalId: string;
  type: 'list' | 'sale';
}>;

export type CommerceCartSummary = Readonly<{
  currencyCode: string;
  customerExternalId?: string;
  externalId: string;
  itemCount: number;
  subtotal: CommerceMoney;
}>;

export type CommerceCustomerRecord = Readonly<{
  email?: string;
  externalId: string;
  memberId?: string;
}>;

export type CommerceOrderSummary = Readonly<{
  currencyCode: string;
  customerExternalId?: string;
  externalId: string;
  status: 'draft' | 'fulfilled' | 'open';
  total: CommerceMoney;
}>;

export type CommerceHealthCheckResult = Readonly<{
  checkedAt: string;
  endpoint: string;
  error?: string;
  ok: boolean;
  provider: CommerceProviderId;
  statusCode?: number;
}>;

export type MedusaCommerceRuntimeConfig = Readonly<{
  backendUrl: string;
  healthPath: string;
  provider: 'medusa';
  publishableKey?: string;
  requestTimeoutMs: number;
  serverToken?: string;
}>;

export type CommerceRuntimeConfig = MedusaCommerceRuntimeConfig;

export type DisabledCommerceSelection = Readonly<{
  enabled: false;
  provider: null;
  reason: 'disabled' | 'missing-provider';
}>;

export type EnabledCommerceSelection = Readonly<{
  config: CommerceRuntimeConfig;
  enabled: true;
  provider: CommerceProviderId;
}>;

export type CommerceRuntimeSelection =
  | DisabledCommerceSelection
  | EnabledCommerceSelection;

export type CommerceProductsPort = Readonly<{
  getById: (externalId: string) => Promise<CommerceProductSummary | null>;
  listCatalog: () => Promise<readonly CommerceProductSummary[]>;
}>;

export type CommercePricesPort = Readonly<{
  listForProduct: (productExternalId: string) => Promise<readonly CommercePrice[]>;
}>;

export type CommerceCartsPort = Readonly<{
  create: (input: { currencyCode: string; customerExternalId?: string }) => Promise<CommerceCartSummary>;
  getById: (externalId: string) => Promise<CommerceCartSummary | null>;
}>;

export type CommerceCustomersPort = Readonly<{
  getByExternalId: (externalId: string) => Promise<CommerceCustomerRecord | null>;
  getByMemberId: (memberId: string) => Promise<CommerceCustomerRecord | null>;
}>;

export type CommerceOrdersPort = Readonly<{
  getById: (externalId: string) => Promise<CommerceOrderSummary | null>;
  listByCustomer: (customerExternalId: string) => Promise<readonly CommerceOrderSummary[]>;
}>;

export type CommerceAdapter = Readonly<{
  carts: CommerceCartsPort;
  checkHealth: () => Promise<CommerceHealthCheckResult>;
  config: CommerceRuntimeConfig;
  customers: CommerceCustomersPort;
  orders: CommerceOrdersPort;
  prices: CommercePricesPort;
  products: CommerceProductsPort;
  provider: CommerceProviderId;
}>;
