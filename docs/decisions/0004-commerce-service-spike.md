# ADR 0004 - Commerce Service Spike

## Status

Accepted.

## Context

NexPress v1 needs commerce capability without forcing commerce to be always on, leaking provider details into public routes, or coupling checkout and order logic directly into the CMS app. Phase 16 exists to validate the integration direction before Commerce MVP work starts.

## Decision

Adopt the following Phase 16 commerce direction:

- keep commerce isolated in `packages/commerce`
- select Medusa as the preferred first provider
- keep Medusa integration embedded as a server-side adapter inside the NexPress monorepo, not as a full Medusa backend scaffold in this repository
- require `commerce-pack` capability activation before any commerce service access
- validate commerce runtime configuration lazily inside server-only code paths
- keep provider secrets server-only and do not expose raw commerce runtime config to public UI
- define typed adapter contracts for products, prices, carts, customers, and orders before building real storefront or checkout flows
- keep customer identity mapping explicit: NexPress `members` remain separate from provider `customers`, with future mapping by stable external reference rather than merged auth models
- keep product/content relationships explicit: CMS pages and builder content may reference provider product identifiers later, but product truth stays in the commerce provider
- keep checkout and order execution outside Phase 16; NexPress will orchestrate storefront/admin integration while the provider remains the source of commerce operations

## Alternatives considered

- embed provider-specific fetch calls directly in `apps/web`
- build a full Medusa backend inside this repository during the spike
- defer the adapter contract until Commerce MVP implementation begins

## Consequences

- Phase 17 can build on a stable service boundary instead of spreading provider concerns through the app
- the platform still runs safely when commerce is disabled or misconfigured
- the spike deliberately does not prove full catalog, cart, checkout, or order workflows yet
