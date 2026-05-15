# Phase 35 — Search, Analytics, and Automation Productionization v2

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

Make search, analytics, and automation useful in production by adding persistence, UI, reindexing, summaries, and safe rule management.

## Scope

Allowed:
- Persistent search adapter.
- Reindex job/script and UI trigger.
- Analytics storage/aggregates.
- Automation rule persistence and admin UI.
- Queue integration from Phase 29 if available.
- Site-aware data isolation.

Forbidden:
- Arbitrary automation code.
- Arbitrary HTTP fetch.
- Shell/database/filesystem actions.
- AI autonomous agents.
- Dangerous MCP expansion.

## File-by-file TODO

### 1. Search production

Inspect:
- `packages/search/src/*`
- `apps/web/src/lib/search/service.ts`
- `apps/web/src/app/api/search/route.ts`
- `apps/web/src/lib/content/hooks.ts`

Tasks:
- Add persistent index adapter.
- Add reindex script:
  - `apps/web/src/scripts/reindex-search.ts`
- Add dashboard search admin page:
  - `apps/web/src/app/dashboard/search/page.tsx`
- Ensure site-aware index/query.
- Add tests for draft/private/cross-site exclusion.

### 2. Analytics production

Inspect:
- `packages/analytics/src/*`
- `apps/web/src/lib/analytics/service.ts`
- `apps/web/src/app/api/analytics/summary/route.ts`

Tasks:
- Add analytics storage adapter.
- Add aggregate summaries by site/date/event.
- Add dashboard analytics page.
- Do not expose raw event stream publicly.
- No IP storage unless minimized/hashed and documented.

### 3. Automation production

Inspect:
- `packages/automation/src/*`
- `apps/web/src/lib/automation/hooks.ts`

Create if required:
- `apps/web/src/collections/AutomationRules.ts`
- `apps/web/src/collections/AutomationExecutions.ts`
- `apps/web/src/app/dashboard/automation/page.tsx`

Tasks:
- Store rules safely.
- UI to enable/disable allowlisted rules.
- Execution history safe metadata.
- Queue-backed execution if Phase 29 introduced queue.
- No arbitrary actions.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir packages/search test
pnpm --dir packages/analytics test
pnpm --dir packages/automation test
pnpm --dir apps/web test
```

If Payload collections change:
```bash
pnpm --dir apps/web generate:types
```

## Stop condition

Provide:
- Search adapter/status.
- Analytics storage/status.
- Automation rule persistence.
- Dashboard UI.
- Site isolation tests.
- Known gaps.
