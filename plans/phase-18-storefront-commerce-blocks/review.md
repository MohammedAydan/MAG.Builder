# Phase 18 Review - Storefront Commerce Blocks

## Summary

Phase 18 adds the first storefront-facing commerce builder blocks on top of the existing Commerce MVP boundary. `@nexpress/builder-core` now defines and validates the storefront block contracts, `@nexpress/builder-editor` exposes constrained editor mappings, and `apps/web` supplies NexPress-owned server rendering plus minimal cart interactivity through existing `/api/commerce/*` routes.

## Files changed

- `packages/builder-core/src/{blocks/core-blocks.tsx,index.ts,types.ts,renderer.test.tsx,schema.test.ts}`
- `packages/builder-editor/src/{config.tsx,config.test.tsx,adapter.test.ts}`
- `apps/web/src/components/commerce/{storefront-add-to-cart.tsx,storefront-cart.tsx,storefront-blocks.tsx}`
- `apps/web/src/lib/commerce/{service.ts,service.test.ts,storefront.ts}`
- `apps/web/src/lib/content/{rendering.ts,rendering.test.tsx}`
- `apps/web/src/app/{(public)/[slug]/page.tsx,dashboard/pages/[id]/preview/page.tsx}`
- `docs/runbooks/commerce-mvp.md`
- `plans/context.md`
- `plans/SESSION_LOG.md`
- `IMPLEMENTATION_STATUS.md`

## Packages added

- none

## Storefront commerce blocks added

- `commerce.product-grid`
- `commerce.product-detail`
- `commerce.cart`
- `commerce.collection-list`

## Builder-core changes

- added strict prop schemas for the four Phase 18 storefront blocks
- added a render-context bridge so `apps/web` can supply server-owned storefront rendering without moving provider logic into the kernel
- kept fail-safe behavior for invalid props, unknown blocks, and unavailable public rendering

## Builder-editor changes

- added constrained mappings for each storefront block
- limited editor inputs to handles, layout options, CTA modes, messages, and curated link items
- preserved editor conversion for structured product-handle selections

## Public rendering changes

- published and preview page rendering is now async so storefront blocks can resolve server-owned commerce UI safely
- storefront product and cart blocks render through NexPress-owned server components
- collection list renders directly from curated safe link props

## Service and API route changes

- added `listCatalogProductsWithInput` for bounded storefront catalog reads
- added `getCommerceStorefrontStatus` for safe disabled or misconfigured rendering states
- reused existing `/api/commerce/cart`, `/api/commerce/cart/[cartId]`, `/api/commerce/cart/[cartId]/items`, and `/api/commerce/cart/[cartId]/checkout` routes for client interactivity

## Product block behavior

- product grid supports catalog-driven or manual handle-driven rendering
- product detail resolves one product by handle
- both product blocks expose only safe product title, handle, price label, and variant projections
- invalid or missing product selections fail safe

## Cart and add-to-cart behavior

- add-to-cart is mediated entirely through NexPress-owned server APIs
- variant ids and quantities are validated server-side before cart mutation
- the browser stores only a local cart id pointer for the signed-in member session
- guest carts were not implemented

## Checkout-related behavior

- checkout remains the existing Phase 17 test-mode flow
- no real payment capture, card collection, shipping, taxes, coupons, or inventory logic was added

## Commerce capability integration

- storefront rendering still fails closed behind `commerce-pack`
- disabled or misconfigured commerce renders safe unavailable states
- no provider secrets, raw config, or raw Medusa responses are exposed to public routes

## Payload and content integration changes

- no new Payload collections were added
- no Payload type regeneration was required
- existing public page routes and dashboard preview routes now support storefront commerce block rendering

## Payload types and migrations status

- Payload types unchanged in Phase 18
- no migration file was generated; live DB-backed migration creation remains a known repository gap

## Tests added

- builder-core storefront rendering and unsafe prop rejection coverage
- builder-editor storefront mapping and structured product-selection coverage
- apps/web storefront availability coverage in commerce service tests
- apps/web published content rendering tests were updated for async rendering

## Commands run

- `pnpm.cmd install`
- `pnpm.cmd lint`
- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- `pnpm.cmd --dir packages/commerce lint`
- `pnpm.cmd --dir packages/commerce typecheck`
- `pnpm.cmd --dir packages/commerce test`
- `pnpm.cmd --dir packages/commerce build`
- `pnpm.cmd --dir packages/forms lint`
- `pnpm.cmd --dir packages/forms typecheck`
- `pnpm.cmd --dir packages/forms test`
- `pnpm.cmd --dir packages/forms build`
- `pnpm.cmd --dir packages/plugins lint`
- `pnpm.cmd --dir packages/plugins typecheck`
- `pnpm.cmd --dir packages/plugins test`
- `pnpm.cmd --dir packages/plugins build`
- `pnpm.cmd --dir packages/builder-core lint`
- `pnpm.cmd --dir packages/builder-core typecheck`
- `pnpm.cmd --dir packages/builder-core test`
- `pnpm.cmd --dir packages/builder-core build`
- `pnpm.cmd --dir packages/builder-editor lint`
- `pnpm.cmd --dir packages/builder-editor typecheck`
- `pnpm.cmd --dir packages/builder-editor test`
- `pnpm.cmd --dir packages/builder-editor build`
- `pnpm.cmd --dir packages/themes lint`
- `pnpm.cmd --dir packages/themes typecheck`
- `pnpm.cmd --dir packages/themes test`
- `pnpm.cmd --dir packages/themes build`
- `pnpm.cmd --dir apps/web lint`
- `pnpm.cmd --dir apps/web typecheck`
- `pnpm.cmd --dir apps/web test`
- `pnpm.cmd --dir apps/web build`

## Security notes

- commerce blocks are validated at the builder schema layer before public rendering
- public/client code does not call Medusa directly
- client cart state stores only a cart id pointer; prices and order-sensitive fields remain server-owned
- safe disabled and error states avoid exposing provider internals
- Puck/editor code remains outside public routes and bundles

## Known gaps

- no live DB migration file was generated in this session
- collection links are curated manually rather than synced from provider categories or collections
- guest carts remain out of scope
- checkout is still the Phase 17 test-mode order snapshot path
- real payment, shipping, tax, coupon, inventory, refund, and webhook-reconciliation work remain deferred

## Recommendation

- [x] Approve
- [ ] Request changes
