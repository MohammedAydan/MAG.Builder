# Commerce MVP and Storefront Blocks Runbook - Phases 17-18

## Overview

Phase 17 adds the first minimal commerce runtime on top of the Phase 16 boundary.

Phase 17 introduced:

- public-safe catalog reads through NexPress-owned route handlers
- member-authenticated cart creation and cart item mutations
- a hidden member-to-commerce-customer mapping collection
- test-mode checkout that records admin-visible order snapshots
- continued fail-closed gating through `commerce-pack`

Phase 18 adds:

- builder-core storefront blocks for product grid, product detail, cart, and collection list
- builder-editor mappings for those blocks with constrained field inputs only
- NexPress-owned server rendering for storefront product and cart blocks
- minimal client add-to-cart and cart-summary interactivity that talks only to existing NexPress commerce APIs

These phases still do not add real payment processing, shipping, taxes, promotions, inventory, refunds, or marketplace features.

## Runtime model

Commerce still runs behind `packages/commerce`.

NexPress owns:

- public-safe product projections
- server-side cart and checkout orchestration
- member-to-customer mapping persistence
- local admin visibility of order snapshots in `commerce-orders`
- storefront block rendering integration inside published builder pages
- minimal browser-local cart id storage for signed-in member storefront sessions

Medusa owns:

- source product and variant catalog
- cart primitives used by the adapter
- customer records created through the admin API
- future real order/payment/shipping/tax workflows

## Capability gating

- all Phase 17 commerce services still require `commerce-pack`
- capability checks run server-side only
- disabled or missing capability state fails closed with a `503`
- Phase 18 storefront blocks render safe disabled or unavailable states when the capability or runtime config is not ready

## Environment variables

Phase 17 requires these Medusa settings when `NEXPRESS_COMMERCE_PROVIDER=medusa`:

- `MEDUSA_BACKEND_URL`
- `MEDUSA_DEFAULT_REGION_ID`
- `MEDUSA_PUBLISHABLE_KEY`
- `MEDUSA_SERVER_TOKEN`
- `MEDUSA_HEALTH_PATH`
- `MEDUSA_REQUEST_TIMEOUT_MS`

Notes:

- `MEDUSA_PUBLISHABLE_KEY` is required for Medusa Store API product/cart routes
- `MEDUSA_SERVER_TOKEN` is required for customer creation and admin order lookups
- provider secrets must remain server-only; do not expose them via `NEXT_PUBLIC_*`

## API routes added

- `GET /api/commerce/products`
- `GET /api/commerce/products/[handle]`
- `POST /api/commerce/cart`
- `GET /api/commerce/cart/[cartId]`
- `POST /api/commerce/cart/[cartId]/items`
- `POST /api/commerce/cart/[cartId]/checkout`
- `GET /api/commerce/orders`

Behavior:

- catalog routes return safe normalized product data only
- cart and order routes require an authenticated `members` session
- checkout runs in NexPress test mode and records an order snapshot without collecting payment data

## Storefront builder blocks

Phase 18 registers these public-safe builder blocks:

- `commerce.product-grid`
- `commerce.product-detail`
- `commerce.cart`
- `commerce.collection-list`

Notes:

- `commerce.product-grid` can render from the catalog feed or a curated manual list of product handles
- `commerce.product-detail` resolves one product by handle and can expose only safe product and variant projections
- `commerce.cart` renders against existing NexPress commerce routes and never calls Medusa directly from the browser
- `commerce.collection-list` is a curated storefront link list, not a provider-backed category sync

## Public rendering model

- `@nexpress/builder-core` remains the public rendering source of truth
- `apps/web` injects storefront block rendering through the builder render context
- editor-only Puck code stays out of public routes and bundles
- storefront server components call `apps/web/src/lib/commerce/service.ts` helpers rather than provider SDK code
- client components are limited to cart/add-to-cart interactions and only call NexPress-owned `/api/commerce/*` endpoints

## Cart behavior

- carts remain member-authenticated only
- the browser stores only a local cart id pointer for the signed-in member session
- variant ids and quantities are validated server-side before cart mutations
- client-provided prices, totals, discounts, shipping, taxes, and inventory are never trusted
- guest carts are still out of scope; the storefront cart UI prompts login or fails safely for unauthenticated users

## Payload collections added

- `commerce-customers`
  - hidden
  - stores minimal member-to-provider customer mapping
- `commerce-orders`
  - admin-visible under the `Commerce` group
  - stores safe order snapshots recorded during test checkout

No public write access exists for either collection.

## Customer identity model

- public `members` remain separate from admin `users`
- Phase 17 creates a provider customer mapping only for authenticated members
- no guest cart or guest checkout flow exists in this phase
- only minimal mapping data is persisted locally: member relation, provider, external customer id, email snapshot

## Checkout test mode

- cart validation remains server-side
- client-provided prices and totals are never trusted
- the route validates variant ids and quantity before mutating the cart
- no card data, payment tokens, shipping, taxes, or coupon logic is processed
- the resulting `commerce-orders` entry is an internal NexPress snapshot for admin visibility and phase handoff

## Known limitations

- no dedicated storefront product routes were added; product presentation is currently builder-block driven inside existing page routes
- no guest carts
- no real payment completion
- no shipping/tax/promotion/inventory workflows
- no order-management dashboard UI beyond Payload admin collection visibility
- collection links are curated manually rather than synced from provider categories or collections
- no live DB migration file generated in this session; collections were added and types were regenerated, but migration generation still requires a live database

## Phase 19 handoff

Phase 19 can build on this work by adding:

- OpenAPI-backed public contracts for the storefront and commerce routes
- documented scoped API behavior for catalog, cart, and future order flows
- broader public storefront API hardening and documentation
