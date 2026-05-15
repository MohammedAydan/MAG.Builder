# Commerce MVP Runbook - Phase 17

## Overview

Phase 17 adds the first minimal commerce runtime on top of the Phase 16 boundary.

This phase introduces:

- public-safe catalog reads through NexPress-owned route handlers
- member-authenticated cart creation and cart item mutations
- a hidden member-to-commerce-customer mapping collection
- test-mode checkout that records admin-visible order snapshots
- continued fail-closed gating through `commerce-pack`

This phase does not add storefront builder blocks, real payment processing, shipping, taxes, promotions, inventory, refunds, or marketplace features.

## Runtime model

Commerce still runs behind `packages/commerce`.

NexPress owns:

- public-safe product projections
- server-side cart and checkout orchestration
- member-to-customer mapping persistence
- local admin visibility of order snapshots in `commerce-orders`

Medusa owns:

- source product and variant catalog
- cart primitives used by the adapter
- customer records created through the admin API
- future real order/payment/shipping/tax workflows

## Capability gating

- all Phase 17 commerce services still require `commerce-pack`
- capability checks run server-side only
- disabled or missing capability state fails closed with a `503`

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

- no storefront product pages or commerce builder blocks yet
- no guest carts
- no real payment completion
- no shipping/tax/promotion/inventory workflows
- no order-management dashboard UI beyond Payload admin collection visibility
- no live DB migration file generated in this session; collections were added and types were regenerated, but migration generation still requires a live database

## Phase 18 handoff

Phase 18 can build on this work by adding:

- storefront-facing commerce builder blocks
- richer product presentation routes/components
- stronger customer-to-cart association with provider-native customer flows
- order history presentation inside the public member account
