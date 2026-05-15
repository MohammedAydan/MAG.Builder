export const COMMERCE_PROVIDER_IDS = ['medusa'] as const;

export type CommerceProviderId = (typeof COMMERCE_PROVIDER_IDS)[number];

export type CommerceMoney = Readonly<{
  amount: number;
  currencyCode: string;
}>;

export type CommerceProductVariantSummary = Readonly<{
  externalId: string;
  price: CommerceMoney;
  productExternalId: string;
  sku?: string;
  title: string;
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
  variants: readonly CommerceProductVariantSummary[];
}>;

export type CommercePrice = Readonly<{
  amount: CommerceMoney;
  externalId: string;
  productExternalId: string;
  variantExternalId?: string;
  type: 'list' | 'sale';
}>;

export type CommerceCartItem = Readonly<{
  externalId: string;
  productExternalId: string;
  quantity: number;
  title: string;
  total: CommerceMoney;
  unitPrice: CommerceMoney;
  variantExternalId: string;
}>;

export type CommerceCartSummary = Readonly<{
  currencyCode: string;
  customerExternalId?: string;
  externalId: string;
  itemCount: number;
  items: readonly CommerceCartItem[];
  subtotal: CommerceMoney;
  total: CommerceMoney;
}>;

export type CommerceCustomerCreateInput = Readonly<{
  email: string;
  firstName?: string;
  lastName?: string;
  memberId?: string;
}>;

export type CommerceCustomerRecord = Readonly<{
  email?: string;
  externalId: string;
  firstName?: string;
  lastName?: string;
  memberId?: string;
}>;

export type CommerceOrderItemSummary = Readonly<{
  productExternalId: string;
  quantity: number;
  title: string;
  total: CommerceMoney;
  unitPrice: CommerceMoney;
  variantExternalId: string;
}>;

export type CommerceOrderSummary = Readonly<{
  currencyCode: string;
  customerExternalId?: string;
  externalCartId?: string;
  externalId: string;
  items: readonly CommerceOrderItemSummary[];
  status: 'draft' | 'fulfilled' | 'open' | 'placed';
  total: CommerceMoney;
}>;

export type CommerceCheckoutResult =
  | Readonly<{
      order: CommerceOrderSummary;
      type: 'order';
    }>
  | Readonly<{
      cart: CommerceCartSummary;
      error?: string;
      type: 'cart';
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
  defaultRegionId: string;
  healthPath: string;
  provider: 'medusa';
  publishableKey: string;
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
  getByHandle: (handle: string) => Promise<CommerceProductSummary | null>;
  getById: (externalId: string) => Promise<CommerceProductSummary | null>;
  getVariantById: (externalId: string) => Promise<CommerceProductVariantSummary | null>;
  listCatalog: (input?: { limit?: number }) => Promise<readonly CommerceProductSummary[]>;
}>;

export type CommercePricesPort = Readonly<{
  listForProduct: (productExternalId: string) => Promise<readonly CommercePrice[]>;
}>;

export type CommerceCartCreateInput = Readonly<{
  customerExternalId?: string;
  email?: string;
  regionId: string;
}>;

export type CommerceCartAddItemInput = Readonly<{
  cartExternalId: string;
  quantity: number;
  variantExternalId: string;
}>;

export type CommerceCartsPort = Readonly<{
  addLineItem: (input: CommerceCartAddItemInput) => Promise<CommerceCartSummary>;
  complete: (cartExternalId: string) => Promise<CommerceCheckoutResult>;
  create: (input: CommerceCartCreateInput) => Promise<CommerceCartSummary>;
  getById: (externalId: string) => Promise<CommerceCartSummary | null>;
}>;

export type CommerceCustomersPort = Readonly<{
  create: (input: CommerceCustomerCreateInput) => Promise<CommerceCustomerRecord>;
  getByExternalId: (externalId: string) => Promise<CommerceCustomerRecord | null>;
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
