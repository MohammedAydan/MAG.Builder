# Phase 32 — Commerce Production Checkout v2

# Common Context for NexPress / MAG Builder

You are working on a greenfield production project called **MAG Builder / NexPress**.

The project is currently a large Next.js 16 + Payload CMS monorepo that reached a Release Candidate foundation after phases 00-27. A recent project map reported:
- 273 scanned files.
- 28,373 total lines.
- 24,097 code lines.
- 240 scanned directories.
- Largest / most sensitive files include:
  - `apps/web/src/payload-types.ts`
  - `apps/web/src/lib/commerce/service.ts`
  - `apps/web/src/lib/plugins/service.ts`
  - `apps/web/src/lib/templates/service.ts`
  - `packages/builder-editor/src/config.tsx`
  - `packages/commerce/src/medusa.ts`
  - `packages/builder-core/src/blocks/core-blocks.tsx`
  - `packages/api/src/openapi.ts`

Core architecture already exists:
- `apps/web`: Next.js 16 App Router + Payload CMS.
- `packages/builder-core`: public builder schema/rendering.
- `packages/builder-editor`: Puck editor adapter only.
- `packages/themes`, `packages/plugins`, `packages/forms`, `packages/commerce`, `packages/api`, `packages/webhooks`, `packages/mcp-gateway`, `packages/search`, `packages/analytics`, `packages/automation`, `packages/marketplace`, `packages/security`, `packages/observability`.
- Public routes include `/`, `/[slug]`, `/journal/[slug]`, `/login`, `/signup`, `/account`.
- API routes include `/api/health`, `/api/readiness`, `/api/openapi.json`, `/api/search`, `/api/analytics/summary`, `/api/mcp`, `/api/marketplace/*`, `/api/commerce/*`, `/api/forms/*`, `/api/webhooks/inbound`, `/api/plugins/*`, `/api/templates/*`, `/api/members/*`.
- Payload collections include at least `users`, `members`, `sites`, `pages`, `posts`, `media`, `forms`, `form-submissions`, `commerce-customers`, `commerce-orders`, `plugin-states`, `webhook-subscriptions`, `webhook-deliveries`, `integrations`, `audit-logs`, `installation-state`, `redirects`.

Important current gaps inferred from the file map and prior implementation:
- `apps/web/src/migrations/` still contains only `.gitkeep` in the map; live DB migrations must be generated and reviewed.
- `packages/auth`, `packages/cms`, `packages/config`, `packages/db`, `packages/shared`, and `packages/api-contracts` are still placeholder-style packages unless you find they were completed locally.
- Many features are foundations/MVPs:
  - Commerce is not production Shopify/WooCommerce yet.
  - Marketplace is dry-run only.
  - MCP is read-only/safe only.
  - Search is process/local unless a production adapter is added.
  - Analytics is Noop/local unless a production adapter is added.
  - Automation rules are limited/hard-coded unless persistence/UI is added.
  - Form email provider is stubbed unless a provider is added.
  - Rate limiting is in-memory unless a distributed store is added.
  - Admin UX is incomplete for many modules.
  - Builder needs advanced layout/responsive/media/form improvements.

Global rules:
- Work on exactly one prompt/phase at a time.
- Do not implement unrelated features.
- Do not hide known limitations.
- Do not commit secrets.
- Do not use `next lint`; use ESLint CLI scripts already in package.json.
- Keep `env.ts` split-schema behavior. Do not eagerly validate runtime secrets during static build.
- Prefer server-side checks over client-side hiding.
- Keep Payload Local API usage server-only. Use `overrideAccess: false` when the operation should respect access control.
- Do not add dangerous MCP tools.
- Do not enable marketplace runtime install/update execution unless a later prompt explicitly authorizes it.
- Do not add payment handling unless the commerce production prompt explicitly requires a safe provider integration.


## Goal

Move commerce from test-mode MVP toward production checkout readiness while keeping payments and order state safe.

## Scope

Allowed:
- Payment provider abstraction.
- One provider integration only if credentials/config are safe and server-only.
- Checkout state model.
- Payment webhook verification foundation.
- Order lifecycle state transitions.
- Shipping/tax/coupon adapter contracts if required.
- Admin order management UI if Phase 30 has not implemented it.
- Transactional order emails if email provider exists.

Forbidden:
- Storing card data.
- PCI-sensitive handling.
- Client-trusted prices/totals.
- Multiple providers in one phase.
- Marketplace/vendor features.

## File-by-file TODO

### 1. Commerce package contracts

Inspect:
- `packages/commerce/src/types.ts`
- `packages/commerce/src/medusa.ts`
- `packages/commerce/src/mock.ts`
- `packages/commerce/src/config.ts`

Tasks:
- Split `medusa.ts` if still large:
  - `medusa/client.ts`
  - `medusa/catalog.ts`
  - `medusa/cart.ts`
  - `medusa/checkout.ts`
  - `medusa/orders.ts`
  - `medusa/customers.ts`
- Add payment/session contracts without card data.
- Add safe order lifecycle types.
- Normalize provider responses.

### 2. Web app commerce service

Inspect:
- `apps/web/src/lib/commerce/service.ts`
- `apps/web/src/lib/commerce/storefront.ts`
- `apps/web/src/app/api/commerce/**`

Tasks:
- Split `service.ts` into domain modules:
  - `catalog.ts`
  - `cart.ts`
  - `checkout.ts`
  - `orders.ts`
  - `customers.ts`
  - `errors.ts`
- Keep public API stable.
- Add server-side validation for all quantities/variant IDs.
- Never trust client price/totals.

### 3. Checkout and payments

Create or update:
- `apps/web/src/app/api/commerce/checkout/session/route.ts`
- `apps/web/src/app/api/commerce/webhooks/payment/route.ts` if needed.
- `docs/runbooks/commerce-production-checkout.md`

Tasks:
- Server-only payment session creation.
- No card data touches NexPress.
- Verify webhook signatures.
- Add idempotency keys.
- Add safe order state transition.

### 4. Orders admin

Inspect:
- `apps/web/src/collections/CommerceOrders.ts`
- `apps/web/src/app/dashboard/commerce/orders/page.tsx` if exists.

Tasks:
- Show order state.
- No refund/payment mutation unless explicitly implemented.
- Safe audit events.

### 5. Emails

If Phase 29 added email provider:
- Send order confirmation through provider interface.
- No secrets in templates.
- No raw provider responses.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir packages/commerce test
pnpm --dir apps/web test
```

## Stop condition

Provide:
- Payment provider status.
- Checkout flow status.
- Webhooks added.
- Order lifecycle behavior.
- Admin UI status.
- Security notes.
- Remaining commerce gaps.
