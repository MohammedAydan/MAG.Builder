# Phase 29 — Production Runtime Services v2

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

Replace process-local/stub runtime foundations with production-ready adapter interfaces and first safe implementations where practical.

This phase should make forms/search/analytics/automation/webhooks operationally credible without adding unrelated product features.

## Scope

Allowed:
- Redis/Valkey-compatible rate-limit adapter interface.
- Queue/job interface and in-process fallback.
- Email provider interface with SMTP or Resend-style implementation if config is available.
- Persistent search adapter interface.
- Persistent analytics adapter interface.
- Webhook delivery queue abstraction.
- Automation trigger wiring to existing events.
- Runtime service runbook updates.

Forbidden:
- New dashboard UX.
- Payments.
- Marketplace execution.
- Dangerous MCP tools.
- Arbitrary HTTP automation.
- External vendor lock-in without interface.

## File-by-file TODO

### 1. Packages/forms

Inspect:
- `packages/forms/src/rate-limit.ts`
- `packages/forms/src/email.ts`
- `packages/forms/src/workflow.ts`
- `packages/forms/src/types.ts`
- `apps/web/src/lib/forms/service.ts`
- `apps/web/src/app/api/forms/[formId]/submit/route.ts`

Tasks:
- Introduce `RateLimitStore` interface.
- Keep current in-memory store as development fallback.
- Add Redis/Valkey adapter only if no heavy dependency is required; otherwise create interface and documented placeholder.
- Introduce production email provider interface.
- Keep stub provider for tests.
- Add server-only email config parsing in `apps/web/src/lib/env.ts` or a safe runtime config module.
- Never expose email secrets to client.
- Add tests for rate-limit adapter behavior and sensitive config redaction.

### 2. Packages/search

Inspect:
- `packages/search/src/adapter.ts`
- `packages/search/src/service.ts`
- `packages/search/src/types.ts`
- `apps/web/src/lib/search/service.ts`
- `apps/web/src/app/api/search/route.ts`
- `apps/web/src/lib/content/hooks.ts`

Tasks:
- Define production adapter contract clearly.
- Add a persistent adapter option if plan allows:
  - PostgreSQL FTS or database-backed adapter preferred over adding a paid provider.
- Add indexing hooks for published Pages/Posts.
- Ensure drafts and cross-site content never index publicly.
- Add reindex command/script if required:
  - `apps/web/src/scripts/reindex-search.ts`
- Add tests for site-aware indexing and search.

### 3. Packages/analytics

Inspect:
- `packages/analytics/src/adapter.ts`
- `packages/analytics/src/service.ts`
- `packages/analytics/src/types.ts`
- `apps/web/src/lib/analytics/service.ts`
- `apps/web/src/app/api/analytics/summary/route.ts`

Tasks:
- Add persistent analytics adapter interface.
- Keep Noop adapter as fallback.
- Add safe server capture calls for:
  - form submitted
  - page viewed if safe and not PII-heavy
  - commerce order snapshot created
  - content published
- Do not store IP addresses unless minimized.
- Add tests for sensitive fields rejection.

### 4. Packages/automation

Inspect:
- `packages/automation/src/engine.ts`
- `packages/automation/src/types.ts`
- `apps/web/src/lib/automation/hooks.ts`

Tasks:
- Wire `fireAutomationTrigger` to actual safe events:
  - form submission success
  - content publish
  - commerce order snapshot
- Keep actions allowlisted.
- No arbitrary HTTP, shell, database, filesystem, or code actions.
- Add execution result metadata only.
- Add tests for no handler = no execution path.

### 5. Webhooks delivery

Inspect:
- `apps/web/src/lib/webhooks/outbound.ts`
- `packages/webhooks/src/*`
- `apps/web/src/collections/WebhookDeliveries.ts`
- `apps/web/src/collections/WebhookSubscriptions.ts`

Tasks:
- Add queue abstraction for deliveries.
- Keep synchronous/in-process fallback if no real queue is configured.
- Add retry/backoff metadata.
- Do not expose raw provider responses.
- Do not remove SSRF protections.

### 6. Env and docs

Inspect:
- `.env.example`
- `docs/runbooks/forms-workflows.md`
- `docs/runbooks/search-analytics-automation.md`
- `docs/runbooks/operations.md`
- `docs/architecture/environment-matrix.md`

Tasks:
- Add placeholders only.
- Document production adapter options.
- Document fallback limitations.

## Acceptance

- Runtime adapter boundaries exist.
- No secrets exposed.
- In-memory/Noop fallbacks remain test-safe but are no longer undocumented production assumptions.
- Search/analytics/automation hooks actually connect to relevant events.
- Existing tests pass and new adapter tests are added.

## Verification

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --dir packages/forms test
pnpm --dir packages/search test
pnpm --dir packages/analytics test
pnpm --dir packages/automation test
pnpm --dir packages/webhooks test
pnpm --dir apps/web test
```

## Stop condition

Provide:
- Runtime services implemented.
- Adapter interfaces added.
- Production providers added or deferred.
- Event wiring added.
- Env vars added.
- Tests added.
- Known gaps.
