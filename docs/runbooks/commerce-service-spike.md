# Commerce Service Spike Runbook - Phase 16

## Overview

Phase 16 establishes the safe commerce integration boundary for NexPress without implementing storefront UI, checkout, payments, shipping, taxes, inventory, or real order flows.

This phase introduces:

- `packages/commerce` as the typed commerce boundary
- provider-agnostic contracts for products, prices, carts, customers, and orders
- a Medusa adapter skeleton with a server-side health check
- lazy runtime configuration validation
- fail-closed `commerce-pack` capability gating in `apps/web`

## Provider strategy

- Selected provider direction: Medusa
- Integration model: server-side adapter inside NexPress
- Repository scope: adapter skeleton only, not a full Medusa backend scaffold

Reasoning:

- matches the architecture decision already captured in `01-final-decision-record.md`
- preserves provider replaceability behind contracts
- keeps provider SDK/API details out of public components
- lets future phases build catalog, cart, checkout, and order features without collapsing boundaries

## What NexPress owns vs what the provider owns

NexPress owns:

- CMS content, builder documents, themes, public routing, and dashboard integration
- capability gating through `commerce-pack`
- runtime configuration validation
- member-to-customer mapping policy
- future storefront/admin orchestration

The commerce provider owns:

- source-of-truth product catalog
- pricing records
- carts, checkout, orders, and customer commerce state
- payment, shipping, tax, and inventory systems in later phases

## Membership and customer identity

- `members` remain a separate auth boundary from commerce customers
- Phase 16 does not create automatic sync
- future phases should map a member to a provider customer using a stable external reference, not shared auth/session storage
- member PII should be sent to the provider only when a concrete commerce workflow requires it

## Product and content relationship

- product truth stays in the provider
- CMS pages, posts, or builder blocks may reference provider product identifiers later
- Phase 16 does not add Payload product, order, or cart collections

## Checkout and order ownership

- checkout is not implemented in Phase 16
- orders are not created or managed in Phase 16
- future phases should keep checkout/order operations inside the commerce adapter boundary and expose only NexPress-safe orchestration services upward

## Runtime configuration

Environment variables added in Phase 16:

- `NEXPRESS_COMMERCE_PROVIDER`
- `MEDUSA_BACKEND_URL`
- `MEDUSA_HEALTH_PATH`
- `MEDUSA_PUBLISHABLE_KEY`
- `MEDUSA_SERVER_TOKEN`
- `MEDUSA_REQUEST_TIMEOUT_MS`

Rules:

- leave `NEXPRESS_COMMERCE_PROVIDER=disabled` unless commerce is intentionally enabled
- runtime config is parsed lazily in server-only commerce service code
- do not expose `MEDUSA_SERVER_TOKEN` through `NEXT_PUBLIC_*`
- do not place provider secrets in client components, public route params, or logs

## Capability gating

- app-side commerce access checks `commerce-pack` through the existing plugin-state capability helper
- disabled or missing capability state fails closed
- activation state remains server-owned; public UI does not inspect plugin-state records directly

## Connectivity smoke checks

The Medusa adapter skeleton includes a server-side health check against:

- `${MEDUSA_BACKEND_URL}${MEDUSA_HEALTH_PATH}`

Behavior:

- uses `fetch` with `AbortController`
- applies a bounded timeout
- never returns provider secrets
- reports safe status metadata only

## Known limitations in Phase 16

- no storefront product routes or blocks yet
- no catalog syncing into Payload
- no carts or checkout flows
- no payments, taxes, shipping, coupons, or inventory
- no order creation or webhook ingestion
- no live database migration file because no Payload collections were added

## Phase 17 handoff

Phase 17 can build on this boundary by adding:

- real catalog read paths through the adapter
- customer mapping persistence strategy
- cart and checkout orchestration
- order-facing admin/storefront services
- builder/storefront integrations that consume the adapter rather than provider internals directly
